import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageUpload from '../ImageUpload'

// Mock the cloudinary service
vi.mock('../../services/cloudinaryService', () => ({
  cloudinaryService: {
    uploadImage: vi.fn(),
    getOptimizedUrl: vi.fn(),
    validateFile: vi.fn()
  }
}))

describe('ImageUpload Component', () => {
  const mockOnImageUploaded = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload dropzone correctly', () => {
    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
      />
    );
    
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
    expect(screen.getByText(/browse to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG, WebP up to 10MB/i)).toBeInTheDocument();
  });

  it('shows current image when provided', () => {
    const currentImage = 'https://example.com/current-image.jpg';
    
    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
        currentImage={currentImage}
      />
    );
    
    const image = screen.getByAltText('Upload preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', currentImage);
  });

  it('handles file selection', async () => {
    const { cloudinaryService } = await import('../../services/cloudinaryService');
    cloudinaryService.uploadImage.mockResolvedValue({
      publicId: 'test-id',
      secureUrl: 'https://cloudinary.com/test.jpg'
    });
    cloudinaryService.getOptimizedUrl.mockReturnValue('https://cloudinary.com/optimized.jpg');

    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
      />
    );
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse to upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        file,
        expect.any(Function),
        expect.objectContaining({
          folder: 'products',
          tags: ['ramro-product', 'admin-upload']
        })
      );
    });
  });

  it('shows upload progress', async () => {
    const { cloudinaryService } = await import('../../services/cloudinaryService');
    let progressCallback;
    
    cloudinaryService.uploadImage.mockImplementation((file, onProgress) => {
      progressCallback = onProgress;
      return new Promise(resolve => {
        setTimeout(() => {
          progressCallback(50);
          setTimeout(() => {
            progressCallback(100);
            resolve({
              publicId: 'test-id',
              secureUrl: 'https://cloudinary.com/test.jpg'
            });
          }, 100);
        }, 100);
      });
    });

    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
      />
    );
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse to upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/uploading to cloudinary/i)).toBeInTheDocument();
    });
  });

  it('handles upload errors', async () => {
    const { cloudinaryService } = await import('../../services/cloudinaryService');
    cloudinaryService.uploadImage.mockRejectedValue(new Error('Upload failed'));

    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
      />
    );
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse to upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Upload failed');
    });
  });

  it('handles drag and drop', () => {
    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
      />
    );
    
    const dropzone = screen.getByText(/drop an image here/i).closest('div');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [file] }
    });
    
    expect(dropzone).toHaveClass('border-organic-primary');
    
    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveClass('border-organic-primary');
  });

  it('allows image removal', () => {
    const currentImage = 'https://example.com/current-image.jpg';
    
    render(
      <ImageUpload 
        onImageUploaded={mockOnImageUploaded}
        onError={mockOnError}
        currentImage={currentImage}
      />
    );
    
    const removeButton = screen.getByTitle('Remove image');
    fireEvent.click(removeButton);
    
    expect(mockOnImageUploaded).toHaveBeenCalledWith(null);
  });
});