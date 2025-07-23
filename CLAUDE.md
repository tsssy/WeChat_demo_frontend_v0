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
  - `/profile` → Profile (displays user information via `getUserInfoWithUserId` API)

#### Service Layer
- `src/services/APIServices.js` - Main API service layer
- `src/services/api.js` - Core API utilities  
- `src/services/APISchemes.js` - API schema definitions
- `src/services/NetworkManager.js` - HTTP request management with interceptors
- `src/composables/useApiRequester.js` - API request composable
- `src/utils/config.js` - **Unified URL configuration management**
- `src/wsclients/WebSocketClient.js` - WebSocket connection management
- `src/wsclients/BaseWebSocketClient.js` - Base WebSocket client class

#### Component Architecture
Components organized by feature:
- **Home/**: Gender-specific UI components (Male/Female folders)
- **GenderSelection/**: User gender selection flow
- **ModeSelection/**: App mode selection
- **Matches/**: Match display and management
- **Shared**: Common UI components (Toast, NavigationManager, etc.)

### Backend Integration

#### URL Configuration Management
All API and WebSocket URLs are managed centrally in `src/utils/config.js`:
- **Environment Detection**: Automatically selects development or production URLs
- **API Configuration**: Centralized API endpoint management
- **WebSocket Configuration**: Unified WebSocket URL handling
- **Helper Functions**: `getApiUrl()`, `getWebSocketUrl()`, `getMatchWebSocketUrl()`, `getMessageWebSocketUrl()`

Usage example:
```javascript
import { getApiUrl, getMessageWebSocketUrl } from '@/utils/config.js'

// API calls
const apiEndpoint = getApiUrl('/api/v1/UserManagement/get_user_info_with_user_id')

// WebSocket connections  
const wsUrl = getMessageWebSocketUrl()
const ws = new WebSocket(wsUrl)
```

#### API Configuration
- **Development**: URLs configured in `src/utils/config.js`
- **Production**: URLs configured in `src/utils/config.js`
- **Environment-based**: Automatically switches based on `import.meta.env.DEV`

#### Key API Endpoints
- **User Management**: `/UserManagement/` (create user, edit profile, get user info)
- **Match Management**: `/MatchManager/` (create match, toggle likes, get match info)  
- **Chatroom Management**: `/ChatroomManager/` (get/create chatroom, chat history)

#### WebSocket Connections
Three specialized WebSocket endpoints (all managed via `src/utils/config.js`):
- `/ws/base` - General purpose with authentication
- `/ws/message` - Private messaging and chat functionality  
- `/ws/match` - Real-time match notifications

All WebSocket connections require authentication via `user_id` on connection.

**Usage with unified configuration:**
```javascript
import { getBaseWebSocketUrl, getMessageWebSocketUrl, getMatchWebSocketUrl } from '@/utils/config.js'

// Connect to different WebSocket endpoints
const baseWs = new WebSocket(getBaseWebSocketUrl())
const messageWs = new WebSocket(getMessageWebSocketUrl()) 
const matchWs = new WebSocket(getMatchWebSocketUrl())
```

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
- `src/utils/config.js` - **Unified URL configuration management (NEW)**
- `src/composables/useApiRequester.js` - API request composable
- `src/services/NetworkManager.js` - HTTP request management with interceptors
- `src/wsclients/WebSocketClient.js` - WebSocket connection utilities
- `src/wsclients/BaseWebSocketClient.js` - Base WebSocket client class
- `src/stores/navigation.js` - Navigation state management
- `src/stores/user.js` - User state management

## Recent Updates

### URL Configuration Refactor
- **Centralized Configuration**: All URLs now managed in `src/utils/config.js`
- **Environment Detection**: Automatic switching between development/production URLs
- **Unified API**: Consistent interface for getting API and WebSocket URLs
- **Migration**: Updated all files to use the new configuration system

### Profile Page Enhancement
- **Dynamic Data Loading**: Profile page now fetches real user data via API
- **Error Handling**: Added loading states and error handling with retry functionality
- **Real-time Updates**: Listens to `match_update` events for automatic data refresh
- **Modern UI**: Improved styling with card-based layout and responsive design