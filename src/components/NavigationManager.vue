<script setup>
import { ref, computed } from 'vue'
import Entry from '../Entry.vue'
import GenderSelection from '../GenderSelection.vue'

const currentComponent = ref('Entry')
const componentStack = ref(['Entry'])

const components = {
  Entry,
  GenderSelection
}

const currentView = computed(() => {
  return components[currentComponent.value]
})

const navigateTo = (componentName) => {
  componentStack.value.push(componentName)
  currentComponent.value = componentName
}

const goBack = () => {
  if (componentStack.value.length > 1) {
    componentStack.value.pop()
    currentComponent.value = componentStack.value[componentStack.value.length - 1]
  }
}

const canGoBack = computed(() => {
  return componentStack.value.length > 1
})

// Expose navigation methods to child components
defineExpose({
  navigateTo,
  goBack,
  canGoBack
})
</script>

<template>
  <component :is="currentView" />
</template> 