import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  saveRedirectPath, 
  getAndClearRedirectPath, 
  determineRedirectPath, 
  isValidRedirectPath 
} from '../redirectUtils'

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

describe('redirectUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorageMock.clear()
  })

  describe('saveRedirectPath', () => {
    it('should save valid redirect paths', () => {
      saveRedirectPath('/shop')
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('redirectPath', '/shop')
    })

    it('should not save login/signup paths', () => {
      saveRedirectPath('/login')
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled()

      saveRedirectPath('/signup')
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle sessionStorage errors gracefully', () => {
      sessionStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Should not throw error
      expect(() => saveRedirectPath('/shop')).not.toThrow()
    })
  })

  describe('getAndClearRedirectPath', () => {
    it('should return and clear saved redirect path', () => {
      sessionStorageMock.getItem.mockReturnValue('/shop')
      
      const result = getAndClearRedirectPath()
      
      expect(result).toBe('/shop')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('redirectPath')
    })

    it('should return null when no path is saved', () => {
      sessionStorageMock.getItem.mockReturnValue(null)
      
      const result = getAndClearRedirectPath()
      
      expect(result).toBe(null)
      expect(sessionStorageMock.removeItem).not.toHaveBeenCalled()
    })

    it('should handle sessionStorage errors gracefully', () => {
      sessionStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available')
      })

      const result = getAndClearRedirectPath()
      expect(result).toBe(null)
    })
  })

  describe('determineRedirectPath', () => {
    it('should redirect admin users to admin panel', () => {
      const adminProfile = { role: 'admin', email: 'admin@ramro.com' }
      const result = determineRedirectPath(adminProfile, '/shop')
      
      expect(result).toBe('/admin')
    })

    it('should redirect regular users to saved path', () => {
      const userProfile = { role: 'customer', email: 'user@ramro.com' }
      const result = determineRedirectPath(userProfile, '/wishlist')
      
      expect(result).toBe('/wishlist')
    })

    it('should redirect to home when no saved path', () => {
      const userProfile = { role: 'customer', email: 'user@ramro.com' }
      const result = determineRedirectPath(userProfile, null)
      
      expect(result).toBe('/')
    })

    it('should handle missing user profile', () => {
      const result = determineRedirectPath(null, '/shop')
      
      expect(result).toBe('/shop')
    })
  })

  describe('isValidRedirectPath', () => {
    it('should validate correct paths', () => {
      expect(isValidRedirectPath('/shop')).toBe(true)
      expect(isValidRedirectPath('/account')).toBe(true)
      expect(isValidRedirectPath('/wishlist')).toBe(true)
    })

    it('should reject invalid paths', () => {
      expect(isValidRedirectPath('/login')).toBe(false)
      expect(isValidRedirectPath('/signup')).toBe(false)
      expect(isValidRedirectPath('/logout')).toBe(false)
    })

    it('should handle invalid input', () => {
      expect(isValidRedirectPath(null)).toBe(false)
      expect(isValidRedirectPath(undefined)).toBe(false)
      expect(isValidRedirectPath('')).toBe(false)
      expect(isValidRedirectPath(123)).toBe(false)
    })
  })
})