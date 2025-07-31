import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useNavigationStack() {
  const router = useRouter()
  const navigationStack = ref([])
  const currentIndex = ref(-1)

  const push = (route) => {
    // Remove any routes after current index (if we're not at the end)
    navigationStack.value = navigationStack.value.slice(0, currentIndex.value + 1)
    
    // Add new route
    navigationStack.value.push(route)
    currentIndex.value++
    
    // Navigate to the route
    router.push(route)
  }

  const pop = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      const previousRoute = navigationStack.value[currentIndex.value]
      router.push(previousRoute)
      return true
    }
    return false // Can't pop anymore
  }

  const canGoBack = () => {
    return currentIndex.value > 0
  }

  const getCurrentRoute = () => {
    return navigationStack.value[currentIndex.value]
  }

  const getStack = () => {
    return navigationStack.value
  }

  const clear = () => {
    navigationStack.value = []
    currentIndex.value = -1
  }

  return {
    push,
    pop,
    canGoBack,
    getCurrentRoute,
    getStack,
    clear
  }
} 