import { describe, it, expect, vi, beforeEach } from 'vitest'
import emailService from '../emailService'

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn()
}))

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email with correct data', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ data: { success: true } })
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John', lastName: 'Doe' },
        items: [{ name: 'Test Product', quantity: 1, price: 299 }],
        total: 299,
        createdAt: new Date().toISOString()
      }

      await emailService.sendOrderConfirmation(orderData)

      expect(mockSendEmail).toHaveBeenCalledWith({
        template: 'order_confirmation',
        to: 'test@example.com',
        data: expect.objectContaining({
          customerName: 'John',
          orderNumber: 'ORD-123',
          items: expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Product',
              quantity: 1,
              price: 299
            })
          ]),
          total: 299
        })
      })
    })

    it('should handle email sending errors gracefully', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockRejectedValue(new Error('Email service unavailable'))
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John' },
        items: [],
        total: 0
      }

      await expect(emailService.sendOrderConfirmation(orderData))
        .rejects.toThrow('Email service unavailable')
    })
  })

  describe('sendOrderStatusUpdate', () => {
    it('should send shipping notification for shipped status', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ data: { success: true } })
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John' },
        trackingNumber: 'TRK123456789'
      }

      await emailService.sendOrderStatusUpdate(orderData, 'shipped')

      expect(mockSendEmail).toHaveBeenCalledWith({
        template: 'order_shipped',
        to: 'test@example.com',
        subject: 'Your order #ORD-123 has been shipped!',
        data: expect.objectContaining({
          customerName: 'John',
          orderNumber: 'ORD-123',
          status: 'shipped',
          trackingNumber: 'TRK123456789'
        })
      })
    })

    it('should send delivery confirmation for delivered status', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ data: { success: true } })
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John' }
      }

      await emailService.sendOrderStatusUpdate(orderData, 'delivered')

      expect(mockSendEmail).toHaveBeenCalledWith({
        template: 'order_delivered',
        to: 'test@example.com',
        subject: 'Your order #ORD-123 has been delivered!',
        data: expect.objectContaining({
          customerName: 'John',
          orderNumber: 'ORD-123',
          status: 'delivered'
        })
      })
    })

    it('should not send email for unsupported status changes', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn()
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John' }
      }

      await emailService.sendOrderStatusUpdate(orderData, 'processing')

      expect(mockSendEmail).not.toHaveBeenCalled()
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new users', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ data: { success: true } })
      httpsCallable.mockReturnValue(mockSendEmail)

      const userData = {
        email: 'newuser@example.com',
        displayName: 'New User'
      }

      await emailService.sendWelcomeEmail(userData)

      expect(mockSendEmail).toHaveBeenCalledWith({
        template: 'welcome',
        to: 'newuser@example.com',
        data: expect.objectContaining({
          customerName: 'New User',
          loginUrl: expect.stringContaining('/login'),
          shopUrl: expect.stringContaining('/shop')
        })
      })
    })
  })

  describe('email template validation', () => {
    it('should validate required fields for order confirmation', () => {
      const invalidOrderData = {
        // Missing required fields
        orderNumber: 'ORD-123'
      }

      expect(() => emailService.validateOrderData(invalidOrderData))
        .toThrow('Missing required field: userEmail')
    })

    it('should validate email address format', () => {
      const invalidEmailData = {
        orderNumber: 'ORD-123',
        userEmail: 'invalid-email',
        shipping: { firstName: 'John' },
        items: [],
        total: 0
      }

      expect(() => emailService.validateOrderData(invalidEmailData))
        .toThrow('Invalid email address format')
    })
  })

  describe('email delivery tracking', () => {
    it('should track email delivery success', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ 
        data: { 
          success: true, 
          messageId: 'msg-123',
          deliveryStatus: 'sent'
        } 
      })
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'test@example.com',
        shipping: { firstName: 'John' },
        items: [],
        total: 0
      }

      const result = await emailService.sendOrderConfirmation(orderData)

      expect(result.data.success).toBe(true)
      expect(result.data.messageId).toBe('msg-123')
    })

    it('should handle email delivery failures', async () => {
      const { httpsCallable } = await import('firebase/functions')
      const mockSendEmail = vi.fn().mockResolvedValue({ 
        data: { 
          success: false, 
          error: 'Invalid email address'
        } 
      })
      httpsCallable.mockReturnValue(mockSendEmail)

      const orderData = {
        orderNumber: 'ORD-123',
        userEmail: 'invalid@email',
        shipping: { firstName: 'John' },
        items: [],
        total: 0
      }

      const result = await emailService.sendOrderConfirmation(orderData)

      expect(result.data.success).toBe(false)
      expect(result.data.error).toBe('Invalid email address')
    })
  })
})