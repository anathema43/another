import React, { useState } from 'react';
import { razorpayService } from '../services/razorpayService';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import formatCurrency from '../utils/formatCurrency';

export default function RazorpayCheckout({ orderData, onSuccess, onError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCartStore();
  const { createOrder } = useOrderStore();

  const handlePayment = async () => {
    setIsProcessing(true);

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
          onError(errorMessage);
          setIsProcessing(false);
        }
      );
    } catch (error) {
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
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
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