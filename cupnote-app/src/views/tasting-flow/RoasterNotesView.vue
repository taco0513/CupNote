<template>
  <div class="roaster-notes-view">
    <!-- Header -->
    <header class="roaster-header">
      <h1 class="roaster-title">📋 로스터 노트가 있나요?</h1>
      <p class="roaster-subtitle">
        카페 메뉴판이나 원두 패키지에 적힌 향미 정보를 입력해주세요<br />
        <strong>없다면 건너뛰어도 괜찮아요!</strong>
      </p>
    </header>

    <!-- Info Card -->
    <section class="info-section">
      <div class="info-card">
        <div class="info-header">
          <span class="info-icon">💡</span>
          <h3 class="info-title">로스터 노트란?</h3>
        </div>
        <div class="info-content">
          <p class="info-description">
            로스터(원두를 볶는 사람)가 이 커피에서 느낄 수 있는 향미를 미리 적어둔 설명입니다.
          </p>
          <div class="info-examples">
            <h4 class="examples-title">예시:</h4>
            <ul class="examples-list">
              <li>"다크 초콜릿, 캐러멜, 견과류의 풍미"</li>
              <li>"베리류, 시트러스, 꽃향기"</li>
              <li>"부드러운 바디, 달콤한 여운"</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Input Methods -->
    <section class="input-methods-section">
      <div class="method-selector">
        <h3 class="section-title">입력 방법을 선택하세요</h3>
        <div class="method-buttons">
          <button
            :class="['method-btn', { active: inputMethod === 'text' }]"
            @click="setInputMethod('text')"
          >
            <span class="method-icon">✍️</span>
            <span class="method-label">직접 입력</span>
            <span class="method-desc">메뉴판이나 패키지 보고 입력</span>
          </button>

          <button
            :class="['method-btn', { active: inputMethod === 'photo' }]"
            @click="setInputMethod('photo')"
            disabled
          >
            <span class="method-icon">📷</span>
            <span class="method-label">사진 촬영</span>
            <span class="method-desc">곧 추가될 예정</span>
          </button>

          <button
            :class="['method-btn', { active: inputMethod === 'skip' }]"
            @click="setInputMethod('skip')"
          >
            <span class="method-icon">⏭️</span>
            <span class="method-label">건너뛰기</span>
            <span class="method-desc">로스터 노트가 없어요</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Text Input -->
    <section v-if="inputMethod === 'text'" class="text-input-section">
      <div class="input-container">
        <label for="roaster-notes" class="input-label"> 로스터 노트 입력 </label>
        <textarea
          id="roaster-notes"
          v-model="roasterNotes"
          class="notes-textarea"
          placeholder="예: 다크 초콜릿, 캐러멜, 견과류의 풍미를 느낄 수 있습니다. 부드러운 바디감과 달콤한 여운이 특징입니다."
          maxlength="300"
          rows="4"
        ></textarea>
        <div class="character-count">{{ roasterNotes.length }}/300</div>
      </div>

      <!-- Quick Suggestions -->
      <div v-if="quickSuggestions.length > 0" class="suggestions-container">
        <h4 class="suggestions-title">자주 사용되는 표현들</h4>
        <div class="suggestions-grid">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion.id"
            class="suggestion-btn"
            @click="addSuggestion(suggestion.text)"
          >
            {{ suggestion.text }}
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="roasterNotes.trim()" class="preview-container">
        <h4 class="preview-title">미리보기</h4>
        <div class="notes-preview">
          <p class="preview-text">{{ roasterNotes }}</p>
        </div>
      </div>
    </section>

    <!-- Skip Confirmation -->
    <section v-if="inputMethod === 'skip'" class="skip-section">
      <div class="skip-card">
        <div class="skip-header">
          <span class="skip-icon">⏭️</span>
          <h3 class="skip-title">로스터 노트 건너뛰기</h3>
        </div>
        <div class="skip-content">
          <p class="skip-description">
            로스터 노트가 없어도 괜찮아요! 대신 다음과 같은 정보를 받을 수 있습니다:
          </p>
          <ul class="skip-benefits">
            <li>
              ✨ <strong>Level 1 매치 스코어</strong>: 선택한 향미와 감각만으로도 의미있는 점수를
              제공
            </li>
            <li>🎯 <strong>개인 취향 분석</strong>: 회원님의 취향 패턴을 더 정확히 파악</li>
            <li>📈 <strong>성장 추적</strong>: 감각 발달 과정을 체계적으로 기록</li>
          </ul>
          <div class="skip-note">
            <p>나중에 로스터 노트를 찾으시면 언제든 수정하실 수 있어요!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Match Score Impact -->
    <section class="impact-section">
      <div class="impact-card">
        <h3 class="impact-title">💯 매치 스코어에 미치는 영향</h3>
        <div class="impact-comparison">
          <div class="impact-item">
            <div class="impact-label with-notes">로스터 노트 있음</div>
            <div class="impact-description">
              <span class="impact-score">Level 2 매치 스코어</span>
              <span class="impact-detail">더 정확한 점수와 상세한 분석</span>
            </div>
          </div>
          <div class="impact-divider"></div>
          <div class="impact-item">
            <div class="impact-label without-notes">로스터 노트 없음</div>
            <div class="impact-description">
              <span class="impact-score">Level 1 매치 스코어</span>
              <span class="impact-detail">기본 점수와 개인 취향 분석</span>
            </div>
          </div>
        </div>
        <p class="impact-note">두 방법 모두 충분히 의미있는 정보를 제공합니다!</p>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <div class="help-card">
        <h4 class="help-title">🔍 로스터 노트를 찾는 방법</h4>
        <div class="help-content">
          <div class="help-item">
            <span class="help-icon">🏪</span>
            <div class="help-text"><strong>카페에서</strong>: 메뉴판이나 칠판의 커피 설명 확인</div>
          </div>
          <div class="help-item">
            <span class="help-icon">📦</span>
            <div class="help-text">
              <strong>원두 패키지</strong>: 포장지 뒷면의 테이스팅 노트 확인
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">💻</span>
            <div class="help-text"><strong>온라인</strong>: 로스터리 웹사이트나 SNS 확인</div>
          </div>
          <div class="help-item">
            <span class="help-icon">👥</span>
            <div class="help-text">
              <strong>바리스타에게 문의</strong>: "이 커피는 어떤 맛이 나나요?"
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.go(-1)">이전</button>
      <button
        type="button"
        class="btn-primary"
        @click="handleNext"
        :disabled="inputMethod === 'text' && roasterNotes.trim().length < 10"
      >
        <span v-if="inputMethod === 'skip'">건너뛰고 완료</span>
        <span v-else>완료하기</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// State
