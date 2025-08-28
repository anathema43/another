import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import RazorpayCheckout from "../components/RazorpayCheckout";
import AddressBook from "../components/AddressBook";
import AddressFormModal from "../components/AddressFormModal";
import formatCurrency from "../utils/formatCurrency";
import LoadingSpinner from "../components/LoadingSpinner";
import emailService from "../services/emailService";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getSubtotal, getTax, getShipping, getGrandTotal, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { currentUser } = useAuthStore();
  const { addresses, getDefaultAddress } = useUserStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Information
    paymentMethod: "card",
    paymentMethod: "razorpay",
    
    // Order Notes
    orderNotes: ""
  });

  // Set default address on component mount
  React.useEffect(() => {
    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [addresses, getDefaultAddress]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    setShowAddressModal(true);
  };

  const validateForm = () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        items: cart,
        shipping: {
          firstName: selectedAddress.recipientName.split(' ')[0],
          lastName: selectedAddress.recipientName.split(' ').slice(1).join(' '),
          name: selectedAddress.recipientName,
          email: currentUser?.email || "",
          phone: selectedAddress.recipientPhone,
          address: selectedAddress.fullAddress,
          addressLabel: selectedAddress.label === 'Other' ? selectedAddress.customLabel : selectedAddress.label
        },
        payment: {
          method: formData.paymentMethod,
        },
        subtotal: getSubtotal(),
        tax: getTax(),
        shippingCost: getShipping(),
        total: getGrandTotal(),
        orderNotes: formData.orderNotes,
        status: "processing",
        paymentStatus: "pending"
      };

      if (formData.paymentMethod === 'razorpay') {
        // Proceed to Razorpay payment
        setPaymentStep(true);
      } else {
        // This shouldn't happen since we only have Razorpay now
        const order = await createOrder(orderData);
        
        // Send confirmation email
        try {
          await emailService.sendOrderConfirmation(order);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
        
        clearCart();
        navigate(`/orders`, { 
          state: { 
            orderSuccess: true, 
            orderId: order.id,
            orderNumber: order.orderNumber 
          } 
        });
      }
      
    } catch (err) {
      setError("Failed to place order. Please try again.");
      console.error("Order creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (order) => {
    try {
      // Send confirmation email
      await emailService.sendOrderConfirmation(order);
      
      navigate(`/orders`, { 
        state: { 
          orderSuccess: true, 
          orderId: order.id,
          orderNumber: order.orderNumber 
        } 
      });
    } catch (error) {
      console.error('Error after payment success:', error);
      // Still navigate to success page even if email fails
      navigate(`/orders`);
    }
  };

  const handlePaymentError = (errorMessage) => {
    // Enhanced error handling for better user experience
    if (errorMessage.includes('service unavailable') || 
        errorMessage.includes('temporarily unavailable') ||
        errorMessage.includes('service down')) {
      setError('Payment service is temporarily down. Please try again in a few minutes or contact support.');
    } else if (errorMessage.includes('network')) {
      setError('Network connection issue. Please check your internet and try again.');
    } else if (errorMessage.includes('cancelled')) {
      setError('Payment was cancelled. You can try again or contact support if you need help.');
    } else {
      setError(errorMessage);
    }
    setError(errorMessage);
    setPaymentStep(false);
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-organic-text mb-4">Your cart is empty</h2>
          <button 
            onClick={() => navigate("/shop")}
            className="bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-organic-background py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-organic-text mb-8">Checkout</h1>
        
        {paymentStep ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-organic-text">Complete Payment</h2>
                <button
                  onClick={() => setPaymentStep(false)}
                  className="text-organic-primary hover:text-organic-text"
                >
                  ← Back to Checkout
                </button>
              </div>
              
              <RazorpayCheckout
                orderData={{
                  items: cart,
                  shipping: {
                    firstName: selectedAddress?.recipientName.split(' ')[0] || '',
                    lastName: selectedAddress?.recipientName.split(' ').slice(1).join(' ') || '',
                    name: selectedAddress?.recipientName || '',
                    email: currentUser?.email || "",
                    phone: selectedAddress?.recipientPhone || '',
                    address: selectedAddress?.fullAddress || '',
                    addressLabel: selectedAddress?.label === 'Other' ? selectedAddress?.customLabel : selectedAddress?.label
                  },
                  subtotal: getSubtotal(),
                  tax: getTax(),
                  shippingCost: getShipping(),
                  total: getGrandTotal(),
                  orderNotes: formData.orderNotes
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h2 className="text-xl font-bold text-organic-text mb-4">Delivery Address</h2>
                <AddressBook 
                  onAddressSelect={handleAddressSelect}
                  selectedAddressId={selectedAddress?.id}
                  onAddNewAddress={handleAddNewAddress}
                  selectionMode={true}
                />
                
                {selectedAddress && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-green-800">Delivery Address Selected</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p><strong>{selectedAddress.recipientName}</strong></p>
                      <p>{selectedAddress.recipientPhone}</p>
                      <p>{selectedAddress.fullAddress}</p>
                    </div>
                  </div>
                )}
                </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-xl font-bold text-organic-text mb-4">Payment Information</h2>
                
                <div className="mb-4">
                  <label className="block text-organic-text font-medium mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod" 
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Credit/Debit Card, UPI, Net Banking, Wallets (via Razorpay)
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-organic-text font-medium mb-2">Order Notes (Optional)</label>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-organic-primary text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Proceed to Payment • ${formatCurrency(getGrandTotal())}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-8 rounded-lg shadow-lg h-fit">
            <h2 className="text-xl font-bold text-organic-text mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-organic-text">{item.name}</h3>
                    <p className="text-sm text-organic-text opacity-75">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-organic-text">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-organic-text">Subtotal:</span>
                <span className="text-organic-text">{formatCurrency(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-organic-text">Tax:</span>
                <span className="text-organic-text">{formatCurrency(getTax())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-organic-text">Shipping:</span>
                <span className="text-organic-text">
                  {getShipping() === 0 ? "Free" : formatCurrency(getShipping())}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span className="text-organic-text">Total:</span>
                <span className="text-organic-text">{formatCurrency(getGrandTotal())}</span>
              </div>
            </div>

            <div className="mt-6 text-sm text-organic-text opacity-75">
              <p>• Free shipping on orders over ₹500</p>
              <p>• Secure checkout with SSL encryption</p>
              <p>• 7-day return policy</p>
            </div>
          </div>
        </div>
        )}

        {/* Address Form Modal */}
        {showAddressModal && (
          <AddressFormModal
            onClose={() => setShowAddressModal(false)}
            onSave={() => setShowAddressModal(false)}
          />
        )}
      </div>
    </div>
  );
}