# Converge Chat Application - System Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Data Flow](#data-flow)
4. [Technology Stack](#technology-stack)
5. [Deployment with Docker](#deployment-with-docker)
6. [Testing Strategy](#testing-strategy)
7. [Current Limitations](#current-limitations)
8. [Future Improvements](#future-improvements)
9. [Performance Considerations](#performance-considerations)
10. [Security Considerations](#security-considerations)

## System Overview

Converge is a real-time chat application built with a microservices architecture. It consists of three main components:

- **User Service**: Manages user accounts and authentication
- **Chat Service**: Handles chat rooms, messages, and real-time communication
- **Frontend**: React-based web interface for user interaction

The system supports multiple backend instances running simultaneously, ensuring scalability and high availability.

## Architecture Components

### 1. User Service (Port 3000)
**Purpose**: User management and authentication

**Key Features**:
- User CRUD operations
- GraphQL API with Apollo Server
- PostgreSQL database integration
- REST API endpoints for backward compatibility

**Components**:
```
user-service/
├── src/
│   ├── entities/          # TypeORM entities
│   ├── dto/              # Data Transfer Objects
│   ├── users/            # User module
│   │   ├── users.service.ts
│   │   ├── users.resolver.ts
│   │   └── users.controller.ts
│   └── app.module.ts
```

**API Endpoints**:
- GraphQL: `http://localhost:3000/graphql`
- REST: `http://localhost:3000/users`

### 2. Chat Service (Port 3002)
**Purpose**: Real-time messaging and chat management

**Key Features**:
- Chat room management
- Real-time messaging via WebSockets
- Message persistence and ordering
- Redis pub/sub for cross-instance communication
- GraphQL API with subscriptions

**Components**:
```
chat-service/
├── src/
│   ├── entities/          # TypeORM entities
│   ├── dto/              # Data Transfer Objects
│   ├── chat/             # Chat module
│   │   ├── chat.service.ts
│   │   ├── chat.resolver.ts
│   │   ├── chat.controller.ts
│   │   └── chat.gateway.ts  # WebSocket gateway
│   └── app.module.ts
```

**API Endpoints**:
- GraphQL: `http://localhost:3002/graphql`
- WebSocket: `ws://localhost:3002`
- REST: `http://localhost:3002/chats`

### 3. Frontend (Port 3001)
**Purpose**: User interface and client-side logic

**Key Features**:
- React-based single-page application
- Apollo Client for GraphQL integration
- WebSocket client for real-time updates
- Material-UI for responsive design
- Local storage for authentication persistence

**Components**:
```
frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API and WebSocket services
│   ├── hooks/           # Custom React hooks
│   └── generated/       # GraphQL generated types
```

### 4. Database Layer
**PostgreSQL Database**:
- **Database**: `converge_users` (User Service)
- **Database**: `converge_chat` (Chat Service)
- **Tables**: `users`, `chats`, `messages`, `chat_participants`

**Redis Cache**:
- **Purpose**: Message ordering and pub/sub
- **Data Structures**: Sorted Sets for message ordering
- **Pub/Sub**: Cross-instance message broadcasting

## Data Flow

### 1. User Authentication Flow
```
Frontend → User Service → PostgreSQL
    ↓
Local Storage (Auth Token)
```

### 2. Chat Message Flow
```
Frontend → WebSocket → Chat Service → PostgreSQL
    ↓
Redis Pub/Sub → Other Chat Service Instances
    ↓
WebSocket → Other Connected Clients
```

### 3. Real-time Message Delivery
```
1. User sends message via WebSocket
2. Chat Service validates and stores in PostgreSQL
3. Message added to Redis Sorted Set for ordering
4. Redis pub/sub broadcasts to other instances
5. All instances emit to connected clients
6. Frontend receives and displays message
```

## Technology Stack

### Backend Services
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

## Deployment with Docker

### Prerequisites
- Docker Desktop
- Docker Compose
- Git

### Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd converge
```

2. **Start all services**:
```bash
docker-compose up -d
```

3. **Access the application**:
- Frontend: http://localhost:3001
- User Service GraphQL: http://localhost:3000/graphql
- Chat Service GraphQL: http://localhost:3002/graphql

### Multi-Instance Deployment

To run multiple instances of each service:

```bash
# Scale user service to 3 instances
docker-compose up -d --scale user-service=3

# Scale chat service to 3 instances
docker-compose up -d --scale chat-service=3
```

### Environment Configuration

Create environment files for different deployments:

**Development** (`.env.development`):
```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
REDIS_HOST=redis
REDIS_PORT=6379
```

**Production** (`.env.production`):
```env
NODE_ENV=production
DB_HOST=postgres-cluster
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
REDIS_HOST=redis-cluster
REDIS_PORT=6379
```

### Docker Compose Override

For production with multiple instances:

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  user-service:
    deploy:
      replicas: 3
    environment:
      NODE_ENV: production
      
  chat-service:
    deploy:
      replicas: 3
    environment:
      NODE_ENV: production
```

## Testing Strategy

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full application flow testing

### Running Tests

**All Tests**:
```bash
./run-tests.sh
```

**With Coverage**:
```bash
./run-tests.sh --coverage
```

**Individual Services**:
```bash
# User Service
cd user-service && npm test

# Chat Service
cd chat-service && npm test

# Frontend
cd frontend && npm test
```

### Test Coverage
- **Target**: 90%+ coverage across all services
- **Current**: 50+ test cases
- **Tools**: Jest, @testing-library/react

## Current Limitations

### 1. Authentication & Security
- **No JWT tokens**: Using simple user ID storage
- **No password hashing**: Users created without passwords
- **No session management**: Stateless authentication
- **No rate limiting**: Vulnerable to abuse
- **No input sanitization**: XSS vulnerabilities possible

### 2. Data Management
- **No caching layer**: Every request hits database
- **No data validation**: Limited input validation
- **No data encryption**: Sensitive data stored in plain text
- **No backup strategy**: Data loss risk

### 3. Scalability Issues
- **Single database**: No read replicas or sharding
- **Redis single point of failure**: No Redis clustering
- **No load balancing**: Manual instance management
- **No auto-scaling**: Manual scaling required

### 4. Real-time Communication
- **Limited WebSocket scaling**: Memory-based connection management
- **No message queuing**: Redis pub/sub only
- **No message persistence**: Lost if service restarts
- **No message ordering guarantees**: Race conditions possible

### 5. Monitoring & Observability
- **No logging strategy**: Console logs only
- **No metrics collection**: No performance monitoring
- **No health checks**: No service health monitoring
- **No error tracking**: No centralized error management

## Future Improvements

### 1. Event-Driven Architecture with Kafka

**Current**: Redis pub/sub
**Proposed**: Apache Kafka

**Benefits**:
- Better message ordering guarantees
- Message persistence and replay
- Higher throughput and scalability
- Better fault tolerance

**Implementation**:
```yaml
# docker-compose.kafka.yml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      
  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
```

### 2. Authentication & Authorization

**JWT Implementation**:
```typescript
// JWT Service
@Injectable()
export class JwtService {
  generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
  
  validateToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
```

**Password Hashing**:
```typescript
// Password Service
@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### 3. Caching Strategy

**Redis Caching with TTL**:
```typescript
// Cache Service
@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

**Cache Implementation**:
```typescript
// Cached User Service
@Injectable()
export class UsersService {
  constructor(
    private userRepository: Repository<User>,
    private cacheService: CacheService
  ) {}
  
  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.cacheService.get<User>(cacheKey);
    
    if (!user) {
      user = await this.userRepository.findOne({ where: { id } });
      if (user) {
        await this.cacheService.set(cacheKey, user, 3600); // 1 hour TTL
      }
    }
    
    return user;
  }
}
```

### 4. Database Optimization

**Indexing Strategy**:
```sql
-- User Service Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Chat Service Indexes
CREATE INDEX idx_chats_participants ON chat_participants(user_id, chat_id);
CREATE INDEX idx_messages_chat_sequence ON messages(chat_id, sequence_number);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

**Query Optimization**:
```typescript
// Optimized Chat Messages Query
async getChatMessages(chatId: string, limit: number = 50, offset: number = 0) {
  return this.messageRepository
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.sender', 'sender')
    .where('message.chatId = :chatId', { chatId })
    .orderBy('message.sequenceNumber', 'ASC')
    .limit(limit)
    .offset(offset)
    .getMany();
}
```

### 5. Monitoring & Observability

**Logging Strategy**:
```typescript
// Logger Service
@Injectable()
export class LoggerService {
  private logger = new Logger('AppService');
  
  log(message: string, context?: string) {
    this.logger.log(message, context);
  }
  
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }
}
```

**Health Checks**:
```typescript
// Health Check Controller
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

## Performance Considerations

### 1. Database Performance
- **Connection Pooling**: Configure TypeORM connection pool
- **Query Optimization**: Use proper indexes and query patterns
- **Read Replicas**: Implement read/write splitting

### 2. Caching Strategy
- **Application-level**: Redis for frequently accessed data
- **CDN**: Static assets and API responses
- **Browser**: HTTP caching headers

### 3. WebSocket Scaling
- **Sticky Sessions**: Use Redis adapter for Socket.IO
- **Horizontal Scaling**: Multiple instances with shared state
- **Connection Management**: Implement connection limits

## Security Considerations

### 1. Input Validation
- **Sanitization**: Clean all user inputs
- **Validation**: Strict data type validation
- **Rate Limiting**: Prevent abuse and DoS attacks

### 2. Authentication Security
- **JWT Security**: Secure token generation and validation
- **Password Policy**: Strong password requirements
- **Session Management**: Secure session handling

### 3. Data Protection
- **Encryption**: Encrypt sensitive data at rest
- **HTTPS**: Secure communication channels
- **CORS**: Proper cross-origin resource sharing

## Conclusion

The Converge chat application provides a solid foundation for real-time messaging with a microservices architecture. While the current implementation serves basic requirements, the proposed improvements would significantly enhance security, scalability, and performance.

The system is designed to be easily extensible, allowing for gradual implementation of these improvements without disrupting existing functionality.

---

For detailed implementation guides and code examples, refer to the individual service documentation and the testing guide.
