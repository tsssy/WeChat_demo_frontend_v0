<template>
  <div class="api-test-page">
    <!-- Navigation Bar -->
    <div class="nav-bar">
      <router-link to="/" class="nav-link">🏠 Home</router-link>
      <router-link to="/gender-selection" class="nav-link">👥 Gender Selection</router-link>
      <router-link to="/mode-selection" class="nav-link">🎯 Mode Selection</router-link>
      <span class="nav-link active">🔧 API Test</span>
    </div>

    <div class="header">
      <h1>🔧 API Service Testing</h1>
      <p>Test all API endpoints with real or fake responses</p>
    </div>

    <!-- Fake Mode Controls -->
    <div class="fake-mode-controls">
      <h2>🎭 Fake Mode Settings</h2>
      <div class="controls-grid">
        <div class="control-item">
          <label>Fake Mode:</label>
          <button 
            :class="['toggle-btn', { active: isFakeMode }]"
            @click="toggleFakeMode"
          >
            {{ isFakeMode ? 'ENABLED' : 'DISABLED' }}
          </button>
        </div>
        <div class="control-item">
          <label>Delay (ms):</label>
          <input 
            type="number" 
            v-model="fakeDelay" 
            @change="setFakeDelay"
            min="0"
            max="5000"
            step="100"
          />
        </div>
        <div class="control-item">
          <label>Status:</label>
          <span class="status" :class="{ loading: isLoading }">
            {{ isLoading ? 'Loading...' : 'Ready' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Service Tabs -->
    <div class="service-tabs">
      <button 
        v-for="service in services" 
        :key="service.id"
        :class="['tab-btn', { active: activeService === service.id }]"
        @click="activeService = service.id"
      >
        {{ service.name }}
      </button>
    </div>

    <!-- Service Content -->
    <div class="service-content">
      <!-- User Service -->
      <div v-if="activeService === 'user'" class="service-section">
        <h3>👤 User Service</h3>
        
        <div class="test-grid">
          <!-- Create Female User -->
          <div class="test-card">
            <h4>Create Female User</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="userTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testCreateFemaleUser" :disabled="isLoading">
              Create Female User
            </button>
            <div v-if="userTests.createFemaleResult" class="result">
              <pre>{{ JSON.stringify(userTests.createFemaleResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Create Male User -->
          <div class="test-card">
            <h4>Create Male User</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="userTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Mode:</label>
              <select v-model="userTests.mode">
                <option value="">None</option>
                <option value="1">1</option>
                <option value="3">3</option>
              </select>
            </div>
            <button @click="testCreateMaleUser" :disabled="isLoading">
              Create Male User
            </button>
            <div v-if="userTests.createMaleResult" class="result">
              <pre>{{ JSON.stringify(userTests.createMaleResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Get User from Session -->
          <div class="test-card">
            <h4>Get User from Session</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="userTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testGetUserFromSession" :disabled="isLoading">
              Get User Session
            </button>
            <div v-if="userTests.sessionResult" class="result">
              <pre>{{ JSON.stringify(userTests.sessionResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Check User Exist -->
          <div class="test-card">
            <h4>Check User Exist</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="userTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testUserExist" :disabled="isLoading">
              Check Existence
            </button>
            <div v-if="userTests.existResult" class="result">
              <pre>{{ JSON.stringify(userTests.existResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Poll Service -->
      <div v-if="activeService === 'cardpoll'" class="service-section">
        <h3>📝 Card Poll Service</h3>
        
        <div class="test-grid">
          <!-- Get Question -->
          <div class="test-card">
            <h4>Get Question</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Swipe Left:</label>
              <input v-model="cardPollTests.swipeLeft" type="checkbox" />
            </div>
            <button @click="testGetQuestion" :disabled="isLoading">
              Get Question
            </button>
            <div v-if="cardPollTests.questionResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.questionResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Edit Answer -->
          <div class="test-card">
            <h4>Edit Answer</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Question ID:</label>
              <input v-model="cardPollTests.questionId" placeholder="q123" />
            </div>
            <div class="input-group">
              <label>Answer:</label>
              <textarea v-model="cardPollTests.answer" placeholder="My answer..."></textarea>
            </div>
            <div class="input-group">
              <label>Send:</label>
              <input v-model="cardPollTests.isSend" type="checkbox" />
            </div>
            <button @click="testEditAnswer" :disabled="isLoading">
              Edit Answer
            </button>
            <div v-if="cardPollTests.editResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.editResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Like Answer -->
          <div class="test-card">
            <h4>Like Answer</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Answer ID:</label>
              <input v-model="cardPollTests.answerId" type="number" placeholder="456" />
            </div>
            <button @click="testLikeAnswer" :disabled="isLoading">
              Like Answer
            </button>
            <div v-if="cardPollTests.likeResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.likeResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Block Answer -->
          <div class="test-card">
            <h4>Block Answer</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Answer ID:</label>
              <input v-model="cardPollTests.blockAnswerId" placeholder="a123" />
            </div>
            <button @click="testBlockAnswer" :disabled="isLoading">
              Block Answer
            </button>
            <div v-if="cardPollTests.blockResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.blockResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Toggle Question Save -->
          <div class="test-card">
            <h4>Toggle Question Save</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Question ID:</label>
              <input v-model="cardPollTests.questionId" placeholder="q123" />
            </div>
            <button @click="testToggleQuestionSave" :disabled="isLoading">
              Toggle Save
            </button>
            <div v-if="cardPollTests.toggleSaveResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.toggleSaveResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Get Answer -->
          <div class="test-card">
            <h4>Get Answer</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="cardPollTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Swipe Left:</label>
              <input v-model="cardPollTests.swipeLeft" type="checkbox" />
            </div>
            <button @click="testGetAnswer" :disabled="isLoading">
              Get Answer
            </button>
            <div v-if="cardPollTests.answerResult" class="result">
              <pre>{{ JSON.stringify(cardPollTests.answerResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Service -->
      <div v-if="activeService === 'message'" class="service-section">
        <h3>💕 Message Service</h3>
        
        <div class="test-grid">
          <!-- Get Matched Users -->
          <div class="test-card">
            <h4>Get Matched Users</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="messageTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testGetMatchedUsers" :disabled="isLoading">
              Get Matches
            </button>
            <div v-if="messageTests.matchesResult" class="result">
              <pre>{{ JSON.stringify(messageTests.matchesResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Management Service -->
      <div v-if="activeService === 'qam'" class="service-section">
        <h3>❓ Question Answer Management</h3>
        
        <div class="test-grid">
          <!-- New Question -->
          <div class="test-card">
            <h4>Create New Question</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="qamTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <div class="input-group">
              <label>Question:</label>
              <textarea v-model="qamTests.questionText" placeholder="What's your favorite color?"></textarea>
            </div>
            <button @click="testNewQuestion" :disabled="isLoading">
              Create Question
            </button>
            <div v-if="qamTests.newQuestionResult" class="result">
              <pre>{{ JSON.stringify(qamTests.newQuestionResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Get Question List -->
          <div class="test-card">
            <h4>Get Question List</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="qamTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testGetQuestionList" :disabled="isLoading">
              Get Questions
            </button>
            <div v-if="qamTests.questionListResult" class="result">
              <pre>{{ JSON.stringify(qamTests.questionListResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Toggle Question Active -->
          <div class="test-card">
            <h4>Toggle Question Active</h4>
            <div class="input-group">
              <label>Question ID:</label>
              <input v-model="qamTests.questionId" placeholder="q123" />
            </div>
            <button @click="testToggleQuestionActive" :disabled="isLoading">
              Toggle Active
            </button>
            <div v-if="qamTests.toggleActiveResult" class="result">
              <pre>{{ JSON.stringify(qamTests.toggleActiveResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Get Answer List -->
          <div class="test-card">
            <h4>Get Answer List</h4>
            <div class="input-group">
              <label>Question ID:</label>
              <input v-model="qamTests.questionId" placeholder="q123" />
            </div>
            <button @click="testGetAnswerList" :disabled="isLoading">
              Get Answers
            </button>
            <div v-if="qamTests.answerListResult" class="result">
              <pre>{{ JSON.stringify(qamTests.answerListResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Get Answer QAM -->
          <div class="test-card">
            <h4>Get Answer (QAM)</h4>
            <div class="input-group">
              <label>Telegram ID:</label>
              <input v-model="qamTests.telegramId" type="number" placeholder="123456789" />
            </div>
            <button @click="testGetAnswerQAM" :disabled="isLoading">
              Get Answer
            </button>
            <div v-if="qamTests.answerQAMResult" class="result">
              <pre>{{ JSON.stringify(qamTests.answerQAMResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-display">
      <h3>❌ Error</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
import { APIServices } from '../services/APIServices.js'

export default {
  name: 'APITestPage',
  data() {
    return {
      activeService: 'user',
      isFakeMode: false,
      fakeDelay: 500,
      isLoading: false,
      error: null,
      
      services: [
        { id: 'user', name: '👤 User Service' },
        { id: 'cardpoll', name: '📝 Card Poll' },
        { id: 'message', name: '💕 Message' },
        { id: 'qam', name: '❓ Q&A Management' }
      ],
      
      // Test data for each service
      userTests: {
        telegramId: 123456789,
        mode: 1,
        createFemaleResult: null,
        createMaleResult: null,
        sessionResult: null,
        existResult: null
      },
      
      cardPollTests: {
        telegramId: 123456789,
        questionId: 'q123',
        answerId: 456,
        blockAnswerId: 'a123',
        answer: 'This is my answer to the question.',
        isSend: true,
        swipeLeft: false,
        questionResult: null,
        editResult: null,
        likeResult: null,
        blockResult: null,
        toggleSaveResult: null,
        answerResult: null
      },
      
      messageTests: {
        telegramId: 123456789,
        matchesResult: null
      },
      
      qamTests: {
        telegramId: 123456789,
        questionId: 'q123',
        questionText: 'What is your favorite hobby?',
        newQuestionResult: null,
        questionListResult: null,
        toggleActiveResult: null,
        answerListResult: null,
        answerQAMResult: null
      }
    }
  },
  
  mounted() {
    this.isFakeMode = APIServices.getFakeMode()
    this.fakeDelay = APIServices.getFakeDelay()
  },
  
  methods: {
    toggleFakeMode() {
      this.isFakeMode = APIServices.toggleFakeMode()
    },
    
    setFakeDelay() {
      APIServices.setFakeDelay(this.fakeDelay)
    },
    
    async executeTest(testFunction, resultKey, serviceKey) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await testFunction()
        this[serviceKey][resultKey] = result
      } catch (error) {
        this.error = error.message || 'An error occurred'
        console.error('Test failed:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // User Service Tests
    async testCreateFemaleUser() {
      await this.executeTest(
        () => APIServices.createFemaleUser(this.userTests.telegramId),
        'createFemaleResult',
        'userTests'
      )
    },
    
    async testCreateMaleUser() {
      const mode = this.userTests.mode ? parseInt(this.userTests.mode) : null
      await this.executeTest(
        () => APIServices.createMaleUser(this.userTests.telegramId, mode),
        'createMaleResult',
        'userTests'
      )
    },
    
    async testGetUserFromSession() {
      await this.executeTest(
        () => APIServices.getUserFromTelegramSession(this.userTests.telegramId),
        'sessionResult',
        'userTests'
      )
    },
    
    async testUserExist() {
      await this.executeTest(
        () => APIServices.getUserExist(this.userTests.telegramId),
        'existResult',
        'userTests'
      )
    },
    
    // Card Poll Service Tests
    async testGetQuestion() {
      await this.executeTest(
        () => APIServices.getQuestion(this.cardPollTests.telegramId, this.cardPollTests.swipeLeft),
        'questionResult',
        'cardPollTests'
      )
    },
    
    async testEditAnswer() {
      await this.executeTest(
        () => APIServices.editAnswer(
          this.cardPollTests.telegramId,
          this.cardPollTests.questionId,
          this.cardPollTests.answer,
          this.cardPollTests.isSend
        ),
        'editResult',
        'cardPollTests'
      )
    },
    
    async testLikeAnswer() {
      await this.executeTest(
        () => APIServices.likeAnswer(this.cardPollTests.telegramId, this.cardPollTests.answerId),
        'likeResult',
        'cardPollTests'
      )
    },
    
    async testBlockAnswer() {
      await this.executeTest(
        () => APIServices.blockAnswer(this.cardPollTests.telegramId, this.cardPollTests.blockAnswerId),
        'blockResult',
        'cardPollTests'
      )
    },
    
    async testToggleQuestionSave() {
      await this.executeTest(
        () => APIServices.toggleQuestionSave(this.cardPollTests.telegramId, this.cardPollTests.questionId),
        'toggleSaveResult',
        'cardPollTests'
      )
    },
    
    async testGetAnswer() {
      await this.executeTest(
        () => APIServices.getAnswer(this.cardPollTests.telegramId, this.cardPollTests.swipeLeft),
        'answerResult',
        'cardPollTests'
      )
    },
    
    // Message Service Tests
    async testGetMatchedUsers() {
      await this.executeTest(
        () => APIServices.getMatchedUsers(this.messageTests.telegramId),
        'matchesResult',
        'messageTests'
      )
    },
    
    // QAM Service Tests
    async testNewQuestion() {
      await this.executeTest(
        () => APIServices.newQuestion(this.qamTests.telegramId, this.qamTests.questionText),
        'newQuestionResult',
        'qamTests'
      )
    },
    
    async testGetQuestionList() {
      await this.executeTest(
        () => APIServices.getQuestionList(this.qamTests.telegramId),
        'questionListResult',
        'qamTests'
      )
    },
    
    async testToggleQuestionActive() {
      await this.executeTest(
        () => APIServices.toggleQuestionActive(this.qamTests.questionId),
        'toggleActiveResult',
        'qamTests'
      )
    },
    
    async testGetAnswerList() {
      await this.executeTest(
        () => APIServices.getAnswerListForAQuestion(this.qamTests.questionId),
        'answerListResult',
        'qamTests'
      )
    },
    
    async testGetAnswerQAM() {
      await this.executeTest(
        () => APIServices.getAnswerQAM(this.qamTests.telegramId),
        'answerQAMResult',
        'qamTests'
      )
    }
  }
}
</script>

<style scoped>
.api-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  display: block;
}

.nav-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.nav-link {
  padding: 2px 6px;
  text-decoration: none;
  color: #6c757d;
  border-radius: 3px;
  font-weight: 600;
  font-size: 12px;
}

.nav-link:hover {
  background: #e9ecef;
  color: #495057;
}

.nav-link.active {
  background: #007bff;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 8px;
}

.header h1 {
  color: #333;
  margin-bottom: 2px;
  font-size: 16px;
}

.header p {
  color: #666;
  font-size: 10px;
  margin: 0;
}

.fake-mode-controls {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 6px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
}

.fake-mode-controls h2 {
  margin-top: 0;
  color: #495057;
  font-size: 12px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 4px;
  align-items: center;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.control-item label {
  font-weight: 600;
  color: #495057;
  font-size: 10px;
}

.toggle-btn {
  padding: 2px 6px;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 10px;
}

.toggle-btn.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-item input {
  padding: 2px 4px;
  border: 1px solid #ced4da;
  border-radius: 2px;
  font-size: 10px;
}

.status {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  background: #e9ecef;
  color: #495057;
  font-size: 10px;
}

.status.loading {
  background: #fff3cd;
  color: #856404;
}

.service-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 2px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 2px 8px;
  border: none;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-weight: 600;
  color: #6c757d;
  font-size: 10px;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active:hover {
  background: #0056b3;
}

.service-content {
  margin-top: 4px;
  padding-right: 2px;
  padding-bottom: 8px;
}

.service-section h3 {
  color: #333;
  margin-bottom: 4px;
  font-size: 13px;
  position: static;
  padding: 0;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
  margin-bottom: 8px;
}

.test-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 6px;
  box-shadow: none;
}

.test-card h4 {
  margin-top: 0;
  color: #495057;
  font-size: 11px;
  margin-bottom: 4px;
}

.input-group {
  margin-bottom: 4px;
}

.input-group label {
  display: block;
  margin-bottom: 2px;
  font-weight: 600;
  color: #495057;
  font-size: 10px;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid #ced4da;
  border-radius: 2px;
  font-size: 10px;
  box-sizing: border-box;
}

.input-group textarea {
  min-height: 30px;
  resize: vertical;
}

.test-card button {
  width: 100%;
  padding: 4px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  font-weight: 600;
  font-size: 10px;
  cursor: pointer;
}

.test-card button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.test-card button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.result {
  margin-top: 4px;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 3px;
  border-left: 2px solid #007bff;
  max-height: 80px;
  overflow-y: auto;
  font-size: 9px;
}

.result pre {
  margin: 0;
  font-size: 9px;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-display {
  margin-top: 8px;
  padding: 6px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  font-size: 10px;
}

.error-display h3 {
  margin-top: 0;
  color: #721c24;
  font-size: 11px;
}

.error-display pre {
  background: white;
  padding: 4px;
  border-radius: 2px;
  overflow-x: auto;
  font-size: 9px;
}

@media (max-width: 768px) {
  .api-test-page {
    padding: 2px;
    min-height: 100vh;
  }
  .nav-bar {
    flex-direction: column;
    gap: 2px;
  }
  .controls-grid {
    grid-template-columns: 1fr;
  }
  .service-tabs {
    flex-wrap: wrap;
  }
  .test-grid {
    grid-template-columns: 1fr;
  }
  .service-content {
    padding-bottom: 4px;
  }
  .result {
    max-height: 50px;
  }
}
</style> 