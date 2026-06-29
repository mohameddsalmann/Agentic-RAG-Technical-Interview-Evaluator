# RAG System Expected Solution

## Problem: Design a RAG System

### Problem Description
Design and implement a Retrieval-Augmented Generation (RAG) system that can answer questions based on a knowledge base of documents.

### Expected Solution Approach

#### Components
1. **Document Loading**: Load documents from various sources (PDF, markdown, web)
2. **Chunking**: Split documents into manageable chunks (500-1000 tokens with overlap)
3. **Embedding**: Convert chunks into vector embeddings using an embedding model
4. **Vector Storage**: Store embeddings in a vector database (Qdrant, Chroma, Pinecone)
5. **Retrieval**: On query, embed the query and search for similar chunks
6. **Context Assembly**: Combine retrieved chunks into a prompt context
7. **Generation**: Send context + query to LLM for answer generation
8. **Source Citation**: Include source references in the response

### Key Design Decisions
- **Chunk size**: Balance between context completeness and retrieval precision
- **Overlap**: 10-20% overlap to avoid splitting important context
- **Embedding model**: Choose based on language, dimension, and cost
- **Top-k**: Number of chunks to retrieve (typically 3-5)
- **Re-ranking**: Optional re-ranking step for better relevance
- **Metadata filtering**: Filter by source, date, category before retrieval

### Advanced Features
- Hybrid search (keyword + semantic)
- Query expansion or rewriting
- Multi-hop retrieval
- Conversation memory
- Streaming responses
- Caching for frequent queries

### Edge Cases to Handle
- Empty query
- No relevant documents found
- Context window overflow
- Conflicting information in sources
- Malformed documents
- Embedding model failures
- Vector database connection issues

### Scoring Expectations
- **Excellent (90+)**: Full pipeline with chunking, embeddings, retrieval, citation, edge cases
- **Good (75-89)**: Core RAG pipeline working, some edge cases, basic citation
- **Fair (60-74)**: Basic retrieval, missing chunking or citation
- **Poor (<60)**: Incorrect pipeline, no vector search, or syntax errors
