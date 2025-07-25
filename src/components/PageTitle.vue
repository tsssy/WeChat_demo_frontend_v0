<template>
  <div class="title-container">
    <img src="/media/Home/leftpigeon.svg" alt="Left Pigeon" class="title-pigeon left-pigeon" />
    <h2 class="page-title">{{ title }}</h2>
    <img src="/media/Home/rightpigeon.svg.svg" alt="Right Pigeon" class="title-pigeon right-pigeon" />
  </div>
</template>

<script setup>
// 接收标题文字作为props
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 20px 0px 20px 0px;
}

.title-pigeon {
  width: 40px;
  height: 40px;
}

.left-pigeon {
  position: absolute;
  left: 0;
}

.right-pigeon {
  position: absolute;
  right: 0;
}

.page-title {
  color: #000;
  text-align: center;
  font-family: "Crimson Text";
  font-size: 30px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  margin: 0;
  flex: 1;
}
</style> 