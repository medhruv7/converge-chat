# Converge Chat Application

A real-time chat application built with microservices architecture, featuring WebSocket communication, GraphQL APIs, and multi-instance deployment support.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop 4.0+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- 4GB+ RAM available

### Start the Application
```bash
# Clone the repository
git clone <repository-url>
cd converge

# Start all services with Docker
docker-compose up -d

# Access the application
open http://localhost:3001
```

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Real-time Messaging**: WebSocket-based instant messaging
- **Multi-User Chats**: Create and join chat rooms
- **User Management**: Complete user CRUD operations
- **Message History**: Persistent message storage and retrieval
- **Multi-Instance Support**: Run multiple backend instances simultaneously
- **GraphQL APIs**: Type-safe API with subscriptions
- **Responsive UI**: Material-UI based modern interface

### Technical Features
- **Microservices Architecture**: Separate user and chat services
- **Database Integration**: PostgreSQL with TypeORM
- **Caching**: Redis for message ordering and pub/sub
- **Real-time Communication**: Socket.IO for WebSocket connections
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive unit test suite
- **Docker Support**: Containerized deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   User Service  │    │  Chat Service   │
│   (React)       │◄──►│   (NestJS)      │    │   (NestJS)      │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   PostgreSQL    │    │   PostgreSQL    │
         │              │   (Users DB)    │    │   (Chat DB)     │
         │              └─────────────────┘    └─────────────────┘
         │                                              │
         └──────────────────────────────────────────────┼
                                                        ▼
                                              ┌─────────────────┐
                                              │     Redis       │
                                              │   (Pub/Sub)     │
                                              └─────────────────┘
```

### Service Overview

| Service | Port | Purpose | Database | Key Features |
|---------|------|---------|----------|--------------|
| **Frontend** | 3001 | User Interface | - | React, Material-UI, Apollo Client |
| **User Service** | 3000 | User Management | PostgreSQL | GraphQL, REST API, User CRUD |
| **Chat Service** | 3002 | Messaging | PostgreSQL | WebSocket, GraphQL, Real-time |

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Cache**: Redis 7
- **API**: GraphQL with Apollo Server
- **Real-time**: Socket.IO
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Apollo Client
- **Routing**: React Router
- **Real-time**: Socket.IO Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (production)
- **Environment**: Node.js 18+

## 🚀 Getting Started

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd converge

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Local Development

```bash
# Install dependencies
cd user-service && npm install
cd ../chat-service && npm install
cd ../frontend && npm install

# Start databases
docker-compose up -d postgres redis

# Start services (in separate terminals)
cd user-service && npm run start:dev
cd chat-service && npm run start:dev
cd frontend && npm start
```

### Access Points
- **Frontend**: http://localhost:3001
- **User Service GraphQL**: http://localhost:3000/graphql
- **Chat Service GraphQL**: http://localhost:3002/graphql

## 💻 Development

### Project Structure
```
converge/
├── user-service/          # User management microservice
│   ├── src/
│   │   ├── entities/      # TypeORM entities
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── users/        # User module
│   │   └── app.module.ts
│   ├── package.json
│   └── Dockerfile
├── chat-service/          # Chat and messaging microservice
│   ├── src/
│   │   ├── entities/      # TypeORM entities
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── chat/         # Chat module
│   │   └── app.module.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── hooks/        # Custom hooks
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Docker Compose configuration
├── run-tests.sh          # Test runner script
└── README.md
```

### Development Commands

```bash
# User Service
cd user-service
npm run start:dev          # Start in development mode
npm run build             # Build for production
npm test                  # Run tests
npm run test:cov          # Run tests with coverage

# Chat Service
cd chat-service
npm run start:dev          # Start in development mode
npm run build             # Build for production
npm test                  # Run tests
npm run test:cov          # Run tests with coverage

# Frontend
cd frontend
npm start                 # Start development server
npm run build             # Build for production
npm test                  # Run tests
npm run test:watch        # Run tests in watch mode
```

## 🧪 Testing

### Run All Tests
```bash
# Run all tests across all services
./run-tests.sh

# Run tests with coverage
./run-tests.sh --coverage
```

### Individual Service Testing
```bash
# User Service tests
cd user-service && npm test

# Chat Service tests
cd chat-service && npm test

