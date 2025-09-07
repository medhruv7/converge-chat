# Converge Frontend

A React frontend application for the Converge chat system with GraphQL integration and real-time messaging.

## Features

- **User Management**: Create and manage users
- **Real-time Chat**: Send and receive messages in real-time using WebSockets
- **Chat History**: View message history with proper ordering
- **Modern UI**: Built with Material-UI for a clean, responsive interface
- **GraphQL Integration**: Efficient data fetching with Apollo Client

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **Material-UI** - UI component library
- **Socket.IO Client** - Real-time WebSocket communication
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend services running (User Service on port 3000, Chat Service on port 3002)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate GraphQL types:
```bash
npm run codegen
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Environment Configuration

Create a `.env.development` file in the frontend directory:

```env
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:3000/graphql
REACT_APP_CHAT_SERVICE_URL=http://localhost:3002
REACT_APP_USER_SERVICE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatInterface.tsx
│   └── CreateChatDialog.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── ChatPage.tsx
│   └── UserManagementPage.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── services/           # API and WebSocket services
│   ├── apolloClient.ts
│   ├── websocket.ts
│   ├── queries.graphql
│   └── mutations.graphql
├── types/              # TypeScript type definitions
│   └── index.ts
└── generated/          # Generated GraphQL types (auto-generated)
    └── graphql.ts
```

## Key Features

### Authentication
- Simple user selection-based authentication
- User session management with localStorage
- Automatic logout and session cleanup

### Real-time Messaging
- WebSocket connection to chat service
- Real-time message broadcasting
- Message history loading
- Connection status indicators

### GraphQL Integration
- Type-safe queries and mutations
- Automatic code generation
- Optimistic updates
- Error handling

### User Interface
- Responsive design with Material-UI
- Dark/light theme support
- Real-time connection status
- Message timestamps and avatars

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run codegen` - Generate GraphQL types
- `npm run codegen:watch` - Watch mode for GraphQL codegen

## API Integration

The frontend integrates with two backend services:

1. **User Service** (Port 3000)
   - User CRUD operations
   - GraphQL endpoint for user management

2. **Chat Service** (Port 3002)
   - Chat and message operations
   - WebSocket endpoint for real-time messaging
   - REST API for chat management

## WebSocket Events

### Outgoing Events
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `leave_chat` - Leave a chat room

### Incoming Events
- `new_message` - Receive new message
- `user_joined` - User joined chat
- `user_left` - User left chat
- `chat_history` - Chat message history
- `error` - Error notifications

## Development

### GraphQL Code Generation

The project uses GraphQL Code Generator to create TypeScript types and React hooks from GraphQL schema and operations.

```bash
# Generate types once
npm run codegen

# Watch for changes
npm run codegen:watch
```

### Adding New GraphQL Operations

1. Add queries/mutations to `.graphql` files in `src/services/`
2. Run `npm run codegen` to generate types
3. Use generated hooks in components

### Styling

The application uses Material-UI with a custom theme. Components are styled using the `sx` prop for consistent theming.

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### Common Issues

1. **GraphQL Connection Failed**
   - Ensure backend services are running
   - Check environment variables
   - Verify GraphQL endpoint URL

2. **WebSocket Connection Failed**
   - Check chat service is running on port 3002
   - Verify WebSocket URL configuration
   - Check browser console for connection errors

3. **Type Generation Errors**
   - Ensure GraphQL schema is accessible
   - Check codegen.yml configuration
   - Verify GraphQL operations syntax
