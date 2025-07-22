<template>
  <div class="your-content-page">
    <!-- Header -->
    <div class="your-matches-parent">
      <b class="your-matches">
        {{ isFemale ? 'Question Management' : 'Answer Management' }}
      </b>
      <div class="group-child" />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your content...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadContent" class="retry-button">Try Again</button>
    </div>
    
    <!-- No content state -->
    <div v-else-if="contentList.length === 0" class="no-content">
      <div class="empty-icon">{{ isFemale ? '❓' : '💭' }}</div>
      <h3>{{ isFemale ? 'No questions yet' : 'No answers yet' }}</h3>
      <p>
        {{ isFemale 
          ? 'Start creating questions to engage with other users!' 
          : 'Start answering questions to connect with others!'
        }}
      </p>
      <button v-if="isFemale" @click="createContent" class="create-button">
        ➕ Create Question
      </button>
    </div>
    
    <!-- Content list -->
    <div v-else class="content-container">
      <div class="content-header">
        <div class="content-count">
          <span>{{ contentList.length }} {{ isFemale ? 'Questions' : 'Answers' }}</span>
        </div>
        <button v-if="isFemale" @click="createContent" class="create-button small">
          ➕ New Question
        </button>
      </div>
      
      <div class="content-list">
        <div 
          v-for="(item, index) in contentList" 
          :key="item.id || index"
          class="content-card"
          @click="viewContent(item, index)"
        >
          <div class="content-main">
            <div class="content-text">
              {{ item.text }}
            </div>
            <div v-if="!isFemale && item.question_text" class="question-text">
              Question: {{ item.question_text }}
            </div>
            <div class="content-meta">
              <span class="content-type">
                {{ isFemale ? 'Question' : 'Answer' }}
              </span>
              <span v-if="!isFemale && item.is_draft" class="draft-badge">
                📝 Draft
              </span>
              <span v-if="isFemale && item.is_active" class="active-badge">
                ✅ Active
              </span>
              <span v-if="isFemale && !item.is_active" class="inactive-badge">
                ⏸️ Paused
              </span>
            </div>
          </div>
          
          <!-- 移除操作按钮，所有功能都在详情页面中实现 -->
        </div>
      </div>
    </div>
    
    <!-- Content Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isFemale ? 'Question Details' : 'Answer Details' }}</h3>
          <button @click="closeDetailModal" class="close-button">✕</button>
        </div>
        
        <div class="modal-body">
          <!-- Question Details for Female Users -->
          <div v-if="isFemale && selectedContent" class="question-details">
            <div class="detail-section">
              <h4>Question Content</h4>
              <p class="content-display">{{ selectedContent.content }}</p>
            </div>
            
            <div class="detail-section">
              <h4>Status</h4>
              <div class="status-info">
                <span :class="['status-badge', selectedContent.is_draft ? 'draft' : 'active']">
                  {{ selectedContent.is_draft ? '📝 Draft' : '✅ Active' }}
                </span>
                <span v-if="selectedContent.is_active" class="status-badge active">
                  ▶️ Live
                </span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Created</h4>
              <p class="date-info">{{ formatDate(selectedContent.created_at) }}</p>
            </div>
            
            <!-- Answer List for Non-Draft Questions -->
            <div v-if="!selectedContent.is_draft && selectedContent.answer_list && selectedContent.answer_list.length > 0" class="detail-section">
              <h4>Answers ({{ selectedContent.answer_list.length }})</h4>
              <div class="answer-list">
                <div v-for="answer in selectedContent.answer_list" :key="answer.answer_id" class="answer-item">
                  <p class="answer-content">{{ answer.content }}</p>
                  <div class="answer-meta">
                    <span class="answer-status" :class="{ draft: answer.is_draft }">
                      {{ answer.is_draft ? '📝 Draft' : '✅ Sent' }}
                    </span>
                    <span v-if="answer.liked_user_ids && answer.liked_user_ids.length > 0" class="answer-likes">
                      ❤️ {{ answer.liked_user_ids.length }}
                    </span>
                    <span v-if="answer.created_at" class="answer-date">
                      {{ formatDate(answer.created_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Answers Message -->
            <div v-else-if="!selectedContent.is_draft" class="detail-section">
              <h4>Answers</h4>
              <p class="no-answers">No answers yet for this question.</p>
            </div>
          </div>
          
          <!-- Answer Details for Male Users -->
          <div v-else-if="!isFemale && selectedContent" class="answer-details">
            <div class="detail-section">
              <h4>Answer Content</h4>
              <p class="content-display">{{ selectedContent.content }}</p>
            </div>
            
            <div class="detail-section">
              <h4>Question</h4>
              <p class="question-display">{{ selectedContent.question_content || 'Loading question content...' }}</p>
            </div>
            
            <div class="detail-section">
              <h4>Status</h4>
              <div class="status-info">
                <span :class="['status-badge', selectedContent.is_draft ? 'draft' : 'active']">
                  {{ selectedContent.is_draft ? '📝 Draft' : '✅ Sent' }}
                </span>
                <span v-if="selectedContent.is_active" class="status-badge active">
                  ✅ Active
                </span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Created</h4>
              <p class="date-info">{{ formatDate(selectedContent.created_at) }}</p>
            </div>
            
            <div v-if="selectedContent.liked_user_ids && selectedContent.liked_user_ids.length > 0" class="detail-section">
              <h4>Likes</h4>
              <p class="likes-info">{{ selectedContent.liked_user_ids.length }} user(s) liked this answer</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDetailModal" class="cancel-button">Close</button>
          
          <!-- 编辑按钮 -->
          <button 
            v-if="isFemale ? (selectedContent && selectedContent.is_draft) : true"
            @click="editSelectedContent" 
            class="action-button edit"
            :disabled="!isFemale && selectedContent && !selectedContent.is_draft"
            :title="!isFemale && selectedContent && !selectedContent.is_draft ? 'Cannot edit sent answers' : 'Edit content'"
          >
            ✏️ Edit
          </button>
          
          <!-- 切换活跃状态按钮（女性用户） -->
          <button 
            v-if="isFemale && selectedContent && !selectedContent.is_draft" 
            @click="toggleActiveFromDetail" 
            class="action-button toggle"
            :class="{ active: selectedContent.is_active }"
          >
            {{ selectedContent.is_active ? '⏸️ Pause' : '▶️ Activate' }}
          </button>
          
          <!-- 切换草稿状态按钮（男性用户） -->
          <button 
            v-if="!isFemale && selectedContent && selectedContent.is_draft" 
            @click="toggleDraftFromDetail" 
            class="action-button toggle draft"
          >
            📤 Send
          </button>
          
          <!-- 删除按钮 -->
          <button 
            v-if="!isFemale && selectedContent && selectedContent.is_draft" 
            @click="deleteFromDetail" 
            class="action-button delete"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingItem ? 'Edit' : 'Create' }} {{ isFemale ? 'Question' : 'Answer' }}</h3>
          <button @click="closeModal" class="close-button">✕</button>
        </div>
        
        <div class="modal-body">
          <textarea 
            v-model="modalText"
            :placeholder="isFemale ? 'Enter your question...' : 'Enter your answer...'"
            class="modal-textarea"
            rows="4"
          ></textarea>
          
          <div v-if="!isFemale" class="draft-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="isDraft" />
              <span class="checkmark"></span>
              Save as draft
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-button">Cancel</button>
          <button @click="saveContent" class="save-button" :disabled="!modalText.trim() || isSaving">
            {{ isSaving ? 'Saving...' : (editingItem ? 'Update' : 'Create') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirm Action</h3>
          <button @click="closeConfirmModal" class="close-button">✕</button>
        </div>
        
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>
        
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="cancel-button">Cancel</button>
          <button @click="confirmAction" class="confirm-button" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Bottom Navigation Bar -->
    <BottomNavigationBar 
      activeTab="answers" 
      :isFemaleUser="isFemale" 
    />
  </div>
</template>

<script>
import BottomNavigationBar from '@/components/BottomNavigationBar.vue'
import { useNavigationStore } from '../stores/navigation.js'
import { APIService } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'

export default {
  name: 'YourContent',
  components: {
    BottomNavigationBar
  },
  data() {
    return {
      contentList: [],
      userInfo: null,
      isLoading: true,
      error: null,
      
      // 模态框状态
      showModal: false,
      modalText: '',
      isDraft: false,
      editingItem: null,
      editingIndex: -1,
      isSaving: false,
      
      // 详情模态框状态
      showDetailModal: false,
      selectedContent: null,
      
      // 确认模态框状态
      showConfirmModal: false,
      confirmMessage: '',
      confirmAction: null,
      isProcessing: false,
      pendingAction: null
    }
  },
  computed: {
    telegramId() {
      const navigationStore = useNavigationStore()
      const entryData = navigationStore.getPageData('entry')
      return entryData.userInfo?.id || null
    },
    isFemale() {
      return this.userInfo && this.userInfo.gender === 1
    }
  },
  async mounted() {
    await this.loadContent()
  },
  methods: {
    /**
     * 加载用户内容（问题或回答）
     */
    async loadContent() {
      if (!this.telegramId) {
        this.error = 'Unable to get user ID'
        this.isLoading = false
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        debugLog.log('🔄 正在加载内容，用户ID:', this.telegramId)
        
        const apiService = new APIService()
        
        // 获取用户信息
        const userInfoResponse = await apiService.getUserInfo(this.telegramId)
        this.userInfo = userInfoResponse
        debugLog.log('✅ 用户信息已获取:', userInfoResponse)
        
        if (this.isFemale) {
          // 加载女性用户的问题列表
          const questionsResponse = await apiService.getQuestionList(this.telegramId)
          debugLog.log('✅ 问题列表已获取:', questionsResponse)
          
          // 转换问题数据格式
          this.contentList = questionsResponse.question_list.map((questionId, index) => ({
            id: questionId,
            text: questionsResponse.question_strings[index] || 'No content',
            is_active: true // 默认活跃状态，实际应从API获取
          }))
        } else {
          // 加载男性用户的回答列表
          const answersResponse = await apiService.getAnswerQAM(this.telegramId)
          debugLog.log('✅ 回答列表已获取:', answersResponse)
          
          // 转换回答数据格式
          this.contentList = answersResponse.answer_id_list.map((answerId, index) => ({
            id: answerId,
            text: answersResponse.answer_content[index] || 'No content',
            question_id: answersResponse.question_id_list[index] || 'unknown',
            question_text: answersResponse.question_content[index] || 'Unknown question',
            is_draft: false // 默认非草稿状态，实际应从API获取
          }))
        }
        
      } catch (error) {
        debugLog.error('❌ 加载内容失败:', error)
        this.error = 'Failed to load content. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * 查看内容详情
     */
    async viewContent(item, index) {
      try {
        const apiService = new APIService()
        
        if (this.isFemale) {
          // 获取问题详情
          const questionInfo = await apiService.getQuestionInfo(item.id)
          this.selectedContent = questionInfo
          debugLog.log('✅ 问题详情已获取:', questionInfo)
          
          // 获取每个回答的详细信息
          if (questionInfo.answer_list && questionInfo.answer_list.length > 0) {
            try {
              const answerDetails = await Promise.all(
                questionInfo.answer_list.map(async (answerId) => {
                  try {
                    debugLog.log('🔄 正在获取回答详情，answer_id:', answerId)
                    const answerInfo = await apiService.getAnswerInfo(answerId)
                    return {
                      answer_id: answerId,
                      content: answerInfo.content,
                      created_at: answerInfo.created_at,
                      liked_user_ids: answerInfo.liked_user_ids,
                      is_active: answerInfo.is_active,
                      is_draft: answerInfo.is_draft
                    }
                  } catch (error) {
                    debugLog.error('❌ 获取回答详情失败，answer_id:', answerId, error)
                    return {
                      answer_id: answerId,
                      content: 'Unable to load answer content',
                      created_at: null,
                      liked_user_ids: [],
                      is_active: false,
                      is_draft: false
                    }
                  }
                })
              )
              this.selectedContent.answer_list = answerDetails
              debugLog.log('✅ 回答详情已获取:', answerDetails)
            } catch (error) {
              debugLog.error('❌ 获取回答列表详情失败:', error)
            }
          }
        } else {
          // 获取回答详情
          const answerInfo = await apiService.getAnswerInfo(item.id)
          this.selectedContent = answerInfo
          debugLog.log('✅ 回答详情已获取:', answerInfo)
          
          // 使用 question_id 获取问题内容
          if (answerInfo.question_id) {
            try {
              const questionInfo = await apiService.getQuestionInfo(answerInfo.question_id)
              this.selectedContent.question_content = questionInfo.content
              debugLog.log('✅ 问题内容已获取:', questionInfo.content)
            } catch (questionError) {
              debugLog.error('❌ 获取问题内容失败:', questionError)
              this.selectedContent.question_content = 'Unable to load question content'
            }
          }
        }
        
        this.showDetailModal = true
        
      } catch (error) {
        debugLog.error('❌ 获取内容详情失败:', error)
        alert('Failed to load content details. Please try again.')
      }
    },
    
    /**
     * 关闭详情模态框
     */
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedContent = null
    },
    
    /**
     * 编辑选中的内容
     */
    editSelectedContent() {
      if (!this.selectedContent) return
      
      // 男性用户不能编辑已发送的回答
      if (!this.isFemale && !this.selectedContent.is_draft) {
        alert('Cannot edit sent answers. Only draft answers can be edited.')
        return
      }
      
      // 女性用户不能编辑非草稿问题
      if (this.isFemale && !this.selectedContent.is_draft) {
        alert('Cannot edit published questions. Only draft questions can be edited.')
        return
      }
      
      this.editingItem = this.selectedContent
      this.editingIndex = this.contentList.findIndex(item => item.id === this.selectedContent.id)
      this.modalText = this.selectedContent.content
      this.isDraft = this.selectedContent.is_draft || false
      
      this.closeDetailModal()
      this.showModal = true
    },
    
    /**
     * 创建新内容
     */
    createContent() {
      this.editingItem = null
      this.editingIndex = -1
      this.modalText = ''
      this.isDraft = false
      this.showModal = true
    },
    
    /**
     * 编辑内容
     */
    editContent(item, index) {
      this.editingItem = item
      this.editingIndex = index
      this.modalText = item.text
      this.isDraft = item.is_draft || false
      this.showModal = true
    },
    
    /**
     * 关闭模态框
     */
    closeModal() {
      this.showModal = false
      this.editingItem = null
      this.editingIndex = -1
      this.modalText = ''
      this.isDraft = false
      this.isSaving = false
    },
    
    /**
     * 保存内容
     */
    async saveContent() {
      if (!this.modalText.trim()) return
      
      try {
        this.isSaving = true
        const apiService = new APIService()
        
        if (this.isFemale) {
          // 女性用户：创建/编辑问题
          if (this.editingItem) {
            // 编辑现有问题（通过切换活跃状态来模拟编辑）
            await apiService.toggleQuestionActive(this.editingItem.id)
            this.contentList[this.editingIndex].text = this.modalText
            debugLog.log('✅ 问题已更新')
          } else {
            // 创建新问题
            const response = await apiService.newQuestion(this.telegramId, this.modalText)
            if (response.success) {
              // 清空列表并重新获取问题列表
              this.contentList = []
              await this.loadContent()
              debugLog.log('✅ 新问题已创建，问题列表已刷新')
            }
          }
        } else {
          // 男性用户：创建/编辑回答
          if (this.editingItem) {
            // 编辑现有回答
            const response = await apiService.editAnswer(
              this.telegramId,
              this.editingItem.question_id || 'unknown',
              this.modalText,
              !this.isDraft, // isSend
              this.editingItem.id,
              this.isDraft
            )
            this.contentList[this.editingIndex].text = this.modalText
            this.contentList[this.editingIndex].is_draft = this.isDraft
            debugLog.log('✅ 回答已更新')
          } else {
            // 创建新回答需要先选择问题
            alert('Creating new answers requires selecting a question first.')
            return
          }
        }
        
        this.closeModal()
        
      } catch (error) {
        debugLog.error('❌ 保存内容失败:', error)
        alert('Failed to save content. Please try again.')
      } finally {
        this.isSaving = false
      }
    },
    
    /**
     * 切换问题活跃状态（女性用户）
     */
    async toggleActive(item, index) {
      try {
        const apiService = new APIService()
        const response = await apiService.toggleQuestionActive(item.id)
        
        if (response.success) {
          this.contentList[index].is_active = !this.contentList[index].is_active
          debugLog.log('✅ 问题状态已切换')
        }
      } catch (error) {
        debugLog.error('❌ 切换问题状态失败:', error)
        alert('Operation failed. Please try again.')
      }
    },
    
    /**
     * 切换回答草稿状态（男性用户）
     */
    async toggleDraft(item, index) {
      try {
        const apiService = new APIService()
        const response = await apiService.editAnswer(
          this.telegramId,
          item.question_id || 'unknown',
          item.text,
          item.is_draft, // 如果是草稿，发送；如果不是草稿，保存为草稿
          item.id,
          !item.is_draft
        )
        
        if (response) {
          this.contentList[index].is_draft = !this.contentList[index].is_draft
          debugLog.log('✅ 回答状态已切换')
        }
      } catch (error) {
        debugLog.error('❌ 切换回答状态失败:', error)
        alert('Operation failed. Please try again.')
      }
    },
    
    /**
     * 删除内容
     */
    deleteContent(item, index) {
      this.confirmMessage = `Are you sure you want to delete this ${this.isFemale ? 'question' : 'answer'}? This action cannot be undone.`
      this.pendingAction = { type: 'delete', item, index }
      this.showConfirmModal = true
    },
    
    /**
     * 确认操作
     */
    async confirmAction() {
      if (!this.pendingAction) return
      
      try {
        this.isProcessing = true
        
        if (this.pendingAction.type === 'delete') {
          // 由于API中没有删除方法，我们模拟删除操作
          // 在实际应用中，这里应该调用删除API
          this.contentList.splice(this.pendingAction.index, 1)
          debugLog.log('✅ 内容已删除（模拟）')
        } else if (this.pendingAction.type === 'deleteFromDetail') {
          // 从详情页面删除内容
          if (this.selectedContent) {
            const listIndex = this.contentList.findIndex(item => item.id === this.selectedContent.id)
            if (listIndex !== -1) {
              this.contentList.splice(listIndex, 1)
            }
            this.closeDetailModal()
            debugLog.log('✅ 内容已删除（模拟）')
          }
        }
        
        this.closeConfirmModal()
        
      } catch (error) {
        debugLog.error('❌ 操作失败:', error)
        alert('Operation failed. Please try again.')
      } finally {
        this.isProcessing = false
      }
    },
    
    /**
     * 关闭确认模态框
     */
    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmMessage = ''
      this.pendingAction = null
      this.isProcessing = false
    },
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },
    
    /**
     * 从详情页面切换问题活跃状态（女性用户）
     */
    async toggleActiveFromDetail() {
      if (!this.selectedContent) return
      
      try {
        const apiService = new APIService()
        const response = await apiService.toggleQuestionActive(this.selectedContent.question_id)
        
        if (response.success) {
          this.selectedContent.is_active = !this.selectedContent.is_active
          // 同时更新列表中的状态
          const listIndex = this.contentList.findIndex(item => item.id === this.selectedContent.question_id)
          if (listIndex !== -1) {
            this.contentList[listIndex].is_active = this.selectedContent.is_active
          }
          debugLog.log('✅ 问题状态已切换')
        }
      } catch (error) {
        debugLog.error('❌ 切换问题状态失败:', error)
        alert('Operation failed. Please try again.')
      }
    },
    
    /**
     * 从详情页面发送草稿回答（男性用户）
     */
    async toggleDraftFromDetail() {
      if (!this.selectedContent || !this.selectedContent.is_draft) return
      
      try {
        const apiService = new APIService()
        const response = await apiService.editAnswer(
          this.telegramId,
          this.selectedContent.question_id,
          this.selectedContent.content,
          true, // 发送回答
          this.selectedContent.answer_id,
          false // 不再是草稿
        )
        
        if (response) {
          this.selectedContent.is_draft = false
          // 同时更新列表中的状态
          const listIndex = this.contentList.findIndex(item => item.id === this.selectedContent.answer_id)
          if (listIndex !== -1) {
            this.contentList[listIndex].is_draft = false
          }
          debugLog.log('✅ 回答已发送')
        }
      } catch (error) {
        debugLog.error('❌ 发送回答失败:', error)
        alert('Failed to send answer. Please try again.')
      }
    },
    
    /**
     * 从详情页面删除内容
     */
    deleteFromDetail() {
      if (!this.selectedContent) return
      
      // 只能删除草稿回答
      if (!this.selectedContent.is_draft) {
        alert('Cannot delete sent answers. Only draft answers can be deleted.')
        return
      }
      
      this.confirmMessage = `Are you sure you want to delete this answer? This action cannot be undone.`
      this.pendingAction = { type: 'deleteFromDetail' }
      this.showConfirmModal = true
    }
  }
}
</script>

<style scoped>
.your-content-page {
  background: #000;
  min-height: 100vh;
  color: white;
  padding-bottom: 80px; /* 为底部导航留出空间 */
}

.your-matches-parent {
  padding: 20px;
  text-align: left;
  font-size: 20px;
  color: #fff;
  font-family: Nunito;
  position: relative;
}
.your-matches {
  display: block;
  line-height: 140%;
  margin-bottom: 8px;
}
.group-child {
  border-top: 1px solid #36394a;
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(250, 134, 164, 0.3);
  border-top: 4px solid #fa86a4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #ccc;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
}

.error-message p {
  color: #ff6b6b;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.retry-button {
  background: #fa86a4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #e75a7c;
  transform: translateY(-2px);
}

.no-content {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-content h3 {
  color: #fa86a4;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.no-content p {
  color: #ccc;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.create-button {
  background: #fa86a4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-button:hover {
  background: #e75a7c;
  transform: translateY(-2px);
}

.create-button.small {
  padding: 8px 16px;
  font-size: 12px;
}

.content-container {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-count span {
  background: rgba(250, 134, 164, 0.2);
  color: #fa86a4;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.content-card:hover {
  background: #2a2a2a;
  border-color: #fa86a4;
  transform: translateY(-2px);
}

.content-main {
  flex: 1;
  min-width: 0;
}

.content-text {
  font-size: 16px;
  color: white;
  line-height: 1.4;
  margin-bottom: 8px;
}

.question-text {
  font-size: 14px;
  color: #999;
  line-height: 1.3;
  margin-bottom: 8px;
  font-style: italic;
}

.content-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.content-type {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
}

.draft-badge {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.active-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.inactive-badge {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.content-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ccc;
  padding: 8px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.action-button.edit:hover {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.action-button.toggle:hover {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.action-button.toggle.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.action-button.toggle.draft {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
}

.action-button.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.detail-modal {
  max-width: 600px;
  max-height: 90vh;
}

.confirm-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  color: #fa86a4;
  margin: 0;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 详情模态框内容样式 */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  color: #fa86a4;
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.content-display, .question-display {
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  color: white;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.status-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.draft {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.date-info, .likes-info {
  color: #ccc;
  font-size: 14px;
  margin: 0;
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-item {
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
}

.answer-content {
  color: white;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.answer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.answer-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.answer-status.draft {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
}

.answer-likes {
  font-size: 11px;
  color: #fa86a4;
  font-weight: 600;
}

.answer-date {
  font-size: 10px;
  color: #999;
}

.no-answers {
  color: #999;
  font-style: italic;
  margin: 0;
}

.modal-textarea {
  width: 100%;
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  padding: 12px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
}

.modal-textarea:focus {
  outline: none;
  border-color: #fa86a4;
}

.draft-option {
  margin-top: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ccc;
  font-size: 14px;
}

.checkbox-label input {
  margin-right: 8px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #333;
  flex-wrap: wrap;
}

.cancel-button {
  background: transparent;
  color: #ccc;
  border: 1px solid #333;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.save-button, .confirm-button, .edit-button {
  background: #fa86a4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.save-button:hover:not(:disabled), .confirm-button:hover:not(:disabled), .edit-button:hover:not(:disabled) {
  background: #e75a7c;
}

.save-button:disabled, .confirm-button:disabled, .edit-button:disabled {
  background: #666;
  cursor: not-allowed;
}

/* 详情模态框中的操作按钮样式 */
.detail-modal .modal-footer .action-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ccc;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.detail-modal .modal-footer .action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.detail-modal .modal-footer .action-button.edit:hover {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.detail-modal .modal-footer .action-button.toggle:hover {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.detail-modal .modal-footer .action-button.toggle.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.detail-modal .modal-footer .action-button.toggle.draft {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
}

.detail-modal .modal-footer .action-button.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.detail-modal .modal-footer .action-button:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

.detail-modal .modal-footer .action-button:disabled:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #666;
  transform: none;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .your-matches-parent {
    padding: 16px;
  }
  
  .content-container {
    padding: 16px;
  }
  
  .content-card {
    padding: 12px;
    gap: 12px;
  }
  
  .content-actions {
    gap: 6px;
  }
  
  .action-button {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .detail-modal {
    max-width: 100%;
    margin: 10px;
  }
}
</style>