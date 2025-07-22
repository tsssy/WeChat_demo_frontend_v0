# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with API proxy)
npm run dev

# Build for production
npm run build

# Lint and fix code
npm run lint

# Format code
npm run format
```

## Core Architecture

### Frontend Stack
- **Vue 3** with Composition API
- **Vite** for build tooling and development server
- **Vue Router** for client-side routing
- **Pinia** for state management
- **ESLint + Prettier** for code quality

### Development Proxy
The Vite dev server proxies `/api/*` requests to `https://lovetapoversea.xyz:4433` to eliminate CORS issues during development.

### Application Structure

#### State Management
- **Pinia Store** at `src/stores/navigation.js` manages page navigation and history
- **Event Bus** at `src/utils/eventBus.js` provides global event communication between components, pages, and WebSocket connections

#### Routing System
- Vue Router configured in `src/router.js` with 6 main views:
  - `/` → FirstMatch (entry point)
  - `/why-him` → WhyHim 
  - `/chatroom` → Chatroom
  - `/match` → Match
  - `/mate` → Mate
  - `/profile` → Profile

#### Service Layer
- `src/services/APIServices.js` - Main API service layer
- `src/services/api.js` - Core API utilities
- `src/services/APISchemes.js` - API schema definitions
- `src/utils/WebSocketClient.js` - WebSocket connection management

#### Component Architecture
Components organized by feature:
- **Home/**: Gender-specific UI components (Male/Female folders)
- **GenderSelection/**: User gender selection flow
- **ModeSelection/**: App mode selection
- **Matches/**: Match display and management
- **Shared**: Common UI components (Toast, NavigationManager, etc.)

### Backend Integration

#### API Configuration
- **Development**: `http://localhost:8000/api/v1/`
- **Production**: `https://lovetapoversea.xyz:4433/api/v1/`

#### Key API Endpoints
- **User Management**: `/UserManagement/` (create user, edit profile, get user info)
- **Match Management**: `/MatchManager/` (create match, toggle likes, get match info)  
- **Chatroom Management**: `/ChatroomManager/` (get/create chatroom, chat history)

#### WebSocket Connections
Three specialized WebSocket endpoints:
- `/ws/base` - General purpose with authentication
- `/ws/message` - Private messaging and chat functionality
- `/ws/match` - Real-time match notifications

All WebSocket connections require authentication via `user_id` on connection.

### Key Development Patterns

#### Event-Driven Architecture
Use the EventBus for cross-component communication:
```javascript
import eventBus from '@/utils/eventBus.js'
eventBus.emit('eventName', data)
eventBus.on('eventName', callback)
```

#### Navigation Management
The navigation store maintains page history and data passing between routes.

#### API Error Handling
All API calls should handle errors gracefully and provide user feedback via the Toast component.

## Important Files to Review

- `FRONTEND_INTEGRATION_GUIDE.md` - Comprehensive backend API documentation
- `src/composables/useApiRequester.js` - API request composable
- `src/utils/WebSocketClient.js` - WebSocket connection utilities
- `src/stores/navigation.js` - Navigation state management