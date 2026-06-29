# AI Engineer Rubric

## Evaluation Criteria for AI Engineer Roles

### Correctness (Weight: 30%)
- ML/AI solution addresses the correct problem
- Model architecture is appropriate for the task
- Training/inference pipeline is logically sound
- Evaluation metrics are correctly implemented

### Complexity (Weight: 15%)
- Computational complexity is reasonable
- Memory usage during inference is considered
- Batch processing is implemented where appropriate
- Caching strategies for embeddings/models

### Edge Cases (Weight: 15%)
- Empty input handling
- Token limit handling for LLMs
- Embedding dimension mismatches
- Model failure and fallback strategies
- Hallucination prevention
- Context window overflow handling

### Readability (Weight: 10%)
- Clear model/pipeline naming
- Configuration is separated from logic
- Hyperparameters are documented
- Code is reproducible

### Maintainability (Weight: 10%)
- Pipeline is modular and extensible
- Model versioning is considered
- A/B testing infrastructure
- Monitoring and logging are present

### Communication (Weight: 20%)
- Technical decisions are documented
- Model card or documentation is present
- Code comments explain AI-specific logic
- Evaluation results are clearly reported

## Seniority Expectations

### Junior
- Can implement basic ML pipelines
- Understands common frameworks
- Learning evaluation metrics

### Mid
- Designs end-to-end ML systems
- Understands trade-offs between models
- Implements proper evaluation pipelines
- Considers production deployment

### Senior
- Designs scalable AI infrastructure
- Handles MLOps and model lifecycle
- Makes architecture decisions for AI systems
- Considers cost, latency, and quality trade-offs
- Implements RAG, agent workflows, and tool calling
