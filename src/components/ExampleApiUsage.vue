<template>
  <div class="api-example">
    <h2>API Requester Example</h2>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading">
      Loading...
    </div>
    
    <!-- Error display -->
    <div v-if="error" class="error">
      Error: {{ error.message }}
      <button @click="clearError">Clear Error</button>
    </div>
    
    <!-- User data display -->
    <div v-if="userData" class="user-data">
      <h3>User Profile</h3>
      <p><strong>Name:</strong> {{ userData.name }}</p>
      <p><strong>Email:</strong> {{ userData.email }}</p>
    </div>
    
    <!-- Action buttons -->
    <div class="actions">
      <button @click="fetchUserData" :disabled="isLoading">
        Fetch User Data
      </button>
      
      <button @click="createUser" :disabled="isLoading">
        Create User
      </button>
      
      <button @click="updateUser" :disabled="isLoading">
        Update User
      </button>
      
      <button @click="deleteUser" :disabled="isLoading">
        Delete User
      </button>
    </div>
    
    <!-- File upload example -->
    <div class="file-upload">
      <h3>Upload Avatar</h3>
      <input 
        type="file" 
        @change="handleFileUpload" 
        accept="image/*"
        :disabled="isLoading"
      >
      <button @click="uploadAvatar" :disabled="!selectedFile || isLoading">
        Upload
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiRequester } from '../composables/useApiRequester.js'
import { debugLog } from '../utils/debug.js'

// Use the API requester
const { 
  get, 
  post, 
  put, 
  delete: del, 
  uploadFile,
  isLoading, 
  error, 
  clearError 
} = useApiRequester()

// Component state
const userData = ref(null)
const selectedFile = ref(null)

// Example user data
const exampleUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
}

// Fetch user data
const fetchUserData = async () => {
  try {
    const response = await get('/users/1')
    userData.value = response.data
  } catch (err) {
    debugLog.error('Failed to fetch user:', err)
  }
}

// Create user
const createUser = async () => {
  try {
    const response = await post('/users', exampleUser)
    debugLog.log('User created:', response.data)
    // Optionally fetch the updated user list
    await fetchUserData()
  } catch (err) {
    debugLog.error('Failed to create user:', err)
  }
}

// Update user
const updateUser = async () => {
  if (!userData.value?.id) {
    debugLog.error('No user to update')
    return
  }
  
  try {
    const updatedData = { ...exampleUser, name: 'Jane Doe' }
    const response = await put(`/users/${userData.value.id}`, updatedData)
    debugLog.log('User updated:', response.data)
    await fetchUserData() // Refresh the data
  } catch (err) {
    debugLog.error('Failed to update user:', err)
  }
}

// Delete user
const deleteUser = async () => {
  if (!userData.value?.id) {
    debugLog.error('No user to delete')
    return
  }
  
  try {
    await del(`/users/${userData.value.id}`)
    debugLog.log('User deleted')
    userData.value = null
  } catch (err) {
    debugLog.error('Failed to delete user:', err)
  }
}

// Handle file selection
const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

// Upload avatar
const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  try {
    const response = await uploadFile('/users/avatar', selectedFile.value)
    debugLog.log('Avatar uploaded:', response.data)
    selectedFile.value = null
  } catch (err) {
    debugLog.error('Failed to upload avatar:', err)
  }
}

// Fetch user data on component mount
onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
.api-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.error button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-data {
  background-color: #f3e5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 15px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.actions button:hover:not(:disabled) {
  background-color: #1976d2;
}

.file-upload {
  background-color: #e8f5e8;
  padding: 15px;
  border-radius: 4px;
}

.file-upload input[type="file"] {
  margin-bottom: 10px;
}

.file-upload button {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-upload button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 