import React, { useEffect } from "react";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import formatCurrency from "../utils/formatCurrency";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

export default function Orders() {
  const { userOrders, loading, fetchUserOrders } = useOrderStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser, fetchUserOrders]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-organic-background py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-organic-text">My Orders</h1>
          <Link 
            to="/account"
            className="text-organic-primary hover:text-organic-text font-medium"
          >
            ← Back to Account
          </Link>
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-organic-text mb-2">No Orders Yet</h2>
            <p className="text-organic-text opacity-75 mb-6">You haven't placed any orders yet.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-organic-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div>
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-organic-text mb-4">Order Summary</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-organic-primary">{userOrders.length}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {userOrders.filter(o => o.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {userOrders.filter(o => o.status === 'shipped').length}
                  </p>
                  <p className="text-sm text-gray-600">Shipped</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {userOrders.filter(o => o.status === 'processing').length}
                  </p>
                  <p className="text-sm text-gray-600">Processing</p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
            {userOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-organic-text">
                      Order #{order.orderNumber || order.id}
                    </h3>
                    <p className="text-organic-text opacity-75">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-organic-text">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-organic-text mb-3">Items Ordered:</h4>
                  <div className="space-y-3">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-organic-text">{item.name}</p>
                          <p className="text-sm text-organic-text opacity-75">
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-medium text-organic-text">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                {order.shippingInfo && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-organic-text mb-2">Shipping Address:</h4>
                    <div className="text-organic-text opacity-75">
                      <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p>{order.shippingInfo.address}</p>
                      <p>{order.shippingInfo.city}, {order.shippingInfo.zipCode}</p>
                      {order.shippingInfo.phone && <p>Phone: {order.shippingInfo.phone}</p>}
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-organic-text mb-2">Tracking Information:</h4>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-blue-800 font-medium">Tracking Number: {order.trackingNumber}</p>
                      <p className="text-blue-600 text-sm">Your order is on its way!</p>
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="border-t pt-4 mt-4 flex gap-3">
                  <button className="text-organic-primary hover:text-organic-text font-medium text-sm">
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button className="text-organic-primary hover:text-organic-text font-medium text-sm">
                      Leave Review
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                      Cancel Order
                    </button>
                  )}
                  <button className="text-organic-primary hover:text-organic-text font-medium text-sm">
                    Reorder Items
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}