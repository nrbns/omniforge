# 🔴 Real-Time Architecture - OmniForge

Complete documentation of OmniForge's real-time collaboration system.

## Overview

OmniForge achieves real-time functionality through a multi-layered architecture combining:
- **Socket.io** for WebSocket communication
- **Yjs (CRDTs)** for conflict-free collaborative editing
- **RealtimeAgent** for generating WebSocket endpoints
- **Presence/Awareness** for live user cursors and collaboration

---

## 🏗️ Architecture Layers

### 1. **Backend - WebSocket Gateway** (`apps/backend/src/realtime/`)

#### **RealtimeGateway** (`realtime.gateway.ts`)
- **Technology**: Socket.io with NestJS WebSocket Gateway
- **Namespace**: `/realtime`
- **Features**:
  - Room-based communication (`idea:{id}`, `project:{id}`, `build:{id}`)
  - Yjs document synchronization
  - Presence/awareness (user cursors, colors, names)
  - Real-time event broadcasting
  - Connection/disconnection handling

**Key Methods**:
```typescript
@SubscribeMessage('joinRoom')
async handleJoin({ roomId, userId, ideaId })

@SubscribeMessage('applyUpdate')
handleUpdate({ roomId, update }) // Yjs updates

@SubscribeMessage('awareness')
handleAwareness({ roomId, userId, awareness })
```

#### **RealtimeService** (`realtime.service.ts`)
- Service layer for emitting events
- Redis pub/sub for multi-instance support
- Event routing to specific rooms

**Key Methods**:
```typescript
async emit(channel: string, event: string, data: any)
async broadcast(roomId: string, event: string, data: any)
```

---

### 2. **Frontend - Real-Time Client** (`apps/frontend/src/`)

#### **WebSocket Connection**
- Uses `socket.io-client` to connect to backend
- Connects to `/realtime` namespace
- Auto-reconnection on disconnect

#### **Yjs Integration**
- **`y-websocket`**: WebSocket provider for Yjs
- **`y-indexeddb`**: Offline persistence
- **`y-monaco`**: Monaco editor binding
- **`y-prosemirror`**: Rich text editor binding (Tiptap)

**Example Usage**:
```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:3001', roomId, ydoc);

// Offline persistence
const indexeddb = new IndexeddbPersistence(roomId, ydoc);
```

---

### 3. **RealtimeAgent** (`packages/agents/src/realtime-agent.ts`)

**Purpose**: AI agent that generates WebSocket endpoints and real-time features for generated applications.

**Responsibilities**:
- Generate WebSocket server code (NestJS/Socket.io)
- Create real-time event handlers
- Generate frontend WebSocket client code
- Set up presence/awareness systems
- Configure Yjs bindings for collaborative editing

**Generated Output**:
```typescript
// Backend: WebSocket gateway
@WebSocketGateway({ namespace: 'app' })
export class AppGateway {
  @SubscribeMessage('message')
  handleMessage() { /* ... */ }
}

// Frontend: WebSocket client
const socket = io('/app');
socket.on('update', (data) => { /* ... */ });
```

---

## 🔄 Real-Time Channels

### **Channel Naming Convention**
- `idea:{ideaId}` - Idea editing, commits, branches
- `project:{projectId}` - Project updates, builds
- `build:{buildId}` - Build progress, logs
- `deployment:{deploymentId}` - Deployment status
- `preview:{projectId}` - Live preview updates
- `presence` - Global presence awareness

### **Event Types**

#### **Idea Events**
- `idea.created` - New idea created
- `idea.updated` - Idea modified
- `idea.parsed` - AI parsing completed
- `idea.committed` - New commit created
- `idea.branched` - Branch created

#### **Build Events**
- `build.created` - Build started
- `build.started` - Build in progress
- `build.progress` - Build progress update
- `build.completed` - Build finished
- `build.failed` - Build error

#### **Deployment Events**
- `deployment.started` - Deployment initiated
- `deployment.progress` - Deployment status
- `deployment.completed` - Deployment live
- `deployment.failed` - Deployment error

#### **Presence Events**
- `user.joined` - User entered room
- `user.left` - User exited room
- `cursor.moved` - Cursor position update
- `selection.changed` - Text selection changed

---

## 🎯 Yjs Integration (CRDTs)

### **Why Yjs?**
- **Conflict-free**: Automatic merge of concurrent edits
- **Offline-first**: Works without connection, syncs when online
- **Low latency**: <50ms local operations
- **Scalable**: Handles 100+ concurrent users

### **Document Structure**
```typescript
const ydoc = new Y.Doc();

// Text editing (code, ideas)
const ytext = ydoc.getText('code');
const ytext2 = ydoc.getText('ideas');

// Map for structured data (tokens, config)
const ymap = ydoc.getMap('tokens');

// Array for lists (components, pages)
const yarray = ydoc.getArray('components');

// XML fragment for rich text
const yxml = ydoc.getXmlFragment('content');
```

### **Editor Bindings**

#### **Monaco Editor** (Code)
```typescript
import { MonacoBinding } from 'y-monaco';

const model = monaco.editor.createModel('', 'typescript');
const binding = new MonacoBinding(
  ydoc.getText('code'),
  model,
  new Set([editor]),
  provider.awareness
);
```

#### **Tiptap/ProseMirror** (Rich Text)
```typescript
import { TiptapBinding } from 'y-prosemirror';

const binding = new TiptapBinding(
  ydoc.getXmlFragment('content'),
  editor.view,
  provider.awareness
);
```

---

## 👥 Presence & Awareness

