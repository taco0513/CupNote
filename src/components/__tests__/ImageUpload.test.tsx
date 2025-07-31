import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ImageUpload, { MultiImageUpload } from '../ImageUpload'

// Mock contexts
const mockUseAuth = vi.fn()
const mockUseNotification = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../contexts/NotificationContext', () => ({
  useNotification: () => mockUseNotification(),
}))

// Mock image service
const mockImageUploadService = {
  compressImage: vi.fn(),
  uploadImage: vi.fn(),
  uploadMultipleImages: vi.fn(),
}

vi.mock('../lib/supabase-image-service', () => ({
  ImageUploadService: mockImageUploadService,
  createImagePreview: vi.fn((file) => `preview-${file.name}`),
  revokeImagePreview: vi.fn(),
}))

describe('ImageUpload', () => {
  const mockOnImageUploaded = vi.fn()
  const mockOnImageRemoved = vi.fn()
  const mockNotifications = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' } })
    mockUseNotification.mockReturnValue(mockNotifications)
    mockImageUploadService.compressImage.mockResolvedValue(new File(['compressed'], 'compressed.jpg'))
    mockImageUploadService.uploadImage.mockResolvedValue({
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    })
  })

  describe('Basic rendering', () => {
    it('should render camera and gallery buttons when no image', () => {
      render(<ImageUpload />)
      
      expect(screen.getByText('카메라')).toBeInTheDocument()
      expect(screen.getByText('갤러리')).toBeInTheDocument()
    })

    it('should render existing image when provided', () => {
      render(<ImageUpload existingImageUrl="https://example.com/existing.jpg" />)
      
      const image = screen.getByAltText('Uploaded coffee')
      expect(image).toHaveAttribute('src', 'https://example.com/existing.jpg')
    })

    it('should show help text when no image', () => {
      render(<ImageUpload maxFileSize={3} />)
      
      expect(screen.getByText('최대 3MB, JPG/PNG/WebP 형식')).toBeInTheDocument()
    })
  })

  describe('File selection', () => {
    it('should handle camera capture', async () => {
      const user = userEvent.setup()
      render(<ImageUpload />)
      
      const cameraButton = screen.getByText('카메라').closest('button')
      await user.click(cameraButton!)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).toHaveAttribute('capture', 'environment')
    })

    it('should handle gallery selection', async () => {
      const user = userEvent.setup()
      render(<ImageUpload />)
      
      const galleryButton = screen.getByText('갤러리').closest('button')
      await user.click(galleryButton!)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).not.toHaveAttribute('capture')
    })

    it('should process file upload successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      render(<ImageUpload onImageUploaded={mockOnImageUploaded} />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      await waitFor(() => {
        expect(mockImageUploadService.compressImage).toHaveBeenCalledWith(file)
        expect(mockImageUploadService.uploadImage).toHaveBeenCalled()
        expect(mockOnImageUploaded).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          'https://example.com/thumb.jpg'
        )
        expect(mockNotifications.success).toHaveBeenCalled()
      })
    })

    it('should show loading state during upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      mockImageUploadService.uploadImage.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          url: 'https://example.com/image.jpg',
          thumbnailUrl: 'https://example.com/thumb.jpg',
        }), 100))
      )
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      expect(screen.getByText('이미지 업로드 중...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText('이미지 업로드 중...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle upload errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      mockImageUploadService.uploadImage.mockRejectedValue(
        new Error('Upload failed')
      )
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          '업로드 실패',
          '이미지 업로드 중 오류가 발생했습니다.'
        )
      })
    })

    it('should not upload when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null })
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      expect(mockImageUploadService.uploadImage).not.toHaveBeenCalled()
    })
  })

  describe('Image removal', () => {
    it('should show remove button when image exists', () => {
      render(<ImageUpload existingImageUrl="https://example.com/test.jpg" />)
      
      const removeButton = screen.getByLabelText('이미지 삭제')
      expect(removeButton).toBeInTheDocument()
    })

    it('should call onImageRemoved when remove button clicked', async () => {
      const user = userEvent.setup()
      render(
        <ImageUpload 
          existingImageUrl="https://example.com/test.jpg"
          onImageRemoved={mockOnImageRemoved}
        />
      )
      
      const removeButton = screen.getByLabelText('이미지 삭제')
      await user.click(removeButton)
      
      expect(mockOnImageRemoved).toHaveBeenCalled()
    })

    it('should show warning for Supabase images', async () => {
      const user = userEvent.setup()
      render(
        <ImageUpload 
          existingImageUrl="https://example.supabase.co/test.jpg"
          onImageRemoved={mockOnImageRemoved}
        />
      )
      
      const removeButton = screen.getByLabelText('이미지 삭제')
      await user.click(removeButton)
      
      expect(mockNotifications.warning).toHaveBeenCalled()
    })
  })

  describe('File validation', () => {
    it('should accept specified file types', () => {
      render(<ImageUpload acceptedTypes={['image/png', 'image/gif']} />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).toHaveAttribute('accept', 'image/png,image/gif')
    })

    it('should use default accepted types', () => {
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(<ImageUpload className="custom-upload" />)
      
      const container = screen.getByText('카메라').closest('.custom-upload')
      expect(container).toBeInTheDocument()
    })
  })
})

