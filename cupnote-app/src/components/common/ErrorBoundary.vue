<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">문제가 발생했습니다</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-details" v-if="showDetails">
        <pre>{{ errorDetails }}</pre>
      </div>
      <div class="error-actions">
        <button @click="retry" class="btn-primary">다시 시도</button>
        <button @click="goHome" class="btn-secondary">홈으로 이동</button>
        <button @click="toggleDetails" class="btn-text">
          {{ showDetails ? '상세 정보 숨기기' : '상세 정보 보기' }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetails = ref(false)

const props = defineProps({
  fallback: {
    type: String,
    default: '예기치 않은 오류가 발생했습니다.',
  },
  onError: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['error', 'retry'])

onErrorCaptured((err, instance, info) => {
  console.error('Error caught by boundary:', err)

  hasError.value = true
  errorMessage.value = err.message || props.fallback
  errorDetails.value = `${err.stack || err}\n\nComponent: ${instance?.$options.name || 'Unknown'}\nInfo: ${info}`

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(err, instance, info)
  }

  emit('error', { error: err, instance, info })

  // Prevent error propagation
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showDetails.value = false
  emit('retry')
}

const goHome = () => {
  router.push('/')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Expose reset method
defineExpose({
  reset: retry,
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--gradient-subtle);
}

.error-container {
  max-width: 600px;
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.error-icon {
  font-size: var(--text-6xl);
  margin-bottom: var(--space-4);
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

.error-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.error-message {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

.error-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  text-align: left;
  overflow-x: auto;
}

.error-details pre {
  font-family: monospace;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  background: var(--bg-tertiary);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  text-decoration: underline;
  transition: opacity var(--transition-base);
}

.btn-text:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .error-container {
    padding: var(--space-6);
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions button {
    width: 100%;
  }
}
</style>
