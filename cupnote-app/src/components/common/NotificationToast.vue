<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'toast',
            `toast-${notification.type}`,
            { 'toast-dismissible': notification.dismissible },
          ]"
          @click="notification.dismissible && removeNotification(notification.id)"
        >
          <div class="toast-icon">
            {{ getIcon(notification.type) }}
          </div>
          <div class="toast-content">
            <div class="toast-title" v-if="notification.title">
              {{ notification.title }}
            </div>
            <div class="toast-message">
              {{ notification.message }}
            </div>
          </div>
          <button
            v-if="notification.dismissible"
            class="toast-close"
            @click.stop="removeNotification(notification.id)"
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notification'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const getIcon = (type: string): string => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    coffee: '☕',
    achievement: '🏆',
    tip: '💡',
  }
  return icons[type as keyof typeof icons] || 'ℹ️'
}

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: auto;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.toast:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.toast-dismissible {
  cursor: pointer;
}

.toast-success {
  border-left-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
}

.toast-error {
  border-left-color: #f56565;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
}

.toast-warning {
  border-left-color: #ed8936;
  background: linear-gradient(135deg, #fffaf0 0%, #fbd38d 100%);
}

.toast-info {
  border-left-color: #4299e1;
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
}

.toast-coffee {
  border-left-color: #7c5842;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
}

.toast-achievement {
  border-left-color: #d69e2e;
  background: linear-gradient(135deg, #fffbeb 0%, #fef5e7 100%);
}

.toast-tip {
  border-left-color: #9f7aea;
  background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%);
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #2d3748;
}

.toast-message {
  font-size: 13px;
  line-height: 1.4;
  color: #4a5568;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #a0aec0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #4a5568;
}

/* Transition animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .toast-container {
    left: 20px;
    right: 20px;
    top: 20px;
    max-width: none;
  }

  .toast {
    margin-bottom: 8px;
    padding: 12px;
  }

  .toast-icon {
    font-size: 18px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-message {
    font-size: 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast {
    background: #2d3748;
    color: #e2e8f0;
  }

  .toast-title {
    color: #f7fafc;
  }

  .toast-message {
    color: #cbd5e0;
  }

  .toast-success {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-error {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-warning {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-info {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-coffee {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-achievement {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .toast-tip {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move,
  .toast {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .toast {
    border: 2px solid;
    box-shadow: none;
  }

  .toast-success {
    border-color: #22543d;
    background: #f0fff4;
    color: #22543d;
  }

  .toast-error {
    border-color: #742a2a;
    background: #fff5f5;
    color: #742a2a;
  }

  .toast-warning {
    border-color: #744210;
    background: #fffaf0;
    color: #744210;
  }

  .toast-info {
    border-color: #2a4365;
    background: #ebf8ff;
    color: #2a4365;
  }
}
</style>
