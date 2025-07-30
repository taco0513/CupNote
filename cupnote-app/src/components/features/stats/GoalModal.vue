<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEdit ? '목표 수정' : '새 목표 만들기' }}</h2>
          <button @click="close" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <!-- Goal Templates -->
          <div v-if="!isEdit && !customMode" class="goal-templates">
            <h3 class="section-title">추천 목표</h3>
            <div class="templates-grid">
              <button
                v-for="template in recommendedTemplates"
                :key="template.id"
                @click="selectTemplate(template)"
                class="template-card"
              >
                <div class="template-icon">{{ template.icon }}</div>
                <div class="template-info">
                  <h4 class="template-title">{{ template.title }}</h4>
                  <p class="template-description">{{ template.description }}</p>
                  <div class="template-meta">
                    <span class="template-period">{{ getPeriodLabel(template.period) }}</span>
                    <span class="template-target">목표: {{ template.target_value }}{{ template.unit }}</span>
                  </div>
                </div>
              </button>
            </div>

            <div class="divider-container">
              <div class="divider"></div>
              <span class="divider-text">또는</span>
              <div class="divider"></div>
            </div>

            <button @click="customMode = true" class="btn-custom">
              ✨ 나만의 목표 만들기
            </button>
          </div>

          <!-- Goal Form -->
          <form v-else @submit.prevent="saveGoal" class="goal-form">
            <div class="form-row">
              <div class="form-group">
                <label>목표 아이콘</label>
                <div class="icon-selector">
                  <button
                    v-for="icon in availableIcons"
                    :key="icon"
                    type="button"
                    @click="formData.icon = icon"
                    class="icon-option"
                    :class="{ selected: formData.icon === icon }"
                  >
                    {{ icon }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="title">목표 제목</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                placeholder="예: 매일 커피 기록하기"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="description">설명</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="2"
                placeholder="목표에 대한 간단한 설명"
                class="form-input"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="type">목표 유형</label>
                <select
                  id="type"
                  v-model="formData.type"
                  required
                  class="form-select"
                >
                  <option value="tastings">테이스팅 횟수</option>
                  <option value="streak">연속 기록</option>
                  <option value="score">평균 점수</option>
                  <option value="exploration">원산지 탐험</option>
                  <option value="skill">Pro Mode 사용</option>
                  <option value="time">추출 시간</option>
                </select>
              </div>

              <div class="form-group">
                <label for="period">기간</label>
                <select
                  id="period"
                  v-model="formData.period"
                  required
                  class="form-select"
                  :disabled="isEdit"
                >
                  <option value="daily">일일</option>
                  <option value="weekly">주간</option>
                  <option value="monthly">월간</option>
                  <option value="custom">커스텀</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="target">목표값</label>
                <div class="input-with-unit">
                  <input
                    id="target"
                    v-model.number="formData.target_value"
                    type="number"
                    min="1"
                    required
                    class="form-input"
                  >
                  <input
                    v-model="formData.unit"
                    type="text"
                    placeholder="단위"
                    class="form-input unit-input"
                  >
                </div>
              </div>
            </div>

            <div v-if="formData.period === 'custom'" class="form-row">
              <div class="form-group">
                <label for="start_date">시작일</label>
                <input
                  id="start_date"
                  v-model="formData.start_date"
                  type="date"
                  required
                  class="form-input"
                  :min="today"
                >
              </div>

              <div class="form-group">
                <label for="end_date">종료일</label>
                <input
                  id="end_date"
                  v-model="formData.end_date"
                  type="date"
                  required
                  class="form-input"
                  :min="formData.start_date || today"
                >
              </div>
            </div>

            <div class="form-actions">
              <button 
                v-if="!isEdit && customMode" 
                type="button" 
                @click="customMode = false"
                class="btn-secondary"
              >
                뒤로
              </button>
              <button type="button" @click="close" class="btn-secondary">
                취소
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? '저장 중...' : (isEdit ? '수정하기' : '목표 만들기') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGoalsStore } from '../../stores/goals'
import { useNotificationStore } from '../../stores/notification'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editGoal: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const goalsStore = useGoalsStore()
const notificationStore = useNotificationStore()

