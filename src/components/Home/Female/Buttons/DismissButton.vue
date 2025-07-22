<template>
    <div :class="$style.button">
          <img :class="$style.remixIconslinesystemclose" alt="" src="/media/images/home/cross.svg" />
          <div :class="$style.dismiss">Dismiss</div>
    </div>
</template>
<style  module>.remixIconslinesystemclose {
    width: 20px;
    position: relative;
    height: 20px;
    overflow: hidden;
    flex-shrink: 0;
}
    .dismiss {
          position: relative;
          line-height: 155%;
          font-weight: 600;
    }
    .button {
          flex: 1;
          width: 100%;
          position: relative;
          border-radius: 100px;
          background-color: #fff;
          height: 48px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          box-sizing: border-box;
          gap: 12px;
          text-align: center;
          font-size: 16px;
          color: #000;
          font-family: Nunito;
    }

</style>