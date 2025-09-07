# Testing Documentation for Converge Application

This document provides comprehensive information about the testing strategy and implementation for the Converge chat application.

## Overview

The Converge application includes comprehensive unit tests across all three main components:
- **User Service** (NestJS backend)
- **Chat Service** (NestJS backend with WebSockets)
- **Frontend** (React with TypeScript)

## Test Structure

### Backend Services (User & Chat Services)

Both backend services use:
- **Jest** as the testing framework
- **@nestjs/testing** for NestJS-specific testing utilities
- **TypeORM** repository mocking
- **Redis** mocking for chat service

#### Test Files:
- `*.service.spec.ts` - Service layer tests
- `*.resolver.spec.ts` - GraphQL resolver tests

### Frontend

The frontend uses:
- **Jest** as the testing framework
- **@testing-library/react** for component testing
- **@testing-library/user-event** for user interaction simulation
- **Apollo Client** mocking for GraphQL operations

#### Test Files:
- `*.test.tsx` - Component tests
- `*.test.ts` - Service/utility tests

## Running Tests

### Quick Start

Run all tests across all services:
```bash
./run-tests.sh
```

Run tests with coverage reports:
```bash
./run-tests.sh --coverage
```

### Individual Service Testing

#### User Service
```bash
cd user-service
npm test
npm run test:cov  # With coverage
```

#### Chat Service
```bash
cd chat-service
npm test
npm run test:cov  # With coverage
```

#### Frontend
```bash
cd frontend
npm test
npm run test:watch  # Watch mode
```

## Test Coverage

### User Service Tests

**Coverage Areas:**
- ✅ User creation with validation
- ✅ User retrieval (all, by ID, active users)
- ✅ User updates and deletion
- ✅ GraphQL resolver integration
- ✅ Error handling and edge cases

**Key Test Files:**
- `src/users/users.service.spec.ts` - Service layer tests
- `src/users/users.resolver.spec.ts` - GraphQL resolver tests

**Test Scenarios:**
- Create user with all required fields
- Create user with default values
- Retrieve all users with proper ordering
- Find user by ID (existing and non-existing)
- Filter active users only
- Update user information
- Delete user (success and failure cases)
- GraphQL query and mutation handling

### Chat Service Tests

**Coverage Areas:**
- ✅ Chat creation and management
- ✅ Message sending and retrieval
- ✅ User chat participation
- ✅ WebSocket integration
- ✅ Redis caching and pub/sub
- ✅ GraphQL resolver integration

**Key Test Files:**
- `src/chat/chat.service.spec.ts` - Service layer tests
- `src/chat/chat.resolver.spec.ts` - GraphQL resolver tests

**Test Scenarios:**
- Create chat with participants
- Join/leave chat functionality
- Send messages with proper sequencing
- Retrieve chat messages with pagination
- Get recent messages from database
- Handle WebSocket events
- Redis message storage and retrieval
- Cross-instance message broadcasting

### Frontend Tests

**Coverage Areas:**
- ✅ React component rendering
- ✅ User interactions and form handling
- ✅ GraphQL query integration
- ✅ WebSocket service functionality
- ✅ Authentication flow
- ✅ Error handling and loading states

**Key Test Files:**
- `src/components/ChatInterface.test.tsx` - Main chat component
- `src/components/CreateChatDialog.test.tsx` - Chat creation dialog
- `src/pages/LoginPage.test.tsx` - User authentication
- `src/pages/UserManagementPage.test.tsx` - User management
- `src/services/websocket.test.ts` - WebSocket service
- `src/services/apolloClient.test.ts` - Apollo Client configuration
- `src/hooks/useAuth.test.tsx` - Authentication hook

**Test Scenarios:**
- Component rendering with different props
- User input handling and form validation
- GraphQL query execution and error handling
- WebSocket connection and message handling
- Authentication state management
- Local storage persistence
- Error boundary and loading states

## Test Data and Mocking

### Mock Data

All tests use consistent mock data that matches the GraphQL schema:

```typescript
const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};
```

### Mocking Strategy

**Backend Services:**
- Repository methods are mocked using Jest
- Database operations are simulated
- Redis operations are mocked for chat service
- GraphQL resolvers are tested in isolation

**Frontend:**
- Apollo Client hooks are mocked
- WebSocket service is mocked
- Local storage is mocked for auth tests
- User interactions are simulated with @testing-library/user-event

## Best Practices

### Test Organization

1. **Arrange-Act-Assert Pattern**: All tests follow the AAA pattern
2. **Descriptive Test Names**: Test names clearly describe what is being tested
3. **Single Responsibility**: Each test focuses on one specific behavior
4. **Setup and Teardown**: Proper cleanup after each test

### Mocking Guidelines

1. **Minimal Mocking**: Only mock what's necessary for the test
2. **Realistic Mocks**: Mock data should closely resemble real data
3. **Consistent Mocking**: Use the same mock patterns across similar tests
4. **Mock Verification**: Verify that mocked methods are called with correct parameters

### Error Testing

1. **Happy Path**: Test successful operations
2. **Error Cases**: Test failure scenarios and error handling
3. **Edge Cases**: Test boundary conditions and unusual inputs
4. **Validation**: Test input validation and business rules

## Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd user-service && npm ci
        cd ../chat-service && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: ./run-tests.sh --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Debugging Tests

### Running Individual Tests

```bash
# Run specific test file
npm test -- ChatInterface.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Run tests in watch mode
npm run test:watch
```

### Debug Mode

```bash
# Backend services
npm run test:debug

# Frontend
npm test -- --runInBand --detectOpenHandles
```

## Coverage Reports

After running tests with coverage, reports are generated in:
- `user-service/coverage/` - User service coverage
- `chat-service/coverage/` - Chat service coverage
- `frontend/coverage/` - Frontend coverage

Open `coverage/lcov-report/index.html` in a browser to view detailed coverage reports.

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure test databases use different ports
2. **Mock Timing**: Use `waitFor` for async operations in frontend tests
3. **Memory Leaks**: Clean up subscriptions and timers in tests
4. **Type Errors**: Ensure mock data matches TypeScript interfaces

### Test Environment Setup

1. **Node.js**: Version 18 or higher
2. **Dependencies**: Run `npm install` in each service directory
3. **Database**: Tests use in-memory or mocked databases
4. **Redis**: Tests mock Redis operations

## Future Improvements

### Planned Enhancements

1. **Integration Tests**: Add end-to-end tests
2. **Performance Tests**: Add load testing for WebSocket connections
3. **Visual Regression Tests**: Add screenshot testing for UI components
4. **API Contract Tests**: Add tests for GraphQL schema validation

### Test Metrics

- **Current Coverage**: Target 90%+ for all services
- **Test Count**: 50+ tests across all services
- **Execution Time**: < 30 seconds for full test suite
- **Reliability**: 100% test stability

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD principles
2. **Update Mocks**: Ensure mock data stays current
3. **Document Changes**: Update this file for new test patterns
4. **Run Full Suite**: Always run all tests before committing

---

For questions or issues with testing, please refer to the individual service documentation or create an issue in the project repository.
