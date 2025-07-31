<template>
  <div class="matches-container">
    <!-- 匹配计数器 -->
    <MatchCounter :count="matches.length" />
    
    <!-- 匹配列表 -->
    <div class="matches-list">
      <MatchCard
        v-for="match in matches"
        :key="match.telegram_id"
        :telegram-id="match.telegram_id"
        @card-click="handleCardClick"
      />
    </div>
  </div>
</template>

<script>
import MatchCounter from './MatchCounter.vue'
import MatchCard from './MatchCard.vue'

export default {
  name: 'MatchesList',
  components: {
    MatchCounter,
    MatchCard
  },
  props: {
    matches: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    // 处理卡片点击事件
    handleCardClick(telegramId) {
      this.$emit('card-click', telegramId)
    }
  }
}
</script>

<style scoped>
.matches-container {
  padding: 20px;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .matches-container {
    padding: 16px;
  }
}
</style> 