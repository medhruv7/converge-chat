# Converge Chat Application - Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Deployment](#development-deployment)
3. [Production Deployment](#production-deployment)
4. [Multi-Instance Deployment](#multi-instance-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Scaling Strategies](#scaling-strategies)

## Quick Start

### Prerequisites
- Docker Desktop 4.0+
- Docker Compose 2.0+
- Git
- 4GB+ RAM available

### 1. Clone and Start
```bash
# Clone the repository
git clone <repository-url>
cd converge

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Verify Deployment
```bash
# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000/users
curl http://localhost:3002/chats
curl http://localhost:3001
```

### 3. Access Application
- **Frontend**: http://localhost:3001
- **User Service GraphQL**: http://localhost:3000/graphql
- **Chat Service GraphQL**: http://localhost:3002/graphql

## Development Deployment

### Local Development Setup

1. **Install Dependencies**:
```bash
# User Service
cd user-service
npm install
npm run start:dev

# Chat Service (in new terminal)
cd chat-service
npm install
npm run start:dev

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

2. **Database Setup**:
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations (if any)
cd user-service
npm run migration:run

cd chat-service
npm run migration:run
```

3. **Environment Variables**:
```bash
# Copy environment files
cp user-service/.env.example user-service/.env
cp chat-service/.env.example chat-service/.env
cp frontend/.env.example frontend/.env
```

### Development Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: converge_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
```

## Production Deployment

### 1. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - converge-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod_data:/data
    networks:
      - converge-network
    restart: unless-stopped

  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      - postgres
    networks:
      - converge-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  chat-service:
    build:
      context: ./chat-service
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      PORT: 3002
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      USER_SERVICE_URL: http://user-service:3000
    depends_on:
      - postgres
      - redis
      - user-service
    networks:
      - converge-network
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    networks:
      - converge-network
    restart: unless-stopped

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  converge-network:
    driver: bridge
```

### 2. Production Environment File

```bash
# .env.production
NODE_ENV=production
DB_NAME=converge_prod
DB_USER=converge_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
REDIS_PASSWORD=your_redis_password_here
```

### 3. Production Dockerfiles

**User Service Dockerfile.prod**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Chat Service Dockerfile.prod**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "run", "start:prod"]
```

**Frontend Dockerfile.prod**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Multi-Instance Deployment

### 1. Horizontal Scaling

```bash
# Scale user service to 3 instances
docker-compose up -d --scale user-service=3

# Scale chat service to 5 instances
docker-compose up -d --scale chat-service=5

# Check running instances
docker-compose ps
```

### 2. Load Balancer Configuration

```yaml
# docker-compose.lb.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - user-service
      - chat-service
      - frontend
    networks:
      - converge-network

  user-service:
    # ... existing config
    deploy:
      replicas: 3

  chat-service:
    # ... existing config
    deploy:
      replicas: 5
```

**Nginx Configuration**:
```nginx
# nginx.conf
upstream user-service {
    server user-service:3000;
    server user-service:3000;
    server user-service:3000;
}

upstream chat-service {
    server chat-service:3002;
    server chat-service:3002;
    server chat-service:3002;
    server chat-service:3002;
    server chat-service:3002;
}

server {
    listen 80;
    
    location /api/users/ {
        proxy_pass http://user-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/chats/ {
        proxy_pass http://chat-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Redis Clustering

```yaml
# docker-compose.redis-cluster.yml
version: '3.8'

services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_master_data:/data
    networks:
      - converge-network

  redis-replica-1:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379
    depends_on:
      - redis-master
    networks:
      - converge-network

  redis-replica-2:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379
    depends_on:
      - redis-master
    networks:
      - converge-network
```

## Environment Configuration

### 1. Environment Variables

**User Service**:
```bash
# .env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=converge_users
JWT_SECRET=your_jwt_secret
```

**Chat Service**:
```bash
# .env
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
# .env
REACT_APP_USER_SERVICE_URL=http://localhost:3000
REACT_APP_CHAT_SERVICE_URL=http://localhost:3002
REACT_APP_WS_URL=ws://localhost:3002
```

### 2. Configuration Management

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
  },
});
```

## Monitoring & Health Checks

### 1. Health Check Endpoints

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

### 2. Monitoring Stack

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - converge-network

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - converge-network

  jaeger:
    image: jaegertracing/all-in-one
    ports:
      - "16686:16686"
    networks:
      - converge-network
```

### 3. Logging Configuration

```typescript
// Logger Configuration
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});
```

## Troubleshooting

### 1. Common Issues

**Port Conflicts**:
```bash
# Check port usage
lsof -i :3000
lsof -i :3002
lsof -i :3001

# Kill processes
pkill -f "nest start"
```

**Database Connection Issues**:
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U postgres -d converge_users
```

**Redis Connection Issues**:
```bash
# Check Redis status
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### 2. Debug Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service
docker-compose logs -f chat-service

# Execute commands in containers
docker-compose exec user-service sh
docker-compose exec chat-service sh

# Check container status
docker-compose ps
docker stats
```

### 3. Performance Debugging

```bash
# Check resource usage
docker stats

# Check network connectivity
docker-compose exec user-service ping chat-service
docker-compose exec chat-service ping user-service

# Check database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## Scaling Strategies

### 1. Vertical Scaling

```yaml
# Increase resource limits
services:
  user-service:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### 2. Horizontal Scaling

```bash
# Scale based on load
docker-compose up -d --scale user-service=5 --scale chat-service=10

# Auto-scaling with Docker Swarm
docker service create --name user-service --replicas 5 converge/user-service
```

### 3. Database Scaling

```yaml
# Read replicas
services:
  postgres-master:
    image: postgres:15
    environment:
      POSTGRES_DB: converge_users
    volumes:
      - postgres_master_data:/var/lib/postgresql/data

  postgres-replica:
    image: postgres:15
    environment:
      POSTGRES_DB: converge_users
    command: |
      bash -c "
        until pg_basebackup -h postgres-master -D /var/lib/postgresql/data -U postgres -v -P -W; do
          echo 'Waiting for master to be available...'
          sleep 1s
        done
        postgres
      "
    depends_on:
      - postgres-master
```

### 4. Caching Strategy

```typescript
// Multi-level caching
@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private redis: Redis,
    private memoryCache: Map<string, any> = new Map()
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // L2: Redis cache
    const value = await this.redis.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      this.memoryCache.set(key, parsed);
      return parsed;
    }

    return null;
  }
}
```

---

For more detailed information, refer to the [Architecture Documentation](./ARCHITECTURE.md) and [Testing Guide](./TESTING.md).
