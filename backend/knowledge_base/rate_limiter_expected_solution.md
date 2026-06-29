# Rate Limiter Expected Solution

## Problem: Design a Rate Limiter

### Problem Description
Design and implement a rate limiter that limits the number of requests a user can make within a given time window.

### Expected Solution Approach

#### Fixed Window Approach
- Maintain a dictionary mapping user IDs to (count, window_start_time)
- On each request, check if current time is within the window
- If within window, increment count and check against limit
- If window expired, reset count and start new window
- Time Complexity: O(1) per request
- Space Complexity: O(n) where n is number of unique users

#### Sliding Window Approach (Preferred)
- Maintain a dictionary mapping user IDs to deque/list of timestamps
- On each request, remove timestamps outside the window
- Add current timestamp
- Check if list length exceeds limit
- Time Complexity: O(k) where k is requests in window
- Space Complexity: O(n * k)

#### Sliding Window Counter (Best Trade-off)
- Combine fixed window with sliding window estimation
- Use previous window count weighted by overlap ratio
- Time Complexity: O(1)
- Space Complexity: O(n)

### Key Requirements
1. **Per-user limits**: Must track requests per user/client ID
2. **Window behavior**: Clearly define fixed vs sliding window
3. **Timestamp cleanup**: Remove expired entries to prevent memory growth
4. **Concurrency**: Consider thread-safety for production use
5. **Memory management**: Prevent unbounded growth of stored timestamps
6. **Invalid inputs**: Handle empty/None user IDs, negative timestamps
7. **Boundary conditions**: Handle exact window boundary, first request, limit edge

### Common Edge Cases to Handle
- Empty user ID or None
- Negative or zero time window
- First request from a user
- Request exactly at window boundary
- Concurrent requests from same user
- Memory cleanup for inactive users
- Clock skew or timestamp manipulation

### Scoring Expectations
- **Excellent (90+)**: Sliding window with cleanup, concurrency handling, edge cases
- **Good (75-89)**: Fixed or sliding window, some edge cases, basic cleanup
- **Fair (60-74)**: Basic rate limiting, missing cleanup or edge cases
- **Poor (<60)**: Incorrect logic, no per-user tracking, or syntax errors
