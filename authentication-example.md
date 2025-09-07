# Authentication Implementation Options

## Option 1: JWT-based Authentication (Recommended)

### Backend Changes Needed:

1. **Install JWT Dependencies**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

2. **Create Auth Module**
```typescript
// user-service/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

3. **Create Auth Service**
```typescript
// user-service/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    // Implement password hashing comparison (bcrypt)
    return true; // Placeholder
  }
}
```

4. **Create JWT Strategy**
```typescript
// user-service/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

5. **Create Auth Guard**
```typescript
// user-service/src/auth/auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

6. **Protect Routes**
```typescript
// user-service/src/users/users.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all routes
export class UsersController {
  // ... existing code
}
```

### Frontend Changes Needed:

1. **Update Login Flow**
```typescript
// frontend/src/services/auth.ts
export class AuthService {
  async login(email: string, password: string) {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}
```

2. **Add Authorization Headers**
```typescript
// frontend/src/services/api.ts
class ApiService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
```

## Option 2: Session-based Authentication

### Backend Changes:
1. Install session middleware
2. Create session store (Redis recommended)
3. Implement login/logout endpoints
4. Add session validation middleware

### Frontend Changes:
1. Handle session cookies
2. Implement proper login/logout flow
3. Add session validation

## Option 3: Keep Current Simple Approach (Not Recommended for Production)

If you want to keep the current simple approach for development/demo purposes:

### Pros:
- Simple to implement and test
- No complex authentication logic
- Easy to demo functionality

### Cons:
- Major security vulnerabilities
- No user privacy protection
- Not suitable for production
- Anyone can access any user's data

## Recommendation

For a production application, I strongly recommend implementing **JWT-based authentication** (Option 1) as it provides:
- Stateless authentication
- Scalable across multiple services
- Industry standard
- Good security practices

Would you like me to implement the JWT authentication system, or do you prefer to keep the current simple approach for now?
