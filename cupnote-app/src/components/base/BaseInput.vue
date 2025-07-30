<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="base-input-label">
      {{ label }}
      <span v-if="required" class="base-input-required">*</span>
    </label>

    <div class="base-input-container">
      <span v-if="$slots.prefix" class="base-input-prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <span v-if="$slots.suffix" class="base-input-suffix">
        <slot name="suffix" />
      </span>
    </div>

    <p v-if="error" class="base-input-error">
      {{ error }}
    </p>
    <p v-else-if="hint" class="base-input-hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: String,
  placeholder: String,
  hint: String,
  error: String,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur'])

// Unique ID for accessibility
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

// Local state
const isFocused = ref(false)

// Computed
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  {
    'base-input--error': props.error,
    'base-input--disabled': props.disabled,
    'base-input--focused': isFocused.value,
    'base-input--full-width': props.fullWidth,
  },
])

// Methods
const handleInput = (event) => {
  emit('input', event.target.value)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.base-input-wrapper {
  display: inline-block;
  width: 100%;
}

.base-input-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.base-input-required {
  color: var(--color-error);
  margin-left: var(--space-1);
}

.base-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input {
  flex: 1;
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-base);
}

/* Sizes */
.base-input--small {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  min-height: 36px;
}

.base-input--medium {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  min-height: 44px;
}

.base-input--large {
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-lg);
  min-height: 52px;
}

/* States */
.base-input:hover:not(.base-input--disabled) {
  border-color: var(--color-primary-light);
}

.base-input--focused,
.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.base-input--error {
  border-color: var(--color-error);
}

.base-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--disabled {
  background: var(--bg-muted);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Placeholder */
.base-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

/* Prefix & Suffix */
.base-input-prefix,
.base-input-suffix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.base-input-prefix {
  left: var(--space-4);
}

.base-input-suffix {
  right: var(--space-4);
}

.base-input-container:has(.base-input-prefix) .base-input {
  padding-left: var(--space-10);
}

.base-input-container:has(.base-input-suffix) .base-input {
  padding-right: var(--space-10);
}

/* Helper text */
.base-input-hint,
.base-input-error {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
}

.base-input-hint {
  color: var(--text-muted);
}

.base-input-error {
  color: var(--color-error);
}

/* Full width */
.base-input--full-width {
  width: 100%;
}
</style>
