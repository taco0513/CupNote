<template>
  <div class="records-list-view">
    <!-- Header -->
    <header class="records-header">
      <h1 class="records-title">☕ 나의 커피 기록</h1>
      <p class="records-subtitle">지금까지 {{ records.length }}개의 커피를 기록했어요</p>
    </header>

    <!-- Filters and Stats -->
    <section class="filters-section">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ totalRecords }}</div>
          <div class="stat-label">전체 기록</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ averageScore }}</div>
          <div class="stat-label">평균 점수</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ favoriteFlavorCount }}</div>
          <div class="stat-label">선호 향미</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-bar">
        <RouterLink to="/stats" class="stats-link">
          📊 자세한 통계 보기
        </RouterLink>
      </div>

      <!-- Sort Options -->
      <div class="sort-options">
        <select v-model="sortBy" class="sort-select">
          <option value="recent">최신순</option>
          <option value="score">점수순</option>
          <option value="name">이름순</option>
        </select>
      </div>
    </section>

    <!-- Records List -->
    <section v-if="!isLoading && records.length > 0" class="records-section">
      <transition-group name="list" tag="div" class="records-grid">
        <article
          v-for="record in sortedRecords"
          :key="record.id"
          class="record-card"
          @click="viewRecord(record)"
        >
          <!-- Score Badge -->
          <div class="score-badge" :class="getScoreClass(record.total_match_score)">
            <div class="score-number">{{ record.total_match_score }}</div>
            <div class="score-text">점</div>
          </div>

          <!-- Coffee Info -->
          <div class="coffee-info">
            <h3 class="coffee-name">{{ record.coffee_name }}</h3>
            <p class="cafe-name">{{ record.cafe_name }}</p>
            <div class="record-meta">
              <span class="meta-item">
                <span class="meta-icon">📍</span>
                {{ record.location }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ formatDate(record.created_at) }}
              </span>
            </div>
          </div>

          <!-- Flavor Preview -->
          <div v-if="record.selected_flavors && record.selected_flavors.length > 0" class="flavor-preview">
            <span 
              v-for="(flavor, index) in record.selected_flavors.slice(0, 3)" 
              :key="`${record.id}-flavor-${index}`"
              class="flavor-tag"
            >
              {{ flavor.text }}
            </span>
            <span v-if="record.selected_flavors.length > 3" class="more-tag">
              +{{ record.selected_flavors.length - 3 }}
            </span>
          </div>

          <!-- Roaster Note Level -->
          <div class="level-indicator">
            <span class="level-badge" :class="record.roaster_notes_level === 2 ? 'level-2' : 'level-1'">
              Level {{ record.roaster_notes_level }}
            </span>
          </div>
        </article>
      </transition-group>
    </section>

    <!-- Empty State -->
    <section v-else-if="!isLoading && records.length === 0" class="empty-state">
      <div class="empty-icon">☕</div>
      <h3 class="empty-title">아직 기록이 없어요</h3>
      <p class="empty-description">
        첫 번째 커피를 기록하고<br>
        당신의 커피 여정을 시작해보세요!
      </p>
      <button type="button" class="btn-primary" @click="startNewTasting">
        첫 커피 기록하기
      </button>
    </section>

    <!-- Loading State -->
    <section v-else-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">기록을 불러오는 중...</p>
    </section>

    <!-- Error State -->
    <section v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">오류가 발생했어요</h3>
      <p class="error-description">{{ error }}</p>
      <button type="button" class="btn-secondary" @click="retry">
        다시 시도
      </button>
    </section>

    <!-- Floating Action Button -->
    <button type="button" class="fab" @click="startNewTasting" aria-label="새 커피 기록하기">
      <span class="fab-icon">+</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../stores/coffeeRecord'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// State
const sortBy = ref('recent')

// Get data from store
const records = computed(() => coffeeRecordStore.records)
const isLoading = computed(() => coffeeRecordStore.isLoading)
const error = computed(() => coffeeRecordStore.error)

// Computed properties
const totalRecords = computed(() => records.value.length)

