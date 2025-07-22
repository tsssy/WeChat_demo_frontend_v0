<template>
  <div :class="$style.button">
  <div :class="$style.label">Next</div>
  </div>
</template>

<style module>.label {
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
    padding: 12px 140px;
    box-sizing: border-box;
    text-align: center;
    font-size: 20px;
    color: #fff;
    font-family: Nunito;
  }
</style>