const inputMethod = ref('text') // 'text', 'photo', 'skip'
const roasterNotes = ref('')

// Quick suggestions for common roaster note phrases
const quickSuggestions = ref([
  { id: 1, text: '다크 초콜릿' },
  { id: 2, text: '캐러멜' },
  { id: 3, text: '견과류' },
  { id: 4, text: '베리류' },
  { id: 5, text: '시트러스' },
  { id: 6, text: '꽃향기' },
  { id: 7, text: '부드러운 바디' },
  { id: 8, text: '달콤한 여운' },
  { id: 9, text: '밝은 산미' },
  { id: 10, text: '진한 풍미' },
])

// Methods
const setInputMethod = (method) => {
  inputMethod.value = method
  if (method === 'skip') {
    roasterNotes.value = ''
  }
}

const addSuggestion = (text) => {
  if (roasterNotes.value.trim()) {
    // Check if the last character needs punctuation
    const lastChar = roasterNotes.value.trim().slice(-1)
    if (!['.', '!', '?', ','].includes(lastChar)) {
      roasterNotes.value += ', '
    } else {
      roasterNotes.value += ' '
    }
  }

  roasterNotes.value += text

  // Focus textarea
  const textarea = document.getElementById('roaster-notes')
  if (textarea) {
    textarea.focus()
    textarea.setSelectionRange(roasterNotes.value.length, roasterNotes.value.length)
  }
}

const handleNext = () => {
  const notes = inputMethod.value === 'skip' ? null : roasterNotes.value.trim()
  const level = inputMethod.value === 'skip' ? 1 : 2

  // Save to store
  tastingSessionStore.updateRoasterNotes(notes, level)

  console.log('Roaster notes saved:', { notes, level })

  // Navigate to result view
  router.push('/tasting-result')
}
</script>

<style scoped>
.roaster-notes-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
  min-height: 100vh;
}

/* Header */
.roaster-header {
  text-align: center;
  margin-bottom: 2rem;
}

