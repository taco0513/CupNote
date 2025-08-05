'use client'

import { useState, useRef, useEffect } from 'react'

import { Camera, Scan, X, FileImage, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

import OCRServiceV2, { type OCRResult, type CoffeeInfoOCR } from '../lib/ocr-service-v2'
import { useNotification } from '../contexts/NotificationContext'

interface OCRScannerProps {
  onInfoExtracted: (info: CoffeeInfoOCR) => void
  onClose: () => void
  maxImages?: number
}

export default function OCRScanner({ 
  onInfoExtracted, 
  onClose,
  maxImages = 2 
}: OCRScannerProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [result, setResult] = useState<OCRResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useNotification()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 최대 이미지 개수 제한
    const validFiles = files.slice(0, maxImages)
    setSelectedImages(validFiles)
    setResult(null)
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const processOCR = async () => {
    if (selectedImages.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setCurrentImageIndex(0)

    try {
      console.log('OCR 처리 시작, 이미지 개수:', selectedImages.length)
      
      let ocrResult: OCRResult

      if (selectedImages.length === 1) {
        // 단일 이미지 처리
        console.log('단일 이미지 OCR 시작')
        ocrResult = await OCRServiceV2.extractText(
          selectedImages[0],
          (progress) => {
            console.log('OCR 진행률:', progress * 100)
            setProgress(progress * 100)
          }
        )
      } else {
        // 다중 이미지 처리
        console.log('다중 이미지 OCR 시작')
        ocrResult = await OCRServiceV2.extractTextFromMultipleImages(
          selectedImages,
          (progress, imageIndex) => {
            console.log(`OCR 진행률 (이미지 ${imageIndex + 1}):`, progress * 100)
            setProgress(progress * 100)
            setCurrentImageIndex(imageIndex)
          }
        )
      }

      console.log('OCR 결과:', ocrResult)
      setResult(ocrResult)
      
      if (Object.keys(ocrResult.extractedInfo).length > 0) {
        success('커피 정보를 성공적으로 추출했습니다!')
      } else {
        error('커피 정보를 찾을 수 없습니다. 이미지가 선명한지 확인해주세요.')
      }
    } catch (err: any) {
      console.error('OCR 처리 오류:', err)
      const errorMessage = err?.message || '이미지 처리 중 오류가 발생했습니다.'
      error(`OCR 오류: ${errorMessage}`)
      
      // iOS에서 Web Worker 문제일 경우
      if (errorMessage.includes('Worker') || errorMessage.includes('CORS')) {
        error('iOS에서 OCR이 지원되지 않을 수 있습니다. 다른 브라우저를 사용해주세요.')
      }
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setCurrentImageIndex(0)
    }
  }

  const handleConfirm = () => {
    if (result) {
      onInfoExtracted(result.extractedInfo)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Scan className="h-5 w-5 text-coffee-600" />
            <h2 className="text-lg font-semibold text-coffee-800">
              커피 정보 스캔
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 안내 메시지 */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">스캔 팁</p>
                <ul className="text-xs space-y-1">
                  <li>• 커피 백이나 메뉴판을 선명하게 촬영하세요</li>
                  <li>• 앞뒤면이 있다면 최대 {maxImages}장까지 추가 가능합니다</li>
                  <li>• 텍스트가 잘 보이도록 조명을 확인하세요</li>
                </ul>
              </div>
            </div>
          </div>


          {/* 이미지 선택 */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            
            {selectedImages.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-coffee-400 hover:bg-coffee-50 transition-colors"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Camera className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      이미지 선택
                    </p>
                    <p className="text-xs text-gray-500">
                      카메라 촬영 또는 갤러리에서 선택
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    선택된 이미지 ({selectedImages.length}/{maxImages})
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedImages.length >= maxImages}
                    className="text-xs text-coffee-600 hover:text-coffee-800 disabled:text-gray-400"
                  >
                    추가하기
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`선택된 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index === 0 ? '앞면' : '뒷면'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OCR 처리 버튼 */}
          {selectedImages.length > 0 && !result && (
            <button
              onClick={processOCR}
              disabled={isProcessing}
              className="w-full py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    처리 중... {Math.round(progress)}%
                    {selectedImages.length > 1 && ` (${currentImageIndex + 1}/${selectedImages.length})`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Scan className="h-4 w-4" />
                  <span>커피 정보 스캔</span>
                </div>
              )}
            </button>
          )}

          {/* 처리 진행바 */}
          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  스캔 완료 (정확도: {Math.round(result.confidence)}%)
                </span>
              </div>

              {/* 추출된 정보 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">추출된 정보</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {Object.entries(result.extractedInfo).map(([key, value]) => {
                    if (!value) return null
                    
                    const labels: Record<string, string> = {
                      coffeeName: '커피명',
                      roasterName: '로스터리',
                      origin: '원산지',
                      variety: '품종',
                      processing: '가공법',
                      roastLevel: '로스팅',
                      altitude: '고도',
                      notes: '로스터 노트'
                    }

                    return key === 'notes' ? (
                      <div key={key} className="pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-600">{labels[key]}</span>
                        <p className="text-sm font-medium text-gray-800 mt-1">{value}</p>
                      </div>
                    ) : (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{labels[key]}</span>
                        <span className="text-sm font-medium text-gray-800">{value}</span>
                      </div>
                    )
                  })}
                  
                  {Object.keys(result.extractedInfo).filter(k => result.extractedInfo[k as keyof CoffeeInfoOCR]).length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      추출된 정보가 없습니다
                    </p>
                  )}
                </div>
              </div>

              {/* 확인 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setResult(null)
                    setSelectedImages([])
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  다시 스캔
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 px-4 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-medium"
                >
                  정보 적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}