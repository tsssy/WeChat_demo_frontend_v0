# WhyHim页面流程可视化

## 完整流程图

```mermaid
sequenceDiagram
    participant U as 用户
    participant W as WhyHim页面
    participant S as SessionStorage
    participant API as 后端API服务
    participant DB as 数据库
    participant C as Chatroom页面

    U->>W: 进入WhyHim页面
    W->>W: onMounted() 触发
    W->>W: loadMatchData() 开始加载
    
    Note over W: 第一步：尝试从Session恢复数据
    W->>S: restoreMatchFromSession()
    S-->>W: 返回存储的匹配数据
    
    alt 有Session数据
        W->>W: 使用Session数据作为备用
    else 无Session数据
        W->>W: 继续API调用
    end
    
    Note over W: 第二步：调用API获取匹配信息
    W->>API: POST /api/v1/MatchManager/get_match_info
    Note right of W: {user_id: "123456789", match_id: 1001}
    
    API->>DB: 查询匹配信息
    DB-->>API: 返回匹配详情
    API-->>W: 返回匹配数据
    Note left of API: {target_user_id: 987654321,<br/>description_for_target: "你们都喜欢摄影...",<br/>is_liked: false, match_score: 85}
    
    Note over W: 第三步：获取目标用户信息
    W->>API: POST /api/v1/UserManagement/get_user_info_with_user_id
    Note right of W: {user_id: "987654321"}
    
    API->>DB: 查询用户信息
    DB-->>API: 返回用户详情
    API-->>W: 返回用户数据
    Note left of API: {user_id: 987654321,<br/>telegram_user_name: "Alice",<br/>gender: 1, age: 25}
    
    W->>W: 更新页面状态
    Note over W: isLoading = false<br/>显示匹配内容
    
    Note over W: 页面显示：<br/>"Why her?"<br/>匹配描述<br/>"Chat Now"按钮
    
    U->>W: 点击"Chat Now"按钮
    W->>W: goToChatroom() 函数执行
    
    Note over W: 第四步：创建聊天室
    W->>API: POST /api/v1/ChatroomManager/get_or_create_chatroom
    Note right of W: {user_id_1: "123456789",<br/>user_id_2: "987654321",<br/>match_id: 1001}
    
    API->>DB: 创建或获取聊天室
    DB-->>API: 返回聊天室ID
    API-->>W: 返回聊天室信息
    Note left of API: {success: true, chatroom_id: 2001}
    
    W->>W: 存储聊天室ID到Store
    W->>C: 跳转到Chatroom页面
    Note over C: 使用预先建立的WebSocket连接<br/>开始实时聊天
```

## 数据流转图

```mermaid
graph TB
    subgraph "前端状态管理"
        A1[userStore.current_match_id]
        A2[userStore.target_user_id]
        A3[userStore.user_id]
        A4[SessionStorage]
    end
    
    subgraph "WhyHim页面组件"
        B1[isLoading: true]
        B2[matchInfo: null]
        B3[targetUserInfo: null]
        B4[error: null]
    end
    
    subgraph "API调用"
        C1[getMatchInfo API]
        C2[getUserInfoWithUserId API]
        C3[getOrCreateChatroom API]
    end
    
    subgraph "后端服务"
        D1[MatchManager]
        D2[UserManagement]
        D3[ChatroomManager]
        D4[(MongoDB)]
    end
    
    subgraph "页面显示"
        E1[动态标题: "Why her/him?"]
        E2[匹配描述文本]
        E3[Chat Now按钮]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    
    B1 --> C1
    B1 --> C2
    
    C1 --> D1
    C2 --> D2
    D1 --> D4
    D2 --> D4
    
    D1 --> B2
    D2 --> B3
    
    B2 --> E1
    B2 --> E2
    B3 --> E1
    
    E3 --> C3
    C3 --> D3
    D3 --> D4
```

## 错误处理流程

```mermaid
flowchart TD
    A[开始加载数据] --> B{Session有数据?}
    B -->|是| C[使用Session数据]
    B -->|否| D[调用API]
    
    C --> E[显示页面内容]
    D --> F{API调用成功?}
    
    F -->|是| G[更新页面数据]
    F -->|否| H{Session有备用数据?}
    
    H -->|是| C
    H -->|否| I[显示错误信息]
    
    G --> E
    I --> J[显示重试按钮]
    J --> K[用户点击重试]
    K --> A
    
    E --> L[用户点击Chat Now]
    L --> M{创建聊天室成功?}
    M -->|是| N[跳转到聊天页面]
    M -->|否| O[显示错误提示]
```

## 关键代码片段分析

### 1. 数据加载逻辑
```javascript
// 核心数据加载函数
const loadMatchData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // 1. Session数据恢复（备用方案）
    const hasSessionData = userStore.restoreMatchFromSession()
    
    // 2. API数据获取（主要方案）
    const matchResponse = await APIServices.getMatchInfo({ 
      user_id: current_user_id, 
      match_id: current_match_id 
    })
    
    // 3. 用户信息获取
    const userResponse = await APIServices.getUserInfoWithUserId(target_user_id)
    
  } catch (err) {
    // 4. 错误处理：使用Session数据或显示错误
    if (!hasSessionData) {
      error.value = err.message
    }
  } finally {
    isLoading.value = false
  }
}
```

### 2. 动态内容计算
```javascript
// 根据性别动态显示
const targetGenderPronoun = computed(() => {
  const gender = targetUserInfo.value?.gender || 1
  return gender === 1 ? 'her' : 'him'
})

// 匹配描述（API优先，Session备用）
const matchDescription = computed(() => {
  return matchInfo.value?.description_for_target || userStore.match_description
})
```

### 3. 聊天室创建
```javascript
const goToChatroom = async () => {
  try {
    // 创建聊天室
    const chatroomResponse = await APIServices.getOrCreateChatroom({
      user_id_1: current_user_id,
      user_id_2: current_target_user_id,
      match_id: current_match_id
    })
    
    if (chatroomResponse.success) {
      // 存储聊天室ID
      userStore.setCurrentMatch({
        ...userStore.currentMatch, 
        chatroom_id: chatroomResponse.chatroom_id 
      })
      
      // 跳转到聊天页面
      router.push('/chatroom')
    }
  } catch (error) {
    toast.value?.show('Error connecting to chat', 'error')
  }
}
```

## 总结

WhyHim页面的设计体现了以下特点：

1. **数据驱动**：通过API获取数据，动态渲染页面内容
2. **容错机制**：Session数据作为API失败的备用方案
3. **用户体验**：加载状态、错误处理、重试机制
4. **功能衔接**：为后续聊天功能做好准备
5. **性能优化**：避免不必要的WebSocket连接开销