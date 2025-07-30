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
import { useRouter, useRoute } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

const router = useRouter()
const route = useRoute()
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
  
  // Check if we're in demo mode
  const isDemo = route.path.startsWith('/demo')
  
  // Navigate to coffee info - use demo path if in demo mode
  if (isDemo) {
    router.push('/demo/coffee-info')
  } else {
    router.push('/coffee-info')
  }
}
</script>

<style scoped>
.mode-selection-view {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  background: var(--gradient-subtle);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Subtle background pattern */
.mode-selection-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(124, 88, 66, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(124, 88, 66, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(124, 88, 66, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.mode-header {
  text-align: center;
  margin-bottom: var(--space-12);
  position: relative;
  z-index: 1;
}

.mode-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-extrabold);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
  letter-spacing: var(--tracking-tight);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mode-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-relaxed);
}

/* Mode Cards */
.mode-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  flex: 1;
  margin-bottom: var(--space-8);
  position: relative;
  z-index: 1;
}

.mode-card {
  background: var(--bg-card);
  border: 3px solid var(--border-color-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-slow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Card glow effect */
.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
}

.mode-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-2xl);
}

.mode-card:hover::before {
  opacity: 0.02;
}

.mode-card:active {
  transform: translateY(-2px) scale(1.01);
}

.mode-icon {
  font-size: var(--text-5xl);
  line-height: 1;
  margin-bottom: var(--space-2);
  filter: drop-shadow(0 2px 4px rgba(124, 88, 66, 0.1));
}

.mode-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
}

.mode-desc {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
}

.mode-time {
  font-size: var(--text-sm);
  color: var(--color-accent);
  font-weight: var(--font-semibold);
  background: var(--gradient-accent);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(10px);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: auto;
  padding-top: var(--space-8);
  position: relative;
  z-index: 1;
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--color-primary);
  border: 2px solid var(--border-color);
  padding: var(--space-3) var(--space-8);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 120px;
  box-shadow: var(--shadow-xs);
}

.btn-secondary:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: var(--bg-secondary);
}

.btn-secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-sm), var(--focus-ring);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mode-selection-view {
    padding: var(--space-6) var(--space-4);
  }
  
  .mode-header {
    margin-bottom: var(--space-8);
  }
  
  .mode-title {
    font-size: var(--text-4xl);
  }
  
  .mode-subtitle {
    font-size: var(--text-lg);
  }
  
  .mode-cards {
    gap: var(--space-4);
  }
  
  .mode-card {
    padding: var(--space-6);
  }
  
  .mode-icon {
    font-size: var(--text-4xl);
  }
  
  .mode-name {
    font-size: var(--text-xl);
  }
}

/* Add entrance animation */
@media (prefers-reduced-motion: no-preference) {
  .mode-card {
    animation: fadeIn 0.6s ease-out forwards;
    opacity: 0;
  }
  
  .mode-card:nth-child(1) { animation-delay: 0.1s; }
  .mode-card:nth-child(2) { animation-delay: 0.2s; }
  .mode-card:nth-child(3) { animation-delay: 0.3s; }
}</style>