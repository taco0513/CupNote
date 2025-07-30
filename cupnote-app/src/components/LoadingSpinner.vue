<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="spinner">
      <div class="bean bean-1"></div>
      <div class="bean bean-2"></div>
      <div class="bean bean-3"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
})

const sizeClass = computed(() => `spinner-${props.size}`)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.spinner {
  position: relative;
  display: inline-block;
}

/* Coffee bean shapes */
.bean {
  position: absolute;
  width: 20px;
  height: 30px;
  background: var(--color-primary);
  border-radius: 50% / 60% 60% 40% 40%;
  transform-origin: center;
  animation: rotate 2s infinite ease-in-out;
}

.bean::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 60%;
  background: var(--bg-card);
  border-radius: 1px;
}

.bean-1 {
  animation-delay: 0s;
}

.bean-2 {
  animation-delay: 0.2s;
}

.bean-3 {
  animation-delay: 0.4s;
}

/* Size variations */
.spinner-small .spinner {
  width: 30px;
  height: 30px;
}

.spinner-small .bean {
  width: 10px;
  height: 15px;
}

.spinner-medium .spinner {
  width: 60px;
  height: 60px;
}

.spinner-medium .bean {
  width: 20px;
  height: 30px;
}

.spinner-large .spinner {
  width: 100px;
  height: 100px;
}

.spinner-large .bean {
  width: 30px;
  height: 45px;
}

/* Position beans in circle */
.bean-1 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.bean-2 {
  bottom: 0;
  left: 0;
  transform: rotate(120deg);
}

.bean-3 {
  bottom: 0;
  right: 0;
  transform: rotate(240deg);
}

/* Loading message */
.loading-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
}

/* Animations */
@keyframes rotate {
  0% {
    opacity: 0.3;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    opacity: 0.3;
    transform: scale(0.8) rotate(360deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bean {
    background: var(--color-accent);
  }
}
</style>