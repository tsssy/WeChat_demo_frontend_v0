<template>
  <div class="name-card">
    <div class="name-card-text">{{ userName }}</div>
  </div>
</template>

<script setup>
defineProps({
  userName: {
    type: String,
    default: 'Someone Special'
  }
})
</script>

<style scoped>
.name-card {
  width: 80%;
  height: 200px;
  background-image: url('/media/WhyHim/MatchCardBackground.png');
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.name-card-text {
  color: #FFF;
  text-align: center;
  font-family: "Anonymous Pro", monospace;
  font-size: 20px;
  font-style: normal;
  line-height: normal;
  margin: 0;
}
</style>