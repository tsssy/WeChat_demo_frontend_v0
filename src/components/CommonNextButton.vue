<template>
  <div :class="$style.button">
  <div :class="$style.label">Next</div>
  </div>
</template>

<style module>
.label {
  position: relative;
  line-height: 155%;
  font-weight: 600;
}

.button {
  width: 100%;
  position: relative;
  border-radius: 100px;
  background-color: #fa86a4;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  box-sizing: border-box;
  text-align: center;
  font-size: 18px;
  color: #fff;
  font-family: Nunito, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  min-height: 48px;
}

.button:hover {
  background-color: #f76d94;
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

</style>