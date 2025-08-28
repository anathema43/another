import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiService } from '../apiService'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication Headers', () => {
    it('should include auth token when available', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const headers = apiService.getAuthHeaders()
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      })
    })

    it('should not include auth token when not available', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const headers = apiService.getAuthHeaders()
      
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      })
    })
  })

  describe('HTTP Methods', () => {
    it('should make GET request correctly', async () => {
      const mockResponse = { data: 'test' }
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.get('/test')

      expect(fetch).toHaveBeenCalledWith('/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request with data', async () => {
      const mockResponse = { success: true }
      const postData = { name: 'test' }
      
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.post('/test', postData)

      expect(fetch).toHaveBeenCalledWith('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle query parameters in GET requests', async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      })

      await apiService.get('/test', { page: 1, limit: 10 })

      expect(fetch).toHaveBeenCalledWith('/test?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Resource not found' })
      })

      await expect(apiService.get('/test')).rejects.toThrow('Resource not found')
    })

    it('should handle network errors', async () => {
      fetch.mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(apiService.get('/test')).rejects.toThrow('Network error: Please check your internet connection')
    })

    it('should handle non-JSON error responses', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(apiService.get('/test')).rejects.toThrow('HTTP 500: Internal Server Error')
    })
  })

  describe('Specialized Methods', () => {
    it('should handle file uploads correctly', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = { url: 'https://example.com/test.jpg' }
      
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.uploadFile('/upload', mockFile, { category: 'product' })

      expect(fetch).toHaveBeenCalledWith('/upload', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }))
      expect(result).toEqual(mockResponse)
    })

    it('should create Razorpay order', async () => {
      const orderData = { amount: 1000, currency: 'INR' }
      const mockResponse = { id: 'order_123', amount: 1000 }
      
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.createRazorpayOrder(orderData)

      expect(fetch).toHaveBeenCalledWith('/api/razorpay/create-order', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(orderData)
      }))
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Response Handling', () => {
    it('should handle text responses', async () => {
      const textResponse = 'Plain text response'
      
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: () => Promise.resolve(textResponse)
      })

      const result = await apiService.get('/test')

      expect(result).toBe(textResponse)
    })

    it('should handle empty responses', async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: new Map(),
        text: () => Promise.resolve('')
      })

      const result = await apiService.get('/test')

      expect(result).toBe('')
    })
  })
});