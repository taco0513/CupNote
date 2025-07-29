<template>
  <div class="personal-notes-view">
    <!-- Header -->
    <header class="notes-header">
      <h1 class="notes-title">
        ✍️ 개인적인 느낌을 기록해주세요
      </h1>
      <p class="notes-subtitle">
        이 커피에 대한 전반적인 느낌이나 생각을 자유롭게 적어보세요
      </p>
    </header>

    <!-- Previous Selections Summary -->
    <section class="selections-summary">
      <h3 class="summary-title">선택한 향미와 감각</h3>
      <p class="summary-description">버튼을 클릭하면 메모에 자동으로 추가됩니다</p>
      
      <div class="selections-content">
        <!-- Flavors -->
        <div v-if="mockFlavors.length > 0" class="selection-group">
          <h4 class="group-title">🍓 향미</h4>
          <div class="selection-buttons">
            <button
              v-for="flavor in mockFlavors"
              :key="flavor.id"
              :class="['selection-btn', { used: usedSelections.includes(flavor.text) }]"
              :disabled="usedSelections.includes(flavor.text)"
              @click="addToNotes(flavor.text)"
            >
              {{ flavor.text }}
            </button>
          </div>
        </div>

        <!-- Sensory Expressions -->
        <div v-if="mockSensoryExpressions.length > 0" class="selection-group">
          <h4 class="group-title">👅 감각</h4>
          <div class="selection-buttons">
            <button
              v-for="sensory in mockSensoryExpressions"
              :key="sensory.id"
              :class="['selection-btn', { used: usedSelections.includes(sensory.text) }]"
              :disabled="usedSelections.includes(sensory.text)"
              @click="addToNotes(sensory.text)"
            >
              <span class="sensory-category">[{{ sensory.category }}]</span>
              <span class="sensory-text">{{ sensory.text }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>


    <!-- Notes Input -->
    <section class="notes-input-section">
      <div class="input-container">
        <label for="personal-notes" class="input-label">
          개인 메모
        </label>
        <textarea
          id="personal-notes"
          v-model="personalNotes"
          class="notes-textarea"
          placeholder="이 커피에 대한 느낌을 자유롭게 적어보세요&#10;예: 아침에 마시기 좋은 달콤한 커피예요. 초콜릿 향이 특히 좋았고..."
          maxlength="200"
          rows="5"
        ></textarea>
        <div class="character-count">
          {{ personalNotes.length }}/200
        </div>
      </div>
    </section>

    <!-- Smart Suggestions -->
    <section v-if="smartSuggestions.length > 0" class="suggestions-section">
      <h3 class="section-title">💡 이런 표현은 어떠세요?</h3>
      <div class="suggestions">
        <button
          v-for="suggestion in smartSuggestions"
          :key="suggestion.id"
          class="suggestion-btn"
          @click="addToNotes(suggestion.text)"
        >
          {{ suggestion.text }}
        </button>
      </div>
    </section>

    <!-- Preview -->
    <section v-if="personalNotes.trim()" class="preview-section">
      <h3 class="section-title">미리보기</h3>
      <div class="notes-preview">
        <p class="preview-text">{{ personalNotes }}</p>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <div class="help-card">
        <h4 class="help-title">✨ 메모 작성 팁</h4>
        <ul class="help-list">
          <li>위의 버튼들을 클릭하면 메모에 자동으로 추가돼요</li>
          <li>감정이나 상황을 함께 적으면 나중에 더 의미있어요</li>
          <li>정답은 없어요! 솔직한 느낌을 적어주세요</li>
          <li>짧게 적어도 괜찮아요. 한 두 단어만 적어도 좋아요</li>
        </ul>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.go(-1)">
        이전
      </button>
      <button
        type="button"
        class="btn-primary"
        @click="handleNext"
      >
        다음 단계
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const personalNotes = ref('')
const usedSelections = ref([])

// Mock data (in real implementation, this would come from previous steps)
const mockFlavors = ref([
  { id: 1, text: '딸기' },
  { id: 2, text: '초콜릿' },
  { id: 3, text: '캐러멜' }
])

const mockSensoryExpressions = ref([
  { id: 1, category: '산미', text: '밝고 상큼한' },
  { id: 2, category: '단맛', text: '꿀 같은' }
])


// Smart Suggestions based on selections
const smartSuggestions = computed(() => {
  const suggestions = []
  
  // Generate contextual suggestions based on flavors and sensory expressions
  if (mockFlavors.value.some(f => f.text === '딸기')) {
    suggestions.push({ id: 's1', text: '베리 향이 인상적이었어요' })
  }
  
  if (mockFlavors.value.some(f => f.text === '초콜릿')) {
    suggestions.push({ id: 's2', text: '초콜릿 같은 깊은 맛' })
  }
  
  if (mockSensoryExpressions.value.some(s => s.text === '밝고 상큼한')) {
    suggestions.push({ id: 's3', text: '상쾌한 산미가 좋았어요' })
  }
  
  // Filter out suggestions that have already been used
  return suggestions.filter(s => !usedSelections.value.includes(s.text))
})

// Methods
const addToNotes = (text) => {
  // Prevent adding duplicate text
  if (usedSelections.value.includes(text)) return
  
  // Smart text processing
  const processedText = processTextForNotes(text)
  
  // Add to notes with appropriate spacing and punctuation
  if (personalNotes.value.trim()) {
    // Check if the last character is punctuation
    const lastChar = personalNotes.value.trim().slice(-1)
    if (!['.', '!', '?', ','].includes(lastChar)) {
      personalNotes.value += ', '
    } else {
      personalNotes.value += ' '
    }
  }
  
  personalNotes.value += processedText
  
  // Mark as used
  usedSelections.value.push(text)
  
  // Auto-focus the textarea
  const textarea = document.getElementById('personal-notes')
  if (textarea) {
    textarea.focus()
    textarea.setSelectionRange(personalNotes.value.length, personalNotes.value.length)
  }
}

const processTextForNotes = (text) => {
  // Smart text processing for natural Korean sentences
  const rules = [
    // Add appropriate particles and endings
    { pattern: /딸기$/, replacement: '딸기 향이 좋았고' },
    { pattern: /초콜릿$/, replacement: '초콜릿 같은 맛이 났고' },
    { pattern: /캐러멜$/, replacement: '캐러멜 향이 느껴졌고' },
    { pattern: /밝고 상큼한$/, replacement: '밝고 상큼한 산미였고' },
    { pattern: /꿀 같은$/, replacement: '꿀 같은 단맛이 있었고' }
  ]
  
  let processedText = text
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      processedText = text.replace(rule.pattern, rule.replacement)
      break
    }
  }
  
  return processedText
}

