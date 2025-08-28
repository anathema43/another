import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useOrderStore } from "../store/orderStore";
import { useWishlistStore } from "../store/wishlistStore";
import UserProfileEditor from "../components/UserProfileEditor";

export default function AccountPage() {
  const { currentUser, userProfile, logout } = useAuthStore();
  const { userOrders } = useOrderStore();
  const { wishlist } = useWishlistStore();
  const [activeTab, setActiveTab] = React.useState('overview');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-organic-text mb-4">Please login to view your account</h2>
          <Link 
            to="/login" 
            className="bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-organic-background py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-organic-text">My Account</h1>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'profile', label: 'Edit Profile' },
                { id: 'orders', label: 'Orders' },
                { id: 'wishlist', label: 'Wishlist' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-organic-primary text-organic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-organic-text mb-4">Profile Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-organic-text opacity-75">Name</label>
                      <p className="text-organic-text">{currentUser.displayName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-organic-text opacity-75">Email</label>
                      <p className="text-organic-text">{currentUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-organic-text opacity-75">Member Since</label>
                      <p className="text-organic-text">
                        {userProfile?.createdAt ? 
                          new Date(userProfile.createdAt).toLocaleDateString() : 
                          'Recently joined'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="mt-6 bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-organic-text mb-4">Account Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-organic-background p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-organic-primary">{userOrders?.length || 0}</p>
                      <p className="text-sm text-organic-text opacity-75">Total Orders</p>
                    </div>
                    <div className="bg-organic-background p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-organic-highlight">{wishlist?.length || 0}</p>
                      <p className="text-sm text-organic-text opacity-75">Wishlist Items</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <UserProfileEditor />
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-organic-text mb-4">Recent Orders</h2>
                {userOrders && userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items • ₹{order.total}
                        </p>
                      </div>
                    ))}
                    <Link 
                      to="/orders" 
                      className="inline-block text-organic-primary hover:text-organic-text font-medium"
                    >
                      View All Orders →
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">No orders yet.</p>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-semibold text-organic-text mb-4">Wishlist</h2>
                <p className="text-gray-600 mb-4">
                  You have {wishlist?.length || 0} items in your wishlist.
                </p>
                <Link 
                  to="/wishlist" 
                  className="inline-block bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  View Wishlist
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Only show on overview tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              to="/orders" 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-organic-text mb-2">My Orders</h3>
              <p className="text-organic-text opacity-75 text-sm">View and track your orders</p>
            </Link>
            
            <Link 
              to="/wishlist" 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-organic-highlight rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-organic-text mb-2">My Wishlist</h3>
              <p className="text-organic-text opacity-75 text-sm">Manage your saved items</p>
            </Link>
            
            <Link 
              to="/shop" 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-organic-text mb-2">Continue Shopping</h3>
              <p className="text-organic-text opacity-75 text-sm">Discover more products</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}