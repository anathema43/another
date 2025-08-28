// src/services/razorpayService.js
import { razorpayConfig, loadRazorpayScript } from '../config/razorpay';

class RazorpayService {
  constructor() {
    this.razorpay = null;
    this.scriptLoaded = false;
  }

  async initialize() {
    if (!this.scriptLoaded) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay script');
      }
      this.scriptLoaded = true;
    }
    return true;
  }

  async createOrder(orderData) {
    try {
      // Use Firebase Functions instead of direct API
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../firebase/firebase');
      
      if (!functions) {
        throw new Error('Payment service unavailable - Firebase Functions not configured');
      }
      
      const createOrder = httpsCallable(functions, 'createRazorpayOrder');
      
      const result = await createOrder({
        amount: orderData.total,
        currency: 'INR',
        receipt: orderData.orderNumber || `order_${Date.now()}`,
        notes: {
          orderId: orderData.id,
          customerEmail: orderData.userEmail
        }
      });

      return result.data;
    } catch (error) {
      // Enhance error messages for better user experience
      if (error.code === 'functions/not-found') {
        throw new Error('Payment service unavailable - backend functions not deployed');
      } else if (error.code === 'functions/unauthenticated') {
        throw new Error('Authentication required for payment processing');
      } else if (error.code === 'functions/deadline-exceeded') {
        throw new Error('Payment service timeout - please try again');
      } else if (error.message.includes('network')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async processPayment(orderData, onSuccess, onError) {
    try {
      await this.initialize();

      // Create order on backend first
      let razorpayOrder;
      try {
        razorpayOrder = await this.createOrder(orderData);
      } catch (error) {
        // Handle backend service errors
        if (error.message.includes('service unavailable') || 
            error.message.includes('not deployed') ||
            error.message.includes('timeout')) {
          throw new Error('Payment service temporarily unavailable');
        }
        throw error;
      }
      const razorpayOrder = await this.createOrder(orderData);

      const options = {
        key: razorpayConfig.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: razorpayConfig.name,
        description: razorpayConfig.description,
        image: razorpayConfig.image,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResult = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData
            });

            if (verificationResult.success) {
              onSuccess({
                ...orderData,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                paymentStatus: 'completed'
              });
            } else {
              onError('Payment verification failed');
            }
          } catch (error) {
            if (error.message.includes('service unavailable') || 
                error.message.includes('timeout')) {
              onError('Payment verification service temporarily unavailable');
            } else {
              onError('Payment verification error: ' + error.message);
            }
            onError('Payment verification error: ' + error.message);
          }
        },
        prefill: {
          name: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
          email: orderData.shipping.email,
          contact: orderData.shipping.phone
        },
        notes: {
          address: orderData.shipping.address,
          city: orderData.shipping.city
        },
        theme: razorpayConfig.theme,
        modal: {
          ondismiss: () => {
            onError('Payment cancelled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      if (error.message.includes('service unavailable') || 
          error.message.includes('temporarily unavailable') ||
          error.message.includes('timeout')) {
        onError('Payment service temporarily unavailable');
      } else {
        onError('Payment initialization failed: ' + error.message);
      }
      onError('Payment initialization failed: ' + error.message);
    }
  }

  async verifyPayment(paymentData) {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../firebase/firebase');
      
      const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
      const result = await verifyPayment(paymentData);
      
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async processRefund(paymentId, amount, reason = 'Customer request') {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../firebase/firebase');
      
      const processRefund = httpsCallable(functions, 'processRazorpayRefund');
      const result = await processRefund({
        payment_id: paymentId,
        amount: amount,
        reason: reason
      });
      
      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();
