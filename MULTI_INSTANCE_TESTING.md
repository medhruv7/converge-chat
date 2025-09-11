# Multi-Instance Testing Guide

## Current Setup

The chat application now supports Redis pub/sub for cross-instance message broadcasting. The main `docker-compose.yml` file includes two chat service instances for testing multi-instance scenarios.

## Testing Instructions

1. **Start all services with multi-instance support:**
   ```bash
   docker-compose up -d
   ```

2. **This automatically creates:**
   - chat-service-1 on port 3007
   - chat-service-2 on port 3009
   - user-service on port 3006
   - postgres on port 5434
   - redis on port 6381
   - frontend on port 3008

3. **Access the application:**
   - Open browser: `http://localhost:3008`
   - Both instances are automatically available for testing

## UI Instance Selector & Indicator

The frontend now has a dropdown to select which instance to connect to:
- **Instance Selector**: Dropdown in the header to choose between available instances
- **Status Indicator**: Colored badge showing connection status and current instance
- **Real-time Switching**: Switch instances without page refresh

### How to Use:
1. Look for the "Chat Instance" dropdown in the header next to your name
2. Select between "Instance 1 (Port 3007)" or "Instance 2 (Port 3009)"
3. The system will automatically reconnect to the selected instance
4. Watch the status indicator change from "Reconnecting..." to "Connected: Port XXXX"

## Expected Behavior

✅ **Cross-Instance Messaging:**
- User A connects to Instance 1 (Port 3007)
- User B connects to Instance 2 (Port 3009)  
- When User A sends a message → Redis pub/sub → Instance 2 receives it → User B sees the message in real-time

✅ **Instance Health:**
- If one instance goes down, users can connect to the other
- Messages are still delivered via Redis pub/sub to all healthy instances

## Testing Scenario

1. **Setup:**
   - Open browser tab 1: Connect as Alice to port 3007
   - Open browser tab 2: Connect as Bob to port 3009

2. **Verify:**
   - Both users should see the instance indicator in the header
   - Alice sends message → Bob receives it instantly
   - Bob sends message → Alice receives it instantly

3. **Multi-Instance Benefits:**
   - Load distribution across instances
   - High availability (one instance can fail)
   - Horizontal scalability

This demonstrates a production-ready multi-instance chat system with Redis pub/sub! 🚀
