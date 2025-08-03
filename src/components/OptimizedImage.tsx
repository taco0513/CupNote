/**
 * Optimized Image Component with Next.js Image
 */
'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Coffee } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${className}`}>
        <Coffee className="h-8 w-8 text-neutral-400" />
      </div>
    )
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          priority={priority}
          quality={85}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          className={`
            duration-700 ease-in-out
            ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
          `}
          style={{ objectFit }}
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      priority={priority}
      quality={85}
      sizes={sizes}
      onLoad={() => setIsLoading(false)}
      onError={() => setHasError(true)}
      className={`
        duration-700 ease-in-out ${className}
        ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
      `}
    />
  )
}