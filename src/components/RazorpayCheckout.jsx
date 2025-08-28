import React, { useState } from 'react';
import { razorpayService } from '../services/razorpayService';
import { isRazorpayConfigured } from '../config/razorpay';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import formatCurrency from '../utils/formatCurrency';

export default function RazorpayCheckout({ orderData, onSuccess, onError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const { clearCart } = useCartStore();
  const { createOrder } = useOrderStore();

  // Check if Razorpay is configured
  if (!isRazorpayConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          💳 Payment Configuration Required
        </h3>
        <p className="text-yellow-700 mb-4">
          Razorpay payment gateway is not configured yet. Please add your Razorpay keys to enable payments.
        </p>
        <div className="text-sm text-yellow-600">
          <p><strong>Required:</strong> VITE_RAZORPAY_KEY_ID in environment variables</p>
          <p><strong>For testing:</strong> Use keys starting with rzp_test_</p>
        </div>
        <button
          onClick={() => onSuccess({ 
            ...orderData, 
            paymentStatus: 'demo',
            paymentMethod: 'demo' 
          })}
          className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Complete Demo Order (No Payment)
        </button>
      </div>
    );
  }

  // Show service down message
  if (serviceDown) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          🚫 Payment Service Temporarily Down
        </h3>
        <p className="text-red-700 mb-4">
          We're experiencing technical difficulties with our payment processor. Please try again in a few minutes.
        </p>
        <div className="text-sm text-red-600 mb-4">
          <p>• Our team has been notified and is working to resolve this issue</p>
          <p>• Your cart items are saved and will be available when you return</p>
          <p>• You can also contact us directly to place your order</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setServiceDown(false);
              setIsProcessing(false);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/#/contact'}
            className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }
  const handlePayment = async () => {
    setIsProcessing(true);
    setServiceDown(false);

    try {
      await razorpayService.processPayment(
        orderData,
        async (paymentResult) => {
          try {
            // Create order in database after successful payment
            const order = await createOrder({
              ...orderData,
              paymentId: paymentResult.paymentId,
              razorpayOrderId: paymentResult.orderId,
              paymentSignature: paymentResult.signature,
              paymentStatus: 'completed',
              paymentMethod: 'razorpay'
            });

            // Clear cart
            clearCart();

            // Call success callback
            onSuccess(order);
          } catch (error) {
            onError('Order creation failed: ' + error.message);
          } finally {
            setIsProcessing(false);
          }
        },
        (errorMessage) => {
          // Check if error indicates service is down
          if (errorMessage.includes('network') || 
              errorMessage.includes('timeout') || 
              errorMessage.includes('service unavailable') ||
              errorMessage.includes('server error') ||
              errorMessage.includes('initialization failed')) {
            setServiceDown(true);
          } else {
            onError(errorMessage);
          }
          onError(errorMessage);
          setIsProcessing(false);
        }
      );
    } catch (error) {
      // Handle initialization errors as service down
      if (error.message.includes('Failed to load') || 
          error.message.includes('network') ||
          error.message.includes('initialization failed')) {
        setServiceDown(true);
      } else {
        onError('Payment initialization failed: ' + error.message);
      }
      onError('Payment initialization failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600"> x {item.quantity}</span>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-semibold mb-2">Shipping Address:</h4>
          <div className="text-sm text-gray-600">
            {orderData.shipping.firstName} {orderData.shipping.lastName}<br />
            {orderData.shipping.address}<br />
            {orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.zipCode}
          </div>
        </div>

        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(orderData.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(orderData.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{orderData.shippingCost === 0 ? 'Free' : formatCurrency(orderData.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(orderData.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-organic-primary text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay ${formatCurrency(orderData.total)} with Razorpay`
        )}
      </button>

      {/* Payment Info */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Razorpay - India's leading payment gateway</p>
        <p>Supports UPI, Cards, Net Banking, and Wallets</p>
      </div>

      {/* Accepted Payment Methods */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Accepted Payment Methods:</h4>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="bg-blue-100 px-2 py-1 rounded">💳 Credit/Debit Cards</span>
          <span className="bg-green-100 px-2 py-1 rounded">📱 UPI</span>
          <span className="bg-purple-100 px-2 py-1 rounded">🏦 Net Banking</span>
          <span className="bg-orange-100 px-2 py-1 rounded">💰 Wallets</span>
          <span className="bg-red-100 px-2 py-1 rounded">💵 EMI</span>
        </div>
      </div>
    </div>
  );
}