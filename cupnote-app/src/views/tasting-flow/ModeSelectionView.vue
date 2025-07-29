<template>
  <div class="mode-selection-view">
    <!-- Header -->
    <header class="mode-header">
      <h1 class="mode-title">
        ☕ CupNote
      </h1>
      <p class="mode-subtitle">
        오늘의 커피를 기록해보세요
      </p>
    </header>

    <!-- Mode Cards -->
    <section class="mode-cards">
      <button
        v-for="mode in modes"
        :key="mode.value"
        class="mode-card"
        @click="selectMode(mode.value)"
      >
        <div class="mode-icon">{{ mode.icon }}</div>
        <h2 class="mode-name">{{ mode.label }}</h2>
        <p class="mode-desc">{{ mode.description }}</p>
        <p class="mode-time">{{ mode.time }}</p>
      </button>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/')">
        취소
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// Mode options
const modes = [
  {
    value: 'cafe',
    label: 'Cafe Mode',
    icon: '☕',
    description: '카페에서 마시는 커피',
    time: '3-5분'
  },
  {
    value: 'homecafe',
    label: 'HomeCafe Mode',
    icon: '🏠',
    description: '집에서 내려 마시는 커피',
    time: '5-8분'
  },
  {
    value: 'pro',
    label: 'Pro Mode',
    icon: '🎯',
    description: 'SCA 표준 전문 품질 평가',
    time: '8-12분'
  }
]

// Methods
const selectMode = (mode) => {
  // Save selected mode to store
  coffeeRecordStore.updateCoffeeSetup({
    mode: mode
  })
  
  console.log('Selected mode:', mode)
  
  // Navigate to coffee info
  router.push('/coffee-info')
}
</script>

<style scoped>
.mode-selection-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mode-header {
  text-align: center;
  margin-bottom: 3rem;
}

.mode-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.mode-subtitle {
  color: #A0796A;
  font-size: 1.2rem;
}

/* Mode Cards */
.mode-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  margin-bottom: 2rem;
}

.mode-card {
  background: white;
  border: 3px solid #E8D5C4;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.mode-card:hover {
  border-color: #D4B896;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(124, 88, 66, 0.2);
}

.mode-card:active {
  transform: translateY(-2px);
}

.mode-icon {
  font-size: 3rem;
  line-height: 1;
}

.mode-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
}

.mode-desc {
  font-size: 1rem;
  color: #A0796A;
}

.mode-time {
  font-size: 0.9rem;
  color: #D4B896;
  font-weight: 500;
  background: #FFF8F0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: auto;
  padding-top: 2rem;
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-secondary:hover {
  border-color: #D4B896;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 88, 66, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mode-selection-view {
    padding: 1.5rem 1rem;
  }
  
  .mode-title {
    font-size: 2rem;
  }
  
  .mode-subtitle {
    font-size: 1.1rem;
  }
  
  .mode-cards {
    gap: 1rem;
  }
  
  .mode-card {
    padding: 1.5rem;
  }
  
  .mode-icon {
    font-size: 2.5rem;
  }
  
  .mode-name {
    font-size: 1.25rem;
  }
}
</style>