<template>
  <div class="matches-count">
    <span>{{ count }} {{ count === 1 ? 'Match' : 'Matches' }}</span>
  </div>
</template>

<script>
export default {
  name: 'MatchCounter',
  props: {
    count: {
      type: Number,
      required: true,
      default: 0
    }
  }
}
</script>

<style scoped>
.matches-count {
  text-align: center;
  margin-bottom: 20px;
}

.matches-count span {
  background: rgba(250, 134, 164, 0.2);
  color: #fa86a4;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}
</style> 