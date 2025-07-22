# API Requester Composable

A unified Vue 3 composable for making HTTPS requests to your backend with built-in error handling, authentication, and request/response interceptors.

## Features

- ✅ **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- ✅ **Authentication**: Automatic Bearer token handling
- ✅ **Error Handling**: Centralized error management
- ✅ **Loading States**: Built-in loading indicators
- ✅ **Request/Response Interceptors**: Customizable request/response processing
- ✅ **File Uploads**: Specialized file upload handling
- ✅ **Timeout Support**: Configurable request timeouts
- ✅ **TypeScript Ready**: Full TypeScript support

## Quick Start

### 1. Basic Usage

```javascript
import { useApiRequester } from '@/composables/useApiRequester.js'

// In your Vue component
const { get, post, isLoading, error } = useApiRequester()

// GET request
const fetchData = async () => {
  try {
    const response = await get('/users')
    console.log(response.data)
  } catch (err) {
    console.error('Request failed:', err)
  }
}

// POST request
const createUser = async (userData) => {
  try {
    const response = await post('/users', userData)
    console.log('User created:', response.data)
  } catch (err) {
    console.error('Failed to create user:', err)
  }
}
```

### 2. Available Methods

#### HTTP Methods
```javascript
const { get, post, put, patch, delete: del } = useApiRequester()

// GET
await get('/users')

// POST
await post('/users', { name: 'John', email: 'john@example.com' })

// PUT
await put('/users/1', { name: 'Jane', email: 'jane@example.com' })

// PATCH
await patch('/users/1', { name: 'Jane' })

// DELETE
await delete('/users/1')
```

#### File Upload
```javascript
const { uploadFile } = useApiRequester()

const handleFileUpload = async (file) => {
  try {
    const response = await uploadFile('/upload', file)
    console.log('File uploaded:', response.data)
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
```

#### Custom Request
```javascript
const { makeRequest } = useApiRequester()

const customRequest = async () => {
  try {
    const response = await makeRequest('/custom-endpoint', {
      method: 'POST',
      body: { custom: 'data' },
      headers: {
        'X-Custom-Header': 'value'
      },
      timeout: 5000
    })
    console.log(response.data)
  } catch (err) {
    console.error('Custom request failed:', err)
  }
}
```

### 3. Authentication

```javascript
const { setAuthToken, getAuthToken, post } = useApiRequester()

// Login and store token
const login = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials)
    setAuthToken(response.data.token)
  } catch (err) {
    console.error('Login failed:', err)
  }
}

// Logout and clear token
const logout = () => {
  setAuthToken(null)
}

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken()
}
```

### 4. Error Handling

```javascript
const { get, error, clearError } = useApiRequester()

const fetchData = async () => {
  try {
    const response = await get('/users')
    return response.data
  } catch (err) {
    // Error is automatically stored in error.value
    console.error('Error details:', {
      message: error.value.message,
      status: error.value.status,
      data: error.value.data
    })
    
    // Clear error when needed
    clearError()
  }
}
```

### 5. Loading States

```javascript
const { get, isLoading } = useApiRequester()

// In your template
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <!-- Your content -->
  </div>
</template>
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Default Configuration

- **Base URL**: `http://localhost:3000/api` (or from `VITE_API_BASE_URL`)
- **Timeout**: 10 seconds
- **Default Headers**: `Content-Type: application/json`
- **Auth Header**: `Authorization: Bearer <token>` (if token exists)

## Response Format

All requests return a standardized response object:

```javascript
{
  data: any,           // Response data (parsed JSON or text)
  status: number,      // HTTP status code
  headers: Headers     // Response headers
}
```

## Error Format

Errors are automatically formatted and stored:

```javascript
{
  message: string,     // Error message
  status?: number,     // HTTP status code (if available)
  data?: any          // Error response data (if available)
}
```

## Advanced Usage

### Custom Interceptors

You can modify the interceptors in `useApiRequester.js`:

```javascript
// Request interceptor - runs before each request
const requestInterceptor = (config) => {
  // Add custom headers
  config.headers['X-Custom-Header'] = 'value'
  
  // Add query parameters
  config.url += '?timestamp=' + Date.now()
  
  return config
}

// Response interceptor - runs after successful response
const responseInterceptor = (response) => {
  // Transform response data
  if (response.data && response.data.items) {
    response.data.items = response.data.items.map(item => ({
      ...item,
      processed: true
    }))
  }
  
  return response
}

// Error interceptor - runs when request fails
const errorInterceptor = (err) => {
  // Custom error handling
  if (err.response?.status === 429) {
    // Rate limit exceeded
    console.warn('Rate limit exceeded, retrying in 1 second...')
    setTimeout(() => {
      // Retry logic
    }, 1000)
  }
  
  return Promise.reject(err)
}
```

### Skip Interceptors

```javascript
const { makeRequest } = useApiRequester()

// Skip all interceptors
const rawRequest = async () => {
  const response = await makeRequest('/raw-endpoint', {
    skipInterceptors: true
  })
  return response
}
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks or check the `error` state
2. **Use loading states**: Disable buttons and show loading indicators
3. **Clear errors**: Call `clearError()` when appropriate
4. **Type your responses**: Use TypeScript interfaces for better type safety
5. **Handle authentication**: Use `setAuthToken()` for login/logout flows
6. **Use appropriate timeouts**: Set shorter timeouts for critical operations

## Examples

See the following files for complete examples:
- `apiExamples.js` - Function-based examples
- `ExampleApiUsage.vue` - Vue component example

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **401 Unauthorized**: Check if the auth token is valid and properly set
3. **Timeout Errors**: Increase the timeout value for slow operations
4. **File Upload Issues**: Ensure the backend accepts multipart/form-data

### Debug Mode

Add this to your component to debug requests:

```javascript
const { makeRequest } = useApiRequester()

// Enable debug logging
const debugRequest = async (endpoint, options) => {
  console.log('Request:', { endpoint, options })
  const response = await makeRequest(endpoint, options)
  console.log('Response:', response)
  return response
}
``` 