describe('MultiImageUpload', () => {
  const mockOnImagesChanged = vi.fn()
  const mockNotifications = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' } })
    mockUseNotification.mockReturnValue(mockNotifications)
    mockImageUploadService.uploadMultipleImages.mockResolvedValue([
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
    ])
  })

  describe('Basic rendering', () => {
    it('should render add button when under limit', () => {
      render(<MultiImageUpload maxImages={3} />)
      
      expect(screen.getByText('추가')).toBeInTheDocument()
    })

    it('should show existing images', () => {
      render(
        <MultiImageUpload 
          existingImages={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
        />
      )
      
      expect(screen.getByAltText('Coffee image 1')).toBeInTheDocument()
      expect(screen.getByAltText('Coffee image 2')).toBeInTheDocument()
    })

    it('should show image count', () => {
      render(
        <MultiImageUpload 
          existingImages={['https://example.com/1.jpg']}
          maxImages={5}
        />
      )
      
      expect(screen.getByText('1 / 5개 업로드 • 최대 5MB')).toBeInTheDocument()
    })
  })

  describe('Multiple file upload', () => {
    it('should handle multiple file selection', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]
      
      render(<MultiImageUpload onImagesChanged={mockOnImagesChanged} />)
      
      const fileInput = screen.getByLabelText('이미지 파일들 선택')
      await userEvent.upload(fileInput, files)
      
      await waitFor(() => {
        expect(mockImageUploadService.uploadMultipleImages).toHaveBeenCalled()
        expect(mockOnImagesChanged).toHaveBeenCalledWith([
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ])
        expect(mockNotifications.success).toHaveBeenCalledWith(
          '업로드 완료',
          '2개의 이미지가 업로드되었습니다.'
        )
      })
    })

    it('should prevent upload when exceeding limit', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]
      
      render(
        <MultiImageUpload 
          existingImages={['https://example.com/existing.jpg']}
          maxImages={2}
        />
      )
      
      const fileInput = screen.getByLabelText('이미지 파일들 선택')
      await userEvent.upload(fileInput, files)
      
      expect(mockNotifications.error).toHaveBeenCalledWith(
        '업로드 제한',
        '최대 2개의 이미지만 업로드할 수 있습니다.'
      )
      expect(mockImageUploadService.uploadMultipleImages).not.toHaveBeenCalled()
    })
  })

  describe('Image removal', () => {
    it('should remove image when delete button clicked', async () => {
      const user = userEvent.setup()
      render(
        <MultiImageUpload 
          existingImages={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
          onImagesChanged={mockOnImagesChanged}
        />
      )
      
      const deleteButton = screen.getByLabelText('이미지 1 삭제')
      await user.click(deleteButton)
      
      expect(mockOnImagesChanged).toHaveBeenCalledWith(['https://example.com/2.jpg'])
      expect(mockNotifications.info).toHaveBeenCalledWith(
        '이미지 삭제',
        '이미지가 삭제되었습니다.'
      )
    })
  })

  describe('Upload states', () => {
    it('should show loading state during upload', async () => {
      mockImageUploadService.uploadMultipleImages.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      )
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      render(<MultiImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일들 선택')
      await userEvent.upload(fileInput, file)
      
      expect(screen.getByText('추가').closest('button')).toBeDisabled()
    })

    it('should hide add button when at max capacity', () => {
      render(
        <MultiImageUpload 
          existingImages={['1.jpg', '2.jpg']}
          maxImages={2}
        />
      )
      
      expect(screen.queryByText('추가')).not.toBeInTheDocument()
    })
  })
})