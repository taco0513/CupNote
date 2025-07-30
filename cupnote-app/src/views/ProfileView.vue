<template>
  <div class="profile-view">
    <!-- Header -->
    <header class="profile-header">
      <div class="header-content">
        <RouterLink to="/" class="back-link">
          <span class="back-icon">←</span>
          홈으로
        </RouterLink>
        <h1 class="profile-title">프로필</h1>
        <button
          type="button"
          class="logout-btn"
          @click="handleLogout"
          :disabled="authStore.isLoading"
        >
          로그아웃
        </button>
      </div>
    </header>

    <div class="profile-container">
      <!-- Profile Card -->
      <section class="profile-card">
        <div class="avatar-section">
          <div class="avatar">
            <span class="avatar-text">
              {{ avatarText }}
            </span>
          </div>
          <div class="level-badge">
            <span class="level-text">Lv.{{ userProfile?.level || 1 }}</span>
          </div>
        </div>

        <div class="profile-info">
          <h2 class="user-name">{{ userProfile?.display_name || '익명 사용자' }}</h2>
          <p class="user-email">{{ authStore.user?.email }}</p>
          
          <!-- XP Progress -->
          <div class="xp-section">
            <div class="xp-bar">
              <div class="xp-progress" :style="{ width: xpProgressPercent }"></div>
            </div>
            <span class="xp-text">{{ currentLevelXP }}/{{ nextLevelXP }} XP</span>
          </div>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-section">
        <h3 class="section-title">나의 통계</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ coffeeRecords.length }}</div>
            <div class="stat-label">총 기록</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ averageScore }}</div>
            <div class="stat-label">평균 점수</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ totalXP }}</div>
            <div class="stat-label">총 XP</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ currentStreak }}</div>
            <div class="stat-label">연속 기록</div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section v-if="recentRecords.length > 0" class="activity-section">
        <h3 class="section-title">최근 활동</h3>
        <div class="activity-list">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="activity-item"
            @click="viewRecord(record)"
          >
            <div class="activity-icon">☕</div>
            <div class="activity-content">
              <h4 class="activity-title">{{ record.coffee_name }}</h4>
              <p class="activity-subtitle">{{ record.cafe_name }}</p>
              <span class="activity-date">{{ formatDate(record.created_at) }}</span>
            </div>
            <div class="activity-score">{{ record.total_match_score }}점</div>
          </div>
        </div>
        <RouterLink to="/records" class="view-all-link">
          모든 기록 보기 →
        </RouterLink>
      </section>

      <!-- Profile Edit -->
      <section class="edit-section">
        <h3 class="section-title">프로필 편집</h3>
        <form @submit.prevent="handleUpdateProfile" class="edit-form">
          <div class="input-group">
            <label for="display-name" class="input-label">표시 이름</label>
            <input
              id="display-name"
              v-model="editForm.displayName"
              type="text"
              class="input-field"
              placeholder="표시할 이름을 입력하세요"
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="input-group">
            <label for="username" class="input-label">사용자명 (선택)</label>
            <input
              id="username"
              v-model="editForm.username"
              type="text"
              class="input-field"
              placeholder="@username"
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="authStore.isLoading || !hasProfileChanges"
            >
              <span v-if="authStore.isLoading" class="loading-spinner"></span>
              {{ authStore.isLoading ? '업데이트 중...' : '프로필 업데이트' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Danger Zone -->
      <section class="danger-section">
        <h3 class="section-title danger-title">계정 관리</h3>
        <div class="danger-card">
          <h4 class="danger-card-title">비밀번호 변경</h4>
          <p class="danger-card-description">
            보안을 위해 정기적으로 비밀번호를 변경하세요
          </p>
          <button
            type="button"
            class="btn-secondary"
            @click="showPasswordChange = true"
          >
            비밀번호 변경
          </button>
        </div>
      </section>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-toast">
      <span class="success-icon">✅</span>
      프로필이 업데이트되었습니다!
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordChange" class="modal-overlay" @click="showPasswordChange = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">비밀번호 변경</h3>
        
        <form @submit.prevent="handlePasswordChange">
          <div class="input-group">
            <label for="new-password" class="input-label">새 비밀번호</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              class="input-field"
              placeholder="6자 이상의 새 비밀번호"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="input-group">
            <label for="confirm-password" class="input-label">비밀번호 확인</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="input-field"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              :disabled="authStore.isLoading"
            />
            <div v-if="passwordForm.confirmPassword && !passwordsMatch" class="error-text">
              비밀번호가 일치하지 않습니다
            </div>
          </div>
          
          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="showPasswordChange = false"
              :disabled="authStore.isLoading"
            >
              취소
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="authStore.isLoading || !isPasswordFormValid"
            >
              {{ authStore.isLoading ? '변경 중...' : '변경' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTastingSessionStore } from '../stores/tastingSession'

const router = useRouter()
const authStore = useAuthStore()
const tastingSessionStore = useTastingSessionStore()

// State
const showSuccess = ref(false)
const showPasswordChange = ref(false)

const editForm = ref({
  displayName: '',
  username: ''
})

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// Computed
const userProfile = computed(() => authStore.userProfile)
const coffeeRecords = computed(() => tastingSessionStore.records)

const avatarText = computed(() => {
  const name = userProfile.value?.display_name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

const totalXP = computed(() => userProfile.value?.xp || 0)
const currentLevel = computed(() => userProfile.value?.level || 1)
const currentLevelXP = computed(() => totalXP.value % 100)
const nextLevelXP = computed(() => 100)
const xpProgressPercent = computed(() => `${(currentLevelXP.value / nextLevelXP.value) * 100}%`)

const averageScore = computed(() => {
  if (coffeeRecords.value.length === 0) return 0
  const sum = coffeeRecords.value.reduce((acc, record) => acc + (record.total_match_score || 0), 0)
  return Math.round(sum / coffeeRecords.value.length)
})

const currentStreak = computed(() => {
  // TODO: Calculate actual streak based on consecutive days
  return Math.min(coffeeRecords.value.length, 7)
})

const recentRecords = computed(() => {
  return coffeeRecords.value
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
})

const hasProfileChanges = computed(() => {
  return (
    editForm.value.displayName !== (userProfile.value?.display_name || '') ||
    editForm.value.username !== (userProfile.value?.username || '')
  )
})

const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.newPassword.length >= 6 &&
    passwordsMatch.value
  )
})

// Methods
const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleUpdateProfile = async () => {
  try {
    await authStore.updateUserProfile({
      display_name: editForm.value.displayName || null,
      username: editForm.value.username || null
    })
    
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Profile update failed:', error)
  }
}

const handlePasswordChange = async () => {
  try {
    await authStore.updatePassword(passwordForm.value.newPassword)
    
    showPasswordChange.value = false
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    
    alert('비밀번호가 성공적으로 변경되었습니다.')
  } catch (error) {
    console.error('Password change failed:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = Math.abs(today - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  
  return date.toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric' 
  })
}

const viewRecord = (record) => {
  router.push(`/records/${record.id}`)
}

// Initialize
onMounted(async () => {
  // Initialize form with current values
  editForm.value.displayName = userProfile.value?.display_name || ''
  editForm.value.username = userProfile.value?.username || ''

  // Load coffee records if not already loaded
  if (coffeeRecords.value.length === 0 && authStore.userId) {
    await tastingSessionStore.fetchUserRecords(authStore.userId)
  }
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.profile-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7C5842;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #5D3F2E;
}

.back-icon {
  font-size: 1.2rem;
}

.profile-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.logout-btn {
  background: none;
  border: 2px solid #E8D5C4;
  color: #7C5842;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover:not(:disabled) {
  border-color: #D4B896;
  background: #F8F4F0;
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Profile Container */
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.avatar-text {
  text-transform: uppercase;
}

.level-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #FFD700;
  color: #7C5842;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
}

.profile-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: #A0796A;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.xp-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.xp-bar {
  flex: 1;
  height: 8px;
  background: #E8D5C4;
  border-radius: 4px;
  overflow: hidden;
}

.xp-progress {
  height: 100%;
  background: linear-gradient(90deg, #7C5842, #A0796A);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.xp-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

/* Stats Section */
.stats-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: #F8F4F0;
  border-radius: 12px;
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

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8F4F0;
  border-radius: 12px;
  border: 1px solid #F0E8DC;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: #F0E8DC;
  transform: translateY(-1px);
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0 0 0.25rem 0;
}

.activity-subtitle {
  font-size: 0.9rem;
  color: #A0796A;
  margin: 0 0 0.25rem 0;
}

.activity-date {
  font-size: 0.8rem;
  color: #666;
}

.activity-score {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  flex-shrink: 0;
}

.view-all-link {
  display: inline-block;
  color: #7C5842;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #5D3F2E;
}

/* Edit Section */
.edit-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 500;
  color: #7C5842;
  font-size: 0.9rem;
}

.input-field {
  padding: 0.75rem 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #7C5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.input-field:disabled {
  background: #F8F4F0;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* Danger Section */
.danger-section {
  background: #FEF2F2;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #FECACA;
}

.danger-title {
  color: #DC2626;
}

.danger-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #FECACA;
}

.danger-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #DC2626;
  margin: 0 0 0.5rem 0;
}

.danger-card-description {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #D4B896;
  background: #F8F4F0;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10B981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.success-icon {
  font-size: 1.2rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  flex: 1;
}

.error-text {
  color: #DC2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .success-toast {
    right: 1rem;
    top: 1rem;
  }
}
</style>