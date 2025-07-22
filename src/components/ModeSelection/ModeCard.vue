<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="mode-card" :class="{ selected: selected }">
    <div class="emoji-circle">
      {{ emoji }}
    </div>
    <div class="text">{{ text }}</div>
    <img 
      v-if="selected" 
      class="check-icon" 
      alt="selected" 
      src="/media/images/check.svg" 
    />
  </div>
</template>

<style scoped>
.mode-card {
  width: 335px;
  height: 90px;
  border-radius: 16px;
  border: 1px solid #dfe1e7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 8px;
}

.mode-card:hover {
  transform: scale(1.02);
}

.mode-card.selected {
  border: 2px solid #fa86a4;
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(250, 134, 164, 0.5);
}

.emoji-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #dfe1e7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.text {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  line-height: 1.2;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
}
</style> 