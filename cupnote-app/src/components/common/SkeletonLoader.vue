<template>
  <div class="skeleton-loader" :class="[typeClass, animationClass]">
    <template v-if="type === 'card'">
      <div class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-header-content">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-subtitle"></div>
          </div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-short"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="type === 'list'">
      <div class="skeleton-list">
        <div v-for="i in count" :key="i" class="skeleton-list-item">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="type === 'text'">
      <div class="skeleton-text">
        <div v-for="i in count" :key="i" class="skeleton-line" :class="getLineClass(i)"></div>
      </div>
    </template>
    
    <template v-else-if="type === 'image'">
      <div class="skeleton-image" :style="imageStyle"></div>
    </template>
    
    <template v-else-if="type === 'chart'">
      <div class="skeleton-chart">
        <div class="skeleton-chart-bars">
          <div v-for="i in 5" :key="i" class="skeleton-bar" :style="{ height: getRandomHeight() }"></div>
        </div>
        <div class="skeleton-chart-labels">
          <div v-for="i in 5" :key="i" class="skeleton-line skeleton-label"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="type === 'custom'">
      <slot />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['card', 'list', 'text', 'image', 'chart', 'custom'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  animation: {
    type: String,
    default: 'pulse',
    validator: (value) => ['pulse', 'wave', 'none'].includes(value)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },
  aspectRatio: {
    type: String,
    default: '16/9'
  }
})

const typeClass = computed(() => `skeleton-${props.type}`)
const animationClass = computed(() => `animation-${props.animation}`)

const imageStyle = computed(() => ({
  width: props.width,
  height: props.height,
  aspectRatio: props.aspectRatio
}))

const getLineClass = (index) => {
  if (index === props.count) return 'skeleton-short'
  if (index === 1) return 'skeleton-title'
  return ''
}

const getRandomHeight = () => {
  return `${Math.floor(Math.random() * 40) + 30}%`
}
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* Base skeleton element */
.skeleton-line,
.skeleton-avatar,
.skeleton-image,
.skeleton-bar {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
}

/* Animations */
.animation-pulse .skeleton-line,
.animation-pulse .skeleton-avatar,
.animation-pulse .skeleton-image,
.animation-pulse .skeleton-bar {
  animation: pulse 1.5s ease-in-out infinite;
}

.animation-wave .skeleton-line,
.animation-wave .skeleton-avatar,
.animation-wave .skeleton-image,
.animation-wave .skeleton-bar {
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Card skeleton */
.skeleton-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* List skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-list-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

/* Text skeleton */
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-line {
  height: 16px;
  width: 100%;
}

.skeleton-title {
  height: 24px;
  width: 60%;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
}

.skeleton-short {
  width: 70%;
}

.skeleton-label {
  height: 12px;
  width: 60px;
}

/* Image skeleton */
.skeleton-image {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
}

.skeleton-image::before {
  content: '🖼️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-3xl);
  opacity: 0.1;
}

/* Chart skeleton */
.skeleton-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  height: 300px;
}

.skeleton-chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: var(--space-2);
}

.skeleton-bar {
  flex: 1;
  max-width: 60px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.skeleton-chart-labels {
  display: flex;
  justify-content: space-around;
  gap: var(--space-2);
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-line {
    height: 14px;
  }
  
  .skeleton-title {
    height: 20px;
  }
  
  .skeleton-subtitle {
    height: 12px;
  }
}
</style>