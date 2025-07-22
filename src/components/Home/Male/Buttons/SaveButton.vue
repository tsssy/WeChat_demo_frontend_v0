<template>
    <div 
        :class="[$style.button, { [$style.saved]: isSaved, [$style.disabled]: disabled }]" 
        @click="onButtonContainerClick"
    >
          <img :class="$style.vectorIcon" alt="" src="/media/images/home/star.svg" />
          <div :class="$style.save">{{ isSaved ? 'Saved' : 'Save' }}</div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    isSaved?: boolean
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSaved: false,
    disabled: false
})

const emit = defineEmits(['click'])
    
function onButtonContainerClick() {
    if (props.disabled) return
    // Emit click event to parent component
    emit('click')
}</script>
<style  module>.vectorIcon {
    width: 18px;
    position: relative;
    height: 18px;
}
    .save {
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
          cursor: pointer;
          text-align: center;
          font-size: 16px;
          color: #1e1e1e;
          font-family: Nunito;
          transition: transform 0.1s ease;
    }
    
    .button:active {
          transform: scale(0.95);
    }
    
    .button.saved {
          background-color: #fa86a4;
          color: #fff;
    }
    
    .button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
    }
    
    .button.disabled:active {
          transform: none;
    }

</style>