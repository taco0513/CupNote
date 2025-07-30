<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div class="card-content">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  padding: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  },
  shadow: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  },
  borderRadius: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => [
  'base-card',
  `base-card--padding-${props.padding}`,
  `base-card--shadow-${props.shadow}`,
  `base-card--radius-${props.borderRadius}`,
  {
    'base-card--hoverable': props.hoverable
  }
])
</script>

<style scoped>
.base-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color-light);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Subtle gradient overlay */
.base-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.base-card--hoverable:hover::before {
  opacity: 1;
}

/* Padding */
.base-card--padding-none .card-content {
  padding: 0;
}

.base-card--padding-small .card-content {
  padding: var(--space-4);
}

.base-card--padding-medium .card-content {
  padding: var(--space-6);
}

.base-card--padding-large .card-content {
  padding: var(--space-8);
}

/* Shadow */
.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-small {
  box-shadow: var(--shadow-sm);
}

.base-card--shadow-medium {
  box-shadow: var(--shadow-md);
}

.base-card--shadow-large {
  box-shadow: var(--shadow-lg);
}

/* Border Radius */
.base-card--radius-none {
  border-radius: 0;
}

.base-card--radius-small {
  border-radius: var(--radius-sm);
}

.base-card--radius-medium {
  border-radius: var(--radius-md);
}

.base-card--radius-large {
  border-radius: var(--radius-lg);
}

/* Hoverable */
.base-card--hoverable {
  cursor: pointer;
}

.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  border-color: var(--border-color);
}

/* Header & Footer */
.card-header {
  padding: var(--space-4) var(--space-6) 0;
  border-bottom: 1px solid var(--border-color-light);
  margin-bottom: var(--space-2);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.card-footer {
  padding: 0 var(--space-6) var(--space-4);
  border-top: 1px solid var(--border-color-light);
  margin-top: var(--space-2);
  color: var(--text-secondary);
}

/* Focus state for accessibility */
.base-card--hoverable:focus-within {
  outline: none;
  box-shadow: var(--shadow-md), var(--focus-ring);
}
</style>