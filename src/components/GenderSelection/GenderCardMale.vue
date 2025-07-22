<template>
  <div :class="[$style.card, { [$style.selected]: selected }]">
      <img v-if="selected" :class="$style.icon" alt="" src="/media/images/check.svg" />
      <img :class="$style.iconMale" alt="" src="/media/images/gender_choosing/icon_male.svg" />
      <div :class="$style.male">Male</div>
  </div>
</template>

<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false
  }
})
</script>

<style module>
.icon {
  position: absolute;
  top: 9px;
  right: 11px;
  border-radius: 100px;
  width: 20px;
  height: 20px;
}

.iconMale {
  position: absolute;
  height: 48.31%;
  width: 71.43%;
  top: 25.6%;
  right: 14.64%;
  bottom: 26.09%;
  left: 13.93%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
}

.male {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  line-height: 155%;
  font-weight: 600;
  text-align: center;
  font-size: 16px;
  color: #000;
}

.card {
  width: 100%;
  position: relative;
  border-radius: 16px;
  background-color: #fff;
  border: 2px solid transparent;
  box-sizing: border-box;
  height: 207px;
  text-align: center;
  font-size: 16px;
  color: #000;
  font-family: Nunito;
  transition: all 0.3s ease;
}

.card.selected {
  border: 2px solid #fa86a4;
}
</style>