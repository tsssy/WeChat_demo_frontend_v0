import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const currentPage = ref('entry')
  const pageHistory = ref(['entry'])
  const pageData = ref({})

  const navigateTo = (page, data = {}) => {
    pageHistory.value.push(page)
    currentPage.value = page
    pageData.value[page] = data
  }

  const goBack = () => {
    if (pageHistory.value.length > 1) {
      pageHistory.value.pop()
      currentPage.value = pageHistory.value[pageHistory.value.length - 1]
    }
  }

  const canGoBack = () => {
    return pageHistory.value.length > 1
  }

  const getPageData = (page) => {
    return pageData.value[page] || {}
  }

  return {
    currentPage,
    pageHistory,
    navigateTo,
    goBack,
    canGoBack,
    getPageData
  }
}) 