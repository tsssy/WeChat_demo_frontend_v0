<template>
  <div :class="['message-box', messageType]">
    <div class="message-content">{{ message }}</div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    required: true,
    validator: (value) => ['self', 'other'].includes(value)
  }
})
</script>

<style scoped>
.message-box {
  max-width: 280px;
  word-wrap: break-word;
  line-height: 1.4;
  margin-bottom: 8px;
  border-radius: 16px;
  padding: 12px 16px;
}

.message-box.self {
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  align-self: flex-end;
  text-align: right;
}

.message-box.other {
  background: #e9ecef;
  color: #333;
  align-self: flex-start;
}

.message-content {
  margin: 0;
}

@media (min-width: 768px) {
  .message-box {
    max-width: 300px;
  }
}
</style>