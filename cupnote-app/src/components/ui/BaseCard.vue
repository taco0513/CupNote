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
  background: white;
  border: 1px solid #E8DDD0;
  transition: all 0.2s ease;
}

/* Padding */
.base-card--padding-none .card-content {
  padding: 0;
}

.base-card--padding-small .card-content {
  padding: 1rem;
}

.base-card--padding-medium .card-content {
  padding: 1.5rem;
}

.base-card--padding-large .card-content {
  padding: 2rem;
}

/* Shadow */
.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-small {
  box-shadow: 0 1px 3px rgba(124, 88, 66, 0.1);
}

.base-card--shadow-medium {
  box-shadow: 0 4px 6px rgba(124, 88, 66, 0.1);
}

.base-card--shadow-large {
  box-shadow: 0 10px 25px rgba(124, 88, 66, 0.15);
}

/* Border Radius */
.base-card--radius-none {
  border-radius: 0;
}

.base-card--radius-small {
  border-radius: 4px;
}

.base-card--radius-medium {
  border-radius: 8px;
}

.base-card--radius-large {
  border-radius: 16px;
}

/* Hoverable */
.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.15);
}

/* Header & Footer */
.card-header {
  padding: 1rem 1.5rem 0;
  border-bottom: 1px solid #F0E5D8;
  margin-bottom: 0.5rem;
}

.card-footer {
  padding: 0 1.5rem 1rem;
  border-top: 1px solid #F0E5D8;
  margin-top: 0.5rem;
}
</style>