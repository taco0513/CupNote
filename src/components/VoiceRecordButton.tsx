'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceRecordButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

export default function VoiceRecordButton({ onTranscript, className = '' }: VoiceRecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // TODO: 실제 음성 인식 API 연동
        // 임시로 샘플 텍스트 반환
        setTimeout(() => {
          const sampleTexts = [
            "케냐 AA 아메리카노 마셨는데 산미가 강하고 과일향이 좋네요",
            "콜롬비아 게이샤 핸드드립, 꽃향기가 엄청 강해요",
            "에티오피아 예가체프 라떼인데 부드럽고 달콤해요"
          ]
          const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
          onTranscript(randomText)
          setIsProcessing(false)
        }, 1500)

        // 스트림 정리
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('마이크 접근 오류:', error)
      alert('마이크 권한이 필요합니다')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`
        relative p-4 rounded-full transition-all duration-300
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-coffee-600 hover:bg-coffee-700'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-label={isRecording ? '녹음 중지' : '음성으로 기록'}
    >
      {isProcessing ? (
        <Loader2 className="h-6 w-6 text-white animate-spin" />
      ) : isRecording ? (
        <>
          <MicOff className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-ping" />
        </>
      ) : (
        <Mic className="h-6 w-6 text-white" />
      )}
    </button>
  )
}