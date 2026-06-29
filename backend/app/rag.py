"""RAG pipeline: load knowledge base, create embeddings, store in vector DB, retrieve relevant chunks."""

import os
import glob
import hashlib
from typing import Optional

from .config import OPENAI_API_KEY, OPENAI_BASE_URL, EMBEDDING_MODEL, QDRANT_URL, CHROMA_PERSIST_DIR, KNOWLEDGE_BASE_DIR, DEMO_MODE

COLLECTION_NAME = "interview_rubrics"

# ---------------------------------------------------------------------------
# Embedding helpers
# ---------------------------------------------------------------------------

def _get_embedding_function():
    """Return the appropriate embedding function based on configuration."""
    if DEMO_MODE:
        return _DummyEmbeddingFunction()

    try:
        from langchain_openai import OpenAIEmbeddings
        kwargs = dict(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
        if OPENAI_BASE_URL:
            kwargs["base_url"] = OPENAI_BASE_URL
        return OpenAIEmbeddings(**kwargs)
    except Exception:
        return _DummyEmbeddingFunction()


class _DummyEmbeddingFunction:
    """Deterministic hash-based embedding for demo mode (no OpenAI key)."""
    def __init__(self):
        self.dim = 256

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        h = hashlib.sha256(text.encode()).digest()
        vec = [(b - 128) / 128.0 for b in h]
        while len(vec) < self.dim:
            h = hashlib.sha256(h).digest()
            vec.extend([(b - 128) / 128.0 for b in h])
        return vec[:self.dim]


# ---------------------------------------------------------------------------
# Document loading & chunking
# ---------------------------------------------------------------------------

def _load_markdown_files() -> list[dict]:
    """Load all markdown files from the knowledge_base directory."""
    docs = []
    pattern = os.path.join(KNOWLEDGE_BASE_DIR, "*.md")
    for filepath in sorted(glob.glob(pattern)):
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        docs.append({
            "source": filename,
            "content": content,
        })
    return docs


def _chunk_document(doc: dict, chunk_size: int = 600, overlap: int = 100) -> list[dict]:
    """Split a document into overlapping chunks."""
    content = doc["content"]
    source = doc["source"]
    chunks = []
    start = 0
    while start < len(content):
        end = start + chunk_size
        chunk_text = content[start:end]
        chunks.append({
            "source": source,
            "text": chunk_text,
            "offset": start,
        })
        if end >= len(content):
            break
        start = end - overlap
    return chunks


def _extract_metadata(source: str) -> dict:
    """Extract metadata tags from filename for filtering."""
    meta = {"source": source}
    name = source.lower()
    if "backend" in name:
        meta["role"] = "Backend Engineer"
    elif "ai_engineer" in name:
        meta["role"] = "AI Engineer"
    elif "fullstack" in name:
        meta["role"] = "Full Stack Engineer"
    if "rate_limiter" in name:
        meta["problem_type"] = "System Design"
        meta["problem"] = "Design a Rate Limiter"
    if "rag_system" in name:
        meta["problem_type"] = "RAG System"
        meta["problem"] = "Design a RAG System"
    if "algorithm" in name:
        meta["problem_type"] = "Algorithm"
    if "system_design" in name:
        meta["problem_type"] = "System Design"
    if "code_quality" in name:
        meta["topic"] = "code_quality"
    if "bias" in name:
        meta["topic"] = "bias_mitigation"
    if "feedback" in name:
        meta["topic"] = "feedback_format"
    return meta


# ---------------------------------------------------------------------------
# Vector store
# ---------------------------------------------------------------------------

_vector_store = None
_chunks_cache: list[dict] = []


def _build_vector_store():
    """Build and populate the vector store from knowledge base files."""
    global _vector_store, _chunks_cache

    docs = _load_markdown_files()
    if not docs:
        return None

    all_chunks = []
    for doc in docs:
        chunks = _chunk_document(doc)
        for c in chunks:
            c["metadata"] = _extract_metadata(doc["source"])
            all_chunks.append(c)
    _chunks_cache = all_chunks

    if DEMO_MODE or not QDRANT_URL:
        # Use ChromaDB (local, persistent)
        try:
            import chromadb
            from langchain_community.vectorstores import Chroma
            from langchain_core.documents import Document

            embedding_fn = _get_embedding_function()
            client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

            langchain_docs = [
                Document(page_content=c["text"], metadata=c["metadata"])
                for c in all_chunks
            ]

            store = Chroma.from_documents(
                documents=langchain_docs,
                embedding=embedding_fn,
                collection_name=COLLECTION_NAME,
                client=client,
            )
            return store
        except Exception as e:
            print(f"[RAG] Chroma init failed: {e}, falling back to in-memory search")
            return None
    else:
        # Use Qdrant
        try:
            from langchain_community.vectorstores import Qdrant
            from langchain_core.documents import Document
            from qdrant_client import QdrantClient

            embedding_fn = _get_embedding_function()
            client = QdrantClient(url=QDRANT_URL)

            langchain_docs = [
                Document(page_content=c["text"], metadata=c["metadata"])
                for c in all_chunks
            ]

            store = Qdrant.from_documents(
                documents=langchain_docs,
                embedding=embedding_fn,
                collection_name=COLLECTION_NAME,
                url=QDRANT_URL,
            )
            return store
        except Exception as e:
            print(f"[RAG] Qdrant init failed: {e}, falling back to in-memory search")
            return None


def get_vector_store():
    """Get or lazily initialize the vector store."""
    global _vector_store
    if _vector_store is None:
        _vector_store = _build_vector_store()
    return _vector_store


def get_vector_db_name() -> str:
    if DEMO_MODE or not QDRANT_URL:
        return "ChromaDB (local)"
    return "Qdrant"


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def retrieve_rubric(
    role: str,
    seniority: str,
    problem_type: str,
    problem_title: str = "",
    query: str = "",
    k: int = 5,
) -> list[dict]:
    """Retrieve relevant rubric chunks from the vector store.

    Returns list of {source, snippet, relevance} dicts.
    """
    store = get_vector_store()

    # Build a query string
    if not query:
        query = f"{role} {seniority} {problem_type} {problem_title} rubric evaluation criteria"

    if store is not None:
        try:
            results = store.similarity_search_with_relevance_scores(query, k=k)
            evidence = []
            for doc, score in results:
                evidence.append({
                    "source": doc.metadata.get("source", "unknown"),
                    "snippet": doc.page_content[:300].strip(),
                    "relevance": round(float(score), 3) if score is not None else 0.0,
                })
            return evidence
        except Exception as e:
            print(f"[RAG] Vector search failed: {e}, using fallback")

    # Fallback: keyword-based search over cached chunks
    return _keyword_search(query, k)


def _keyword_search(query: str, k: int = 5) -> list[dict]:
    """Simple keyword-based fallback search."""
    global _chunks_cache
    if not _chunks_cache:
        docs = _load_markdown_files()
        for doc in docs:
            for c in _chunk_document(doc):
                c["metadata"] = _extract_metadata(doc["source"])
                _chunks_cache.append(c)

    query_lower = query.lower()
    query_words = set(query_lower.split())
    scored = []
    for chunk in _chunks_cache:
        text_lower = chunk["text"].lower()
        matches = sum(1 for w in query_words if w in text_lower)
        if matches > 0:
            scored.append((matches / max(len(query_words), 1), chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {
            "source": c["source"],
            "snippet": c["text"][:300].strip(),
            "relevance": round(score, 3),
        }
        for score, c in scored[:k]
    ]


def is_loaded() -> bool:
    """Check if knowledge base has been loaded."""
    store = get_vector_store()
    return store is not None or len(_chunks_cache) > 0


def get_chunk_count() -> int:
    """Return the number of chunks in the knowledge base."""
    global _chunks_cache
    if not _chunks_cache:
        docs = _load_markdown_files()
        for doc in docs:
            for c in _chunk_document(doc):
                c["metadata"] = _extract_metadata(doc["source"])
                _chunks_cache.append(c)
    return len(_chunks_cache)
