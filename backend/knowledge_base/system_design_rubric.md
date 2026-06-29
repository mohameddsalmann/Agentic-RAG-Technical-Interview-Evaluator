# System Design Rubric

## Evaluation Criteria for System Design Problems

### Correctness (Weight: 30%)
- Design addresses all stated requirements
- Core components are correctly identified
- Data flow is logical and complete
- API design meets the problem needs

### Complexity (Weight: 15%)
- System handles expected scale efficiently
- Resource usage is reasonable (memory, CPU, network)
- Bottlenecks are identified and addressed
- Caching strategies are appropriate

### Edge Cases (Weight: 15%)
- Failure modes and error handling
- Scaling beyond initial requirements
- Network partitions and timeouts
- Data consistency issues
- Concurrent access patterns
- Disaster recovery considerations

### Readability (Weight: 10%)
- Design is clearly communicated
- Component naming is intuitive
- Architecture is easy to follow
- Trade-offs are explicitly stated

### Maintainability (Weight: 10%)
- System is modular and extensible
- Components have clear responsibilities
- Design allows for future feature additions
- Monitoring and observability are considered

### Communication (Weight: 20%)
- Design rationale is explained
- Trade-offs are discussed
- Assumptions are stated explicitly
- Alternative approaches are considered

## Key System Design Components to Evaluate

### Architecture
- Component diagram and responsibilities
- Service boundaries and APIs
- Data storage choices (SQL, NoSQL, cache)
- Communication patterns (sync, async, event-driven)

### Scalability
- Horizontal vs vertical scaling
- Load balancing strategy
- Database sharding/partitioning
- Caching layers

### Reliability
- Single points of failure
- Redundancy and replication
- Fault tolerance mechanisms
- Health checks and circuit breakers

### Security
- Authentication and authorization
- Data encryption (at rest and in transit)
- Input validation and sanitization
- Rate limiting and DDoS protection

## Scoring Guide

### Excellent (90-100)
- Comprehensive design with all components
- Clear trade-off analysis
- Handles scale, reliability, and security
- Well-structured and communicated

### Good (75-89)
- Solid design covering main requirements
- Some trade-off discussion
- Addresses scalability and reliability

### Fair (60-74)
- Basic design with missing components
- Limited discussion of trade-offs
- Some scalability considerations

### Poor (below 60)
- Incomplete or incorrect design
- No consideration for scale or reliability
- Poor communication
