import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'


// Mock image service
vi.mock('../../lib/supabase-image-service', () => ({
  ImageUploadService: {
    compressImage: vi.fn(),
    uploadImage: vi.fn(),
    uploadMultipleImages: vi.fn(),
  },
  createImagePreview: vi.fn((file) => `preview-${file.name}`),
  revokeImagePreview: vi.fn(),
}))

// Mock contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}))

// Mock LoadingSpinner
vi.mock('../ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}))

// Import the mocked services
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { ImageUploadService } from '../../lib/supabase-image-service'
import ImageUpload from '../ImageUpload'

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
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-123' } } as any)
    vi.mocked(useNotification).mockReturnValue(mockNotifications as any)
    vi.mocked(ImageUploadService.compressImage).mockResolvedValue(new File(['compressed'], 'compressed.jpg'))
    vi.mocked(ImageUploadService.uploadImage).mockResolvedValue({
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    })
  })

  describe('Basic rendering', () => {
    it('should render upload buttons when no image', () => {
      render(<ImageUpload />)
      
      expect(screen.getByLabelText('카메라로 촬영')).toBeInTheDocument()
      expect(screen.getByLabelText('갤러리에서 선택')).toBeInTheDocument()
    })

    it('should render existing image when provided', () => {
      render(<ImageUpload existingImageUrl="https://example.com/existing.jpg" />)
      
      const image = screen.getByAltText('업로드된 이미지')
      expect(image).toHaveAttribute('src', 'https://example.com/existing.jpg')
    })

    it('should show help text when no image', () => {
      render(<ImageUpload maxFileSize={3} />)
      
      expect(screen.getByText(/최대 3MB/)).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<ImageUpload className="custom-upload" />)
      
      const container = screen.getByLabelText('카메라로 촬영').closest('.custom-upload')
      expect(container).toBeInTheDocument()
    })
  })

  describe('File selection and upload', () => {
    it('should handle file upload successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      render(<ImageUpload onImageUploaded={mockOnImageUploaded} />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      await waitFor(() => {
        expect(ImageUploadService.compressImage).toHaveBeenCalledWith(file)
        expect(ImageUploadService.uploadImage).toHaveBeenCalled()
        expect(mockOnImageUploaded).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          'https://example.com/thumb.jpg'
        )
        expect(mockNotifications.success).toHaveBeenCalledWith(
          '업로드 완료',
          '이미지가 성공적으로 업로드되었습니다.'
        )
      })
    })

    it('should show loading state during upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vi.mocked(ImageUploadService.uploadImage).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          url: 'https://example.com/image.jpg',
          thumbnailUrl: 'https://example.com/thumb.jpg',
        }), 100))
      )
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('should handle upload errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vi.mocked(ImageUploadService.uploadImage).mockRejectedValue(
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
      vi.mocked(useAuth).mockReturnValue({ user: null } as any)
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      expect(ImageUploadService.uploadImage).not.toHaveBeenCalled()
    })

    it('should handle file size validation', async () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      render(<ImageUpload maxFileSize={5} />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, largeFile)
      
      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          '파일 크기 초과',
          '파일 크기는 5MB 이하여야 합니다.'
        )
      })
      expect(ImageUploadService.uploadImage).not.toHaveBeenCalled()
    })

    it('should handle invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, invalidFile)
      
      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          '잘못된 파일 형식',
          '지원되는 형식: JPEG, JPG, PNG, WebP'
        )
      })
      expect(ImageUploadService.uploadImage).not.toHaveBeenCalled()
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
      
      expect(mockNotifications.warning).toHaveBeenCalledWith(
        '이미지 삭제',
        '이미지가 즉시 삭제됩니다. 계속하시겠습니까?'
      )
      expect(mockOnImageRemoved).toHaveBeenCalled()
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

  describe('Camera and gallery buttons', () => {
    it('should set capture attribute for camera button', async () => {
      const user = userEvent.setup()
      render(<ImageUpload />)
      
      const cameraButton = screen.getByLabelText('카메라로 촬영')
      await user.click(cameraButton)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).toHaveAttribute('capture', 'environment')
    })

    it('should not set capture attribute for gallery button', async () => {
      const user = userEvent.setup()
      render(<ImageUpload />)
      
      const galleryButton = screen.getByLabelText('갤러리에서 선택')
      await user.click(galleryButton)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      expect(fileInput).not.toHaveAttribute('capture')
    })
  })

  describe('Progress indicators', () => {
    it('should show upload progress', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock progress callback
      vi.mocked(ImageUploadService.uploadImage).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve({
            url: 'https://example.com/image.jpg',
            thumbnailUrl: 'https://example.com/thumb.jpg',
          }), 50)
        })
      )
      
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      await userEvent.upload(fileInput, file)
      
      // Should show loading state
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Thumbnail handling', () => {
    it('should show thumbnail when showThumbnail is true', () => {
      render(
        <ImageUpload 
          existingImageUrl="https://example.com/test.jpg"
          showThumbnail={true}
        />
      )
      
      const image = screen.getByAltText('업로드된 이미지')
      expect(image).toBeInTheDocument()
    })

    it('should hide thumbnail when showThumbnail is false', () => {
      render(
        <ImageUpload 
          existingImageUrl="https://example.com/test.jpg"
          showThumbnail={false}
        />
      )
      
      const image = screen.queryByAltText('업로드된 이미지')
      expect(image).not.toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle compression errors gracefully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vi.mocked(ImageUploadService.compressImage).mockRejectedValue(
        new Error('Compression failed')
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

    it('should handle empty file selection', async () => {
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택')
      fireEvent.change(fileInput, { target: { files: [] } })
      
      expect(ImageUploadService.uploadImage).not.toHaveBeenCalled()
    })

    it('should reset file input after successful upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      render(<ImageUpload />)
      
      const fileInput = screen.getByLabelText('이미지 파일 선택') as HTMLInputElement
      await userEvent.upload(fileInput, file)
      
      await waitFor(() => {
        expect(fileInput.value).toBe('')
      })
    })
  })
})