<template>
  <div class="profile-page">
    <!-- Profile 页面骨架 -->
    <h2>This is your profile</h2>
    <div class="profile-info">
      <div>Name: Daniel Yu</div>
      <div>Age: 25</div>
    </div>
    <div class="trait-section">
      <h3>Your personality trait</h3>
      <div>
        <b>Plus</b>
        <ul>
          <li>Suggestion 1</li>
          <li>Suggestion 1</li>
        </ul>
      </div>
      <div>
        <b>Minus</b>
        <ul>
          <li>Suggestion 1</li>
          <li>Suggestion 1</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// Profile 页面骨架，无业务逻辑
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
}
.profile-info {
  margin: 16px 0;
}
.trait-section {
  margin-top: 24px;
  width: 100%;
  max-width: 400px;
  background: #f8f8f8;
  border-radius: 16px;
  padding: 16px;
}
.trait-section ul {
  margin: 0 0 8px 16px;
}
</style>