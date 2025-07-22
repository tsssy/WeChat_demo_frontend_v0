# CardPoll 组件

## 功能描述

CardPoll 是一个可拖拽的卡片轮播组件，包含多张 AnswerCard，支持通过拖拽来切换卡片位置。

## 主要特性

- **拖拽切换**: 支持鼠标和触摸拖拽来切换卡片
- **居中显示**: 当前卡片始终居中显示
- **扑克牌效果**: 侧边卡片像扑克牌一样斜着叠起来
- **卡片保持**: 所有卡片都会保持显示，通过位置、旋转和透明度区分
- **进度指示**: 底部显示进度指示器
- **响应式设计**: 支持桌面和移动设备

## 使用方法

```vue
<template>
  <div class="home">
    <CardPoll />
  </div>
</template>

<script>
import CardPoll from './components/Home/Male/CardPoll.vue'

export default {
  components: {
    CardPoll
  }
}
</script>
```

## 组件结构

```
CardPoll.vue
├── 卡片容器 (card-poll-container)
├── 卡片包装器 (cards-wrapper)
│   ├── 卡片项 (card-item)
│   │   └── AnswerCard 组件
└── 进度指示器 (progress-indicator)
    └── 进度点 (progress-dot)
```

## 拖拽操作

- **向左拖拽**: 切换到右边的卡片
- **向右拖拽**: 切换到左边的卡片
- **拖拽阈值**: 100px，超过阈值才会触发切换

## 事件处理

- `@save-click`: 保存按钮点击事件
- `@answer-click`: 回答按钮点击事件

## 样式特点

- 当前卡片: 100% 透明度，100% 缩放，0度旋转，最高层级，无滤镜
- 侧边卡片: 根据距离动态调整透明度、缩放、旋转和滤镜
  - 距离1: 50% 透明度，90% 缩放，±12度旋转，70%亮度
  - 距离2: 0% 透明度，80% 缩放，±24度旋转，70%亮度
  - 距离3+: 5% 透明度，60% 缩放，±36度旋转，70%亮度
- 扑克牌叠放效果: 每张卡片都有轻微的垂直偏移
- 黑色滤镜效果: 侧边卡片使用brightness(0.7)和contrast(1.2)滤镜
- 平滑过渡动画: 0.3s ease
- 拖拽时禁用过渡动画以获得更好的性能 