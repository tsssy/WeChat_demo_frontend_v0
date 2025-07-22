<template>
    <div 
        :class="[$style.button, { [$style.liked]: isLiked }]" 
        @click="onButtonContainerClick"
        :style="{ cursor: isLiked ? 'default' : 'pointer' }"
    >
          <img :class="$style.remixIconsfillhealthheart" alt="" src="/media/images/home/heart.svg" />
          <div :class="$style.like">{{ isLiked ? 'Liked' : 'Like' }}</div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isLiked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLiked: false
})

const emit = defineEmits<{
    click: []
}>()

function onButtonContainerClick() {
    if (!props.isLiked) {
        emit('click')
    }
}
</script>

<style module>
.remixIconsfillhealthheart {
    width: 20px;
    position: relative;
    height: 20px;
    overflow: hidden;
    flex-shrink: 0;
}

.like {
    position: relative;
    line-height: 155%;
    font-weight: 600;
}

.button {
    flex: 1;
    width: 100%;
    position: relative;
    border-radius: 100px;
    background-color: #fa86a4;
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
    color: #fff;
    font-family: Nunito;
    transition: all 0.3s ease;
}

.button.liked {
    background-color: #e91e63;
    cursor: default;
}

.button:not(.liked):hover {
    background-color: #f06292;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(250, 134, 164, 0.3);
}

.button.liked:hover {
    transform: none;
    box-shadow: none;
}
</style>