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
      throw error;
    }
  }

  async processPayment(orderData, onSuccess, onError) {
    try {
      await this.initialize();

      // Create order on backend first
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
export default razorpayService;