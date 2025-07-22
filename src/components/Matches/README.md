# Matches 组件

这个文件夹包含了Matches页面的所有子组件，用于显示用户的匹配列表。

## 组件结构

### 1. MatchCounter.vue
**匹配计数器组件**
- 显示匹配数量
- 自动处理单复数形式（Match/Matches）
- Props: `count` (Number) - 匹配数量

### 2. MatchCard.vue  
**单个匹配用户卡片组件**
- 显示用户头像（基于telegram ID生成缩写）
- 显示用户信息
- 包含聊天按钮
- Props: `telegramId` (String/Number) - 用户的telegram ID
- Events: `card-click` - 卡片被点击时触发

### 3. MatchesList.vue
**匹配列表容器组件**
- 包含计数器和用户卡片列表
- 统一管理所有匹配相关的UI
- Props: `matches` (Array) - 匹配用户数组
- Events: `card-click` - 当任何卡片被点击时触发

## 使用方法

在Matches.vue中使用：

```vue
<template>
  <MatchesList 
    :matches="matches"
    @card-click="openChat"
  />
</template>

<script>
import MatchesList from '@/components/Matches/MatchesList.vue'

export default {
  components: {
    MatchesList
  },
  methods: {
    openChat(telegramId) {
      // 处理聊天功能
    }
  }
}
</script>
```

## 数据格式

matches数组中的每个对象应该包含：
```javascript
{
  telegram_id: "123456789", // 用户的telegram ID
  last_message: null,        // 最后一条消息（可选）
  timestamp: new Date()      // 匹配时间戳（可选）
}
```

## 样式特点

- 响应式设计，支持移动端
- 使用粉色主题色 (#fa86a4)
- 悬停效果和动画过渡
- 深色主题背景 