const clearNotes = () => {
  personalNotes.value = ''
  usedSelections.value = []
}

const handleNext = () => {
  // TODO: Save personal notes data
  console.log('Personal Notes:', personalNotes.value)
  console.log('Used Selections:', usedSelections.value)
  
  // Navigate to next step (Roaster Notes)
  router.push('/roaster-notes')
}

// Initialize
onMounted(() => {
  // In real implementation, load previous selections from route params or store
})
</script>

<style scoped>
.personal-notes-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.notes-header {
  text-align: center;
  margin-bottom: 2rem;
}

.notes-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.notes-subtitle {
  color: #A0796A;
  font-size: 1.1rem;
  line-height: 1.4;
}

/* Selections Summary */
.selections-summary {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.summary-description {
  color: #A0796A;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.selections-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.selection-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.selection-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selection-btn {
  background: #F8F4F0;
  border: 2px solid #E8D5C4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selection-btn:hover:not(:disabled) {
  border-color: #D4B896;
  background: #F0E8DC;
  transform: translateY(-1px);
}

.selection-btn:active:not(:disabled) {
  transform: translateY(0);
}

.selection-btn.used {
  background: #E8D5C4;
  border-color: #D4B896;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.sensory-category {
  font-size: 0.8rem;
  color: #A0796A;
  font-weight: 500;
}

.sensory-text {
  color: #666;
}

/* Section Title */
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

/* Notes Input */
.notes-input-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
}

.input-container {
  position: relative;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.notes-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;
}

.notes-textarea:focus {
  outline: none;
  border-color: #7C5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.character-count {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.8rem;
  color: #A0796A;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Smart Suggestions */
.suggestions-section {
  background: #FFF8F0;
  border: 1px solid #F0E8DC;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-btn {
  background: white;
  border: 1px solid #E8D5C4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #7C5842;
}

.suggestion-btn:hover {
  border-color: #D4B896;
  background: #F8F4F0;
  transform: translateY(-1px);
}

/* Preview */
.preview-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
}

.notes-preview {
  background: #F8F4F0;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #F0E8DC;
}

.preview-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Help Section */
.help-section {
  margin-bottom: 2rem;
}

.help-card {
  background: #FFF8F0;
  border: 1px solid #F0E8DC;
  border-radius: 12px;
  padding: 1.5rem;
}

.help-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.help-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E8D5C4;
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
  background: #7C5842;
  color: white;
  border: 2px solid #7C5842;
}

.btn-primary:hover {
  background: #5D3F2E;
  border-color: #5D3F2E;
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

/* Responsive Design */
@media (max-width: 768px) {
  .personal-notes-view {
    padding: 0.5rem;
  }
  
  .notes-title {
    font-size: 1.5rem;
  }
  
  .selections-summary,
  .notes-input-section,
  .suggestions-section,
  .preview-section {
    padding: 1rem;
  }
  
  .selection-buttons {
    justify-content: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .notes-header {
    margin-bottom: 1.5rem;
  }
  
  .notes-subtitle {
    font-size: 1rem;
  }
  
  .selection-buttons,
  .suggestions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selection-btn,
  .suggestion-btn {
    text-align: center;
  }
}
</style>