# Frontend tests
cd frontend && npm test
```

### Test Coverage
- **Target**: 90%+ coverage across all services
- **Current**: 50+ test cases
- **Tools**: Jest, @testing-library/react

For detailed testing information, see [TESTING.md](./TESTING.md).

## 🚀 Deployment

### Multi-Instance Deployment
```bash
# Scale services to multiple instances
docker-compose up -d --scale user-service=3 --scale chat-service=5

# Check running instances
docker-compose ps
```

### Production Deployment
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# With environment variables
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

For detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 API Documentation

### User Service API

**GraphQL Endpoint**: `http://localhost:3000/graphql`

**Queries**:
```graphql
query GetUsers {
  users {
    id
    firstName
    lastName
    email
    phoneNumber
    isActive
  }
}

query GetUser($id: ID!) {
  user(id: $id) {
    id
    firstName
    lastName
    email
    phoneNumber
    isActive
  }
}
```

**Mutations**:
```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    firstName
    lastName
    email
    phoneNumber
    isActive
  }
}
```

### Chat Service API

**GraphQL Endpoint**: `http://localhost:3002/graphql`

**Queries**:
```graphql
query GetUserChats($userId: ID!) {
  userChats(userId: $userId) {
    id
    name
    type
    participants {
      id
      firstName
      lastName
    }
  }
}

query GetChatMessages($chatId: ID!, $userId: ID!, $limit: Float, $offset: Float) {
  chatMessages(chatId: $chatId, userId: $userId, limit: $limit, offset: $offset) {
    id
    content
    sender {
      id
      firstName
      lastName
    }
    createdAt
  }
}
```

**Mutations**:
```graphql
mutation CreateChat($input: CreateChatInput!) {
  createChat(input: $input) {
    id
    name
    type
    participants {
      id
      firstName
      lastName
    }
  }
}

mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    sender {
      id
      firstName
      lastName
    }
    createdAt
  }
}
```

**Subscriptions**:
```graphql
subscription NewMessage($chatId: ID!) {
  newMessage(chatId: $chatId) {
    id
    content
    sender {
      id
      firstName
      lastName
    }
    createdAt
  }
}
```

### WebSocket Events

**Client to Server**:
- `join_chat`: Join a chat room
- `leave_chat`: Leave a chat room
- `send_message`: Send a message

**Server to Client**:
- `new_message`: New message received
- `user_joined`: User joined chat
- `user_left`: User left chat
- `chat_history`: Chat message history
- `error`: Error occurred

## 🔧 Configuration

### Environment Variables

**User Service**:
```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=converge_users
```

**Chat Service**:
```bash
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=converge_chat
REDIS_HOST=localhost
REDIS_PORT=6379
USER_SERVICE_URL=http://localhost:3000
```

**Frontend**:
```bash
REACT_APP_USER_SERVICE_URL=http://localhost:3000
REACT_APP_CHAT_SERVICE_URL=http://localhost:3002
REACT_APP_WS_URL=ws://localhost:3002
```

## 🚨 Current Limitations

### Security
- No JWT token authentication
- No password hashing
- No input sanitization
- No rate limiting

### Scalability
- Single database instance
- No Redis clustering
- No load balancing
- No auto-scaling

### Performance
- No caching layer
- No database indexing optimization
- No CDN for static assets

### Monitoring
- No centralized logging
- No metrics collection
- No health checks
- No error tracking

## 🔮 Future Improvements

### Planned Enhancements
1. **Authentication & Security**
   - JWT token implementation
   - Password hashing with bcrypt
   - Input validation and sanitization
   - Rate limiting and CORS

2. **Scalability**
   - Kafka for event streaming
   - Redis clustering
   - Load balancer with Nginx
   - Auto-scaling with Docker Swarm

3. **Performance**
   - Multi-level caching strategy
   - Database indexing optimization
   - CDN for static assets
   - Connection pooling

4. **Monitoring & Observability**
   - Centralized logging with Winston
   - Metrics collection with Prometheus
   - Health checks and monitoring
   - Error tracking with Sentry

5. **Data Management**
   - Database read replicas
   - Data encryption at rest
   - Backup and recovery strategy
   - Data migration tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [Architecture Documentation](./ARCHITECTURE.md)
- Review the [Deployment Guide](./DEPLOYMENT.md)
- See the [Testing Guide](./TESTING.md)

---

**Built with ❤️ using NestJS, React, and Docker**