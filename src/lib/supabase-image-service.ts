import { mapSupabaseError, logError, createError, ERROR_CODES } from './error-handler'
import { supabase } from './supabase'

export interface ImageUploadOptions {
  bucket?: string
  folder?: string
  maxFileSize?: number // in MB
  allowedTypes?: string[]
  generateThumbnail?: boolean
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
  bucket: 'coffee-images',
  folder: 'uploads',
  maxFileSize: 5, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  generateThumbnail: true,
}

export class ImageUploadService {
  // 이미지 업로드
  static async uploadImage(
    file: File,
    userId: string,
    options: ImageUploadOptions = {}
  ): Promise<{ url: string; path: string; thumbnailUrl?: string }> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    try {
      // 파일 유효성 검사
      this.validateFile(file, opts)

      // 파일명 생성 (timestamp + random string)
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${timestamp}-${randomString}.${fileExt}`
      const filePath = `${opts.folder}/${userId}/${fileName}`

      // 이미지 업로드
      const { data, error } = await supabase.storage.from(opts.bucket!).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) throw error

      // Public URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from(opts.bucket!).getPublicUrl(data.path)

      // 썸네일 URL 생성 (Supabase Transform 사용)
      let thumbnailUrl
      if (opts.generateThumbnail) {
        thumbnailUrl = `${publicUrl}?width=300&height=300&resize=cover`
      }

      return {
        url: publicUrl,
        path: data.path,
        thumbnailUrl,
      }
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'ImageUploadService.uploadImage')
      throw mappedError
    }
  }

  // 이미지 삭제
  static async deleteImage(path: string, bucket: string = 'coffee-images'): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) throw error
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'ImageUploadService.deleteImage')
      throw mappedError
    }
  }

  // 여러 이미지 업로드
  static async uploadMultipleImages(
    files: File[],
    userId: string,
    options: ImageUploadOptions = {}
  ): Promise<Array<{ url: string; path: string; thumbnailUrl?: string }>> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, userId, options))

      const results = await Promise.allSettled(uploadPromises)

      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)

      const failedUploads = results.filter(result => result.status === 'rejected')

      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} images failed to upload`)
      }

      return successfulUploads
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'ImageUploadService.uploadMultipleImages')
      throw mappedError
    }
  }

  // 이미지 URL 리스트 가져오기
  static async listImages(
    userId: string,
    folder: string = 'uploads',
    bucket: string = 'coffee-images'
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(`${folder}/${userId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (error) throw error

      // Public URL 생성
      const urls = data.map(file => {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(`${folder}/${userId}/${file.name}`)
        return publicUrl
      })

      return urls
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'ImageUploadService.listImages')
      throw mappedError
    }
  }

  // 파일 유효성 검사
  private static validateFile(file: File, options: ImageUploadOptions): void {
    // 파일 크기 검사
    const maxSizeInBytes = (options.maxFileSize || 5) * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        { 
          fileSize: file.size, 
          maxSize: maxSizeInBytes,
          message: `파일 크기는 ${options.maxFileSize}MB를 초과할 수 없습니다.`
        }
      )
    }

    // 파일 타입 검사
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        { 
          fileType: file.type, 
          allowedTypes: options.allowedTypes,
          message: '지원하지 않는 이미지 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.'
        }
      )
    }

    // 파일명 검사
    if (!file.name || file.name.length === 0) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, {
        fileName: file.name,
        message: '올바른 파일명이 필요합니다.'
      })
    }
  }

  // 이미지 압축 (클라이언트 사이드)
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = e => {
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Canvas context를 생성할 수 없습니다.'))
            return
          }

          // 비율 유지하면서 크기 조정
          let { width, height } = img

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          canvas.width = width
          canvas.height = height

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height)

          // Blob으로 변환
          canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('이미지 압축에 실패했습니다.'))
                return
              }

              const compressedFile = new File([blob], file.name, { type: file.type })

              resolve(compressedFile)
            },
            file.type,
            quality
          )
        }

        img.onerror = () => reject(new Error('이미지 로딩에 실패했습니다.'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'))
      reader.readAsDataURL(file)
    })
  }
}

// Helper function to create image preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// Helper function to revoke image preview URL
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}
