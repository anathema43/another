import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import RazorpayCheckout from "../components/RazorpayCheckout";
import formatCurrency from "../utils/formatCurrency";
import LoadingSpinner from "../components/LoadingSpinner";
import emailService from "../services/emailService";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getSubtotal, getTax, getShipping, getGrandTotal, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { currentUser } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nepal",
    
    // Payment Information
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    
    // Order Notes
    orderNotes: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
    
    for (let field of required) {
      if (!formData[field].trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.paymentMethod === 'card') {
      const cardRequired = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
      for (let field of cardRequired) {
        if (!formData[field].trim()) {
          setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
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
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
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

      if (formData.paymentMethod === 'card') {
        // Proceed to Stripe payment
        setPaymentStep(true);
      } else {
        // Handle other payment methods (COD, etc.)
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
                  shippingInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
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
                <h2 className="text-xl font-bold text-organic-text mb-4">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-organic-text font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-organic-text font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-organic-text font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-organic-text font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-organic-text font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-organic-text font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-organic-text font-medium mb-2">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-organic-text font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
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
                      Razorpay (Cards, UPI, Net Banking, Wallets)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Cash on Delivery
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
                {loading ? "Processing..." : `${formData.paymentMethod === 'card' ? 'Proceed to Payment' : 'Place Order'} - ${formatCurrency(getGrandTotal())}`}
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
      </div>
    </div>
  );
}