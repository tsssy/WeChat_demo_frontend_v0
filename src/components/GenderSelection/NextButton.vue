<template>
  <div :class="$style.text">
    <div :class="$style.button">
      <img :class="$style.fiRsArrowRightIcon" alt="" src="/media/images/gender_choosing/fi-rs-arrow-right.svg" />
    </div>
  </div>
</template>

<style module>
.fiRsArrowRightIcon {
  width: 18px;
  position: relative;
  height: 18px;
}

.button {
  align-self: stretch;
  border-radius: 100px;
  background-color: #fa86a4;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  width: 104px;
  height: 42px;
  min-width: 104px;
  min-height: 42px;
}

.text {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>