### **User Presence**
```typescript
provider.awareness.setLocalStateField('user', {
  id: userId,
  name: 'John Doe',
  color: '#ffcc00',
  cursor: { x: 100, y: 200 },
  selection: { from: 0, to: 10 }
});

// Listen for other users
provider.awareness.on('change', () => {
  const states = Array.from(provider.awareness.getStates().entries());
  // states: [[userId, { user: {...}, cursor: {...} }], ...]
});
```

### **Visual Indicators**
- **Cursors**: Show other users' cursor positions
- **Selections**: Highlight selected text
- **Avatars**: Display user avatars with colors
- **Badges**: Show active users in room

---

## 🔌 WebSocket Connection Flow

### **1. Client Connection**
```typescript
// Frontend
const socket = io('http://localhost:3001/realtime', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  socket.emit('joinRoom', { roomId, userId, ideaId });
});
```

### **2. Server Handling**
```typescript
// Backend
@SubscribeMessage('joinRoom')
async handleJoin({ roomId, userId, ideaId }) {
  // Join Socket.io room
  client.join(roomId);
  
  // Initialize Yjs document
  const doc = this.getOrCreateDoc(roomId);
  
  // Set up awareness
  provider.awareness.setLocalStateField('user', { id: userId });
  
  // Send initial state
  const update = Y.encodeStateAsUpdate(doc);
  client.emit('docSync', update);
}
```

### **3. Document Synchronization**
```typescript
// Client receives update
socket.on('docUpdate', (update) => {
  Y.applyUpdate(ydoc, new Uint8Array(update));
});

// Client sends update
ydoc.on('update', (update) => {
  socket.emit('applyUpdate', { roomId, update: Array.from(update) });
});
```

---

## 📊 Performance & Scalability

### **Optimizations**
- **Throttling**: Yjs updates throttled to 5s for persistence
- **Debouncing**: Awareness updates debounced (100ms)
- **Batching**: Multiple updates batched together
- **Compression**: Yjs updates are binary (efficient)

### **Scaling Strategies**
- **Room Sharding**: Distribute rooms across instances
- **Redis Pub/Sub**: Multi-instance synchronization
- **Load Balancing**: Sticky sessions for WebSocket connections
- **CDN**: Static assets served via CDN

### **Metrics**
- **Connection Time**: <100ms
- **Update Latency**: <50ms local, <200ms remote
- **Reconnection**: <2s
- **Concurrent Users**: 100+ per room (tested)

---

## 🧪 Testing Real-Time Features

### **Manual Testing**
1. Open 2+ browser tabs
2. Connect to same room
3. Edit code/ideas simultaneously
4. Verify changes sync instantly
5. Check presence indicators

### **Automated Testing**
```typescript
// Playwright test
test('real-time collaboration', async ({ page, context }) => {
  const page2 = await context.newPage();
  
  await page.goto('/editor/room-123');
  await page2.goto('/editor/room-123');
  
  // Edit in page 1
  await page.fill('.editor', 'const x = 1;');
  
  // Verify in page 2
  await expect(page2.locator('.editor')).toContainText('const x = 1;');
});
```

---

## 🔒 Security Considerations

### **Authentication**
- JWT tokens validated on connection
- User ID extracted from token
- Unauthorized users rejected

### **Authorization**
- Room access control (user must have permission)
- Rate limiting on WebSocket messages
- Input validation on all events

### **Data Privacy**
- Yjs documents encrypted at rest (optional)
- WebSocket connections use WSS in production
- No sensitive data in awareness states

---

## 🚀 Deployment

### **Production Configuration**
```typescript
// Backend
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
  },
  namespace: '/realtime',
  transports: ['websocket'],
})
```

### **Environment Variables**
```bash
# WebSocket server
WS_PORT=3001
WS_PATH=/realtime

# Redis (for pub/sub)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
ALLOWED_ORIGINS=https://yourdomain.com
```

### **Load Balancer Configuration**
- **Sticky Sessions**: Required for WebSocket
- **Health Checks**: Monitor `/health/live`
- **Timeout**: Extended timeout for WebSocket connections

---

## 📚 API Reference

### **Backend Events**

#### **Client → Server**
- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `applyUpdate` - Send Yjs update
- `awareness` - Update presence/awareness
- `message` - Send custom message

#### **Server → Client**
- `docSync` - Initial document state
- `docUpdate` - Document update
- `awareness` - Presence update
- `event` - Custom event (idea.created, build.progress, etc.)

### **Frontend Hooks**

```typescript
// Custom hook for real-time
function useRealtime(roomId: string, userId: string) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const s = io('/realtime');
    s.on('connect', () => {
      s.emit('joinRoom', { roomId, userId });
      setConnected(true);
    });
    setSocket(s);
    return () => s.disconnect();
  }, [roomId, userId]);
  
  return { socket, connected, users };
}
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Connection Fails**
- Check CORS configuration
- Verify WebSocket server is running
- Check firewall/network rules

#### **Updates Not Syncing**
- Verify Yjs provider is connected
- Check room ID matches
- Inspect browser console for errors

#### **High Latency**
- Check network connection
- Verify Redis is responding
- Monitor server CPU/memory

#### **Presence Not Showing**
- Verify awareness is set
- Check user IDs are unique
- Inspect awareness events

---

## 🔮 Future Enhancements

1. **Voice/Video**: WebRTC integration for calls
2. **Screen Sharing**: Share editor view
3. **Comments**: Threaded comments on code
4. **Version History**: Time-travel through edits
5. **Conflict Resolution UI**: Visual merge conflicts
6. **Offline Mode**: Full offline editing with sync

---

## 📖 Resources

- [Yjs Documentation](https://docs.yjs.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [CRDTs Explained](https://crdt.tech/)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

