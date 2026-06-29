# Code Quality Standards

## General Code Quality Criteria

### Readability
- **Variable Naming**: Use descriptive names that convey purpose
  - Good: `user_request_count`, `is_rate_limited`
  - Bad: `x`, `data`, `temp`, `val`
- **Function Naming**: Functions should be verbs describing the action
  - Good: `check_rate_limit`, `cleanup_expired_entries`
  - Bad: `process`, `handle`, `do_stuff`
- **Constant Naming**: Use UPPER_CASE for constants
- **Consistent Style**: Follow language conventions (PEP 8 for Python, etc.)

### Structure
- **Function Length**: Functions should be < 30 lines ideally, max 50
- **Single Responsibility**: Each function does one thing well
- **Nesting Depth**: Maximum 3-4 levels of nesting
- **File Organization**: Imports, constants, classes, functions in logical order

### Error Handling
- **Explicit Errors**: Don't swallow exceptions silently
- **Meaningful Messages**: Error messages should help debugging
- **Graceful Degradation**: Handle errors without crashing
- **Input Validation**: Validate inputs at function boundaries

### Documentation
- **Comments**: Explain WHY, not WHAT
- **Docstrings**: All public functions should have docstrings
- **README**: Project-level documentation
- **Type Hints**: Use type annotations where supported

### Security
- **Input Sanitization**: Never trust user input
- **SQL Injection**: Use parameterized queries
- **Hardcoded Secrets**: Never hardcode API keys or passwords
- **Resource Limits**: Prevent resource exhaustion attacks

### Testing
- **Test Coverage**: Aim for > 80% coverage
- **Edge Case Tests**: Test boundary conditions
- **Integration Tests**: Test component interactions
- **Test Naming**: Test names should describe the scenario

### Performance
- **Avoid Premature Optimization**: Correctness first, then optimize
- **Profile Before Optimizing**: Use profiling tools
- **Batch Operations**: Avoid N+1 queries
- **Lazy Loading**: Load data only when needed

### Maintainability
- **DRY Principle**: Don't Repeat Yourself
- **YAGNI Principle**: You Aren't Gonna Need It
- **SOLID Principles**: Where applicable
- **Dependency Injection**: For testability and flexibility
