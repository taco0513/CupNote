// CupNote Feedback System
// 베타 테스터 피드백 수집을 위한 컴포넌트

class FeedbackWidget {
  constructor() {
    this.isOpen = false
    this.feedbackTypes = {
      bug: '🐛 버그 신고',
      feature: '💡 기능 제안',
      general: '💬 일반 피드백',
    }
    this.init()
  }

  init() {
    this.createWidget()
    this.attachEventListeners()
  }

  createWidget() {
    // Feedback button
    const button = document.createElement('button')
    button.id = 'feedback-button'
    button.className = 'feedback-button'
    button.innerHTML = '💬'
    button.setAttribute('aria-label', '피드백 보내기')

    // Feedback modal
    const modal = document.createElement('div')
    modal.id = 'feedback-modal'
    modal.className = 'feedback-modal'
    modal.innerHTML = `
      <div class="feedback-content">
        <div class="feedback-header">
          <h3>피드백 보내기</h3>
          <button class="feedback-close" aria-label="닫기">&times;</button>
        </div>
        
        <div class="feedback-body">
          <div class="feedback-types">
            ${Object.entries(this.feedbackTypes)
              .map(
                ([key, label]) => `
              <label class="feedback-type">
                <input type="radio" name="feedback-type" value="${key}" ${key === 'general' ? 'checked' : ''}>
                <span>${label}</span>
              </label>
            `
              )
              .join('')}
          </div>
          
          <textarea 
            id="feedback-message" 
            class="feedback-textarea" 
            placeholder="어떤 점이 불편하셨나요? 어떤 기능이 필요하신가요?"
            rows="5"
          ></textarea>
          
          <div class="feedback-meta">
            <label>
              <input type="checkbox" id="include-screenshot" checked>
              <span>현재 화면 스크린샷 포함</span>
            </label>
          </div>
          
          <div class="feedback-actions">
            <button class="btn-cancel">취소</button>
            <button class="btn-submit" id="submit-feedback">보내기</button>
          </div>
        </div>
      </div>
    `

    // Add styles
    const styles = document.createElement('style')
    styles.textContent = `
      .feedback-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary, #7C5842);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9998;
        transition: transform 0.2s, background 0.2s;
      }
      
      .feedback-button:hover {
        transform: scale(1.1);
        background: var(--color-primary-dark, #6B4A37);
      }
      
      .feedback-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.3s ease;
      }
      
      .feedback-modal.open {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .feedback-content {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .feedback-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .feedback-header h3 {
        margin: 0;
        font-size: 18px;
      }
      
      .feedback-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
      }
      
      .feedback-body {
        padding: 20px;
        overflow-y: auto;
      }
      
      .feedback-types {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      
      .feedback-type {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .feedback-type:has(input:checked) {
        background: var(--color-primary-light, #F5E6D8);
        border-color: var(--color-primary, #7C5842);
      }
      
      .feedback-type input {
        margin: 0;
      }
      
      .feedback-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
        font-family: inherit;
      }
      
      .feedback-textarea:focus {
        outline: none;
        border-color: var(--color-primary, #7C5842);
      }
      
      .feedback-meta {
        margin: 16px 0;
      }
      
      .feedback-meta label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      
      .feedback-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      
      .feedback-actions button {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .btn-cancel {
        background: #f0f0f0;
        color: #666;
      }
      
      .btn-cancel:hover {
        background: #e0e0e0;
      }
      
      .btn-submit {
        background: var(--color-primary, #7C5842);
        color: white;
      }
      
      .btn-submit:hover {
        background: var(--color-primary-dark, #6B4A37);
      }
      
      .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @media (max-width: 600px) {
        .feedback-content {
          margin: 20px;
          max-height: calc(100vh - 40px);
        }
      }
    `

    // Append to DOM
    document.head.appendChild(styles)
    document.body.appendChild(button)
    document.body.appendChild(modal)
  }

  attachEventListeners() {
    // Open modal
    document.getElementById('feedback-button').addEventListener('click', () => {
      this.open()
    })

    // Close modal
    document.querySelector('.feedback-close').addEventListener('click', () => {
      this.close()
    })

    document.querySelector('.btn-cancel').addEventListener('click', () => {
      this.close()
    })

    // Close on background click
    document.getElementById('feedback-modal').addEventListener('click', e => {
      if (e.target.id === 'feedback-modal') {
        this.close()
      }
    })

    // Submit feedback
    document.getElementById('submit-feedback').addEventListener('click', () => {
      this.submitFeedback()
    })
  }

  open() {
    this.isOpen = true
    document.getElementById('feedback-modal').classList.add('open')
    document.getElementById('feedback-message').focus()
  }

  close() {
    this.isOpen = false
    document.getElementById('feedback-modal').classList.remove('open')
    // Reset form
    document.getElementById('feedback-message').value = ''
    document.querySelector('input[value="general"]').checked = true
  }

  async submitFeedback() {
    const type = document.querySelector('input[name="feedback-type"]:checked').value
    const message = document.getElementById('feedback-message').value.trim()
    const includeScreenshot = document.getElementById('include-screenshot').checked

    if (!message) {
      showToast('피드백 내용을 입력해주세요', 'warning')
      return
    }

    // Disable submit button
    const submitBtn = document.getElementById('submit-feedback')
    submitBtn.disabled = true
    submitBtn.textContent = '보내는 중...'

    try {
      const feedbackData = {
        type,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        // App state context
        appState: {
          mode: window.appState?.selectedMode || 'unknown',
          screen: window.appState?.currentScreen || 'unknown',
        },
      }

      // Capture screenshot if requested
      if (includeScreenshot && typeof html2canvas !== 'undefined') {
        try {
          const canvas = await html2canvas(document.body)
          feedbackData.screenshot = canvas.toDataURL('image/png')
        } catch (err) {
          console.error('Screenshot capture failed:', err)
        }
      }

      // Send feedback to server
      if (window.api && window.appState?.isAuthenticated) {
        // If authenticated, use API
        await window.api.feedback.submit(feedbackData)
      } else {
        // For prototype, store in localStorage
        const feedbacks = JSON.parse(localStorage.getItem('cupnote_feedbacks') || '[]')
        feedbacks.push(feedbackData)
        localStorage.setItem('cupnote_feedbacks', JSON.stringify(feedbacks))
      }

      showToast('피드백이 전송되었습니다. 감사합니다!', 'success')
      this.close()
    } catch (error) {
      console.error('Feedback submission failed:', error)
      showToast('피드백 전송에 실패했습니다', 'error')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = '보내기'
    }
  }
}

// Initialize feedback widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FeedbackWidget()
  })
} else {
  new FeedbackWidget()
}
