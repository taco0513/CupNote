<template>
  <div class="goal-card" :class="{ 'goal-completed': goal.progress >= 100 }">
    <div class="goal-header">
      <div class="goal-icon">{{ goal.icon }}</div>
      <div class="goal-info">
        <h4 class="goal-title">{{ goal.title }}</h4>
        <p class="goal-period">{{ periodLabel }}</p>
      </div>
      <button
        @click="$emit('toggle-active')"
        class="goal-toggle"
        :class="{ active: goal.is_active }"
        :title="goal.is_active ? '목표 비활성화' : '목표 활성화'"
      >
        <span v-if="goal.is_active">⏸️</span>
        <span v-else>▶️</span>
      </button>
    </div>

    <div class="goal-description">
      {{ goal.description }}
    </div>

    <div class="goal-progress">
      <div class="progress-info">
        <span class="progress-current">{{ goal.current_value || 0 }}{{ goal.unit }}</span>
        <span class="progress-target">/ {{ goal.target_value }}{{ goal.unit }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${goal.progress}%` }"
          :class="progressClass"
        ></div>
      </div>
      <div class="progress-percentage">{{ goal.progress }}%</div>
    </div>

    <div class="goal-footer">
      <div class="goal-dates">
        <span class="date-label">{{ remainingTime }}</span>
      </div>
      <div class="goal-actions">
        <button @click="$emit('edit')" class="btn-icon" title="목표 수정">✏️</button>
        <button @click="$emit('delete')" class="btn-icon btn-danger" title="목표 삭제">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  goal: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle-active', 'edit', 'delete'])

// Computed
const periodLabel = computed(() => {
  const periodMap = {
    daily: '일일 목표',
    weekly: '주간 목표',
    monthly: '월간 목표',
    custom: '커스텀 목표',
  }
  return periodMap[props.goal.period] || props.goal.period
})

const progressClass = computed(() => {
  const progress = props.goal.progress
  if (progress >= 100) return 'progress-complete'
  if (progress >= 75) return 'progress-high'
  if (progress >= 50) return 'progress-medium'
  if (progress >= 25) return 'progress-low'
  return 'progress-start'
})

const remainingTime = computed(() => {
  if (!props.goal.is_active) return '비활성'
  if (props.goal.progress >= 100) return '완료됨! 🎉'

  const now = new Date()
  const end = new Date(props.goal.end_date)
  const diff = end - now

  if (diff < 0) return '기간 만료'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}일 남음`
  if (hours > 0) return `${hours}시간 남음`
  return '곧 마감'
})
</script>

<style scoped>
.goal-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0e8dc;
  transition: all 0.3s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.goal-card.goal-completed {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #86efac;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.goal-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.goal-info {
  flex: 1;
}

.goal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
}

.goal-period {
  margin: 0;
  font-size: 0.85rem;
  color: #a0796a;
}

.goal-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.goal-toggle:hover {
  background: #f8f4f0;
}

.goal-toggle.active {
  opacity: 1;
}

.goal-toggle:not(.active) {
  opacity: 0.5;
}

.goal-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.progress-current {
  font-weight: 600;
  color: #7c5842;
  font-size: 1.1rem;
}

.progress-target {
  color: #a0796a;
  font-size: 0.9rem;
}

.progress-bar {
  height: 10px;
  background: #f0e8dc;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition:
    width 0.5s ease,
    background-color 0.3s ease;
  border-radius: 5px;
}

.progress-start {
  background: #e8d5c4;
}

.progress-low {
  background: #f59e0b;
}

.progress-medium {
  background: #eab308;
}

.progress-high {
  background: #84cc16;
}

.progress-complete {
  background: #10b981;
}

.progress-percentage {
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c5842;
}

.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0e8dc;
}

.goal-dates {
  font-size: 0.85rem;
}

.date-label {
  color: #a0796a;
  font-weight: 500;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #f8f4f0;
  transform: scale(1.1);
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
}

/* Responsive */
@media (max-width: 640px) {
  .goal-card {
    padding: 1rem;
  }

  .goal-header {
    gap: 0.75rem;
  }

  .goal-icon {
    font-size: 2rem;
  }

  .goal-title {
    font-size: 1rem;
  }

  .goal-description {
    font-size: 0.85rem;
  }
}
</style>
