<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HorizontalLogo from './components/HorizontalLogo.vue'
import GenderCardMale from './components/GenderSelection/GenderCardMale.vue'
import GenderCardFemale from './components/GenderSelection/GenderCardFemale.vue'
import NextButton from './components/GenderSelection/NextButton.vue'
import CommonNextButton from './components/CommonNextButton.vue'
import { useNavigationStore } from './stores/navigation.js'
import { debugLog } from './utils/debug.js'

const router = useRouter()
const navigationStore = useNavigationStore()
const selectedGender = ref('')

const selectGender = (gender) => {
  selectedGender.value = gender
  debugLog.log('Selected gender:', gender)
}

const handleNext = () => {
  if (selectedGender.value) {
    debugLog.log('Proceeding with gender:', selectedGender.value)
    
    if (selectedGender.value === 'female') {
      // Redirect to Telegram bot for females
      window.open('https://t.me/CupidYukioBot', '_blank')
      return
    }
    
    // For males, continue with the normal flow
    // Get user info from previous step and pass it forward
    const entryData = navigationStore.getPageData('entry')
    const userInfo = entryData.userInfo
    
    // Store both user info and selected gender for next step
    navigationStore.navigateTo('mode-selection', { 
      userInfo: userInfo,
      selectedGender: selectedGender.value 
    })
    
    // Navigate to mode selection
    router.push('/mode-selection')
  } else {
    debugLog.log('Please select a gender first')
  }
}
</script>

<template>
  <div class="gender-selection">
    <div class="logo-container">
      <HorizontalLogo />
    </div>
    
    <div class="welcome-text-container">
      <h1 class="welcomeToLovelush">Welcome to Lovelush</h1>
    </div>
    
    <div class="title-container">
      <h2 class="title">Are you a boy or a girl?</h2>
    </div>
    
    <div class="gender-options-container">
      <div class="gender-options">
        <div 
          class="gender-card-wrapper"
          :class="{ active: selectedGender === 'male' }"
          @click="selectGender('male')"
        >
          <GenderCardMale :selected="selectedGender === 'male'" />
        </div>
        
        <div 
          class="gender-card-wrapper"
          :class="{ active: selectedGender === 'female' }"
          @click="selectGender('female')"
        >
          <GenderCardFemale :selected="selectedGender === 'female'" />
        </div>
      </div>
    </div>
    
    <div class="next-button-container">
      <div 
        class="next-button-wrapper"
        :class="{ disabled: !selectedGender }"
        @click="handleNext"
      >
        <CommonNextButton />
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.gender-selection {
  background: #000;
  height: 100vh;
  width: 100%;
  color: white;
  font-family: Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* Logo - The pivot point */
.logo-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.logo-container img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

/* Welcome text - positioned relative to logo */
.welcome-text-container {
  position: absolute;
  top: 8rem;
  left: 50%;
  transform: translateX(-50%);
}

.welcomeToLovelush {
  font-size: 2rem;
  line-height: 140%;
  font-family: Nunito, sans-serif;
  color: #fa86a4;
  text-align: center;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

/* Title - positioned relative to welcome text */
.title-container {
  position: absolute;
  top: 11rem;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-size: 1rem;
  line-height: 160%;
  font-family: Nunito, sans-serif;
  color: #fff;
  text-align: center;
  font-weight: 400;
  margin: 0;
  white-space: nowrap;
}

/* Gender options - positioned relative to title */
.gender-options-container {
  position: absolute;
  top: 15rem;
  left: 50%;
  transform: translateX(-50%);
}

.gender-options {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.gender-card-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  width: 120px;
  height: 207px;
}

.gender-card-wrapper:hover {
  transform: scale(1.05);
}

.gender-card-wrapper.active {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(250, 134, 164, 0.5);
}

/* Next button - positioned relative to gender options */
.next-button-container {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
}

.next-button-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 100px;
  padding: 0.5rem;
}

.next-button-wrapper:hover {
  transform: scale(1.05);
}

.next-button-wrapper.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-button-wrapper.disabled:hover {
  transform: none;
}
</style>