import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  ImageUploadService,
  createImagePreview,
  revokeImagePreview,
  type ImageUploadOptions,
} from '../supabase-image-service'
import * as errorHandler from '../error-handler'

// Mock the supabase client
const mockSupabase = {
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
}

// Mock error handler
vi.mock('../error-handler', () => ({
  mapSupabaseError: vi.fn(),
  logError: vi.fn(),
  createError: vi.fn(),
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
}))

// Mock supabase client import
vi.mock('../supabase', () => ({
  supabase: mockSupabase,
}))

// Mock console
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock URL object
const mockURL = {
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
}

// Mock Date for consistent timestamps
const mockDate = vi.fn()
const mockMath = {
  random: vi.fn(),
}

beforeEach(() => {
  vi.stubGlobal('console', mockConsole)
  vi.stubGlobal('URL', mockURL)
  vi.stubGlobal('Math', mockMath)
  
  // Mock Date.now for consistent timestamps
  mockDate.mockReturnValue(1643723400000) // 2022-02-01T10:30:00.000Z
  vi.spyOn(Date, 'now').mockImplementation(mockDate)

  // Mock Math.random for consistent random strings
  mockMath.random.mockReturnValue(0.12345)
})

describe('ImageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default successful storage mock
    const mockStorageQuery = mockSupabase.storage.from()
    mockStorageQuery.upload.mockResolvedValue({
      data: { 
        path: 'uploads/user123/1643723400000-4fzyo0r.jpg',
        id: 'upload-id',
        fullPath: 'coffee-images/uploads/user123/1643723400000-4fzyo0r.jpg'
      },
      error: null,
    })

    mockStorageQuery.getPublicUrl.mockReturnValue({
      data: { 
        publicUrl: 'https://example.supabase.co/storage/v1/object/public/coffee-images/uploads/user123/1643723400000-4fzyo0r.jpg'
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('uploadImage', () => {
    it('should upload image successfully with default options', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' })
      const userId = 'user123'

      const result = await ImageUploadService.uploadImage(mockFile, userId)

      const mockStorageQuery = mockSupabase.storage.from()
      
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('coffee-images')
      expect(mockStorageQuery.upload).toHaveBeenCalledWith(
        'uploads/user123/1643723400000-4fzyo0r.jpg',
        mockFile,
        {
          cacheControl: '3600',
          upsert: false,
        }
      )
      
      expect(mockStorageQuery.getPublicUrl).toHaveBeenCalledWith(
        'uploads/user123/1643723400000-4fzyo0r.jpg'
      )

      expect(result).toEqual({
        url: 'https://example.supabase.co/storage/v1/object/public/coffee-images/uploads/user123/1643723400000-4fzyo0r.jpg',
        path: 'uploads/user123/1643723400000-4fzyo0r.jpg',
        thumbnailUrl: 'https://example.supabase.co/storage/v1/object/public/coffee-images/uploads/user123/1643723400000-4fzyo0r.jpg?width=300&height=300&resize=cover',
      })
    })

    it('should upload image with custom options', async () => {
      const mockFile = new File(['test content'], 'custom-image.png', { type: 'image/png' })
      const userId = 'user456'
      const options: ImageUploadOptions = {
        bucket: 'custom-bucket',
        folder: 'custom-folder',
        maxFileSize: 10, // 10MB
        allowedTypes: ['image/png', 'image/webp'],
        generateThumbnail: false,
      }

      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.upload.mockResolvedValue({
        data: { path: 'custom-folder/user456/1643723400000-4fzyo0r.png' },
        error: null,
      })

      mockStorageQuery.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/custom-bucket/custom-folder/user456/1643723400000-4fzyo0r.png' },
      })

      const result = await ImageUploadService.uploadImage(mockFile, userId, options)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('custom-bucket')
      expect(mockStorageQuery.upload).toHaveBeenCalledWith(
        'custom-folder/user456/1643723400000-4fzyo0r.png',
        mockFile,
        {
          cacheControl: '3600',
          upsert: false,
        }
      )

      expect(result).toEqual({
        url: 'https://example.supabase.co/storage/v1/object/public/custom-bucket/custom-folder/user456/1643723400000-4fzyo0r.png',
        path: 'custom-folder/user456/1643723400000-4fzyo0r.png',
        thumbnailUrl: undefined, // generateThumbnail: false
      })
    })

    it('should generate correct filename with extension detection', async () => {
      const mockFile = new File(['test content'], 'image-without-extension', { type: 'image/webp' })
      const userId = 'user123'

      const mockStorageQuery = mockSupabase.storage.from()
      
      await ImageUploadService.uploadImage(mockFile, userId)

      expect(mockStorageQuery.upload).toHaveBeenCalledWith(
        'uploads/user123/1643723400000-4fzyo0r.jpg', // Default to jpg when no extension
        mockFile,
        expect.any(Object)
      )
    })

    it('should extract correct file extension', async () => {
      const mockFile = new File(['test content'], 'my-awesome-photo.JPEG', { type: 'image/jpeg' })
      const userId = 'user123'

      const mockStorageQuery = mockSupabase.storage.from()
      
      await ImageUploadService.uploadImage(mockFile, userId)

      expect(mockStorageQuery.upload).toHaveBeenCalledWith(
        'uploads/user123/1643723400000-4fzyo0r.jpeg', // Should preserve and lowercase extension
        mockFile,
        expect.any(Object)
      )
    })

    it('should validate file size and reject large files', async () => {
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-image.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB file
      const userId = 'user123'

      const validationError = new Error('File size too large')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId)).rejects.toThrow(validationError)

      expect(errorHandler.createError).toHaveBeenCalledWith(
        'VALIDATION_ERROR',
        {
          fileSize: 6 * 1024 * 1024,
          maxSize: 5 * 1024 * 1024,
          message: '파일 크기는 5MB를 초과할 수 없습니다.',
        }
      )
    })

    it('should validate file type and reject unsupported formats', async () => {
      const mockFile = new File(['test content'], 'document.pdf', { type: 'application/pdf' })
      const userId = 'user123'

      const validationError = new Error('Unsupported file type')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId)).rejects.toThrow(validationError)

      expect(errorHandler.createError).toHaveBeenCalledWith(
        'VALIDATION_ERROR',
        {
          fileType: 'application/pdf',
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          message: '지원하지 않는 이미지 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.',
        }
      )
    })

    it('should validate filename and reject empty names', async () => {
      const mockFile = new File(['test content'], '', { type: 'image/jpeg' })
      const userId = 'user123'

      const validationError = new Error('Invalid filename')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId)).rejects.toThrow(validationError)

      expect(errorHandler.createError).toHaveBeenCalledWith(
        'VALIDATION_ERROR',
        {
          fileName: '',
          message: '올바른 파일명이 필요합니다.',
        }
      )
    })

    it('should handle storage upload errors', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' })
      const userId = 'user123'

      const mockStorageQuery = mockSupabase.storage.from()
      const uploadError = new Error('Storage upload failed')
      mockStorageQuery.upload.mockResolvedValue({
        data: null,
        error: uploadError,
      })

      const mappedError = new Error('Mapped upload error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId)).rejects.toThrow(mappedError)

      expect(errorHandler.mapSupabaseError).toHaveBeenCalledWith(uploadError)
      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'ImageUploadService.uploadImage')
    })

    it('should handle custom file size limits', async () => {
      const mockFile = new File(['content'], 'small-image.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB file
      const userId = 'user123'
      const options: ImageUploadOptions = {
        maxFileSize: 1, // 1MB limit
      }

      const validationError = new Error('File too large')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId, options)).rejects.toThrow(validationError)

      expect(errorHandler.createError).toHaveBeenCalledWith(
        'VALIDATION_ERROR',
        {
          fileSize: 2 * 1024 * 1024,
          maxSize: 1 * 1024 * 1024,
          message: '파일 크기는 1MB를 초과할 수 없습니다.',
        }
      )
    })

    it('should handle custom allowed types', async () => {
      const mockFile = new File(['content'], 'image.gif', { type: 'image/gif' })
      const userId = 'user123'
      const options: ImageUploadOptions = {
        allowedTypes: ['image/png'], // Only PNG allowed
      }

      const validationError = new Error('Type not allowed')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      await expect(ImageUploadService.uploadImage(mockFile, userId, options)).rejects.toThrow(validationError)

      expect(errorHandler.createError).toHaveBeenCalledWith(
        'VALIDATION_ERROR',
        {
          fileType: 'image/gif',
          allowedTypes: ['image/png'],
          message: '지원하지 않는 이미지 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.',
        }
      )
    })

    it('should use custom bucket and folder', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const userId = 'user456'
      const options: ImageUploadOptions = {
        bucket: 'custom-bucket',
        folder: 'custom-folder',
      }

      const mockStorageQuery = mockSupabase.storage.from()

      await ImageUploadService.uploadImage(mockFile, userId, options)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('custom-bucket')
      expect(mockStorageQuery.upload).toHaveBeenCalledWith(
        'custom-folder/user456/1643723400000-4fzyo0r.jpg',
        mockFile,
        expect.any(Object)
      )
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.remove.mockResolvedValue({
        data: [{ name: 'test-image.jpg' }],
        error: null,
      })

      await ImageUploadService.deleteImage('uploads/user123/test-image.jpg')

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('coffee-images')
      expect(mockStorageQuery.remove).toHaveBeenCalledWith(['uploads/user123/test-image.jpg'])
    })

    it('should delete image from custom bucket', async () => {
      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.remove.mockResolvedValue({
        data: [{ name: 'test-image.jpg' }],
        error: null,
      })

      await ImageUploadService.deleteImage('custom/path/image.jpg', 'custom-bucket')

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('custom-bucket')
      expect(mockStorageQuery.remove).toHaveBeenCalledWith(['custom/path/image.jpg'])
    })

    it('should handle delete errors', async () => {
      const mockStorageQuery = mockSupabase.storage.from()
      const deleteError = new Error('Delete failed')
      mockStorageQuery.remove.mockResolvedValue({
        data: null,
        error: deleteError,
      })

      const mappedError = new Error('Mapped delete error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(ImageUploadService.deleteImage('path/to/image.jpg')).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'ImageUploadService.deleteImage')
    })
  })

  describe('uploadMultipleImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockFiles = [
        new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'image2.png', { type: 'image/png' }),
      ]
      const userId = 'user123'

      const mockStorageQuery = mockSupabase.storage.from()
      
      // Mock successful uploads for both files
      mockStorageQuery.upload
        .mockResolvedValueOnce({
          data: { path: 'uploads/user123/1643723400000-4fzyo0r.jpg' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { path: 'uploads/user123/1643723400000-4fzyo0r.png' },
          error: null,
        })

      mockStorageQuery.getPublicUrl
        .mockReturnValueOnce({
          data: { publicUrl: 'https://example.com/image1.jpg' },
        })
        .mockReturnValueOnce({
          data: { publicUrl: 'https://example.com/image2.png' },
        })

      const results = await ImageUploadService.uploadMultipleImages(mockFiles, userId)

      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({
        url: 'https://example.com/image1.jpg',
        path: 'uploads/user123/1643723400000-4fzyo0r.jpg',
        thumbnailUrl: 'https://example.com/image1.jpg?width=300&height=300&resize=cover',
      })
      expect(results[1]).toMatchObject({
        url: 'https://example.com/image2.png',
        path: 'uploads/user123/1643723400000-4fzyo0r.png',
        thumbnailUrl: 'https://example.com/image2.png?width=300&height=300&resize=cover',
      })
    })

    it('should handle partial failures in multiple uploads', async () => {
      const mockFiles = [
        new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['x'.repeat(10 * 1024 * 1024)], 'large-image.jpg', { type: 'image/jpeg' }), // Too large
      ]
      Object.defineProperty(mockFiles[1], 'size', { value: 10 * 1024 * 1024 })
      
      const userId = 'user123'

      const mockStorageQuery = mockSupabase.storage.from()
      
      // First upload succeeds
      mockStorageQuery.upload.mockResolvedValueOnce({
        data: { path: 'uploads/user123/1643723400000-4fzyo0r.jpg' },
        error: null,
      })

      mockStorageQuery.getPublicUrl.mockReturnValueOnce({
        data: { publicUrl: 'https://example.com/image1.jpg' },
      })

      // Second upload will fail due to validation
      const validationError = new Error('File too large')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      const results = await ImageUploadService.uploadMultipleImages(mockFiles, userId)

      expect(results).toHaveLength(1) // Only successful upload
      expect(results[0]).toMatchObject({
        url: 'https://example.com/image1.jpg',
        path: 'uploads/user123/1643723400000-4fzyo0r.jpg',
      })

      expect(mockConsole.warn).toHaveBeenCalledWith('1 images failed to upload')
    })

    it('should handle complete failure in multiple uploads', async () => {
      const mockFiles = [
        new File(['x'.repeat(10 * 1024 * 1024)], 'large1.jpg', { type: 'image/jpeg' }),
        new File(['x'.repeat(10 * 1024 * 1024)], 'large2.jpg', { type: 'image/jpeg' }),
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 })
      })
      
      const userId = 'user123'

      const validationError = new Error('File too large')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      const results = await ImageUploadService.uploadMultipleImages(mockFiles, userId)

      expect(results).toHaveLength(0)
      expect(mockConsole.warn).toHaveBeenCalledWith('2 images failed to upload')
    })

    it('should handle errors in multiple upload orchestration', async () => {
      const mockFiles = [
        new File(['content'], 'image.jpg', { type: 'image/jpeg' }),
      ]
      const userId = 'user123'

      // Mock a service-level error
      const orchestrationError = new Error('Service unavailable')
      vi.spyOn(ImageUploadService, 'uploadImage').mockRejectedValue(orchestrationError)

      const mappedError = new Error('Mapped orchestration error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(ImageUploadService.uploadMultipleImages(mockFiles, userId)).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(
        mappedError,
        'ImageUploadService.uploadMultipleImages'
      )
    })
  })

  describe('listImages', () => {
    it('should list images for user', async () => {
      const userId = 'user123'
      const mockFiles = [
        { name: 'image1.jpg', created_at: '2025-01-31T10:00:00Z' },
        { name: 'image2.png', created_at: '2025-01-31T09:00:00Z' },
      ]

      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.list.mockResolvedValue({
        data: mockFiles,
        error: null,
      })

      mockStorageQuery.getPublicUrl
        .mockReturnValueOnce({ data: { publicUrl: 'https://example.com/image1.jpg' } })
        .mockReturnValueOnce({ data: { publicUrl: 'https://example.com/image2.png' } })

      const result = await ImageUploadService.listImages(userId)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('coffee-images')
      expect(mockStorageQuery.list).toHaveBeenCalledWith('uploads/user123', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      expect(result).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
      ])
    })

    it('should list images from custom folder and bucket', async () => {
      const userId = 'user456'
      const folder = 'custom-folder'
      const bucket = 'custom-bucket'

      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.list.mockResolvedValue({
        data: [{ name: 'custom-image.jpg' }],
        error: null,
      })

      mockStorageQuery.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/custom-image.jpg' },
      })

      const result = await ImageUploadService.listImages(userId, folder, bucket)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('custom-bucket')
      expect(mockStorageQuery.list).toHaveBeenCalledWith('custom-folder/user456', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      expect(result).toEqual(['https://example.com/custom-image.jpg'])
    })

    it('should handle list errors', async () => {
      const userId = 'user123'
      
      const mockStorageQuery = mockSupabase.storage.from()
      const listError = new Error('List failed')
      mockStorageQuery.list.mockResolvedValue({
        data: null,
        error: listError,
      })

      const mappedError = new Error('Mapped list error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(ImageUploadService.listImages(userId)).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'ImageUploadService.listImages')
    })

    it('should handle empty file list', async () => {
      const userId = 'user123'
      
      const mockStorageQuery = mockSupabase.storage.from()
      mockStorageQuery.list.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await ImageUploadService.listImages(userId)

      expect(result).toEqual([])
    })
  })

  describe('compressImage', () => {
    it('should compress image with default settings', async () => {
      // Mock File, Image, and Canvas APIs
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn(),
      }

      const mockImage = {
        width: 1920,
        height: 1080,
        onload: null as any,
        onerror: null as any,
        src: '',
      }

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,mock-data',
      }

      // Mock global constructors
      vi.stubGlobal('Image', vi.fn(() => mockImage))
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      })

      const mockFile = new File(['content'], 'large-image.jpg', { type: 'image/jpeg' })
      const mockCompressedBlob = new Blob(['compressed'], { type: 'image/jpeg' })
      
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(mockCompressedBlob)
      })

      const compressionPromise = ImageUploadService.compressImage(mockFile)

      // Simulate FileReader success
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mock-data' } })

      // Simulate Image load success
      mockImage.onload()

      // Simulate canvas.toBlob success
      const result = await compressionPromise

      expect(result).toBeInstanceOf(File)
      expect(result.name).toBe('large-image.jpg')
      expect(result.type).toBe('image/jpeg')
      expect(mockCanvas.width).toBe(1920) // Should keep original size if within limits
      expect(mockCanvas.height).toBe(1080)
    })

    it('should resize large images', async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn(),
      }

      const mockImage = {
        width: 3840, // 4K width
        height: 2160, // 4K height
        onload: null as any,
        onerror: null as any,
        src: '',
      }

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,mock-data',
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      })

      const mockFile = new File(['content'], 'huge-image.jpg', { type: 'image/jpeg' })
      const mockCompressedBlob = new Blob(['compressed'], { type: 'image/jpeg' })
      
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(mockCompressedBlob)
      })

      const compressionPromise = ImageUploadService.compressImage(
        mockFile, 
        1920, // maxWidth
        1920, // maxHeight
        0.8   // quality
      )

      // Simulate FileReader and Image success
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mock-data' } })
      mockImage.onload()

      await compressionPromise

      // Should be resized to fit within 1920x1920 maintaining aspect ratio
      expect(mockCanvas.width).toBe(1920) // Limited by maxWidth
      expect(mockCanvas.height).toBe(1080) // Scaled proportionally
    })

    it('should handle compression errors', async () => {
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
      }

      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      const compressionPromise = ImageUploadService.compressImage(mockFile)

      // Simulate FileReader error
      mockFileReader.onerror()

      await expect(compressionPromise).rejects.toThrow('파일 읽기에 실패했습니다.')
    })

    it('should handle image load errors', async () => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

      const mockFile = new File(['content'], 'corrupt.jpg', { type: 'image/jpeg' })

      const compressionPromise = ImageUploadService.compressImage(mockFile)

      // Simulate FileReader success but Image error
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,corrupt-data' } })
      mockImage.onerror()

      await expect(compressionPromise).rejects.toThrow('이미지 로딩에 실패했습니다.')
    })

    it('should handle canvas context errors', async () => {
      const mockCanvas = {
        getContext: vi.fn(() => null), // No context available
      }

      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      })

      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      const compressionPromise = ImageUploadService.compressImage(mockFile)

      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mock-data' } })
      mockImage.onload()

      await expect(compressionPromise).rejects.toThrow('Canvas context를 생성할 수 없습니다.')
    })

    it('should handle canvas.toBlob errors', async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn(),
      }

      const mockImage = {
        width: 800,
        height: 600,
        onload: null as any,
        onerror: null as any,
        src: '',
      }

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      })

      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(null) // Blob creation failed
      })

      const compressionPromise = ImageUploadService.compressImage(mockFile)

      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mock-data' } })
      mockImage.onload()

      await expect(compressionPromise).rejects.toThrow('이미지 압축에 실패했습니다.')
    })
  })

  describe('validateFile', () => {
    it('should accept valid files', () => {
      const mockFile = new File(['content'], 'valid-image.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }) // 1MB

      const options: ImageUploadOptions = {
        maxFileSize: 5,
        allowedTypes: ['image/jpeg', 'image/png'],
      }

      // Should not throw
      expect(() => {
        (ImageUploadService as any).validateFile(mockFile, options)
      }).not.toThrow()
    })

    it('should reject oversized files', () => {
      const mockFile = new File(['content'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }) // 10MB

      const options: ImageUploadOptions = {
        maxFileSize: 5, // 5MB limit
      }

      const validationError = new Error('File too large')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      expect(() => {
        (ImageUploadService as any).validateFile(mockFile, options)
      }).toThrow(validationError)
    })

    it('should reject unsupported file types', () => {
      const mockFile = new File(['content'], 'document.txt', { type: 'text/plain' })

      const options: ImageUploadOptions = {
        allowedTypes: ['image/jpeg', 'image/png'],
      }

      const validationError = new Error('Unsupported type')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      expect(() => {
        (ImageUploadService as any).validateFile(mockFile, options)
      }).toThrow(validationError)
    })

    it('should reject files with empty names', () => {
      const mockFile = new File(['content'], '', { type: 'image/jpeg' })

      const validationError = new Error('Empty filename')
      vi.mocked(errorHandler.createError).mockReturnValue(validationError as any)

      expect(() => {
        (ImageUploadService as any).validateFile(mockFile, {})
      }).toThrow(validationError)
    })
  })
})

describe('Helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createImagePreview', () => {
    it('should create object URL for file', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const mockObjectURL = 'blob:http://localhost/mock-object-url'
      
      mockURL.createObjectURL.mockReturnValue(mockObjectURL)

      const result = createImagePreview(mockFile)

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile)
      expect(result).toBe(mockObjectURL)
    })
  })

  describe('revokeImagePreview', () => {
    it('should revoke object URL', () => {
      const mockObjectURL = 'blob:http://localhost/mock-object-url'

      revokeImagePreview(mockObjectURL)

      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL)
    })
  })
})