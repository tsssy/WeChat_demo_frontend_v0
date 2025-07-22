<template>
  <div class="page-container profile-page">
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
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.profile-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  align-self: center;
}
.profile-info {
  margin: 1rem 0;
  text-align: center;
  align-self: center;
}

.profile-info div {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}
.trait-section {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 100%;
  background: #f8f8f8;
  border-radius: 16px;
  padding: 1rem;
}

@media (min-width: 768px) {
  .trait-section {
    max-width: 380px;
  }
}

.trait-section h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.trait-section > div {
  margin-bottom: 1rem;
}

.trait-section b {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 1rem;
}
.trait-section ul {
  margin: 0 0 0.5rem 1rem;
  padding: 0;
}

.trait-section li {
  margin-bottom: 0.3rem;
  line-height: 1.3;
}
</style>