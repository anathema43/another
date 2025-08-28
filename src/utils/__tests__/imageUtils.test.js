import { describe, it, expect } from 'vitest'
import { 
  generateResponsiveUrls, 
  generateSrcSet, 
  generateSizes,
  getOptimalSize,
  IMAGE_SIZES 
} from '../imageUtils'

describe('imageUtils', () => {
  describe('generateResponsiveUrls', () => {
    it('handles Cloudinary URLs correctly', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      const result = generateResponsiveUrls(cloudinaryUrl)
      
      expect(result.small).toContain('w_400,h_400,c_fill,f_auto,q_auto')
      expect(result.medium).toContain('w_800,h_800,c_fill,f_auto,q_auto')
      expect(result.large).toContain('w_1200,h_1200,c_fill,f_auto,q_auto')
      expect(result.xlarge).toContain('w_1600,h_1600,c_fill,f_auto,q_auto')
    })

    it('handles Pexels URLs correctly', () => {
      const pexelsUrl = 'https://images.pexels.com/photos/123/photo.jpg'
      const result = generateResponsiveUrls(pexelsUrl)
      
      expect(result.small).toContain('w=400')
      expect(result.medium).toContain('w=800')
      expect(result.large).toContain('w=1200')
      expect(result.xlarge).toContain('w=1600')
    })

    it('handles Firebase Storage URLs correctly', () => {
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/project/o/image.jpg'
      const result = generateResponsiveUrls(firebaseUrl)
      
      expect(result.small).toContain('_400x400')
      expect(result.medium).toContain('_800x800')
      expect(result.large).toContain('_1200x1200')
      expect(result.xlarge).toContain('_1600x1600')
    })

    it('returns null for empty URL', () => {
      expect(generateResponsiveUrls('')).toBeNull()
      expect(generateResponsiveUrls(null)).toBeNull()
      expect(generateResponsiveUrls(undefined)).toBeNull()
    })

    it('falls back to original URL for unknown services', () => {
      const unknownUrl = 'https://unknown-service.com/image.jpg'
      const result = generateResponsiveUrls(unknownUrl)
      
      expect(result.small).toBe(unknownUrl)
      expect(result.medium).toBe(unknownUrl)
      expect(result.large).toBe(unknownUrl)
      expect(result.xlarge).toBe(unknownUrl)
    })
  })

  describe('generateSrcSet', () => {
    it('creates proper srcset string', () => {
      const imageUrls = {
        small: 'image-400.jpg',
        medium: 'image-800.jpg',
        large: 'image-1200.jpg',
        xlarge: 'image-1600.jpg'
      }
      
      const result = generateSrcSet(imageUrls)
      
      expect(result).toBe('image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w, image-1600.jpg 1600w')
    })

    it('returns empty string for null input', () => {
      expect(generateSrcSet(null)).toBe('')
      expect(generateSrcSet(undefined)).toBe('')
    })
  })

  describe('generateSizes', () => {
    it('returns custom sizes when provided', () => {
      const customSizes = '(max-width: 600px) 300px, 600px'
      expect(generateSizes(customSizes)).toBe(customSizes)
    })

    it('returns default sizes when no custom sizes provided', () => {
      const result = generateSizes()
      expect(result).toContain('(max-width: 768px)')
      expect(result).toContain('400px')
      expect(result).toContain('800px')
    })
  })

  describe('getOptimalSize', () => {
    it('returns correct size for different container widths', () => {
      expect(getOptimalSize(300)).toBe('small')
      expect(getOptimalSize(600)).toBe('medium')
      expect(getOptimalSize(1000)).toBe('large')
      expect(getOptimalSize(1500)).toBe('xlarge')
    })

    it('handles edge cases', () => {
      expect(getOptimalSize(400)).toBe('small') // Exactly at boundary
      expect(getOptimalSize(800)).toBe('medium') // Exactly at boundary
      expect(getOptimalSize(1200)).toBe('large') // Exactly at boundary
    })
  })
})