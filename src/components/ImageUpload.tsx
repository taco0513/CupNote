'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react'
import {
  ImageUploadService,
  createImagePreview,
  revokeImagePreview,
} from '../lib/supabase-image-service'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './common/LoadingSpinner'

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string, thumbnailUrl?: string) => void
  onImageRemoved?: () => void
  existingImageUrl?: string
  maxFileSize?: number
  acceptedTypes?: string[]
  className?: string
  showThumbnail?: boolean
}

export default function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  existingImageUrl,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  showThumbnail = true,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImageUrl || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { success, error, warning } = useNotification()

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      try {
        setIsUploading(true)
        setUploadProgress(20)

        // 파일 미리보기 생성
        const preview = createImagePreview(file)
        setPreviewUrl(preview)
        setUploadProgress(40)

        // 이미지 압축 (1920x1920 최대 크기)
        const compressedFile = await ImageUploadService.compressImage(file)
        setUploadProgress(60)

        // 이미지 업로드
        const { url, thumbnailUrl } = await ImageUploadService.uploadImage(
          compressedFile,
          user.id,
          {
            maxFileSize: maxFileSize,
            allowedTypes: acceptedTypes,
          }
        )
        setUploadProgress(100)

        // 상태 업데이트
        setImageUrl(url)
        revokeImagePreview(preview)
        setPreviewUrl(null)

        // 콜백 호출
        onImageUploaded?.(url, thumbnailUrl)

        success('이미지 업로드 완료', '이미지가 성공적으로 업로드되었습니다.')
      } catch (err: any) {
        error('업로드 실패', err.userMessage || '이미지 업로드 중 오류가 발생했습니다.')

        // 미리보기 정리
        if (previewUrl) {
          revokeImagePreview(previewUrl)
          setPreviewUrl(null)
        }
      } finally {
        setIsUploading(false)
        setUploadProgress(0)

        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [user, maxFileSize, acceptedTypes, onImageUploaded, success, error]
  )

  const handleRemoveImage = useCallback(() => {
    if (imageUrl && imageUrl.includes('supabase')) {
      warning('이미지 삭제', '이미지가 삭제되었습니다. 저장 시 반영됩니다.')
    }

    setImageUrl(null)
    setPreviewUrl(null)
    onImageRemoved?.()
  }, [imageUrl, onImageRemoved, warning])

  const handleCameraCapture = useCallback(() => {
    // 모바일 카메라 직접 열기
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }, [])

  const handleGallerySelect = useCallback(() => {
    // 갤러리에서 선택
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이미지 표시 영역 */}
      {imageUrl || previewUrl || isUploading ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <LoadingSpinner size="lg" text="이미지 업로드 중..." />
                <div className="w-full max-w-xs">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={previewUrl || imageUrl || ''}
                alt="Uploaded coffee"
                className="w-full h-64 object-cover"
              />
            )}
          </div>

          {/* 삭제 버튼 */}
          {!isUploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all"
              aria-label="이미지 삭제"
            >
              <X size={20} className="text-gray-700" />
            </button>
          )}
        </div>
      ) : (
        /* 업로드 버튼 영역 */
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCameraCapture}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all"
          >
            <Camera size={32} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">카메라</span>
          </button>

          <button
            type="button"
            onClick={handleGallerySelect}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all"
          >
            <ImageIcon size={32} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">갤러리</span>
          </button>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="이미지 파일 선택"
      />

      {/* 도움말 텍스트 */}
      {!imageUrl && !previewUrl && !isUploading && (
        <p className="text-xs text-gray-500 text-center">최대 {maxFileSize}MB, JPG/PNG/WebP 형식</p>
      )}
    </div>
  )
}

// 다중 이미지 업로드 컴포넌트
export function MultiImageUpload({
  onImagesChanged,
  existingImages = [],
  maxImages = 5,
  maxFileSize = 5,
  className = '',
}: {
  onImagesChanged?: (images: string[]) => void
  existingImages?: string[]
  maxImages?: number
  maxFileSize?: number
  className?: string
}) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { success, error, info } = useNotification()

  const handleFilesSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0 || !user) return

      // 이미지 개수 체크
      if (images.length + files.length > maxImages) {
        error('업로드 제한', `최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
        return
      }

      try {
        setIsUploading(true)

        // 이미지 압축
        const compressedFiles = await Promise.all(
          files.map(file => ImageUploadService.compressImage(file))
        )

        // 다중 업로드
        const uploadedImages = await ImageUploadService.uploadMultipleImages(
          compressedFiles,
          user.id,
          { maxFileSize }
        )

        const newImageUrls = uploadedImages.map(img => img.url)
        const updatedImages = [...images, ...newImageUrls]

        setImages(updatedImages)
        onImagesChanged?.(updatedImages)

        success('업로드 완료', `${uploadedImages.length}개의 이미지가 업로드되었습니다.`)
      } catch (err: any) {
        error('업로드 실패', err.userMessage || '이미지 업로드 중 오류가 발생했습니다.')
      } finally {
        setIsUploading(false)

        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [user, images, maxImages, maxFileSize, onImagesChanged, success, error]
  )

  const handleRemoveImage = useCallback(
    (index: number) => {
      const updatedImages = images.filter((_, i) => i !== index)
      setImages(updatedImages)
      onImagesChanged?.(updatedImages)
      info('이미지 삭제', '이미지가 삭제되었습니다.')
    },
    [images, onImagesChanged, info]
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이미지 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={image}
              alt={`Coffee image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 p-1 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <X size={16} className="text-gray-700" />
            </button>
          </div>
        ))}

        {/* 추가 버튼 */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all flex flex-col items-center justify-center disabled:opacity-50"
          >
            {isUploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-600">추가</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFilesSelect}
        className="hidden"
        aria-label="이미지 파일들 선택"
      />

      {/* 도움말 텍스트 */}
      <p className="text-xs text-gray-500 text-center">
        {images.length} / {maxImages}개 업로드 • 최대 {maxFileSize}MB
      </p>
    </div>
  )
}