const averageScore = computed(() => {
  if (records.value.length === 0) return 0
  const sum = records.value.reduce((acc, record) => acc + (record.total_match_score || 0), 0)
  return Math.round(sum / records.value.length)
})

const favoriteFlavorCount = computed(() => {
  const flavorMap = new Map()
  records.value.forEach(record => {
    if (record.selected_flavors) {
      record.selected_flavors.forEach(flavor => {
        const count = flavorMap.get(flavor.text) || 0
        flavorMap.set(flavor.text, count + 1)
      })
    }
  })
  // Get top 3 flavors
  return Math.min(3, flavorMap.size)
})

const sortedRecords = computed(() => {
  const sorted = [...records.value]
  
  switch (sortBy.value) {
    case 'recent':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'score':
      return sorted.sort((a, b) => (b.total_match_score || 0) - (a.total_match_score || 0))
    case 'name':
      return sorted.sort((a, b) => a.coffee_name.localeCompare(b.coffee_name))
    default:
      return sorted
  }
})

// Methods
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-great'
  if (score >= 70) return 'score-good'
  if (score >= 60) return 'score-okay'
  return 'score-needs-improvement'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = Math.abs(today - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  
  return date.toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric' 
  })
}

const viewRecord = (record) => {
  // TODO: Navigate to record detail view
  console.log('View record:', record)
  router.push(`/records/${record.id}`)
}

const startNewTasting = () => {
  router.push('/coffee-setup')
}

const retry = async () => {
  // TODO: Get real user ID from auth
  const mockUserId = 'mock-user-id-123'
  await coffeeRecordStore.fetchUserRecords(mockUserId)
}

// Initialize
onMounted(async () => {
  // TODO: Get real user ID from auth
  const mockUserId = 'mock-user-id-123'
  await coffeeRecordStore.fetchUserRecords(mockUserId)
})
</script>

<style scoped>
.records-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
  position: relative;
  padding-bottom: 100px; /* Space for FAB */
}

/* Header */
.records-header {
  text-align: center;
  margin-bottom: 2rem;
}

.records-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.records-subtitle {
  color: #A0796A;
  font-size: 1.1rem;
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #A0796A;
  font-size: 0.9rem;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.stats-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.stats-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

.sort-options {
  display: flex;
  justify-content: flex-end;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  background: white;
  color: #7C5842;
  font-size: 1rem;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #7C5842;
}

/* Records Grid */
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.record-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.record-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(124, 88, 66, 0.2);
  border-color: #D4B896;
}

/* Score Badge */
.score-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.score-number {
  font-size: 1.5rem;
  line-height: 1;
}

.score-text {
  font-size: 0.75rem;
}

.score-excellent {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.score-great {
  background: linear-gradient(135deg, #10B981, #059669);
}

.score-good {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
}

.score-okay {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.score-needs-improvement {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}

/* Coffee Info */
.coffee-info {
  margin-bottom: 1rem;
  padding-right: 80px; /* Space for score badge */
}

.coffee-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.25rem;
}

.cafe-name {
  color: #A0796A;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.record-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 0.9rem;
}

/* Flavor Preview */
.flavor-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.flavor-tag {
  background: #F8F4F0;
  border: 1px solid #E8D5C4;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #7C5842;
}

.more-tag {
  background: #E8D5C4;
  border: 1px solid #D4B896;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #7C5842;
  font-weight: 500;
}

/* Level Indicator */
.level-indicator {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.level-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  text-transform: uppercase;
}

.level-1 {
  background: #E8D5C4;
  color: #7C5842;
}

.level-2 {
  background: #7C5842;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #A0796A;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #E8D5C4;
  border-top-color: #7C5842;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #A0796A;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.error-description {
  color: #A0796A;
  margin-bottom: 2rem;
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  border: none;
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fab:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.4);
}

.fab-icon {
  font-size: 2rem;
  font-weight: 300;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #7C5842;
  color: white;
}

.btn-primary:hover {
  background: #5D3F2E;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover {
  border-color: #D4B896;
  transform: translateY(-1px);
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .records-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .fab {
    bottom: 1rem;
    right: 1rem;
    width: 56px;
    height: 56px;
  }
}
</style>