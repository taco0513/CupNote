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
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

/* Ripple effect */
.base-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.base-button:active::before {
  width: 300px;
  height: 300px;
}

/* Sizes */
.base-button--small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  min-height: 36px;
}

.base-button--medium {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  min-height: 44px;
}

.base-button--large {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
  min-height: 52px;
}

/* Variants */
.base-button--primary {
  background: var(--gradient-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-sm);
}

.base-button--primary:hover:not(.base-button--disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button--primary:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.base-button--secondary {
  background: var(--bg-secondary);
  color: var(--color-primary);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-xs);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: var(--bg-tertiary);
  border-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.base-button--secondary:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.base-button--outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.base-button--outline:hover:not(.base-button--disabled) {
  background: var(--color-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-sm);
}

.base-button--outline:active:not(.base-button--disabled) {
  box-shadow: none;
}

.base-button--text {
  background: transparent;
  color: var(--color-primary);
  padding: var(--space-2);
}

.base-button--text:hover:not(.base-button--disabled) {
  background: rgba(124, 88, 66, 0.08);
  box-shadow: none;
}

.base-button--text:active:not(.base-button--disabled) {
  background: rgba(124, 88, 66, 0.12);
}

/* States */
.base-button--disabled {
  opacity: 0.5;
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

/* Loading spinner with coffee bean icon */
.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Focus states for accessibility */
.base-button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.base-button--primary:focus-visible {
  box-shadow: var(--shadow-sm), var(--focus-ring);
}
</style>