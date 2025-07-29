<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner">⏳</span>
    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--disabled': props.disabled || props.loading,
    'base-button--loading': props.loading,
    'base-button--full-width': props.fullWidth
  }
])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* Sizes */
.base-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 36px;
}

.base-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 44px;
}

.base-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 52px;
}

/* Variants */
.base-button--primary {
  background: linear-gradient(135deg, #7C5842 0%, #A0796A 100%);
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: linear-gradient(135deg, #6B4A37 0%, #8D6A5B 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 88, 66, 0.3);
}

.base-button--secondary {
  background: #F5F0E8;
  color: #7C5842;
  border: 2px solid #E8DDD0;
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: #F0E5D8;
  border-color: #D4C4B0;
  transform: translateY(-1px);
}

.base-button--outline {
  background: transparent;
  color: #7C5842;
  border: 2px solid #7C5842;
}

.base-button--outline:hover:not(.base-button--disabled) {
  background: #7C5842;
  color: white;
}

.base-button--text {
  background: transparent;
  color: #7C5842;
  padding: 0.5rem;
}

.base-button--text:hover:not(.base-button--disabled) {
  background: rgba(124, 88, 66, 0.1);
}

/* States */
.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.base-button--loading {
  cursor: not-allowed;
}

.base-button--full-width {
  width: 100%;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>