<template>
  <div class="achievement-card" :class="{ earned: isEarned, locked: isLocked }">
    <div class="achievement-icon">
      <span v-if="isEarned">{{ achievement.icon }}</span>
      <span v-else-if="showProgress">🔒</span>
      <span v-else>{{ achievement.icon }}</span>
    </div>

    <div class="achievement-content">
      <div class="achievement-header">
        <h4 class="achievement-title">{{ achievement.title }}</h4>
        <div class="achievement-tier" :class="`tier-${achievement.tier}`">
          {{ getTierLabel(achievement.tier) }}
        </div>
      </div>

      <p class="achievement-description">{{ achievement.description }}</p>

      <div class="achievement-footer">
        <div class="achievement-points">
          <span class="points-icon">⭐</span>
          <span class="points-value">{{ achievement.points }}포인트</span>
        </div>

        <div v-if="showProgress && userProgress" class="achievement-progress">
          <div class="progress-text">
            {{ userProgress.progress }}% ({{ userProgress.current }}/{{ achievement.target }})
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${userProgress.progress}%` }"></div>
          </div>
        </div>

        <div v-if="isEarned && userProgress?.earned_at" class="earned-date">
          {{ formatEarnedDate(userProgress.earned_at) }}에 획득
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
  },
  userProgress: {
    type: Object,
    default: null,
  },
})

const isEarned = computed(() => {
  return props.userProgress?.progress >= 100
})

const isLocked = computed(() => {
  return !props.userProgress || props.userProgress.progress === 0
})

const showProgress = computed(() => {
  return props.userProgress && props.userProgress.progress > 0 && props.userProgress.progress < 100
})

const getTierLabel = (tier) => {
  const tiers = {
    1: '브론즈',
    2: '실버',
    3: '골드',
    4: '플래티넘',
    5: '다이아몬드',
  }
  return tiers[tier] || '브론즈'
}

const formatEarnedDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}
</script>

<style scoped>
.achievement-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.1);
  border: 2px solid #f0e8dc;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.achievement-card.earned {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.achievement-card.earned::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 40px 40px 0;
  border-color: transparent #10b981 transparent transparent;
}

.achievement-card.earned::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.achievement-card.locked {
  opacity: 0.6;
  background: #f8f8f8;
}

.achievement-card:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.15);
}

.achievement-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  filter: grayscale(0);
  transition: filter 0.3s ease;
}

.achievement-card.locked .achievement-icon {
  filter: grayscale(100%);
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0;
  flex: 1;
}

.achievement-tier {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-1 {
  background: #cd7f32;
  color: white;
}

.tier-2 {
  background: #c0c0c0;
  color: #333;
}

.tier-3 {
  background: #ffd700;
  color: #333;
}

.tier-4 {
  background: #e5e4e2;
  color: #333;
}

.tier-5 {
  background: #b9f2ff;
  color: #333;
}

.achievement-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.achievement-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.achievement-points {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #7c5842;
  font-weight: 600;
}

.points-icon {
  color: #f59e0b;
}

.achievement-progress {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  background: #e8d5c4;
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c5842, #a0796a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.earned-date {
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 500;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .achievement-card {
    padding: 1rem;
  }

  .achievement-icon {
    font-size: 2.5rem;
  }

  .achievement-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
