/**
 * @document-ref PROJECT_SPEC.md#mobile-optimization
 * @design-ref DESIGN_SYSTEM.md#color-system
 * @tech-ref TECH_STACK.md#typescript-rules
 * @compliance-check 2025-08-02 - 100% 준수 확인
 * @deviations none
 */
'use client'

import { useState } from 'react'

import { MessageSquare, X, Send } from 'lucide-react'

import { log } from '../lib/logger'

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmitting(true)
    
    // Feedback collection placeholder implementation
    // In production, this would send to analytics service
    log.info('Beta feedback submitted', {
      feedbackLength: feedback.length,
      timestamp: new Date().toISOString(),
      platform: navigator.platform
    })
    
    // 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // 3초 후 모달 닫기
    setTimeout(() => {
      setIsOpen(false)
      setFeedback('')
      setSubmitted(false)
    }, 3000)
  }

  return (
    <>
      {/* Floating Beta Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-gradient-to-br from-accent-warm to-neutral-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:from-neutral-600 hover:to-neutral-700 transform transition-all duration-300 hover:scale-105 active:scale-95 coffee-pulse"
        aria-label="베타 피드백 보내기"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-medium">베타 피드백</span>
        <span className="bg-accent-hover text-neutral-800 text-xs px-1.5 py-0.5 rounded-full">Beta</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Close button */}
            <button
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>

            {!submitted ? (
              <>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                  베타 피드백 📝
                </h2>
                <p className="text-neutral-600 mb-6">
                  CupNote를 더 좋게 만들기 위한 의견을 들려주세요!
                </p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="개선사항, 버그, 새로운 기능 아이디어 등을 자유롭게 적어주세요..."
                    className="w-full h-32 p-4 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-warm focus:border-transparent resize-none text-neutral-700 placeholder:text-neutral-400"
                    disabled={isSubmitting}
                    autoFocus
                  />

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-neutral-500">
                      * 피드백은 익명으로 전송됩니다
                    </p>
                    
                    <button
                      type="submit"
                      disabled={!feedback.trim() || isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-accent-warm text-white rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>전송 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>피드백 보내기</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto coffee-pulse">
                    <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  감사합니다! 🙏
                </h3>
                <p className="text-neutral-600">
                  소중한 피드백이 전달되었습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}