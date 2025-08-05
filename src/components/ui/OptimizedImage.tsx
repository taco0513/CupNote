/**
 * 성능 최적화된 이미지 컴포넌트
 * - Lazy loading
 * - WebP 지원
 * - 반응형 이미지
 * - 로딩 상태 표시
 * - 에러 처리
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ImageIcon } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  fallback?: string
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallback = '/images/placeholder.jpg'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [currentSrc, setCurrentSrc] = useState<string>(priority ? src : '')
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // WebP 지원 감지
  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }, [])

  // 최적화된 이미지 URL 생성
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!originalSrc) return fallback
    
    // Supabase Storage URL인 경우 변환 옵션 추가
    if (originalSrc.includes('supabase') && originalSrc.includes('/storage/')) {
      const webpSupport = supportsWebP()
      const baseUrl = originalSrc.split('?')[0]
      const params = new URLSearchParams()
      
      if (width) params.set('width', width.toString())
      if (height) params.set('height', height.toString())
      params.set('quality', '85')
      if (webpSupport) params.set('format', 'webp')
      
      return `${baseUrl}?${params.toString()}`
    }
    
    return originalSrc
  }, [width, height, fallback, supportsWebP])

  // Intersection Observer 설정
  useEffect(() => {
    if (priority || !imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true)
            setCurrentSrc(getOptimizedSrc(src))
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority, isInView, src, getOptimizedSrc])

  // 이미지 로드 처리
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  // 이미지 에러 처리
  const handleError = useCallback(() => {
    setIsError(true)
    setCurrentSrc(fallback)
    onError?.()
  }, [fallback, onError])

  // 스타일 클래스 생성
  const getImageClasses = () => {
    const baseClasses = 'transition-opacity duration-300 ease-in-out'
    const loadingClasses = isLoaded ? 'opacity-100' : 'opacity-0'
    const userClasses = className || ''
    
    return `${baseClasses} ${loadingClasses} ${userClasses}`.trim()
  }

  // 플레이스홀더 렌더링
  const renderPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <div 
          className={`absolute inset-0 bg-cover bg-center filter blur-sm ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )
    }
    
    return (
      <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* 플레이스홀더 */}
      {!isLoaded && !isError && renderPlaceholder()}
      
      {/* 실제 이미지 */}
      <img
        ref={imgRef}
        src={currentSrc || (priority ? getOptimizedSrc(src) : '')}
        alt={alt}
        className={getImageClasses()}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
      
      {/* 에러 상태 */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 반응형 이미지 컴포넌트
export function ResponsiveImage({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: OptimizedImageProps & { aspectRatio?: string }) {
  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        sizes={sizes}
        priority={priority}
        {...props}
      />
    </div>
  )
}

// 프로필 이미지 컴포넌트
export function ProfileImage({
  src,
  alt,
  size = 'md',
  className = '',
  fallback,
  ...props
}: OptimizedImageProps & { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-100`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        fallback={fallback || '/images/default-avatar.jpg'}
        {...props}
      />
    </div>
  )
}