.roaster-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.roaster-subtitle {
  color: #a0796a;
  font-size: 1.1rem;
  line-height: 1.5;
}

/* Info Section */
.info-section {
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-icon {
  font-size: 1.5rem;
}

.info-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0;
}

.info-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.examples-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.examples-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.examples-list li {
  margin-bottom: 0.25rem;
  font-style: italic;
}

/* Input Methods */
.input-methods-section {
  margin-bottom: 2rem;
}

.method-selector {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1.5rem;
  text-align: center;
}

.method-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.method-btn {
  background: white;
  border: 2px solid #e8d5c4;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.method-btn:hover:not(:disabled) {
  border-color: #d4b896;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.15);
}

.method-btn.active {
  border-color: #7c5842;
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.3);
}

.method-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.method-icon {
  font-size: 2rem;
}

.method-label {
  font-weight: 600;
  font-size: 1.1rem;
}

.method-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Text Input */
.text-input-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  margin-bottom: 2rem;
}

.input-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.notes-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e8d5c4;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.notes-textarea:focus {
  outline: none;
  border-color: #7c5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.character-count {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.8rem;
  color: #a0796a;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Suggestions */
.suggestions-container {
  margin-bottom: 1.5rem;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.75rem;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-btn {
  background: #f8f4f0;
  border: 1px solid #e8d5c4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #7c5842;
}

.suggestion-btn:hover {
  border-color: #d4b896;
  background: #f0e8dc;
  transform: translateY(-1px);
}

/* Preview */
.preview-container {
  border-top: 1px solid #f0e8dc;
  padding-top: 1rem;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.75rem;
}

.notes-preview {
  background: #f8f4f0;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #f0e8dc;
}

.preview-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Skip Section */
.skip-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  margin-bottom: 2rem;
}

.skip-card {
  text-align: center;
}

.skip-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.skip-icon {
  font-size: 1.5rem;
}

.skip-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0;
}

.skip-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.skip-benefits {
  text-align: left;
  margin: 0 auto 1rem;
  padding-left: 1.5rem;
  max-width: 500px;
  color: #666;
}

.skip-benefits li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.skip-note {
  background: #fff8f0;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #f0e8dc;
}

.skip-note p {
  margin: 0;
  color: #a0796a;
  font-size: 0.9rem;
  font-style: italic;
}

/* Impact Section */
.impact-section {
  margin-bottom: 2rem;
}

.impact-card {
  background: #f8f4f0;
  border: 1px solid #f0e8dc;
  border-radius: 16px;
  padding: 1.5rem;
}

.impact-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
  text-align: center;
}

.impact-comparison {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.impact-item {
  flex: 1;
  text-align: center;
}

.impact-label {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.impact-label.with-notes {
  background: #7c5842;
  color: white;
}

.impact-label.without-notes {
  background: #a0796a;
  color: white;
}

.impact-score {
  display: block;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.25rem;
}

.impact-detail {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.impact-divider {
  width: 2px;
  height: 40px;
  background: #e8d5c4;
  flex-shrink: 0;
}

.impact-note {
  text-align: center;
  color: #a0796a;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}

/* Help Section */
.help-section {
  margin-bottom: 2rem;
}

.help-card {
  background: #fff8f0;
  border: 1px solid #f0e8dc;
  border-radius: 12px;
  padding: 1.5rem;
}

.help-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
  text-align: center;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0e8dc;
}

.help-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.help-text {
  color: #666;
  line-height: 1.4;
  flex: 1;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e8d5c4;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: #7c5842;
  color: white;
  border: 2px solid #7c5842;
}

.btn-primary:hover:not(:disabled) {
  background: #5d3f2e;
  border-color: #5d3f2e;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #7c5842;
  border: 2px solid #e8d5c4;
}

.btn-secondary:hover {
  border-color: #d4b896;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .roaster-notes-view {
    padding: 0.5rem;
  }

  .roaster-title {
    font-size: 1.5rem;
  }

  .method-buttons {
    grid-template-columns: 1fr;
  }

  .impact-comparison {
    flex-direction: column;
    gap: 1rem;
  }

  .impact-divider {
    width: 40px;
    height: 2px;
  }

  .help-content {
    gap: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .roaster-subtitle {
    font-size: 1rem;
  }

  .method-btn {
    padding: 1rem;
  }

  .method-icon {
    font-size: 1.5rem;
  }

  .help-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
