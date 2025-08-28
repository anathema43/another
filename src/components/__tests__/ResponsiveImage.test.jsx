import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResponsiveImage from '../ResponsiveImage'

// Mock the image utils
vi.mock('../../utils/imageUtils', () => ({
  generateResponsiveUrls: vi.fn((url) => ({
    small: `${url}?w=400`,
    medium: `${url}?w=800`, 
    large: `${url}?w=1200`,
    xlarge: `${url}?w=1600`
  })),
  generateSrcSet: vi.fn(() => 'image.jpg?w=400 400w, image.jpg?w=800 800w, image.jpg?w=1200 1200w'),
  generateSizes: vi.fn(() => '(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px'),
  handleImageError: vi.fn()
}))

describe('ResponsiveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders responsive image with correct attributes', () => {
    render(
      <ResponsiveImage 
        src="https://example.com/image.jpg"
        alt="Test image"
        className="test-class"
      />
    )

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('srcset')
    expect(img).toHaveAttribute('sizes')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('shows loading placeholder initially', () => {
    render(
      <ResponsiveImage 
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    // Should show loading placeholder
    const placeholder = document.querySelector('.animate-pulse')
    expect(placeholder).toBeInTheDocument()
  })

  it('handles image load event', async () => {
    const onLoad = vi.fn()
    
    render(
      <ResponsiveImage 
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={onLoad}
      />
    )

    const img = screen.getByAltText('Test image')
    
    // Simulate image load
    fireEvent.load(img)
    
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('handles image error with fallback', async () => {
    const onError = vi.fn()
    
    render(
      <ResponsiveImage 
        src="https://example.com/broken-image.jpg"
        alt="Test image"
        onError={onError}
      />
    )

    const img = screen.getByAltText('Test image')
    
    // Simulate image error
    fireEvent.error(img)
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })

    // Should show error state
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('sets priority loading for important images', () => {
    render(
      <ResponsiveImage 
        src="https://example.com/image.jpg"
        alt="Priority image"
        priority={true}
      />
    )

    const img = screen.getByAltText('Priority image')
    expect(img).toHaveAttribute('loading', 'eager')
  })

  it('handles missing src gracefully', () => {
    render(
      <ResponsiveImage 
        src=""
        alt="No image"
        className="test-class"
      />
    )

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('applies custom sizes attribute', () => {
    const customSizes = '(max-width: 600px) 300px, 600px'
    
    render(
      <ResponsiveImage 
        src="https://example.com/image.jpg"
        alt="Custom sizes"
        sizes={customSizes}
      />
    )

    const img = screen.getByAltText('Custom sizes')
    expect(img).toHaveAttribute('sizes', customSizes)
  })
})