// State
const customMode = ref(false)
const loading = ref(false)
const formData = ref({
  icon: '🎯',
  title: '',
  description: '',
  type: 'tastings',
  period: 'weekly',
  target_value: 7,
  unit: '회',
  start_date: '',
  end_date: ''
})

const availableIcons = ['☕', '🎯', '📊', '🔥', '🌍', '🏆', '⏰', '📈', '⭐', '🚀']

const today = new Date().toISOString().split('T')[0]

// Computed
const isEdit = computed(() => !!props.editGoal)

const recommendedTemplates = computed(() => {
  return goalsStore.getRecommendedGoals.slice(0, 4)
})

const getPeriodLabel = (period) => {
  const labels = {
    daily: '일일',
    weekly: '주간',
    monthly: '월간',
    custom: '커스텀'
  }
  return labels[period] || period
}

// Methods
const selectTemplate = (template) => {
  formData.value = {
    ...formData.value,
    ...template,
    start_date: '',
    end_date: ''
  }
  customMode.value = true
}

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  customMode.value = false
  formData.value = {
    icon: '🎯',
    title: '',
    description: '',
    type: 'tastings',
    period: 'weekly',
    target_value: 7,
    unit: '회',
    start_date: '',
    end_date: ''
  }
}

const saveGoal = async () => {
  try {
    loading.value = true

    const result = isEdit.value
      ? await goalsStore.updateGoal(props.editGoal.id, formData.value)
      : await goalsStore.createGoal(formData.value)

    if (result.success) {
      notificationStore.showSuccess(
        isEdit.value ? '목표가 수정되었습니다' : '새 목표가 생성되었습니다',
        isEdit.value ? '목표 수정 완료' : '목표 생성 완료'
      )
      emit('saved', result.data)
      close()
    } else {
      notificationStore.showError(
        result.error || '오류가 발생했습니다',
        '목표 저장 실패'
      )
    }
  } catch (err) {
    console.error('Error saving goal:', err)
    notificationStore.showError(
      '목표 저장 중 오류가 발생했습니다',
      '오류'
    )
  } finally {
    loading.value = false
  }
}

// Watch for edit mode
watch(() => props.editGoal, (newGoal) => {
  if (newGoal) {
    formData.value = {
      icon: newGoal.icon || '🎯',
      title: newGoal.title,
      description: newGoal.description || '',
      type: newGoal.type,
      period: newGoal.period,
      target_value: newGoal.target_value,
      unit: newGoal.unit,
      start_date: newGoal.start_date?.split('T')[0] || '',
      end_date: newGoal.end_date?.split('T')[0] || ''
    }
    customMode.value = true
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #F0E8DC;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7C5842;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #A0796A;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #F8F4F0;
  color: #7C5842;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Goal Templates */
.goal-templates {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.template-card {
  background: #FFF8F0;
  border: 1px solid #F0E8DC;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 88, 66, 0.15);
  border-color: #D4B896;
}

.template-icon {
  font-size: 2rem;
  line-height: 1;
}

.template-info {
  flex: 1;
}

.template-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
}

.template-description {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.3;
}

.template-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #A0796A;
}

.divider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.divider {
  flex: 1;
  height: 1px;
  background: #E8D5C4;
}

.divider-text {
  color: #A0796A;
  font-size: 0.9rem;
}

.btn-custom {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

/* Goal Form */
.goal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7C5842;
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #D4B896;
  box-shadow: 0 0 0 3px rgba(212, 184, 150, 0.1);
}

.icon-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-option {
  width: 50px;
  height: 50px;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  background: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  border-color: #D4B896;
  transform: scale(1.05);
}

.icon-option.selected {
  border-color: #7C5842;
  background: #FFF8F0;
}

.input-with-unit {
  display: flex;
  gap: 0.5rem;
}

.unit-input {
  width: 80px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F0E8DC;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 1px solid #E8D5C4;
}

.btn-secondary:hover {
  background: #F8F4F0;
  border-color: #D4B896;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>