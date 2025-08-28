import React, { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import { useOrderStore } from '../store/orderStore';
import { useArtisanStore } from '../store/artisanStore';
import { useAuthStore } from '../store/authStore';
import ProductFormModal from '../components/ProductFormModal';
import ArtisanFormModal from '../components/ArtisanFormModal';
import BulkProductUpload from '../components/BulkProductUpload';
import AdminSeedButton from '../components/AdminSeedButton';
import ArtisanSeedButton from '../components/ArtisanSeedButton';
import StoryEditor from '../components/StoryEditor';
import AdminAlgoliaSync from '../components/AdminAlgoliaSync';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import formatCurrency from '../utils/formatCurrency';
import { db } from '../firebase/firebase';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Admin() {
  const { currentUser, userProfile } = useAuthStore();
  const { products, fetchProducts, updateProduct, deleteProduct } = useProductStore();
  const { orders: orderStoreOrders, fetchOrders: fetchOrdersFromStore, updateOrderStatus: updateOrderStatusInStore } = useOrderStore();
  const { artisans: artisanStoreArtisans, fetchArtisans: fetchArtisansFromStore, deleteArtisan } = useArtisanStore();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingArtisan, setEditingArtisan] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Use data from appropriate stores
  const displayProducts = products.length > 0 ? products : [];
  const displayOrders = orderStoreOrders.length > 0 ? orderStoreOrders : [];
  const displayArtisans = artisanStoreArtisans.length > 0 ? artisanStoreArtisans : [];
  const displayStories = stories.length > 0 ? stories : [];

  useEffect(() => {
    // Fetch data when component mounts
    const loadData = async () => {
      try {
        await fetchProducts();
        await fetchOrdersFromStore();
        await fetchArtisansFromStore();
        await fetchStories();
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadData();
  }, [fetchProducts, fetchOrdersFromStore, fetchArtisansFromStore]);

  // Fetch stories
  const fetchStories = async () => {
    try {
      if (!db) return;
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'stories'));
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  // Check admin access
  if (!currentUser || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-organic-text mb-6">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-gray-600">Admin access is controlled server-side via Firestore user documents.</p>
        </div>
      </div>
    );
  }

  // Filter functions
  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = displayOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesStatus;
  });

  // Get unique categories
  const categories = [...new Set(displayProducts.map(p => p.category))];

  // Calculate dashboard stats
  const dashboardStats = {
    totalProducts: displayProducts.length,
    totalOrders: displayOrders.length,
    totalArtisans: displayArtisans.length,
    totalRevenue: displayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
    newOrders: displayOrders.filter(o => o.status === 'processing').length,
    lowStockItems: displayProducts.filter(p => p.quantityAvailable <= 5).length
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleEditArtisan = (artisan) => {
    setEditingArtisan(artisan);
    setShowArtisanModal(true);
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowStoryModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
    }
  };

  const handleDeleteArtisan = async (artisanId) => {
    if (window.confirm('Are you sure you want to delete this artisan?')) {
      try {
        await deleteArtisan(artisanId);
      } catch (error) {
        alert('Error deleting artisan: ' + error.message);
      }
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        if (!db) return;
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'stories', storyId));
        setStories(stories.filter(s => s.id !== storyId));
      } catch (error) {
        alert('Error deleting story: ' + error.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusInStore(orderId, newStatus);
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setShowArtisanModal(false);
    setShowStoryModal(false);
    setEditingProduct(null);
    setEditingArtisan(null);
    setEditingStory(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    // Refresh data
    fetchProducts();
    fetchArtisansFromStore();
    fetchStories();
  };

  return (
    <div className="min-h-screen bg-organic-background" data-cy="admin-panel">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-organic-text">Admin Dashboard</h1>
            <p className="text-organic-text opacity-75">Manage your Darjeeling Souls store</p>
          </div>
          <div className="text-sm text-organic-text opacity-75">
            Welcome, {currentUser.displayName || currentUser.email}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
                { id: 'products', label: 'Products', icon: ShoppingBagIcon },
                { id: 'orders', label: 'Orders', icon: CurrencyDollarIcon },
                { id: 'artisans', label: 'Artisans', icon: UsersIcon },
                { id: 'stories', label: 'Stories', icon: ChartBarIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-organic-primary text-organic-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Products</p>
                        <p className="text-2xl font-bold text-blue-700">{dashboardStats.totalProducts}</p>
                      </div>
                      <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Orders</p>
                        <p className="text-2xl font-bold text-green-700">{dashboardStats.totalOrders}</p>
                      </div>
                      <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-purple-700">{formatCurrency(dashboardStats.totalRevenue)}</p>
                      </div>
                      <ChartBarIcon className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Low Stock Items</p>
                        <p className="text-2xl font-bold text-orange-700">{dashboardStats.lowStockItems}</p>
                      </div>
                      <EyeIcon className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Seed Buttons */}
                <div className="space-y-4">
                  <AdminSeedButton />
                  <ArtisanSeedButton />
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-organic-text mb-4">Recent Orders</h3>
                  {displayOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber || order.id}</p>
                        <p className="text-sm text-gray-600">{order.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total || 0)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <h2 className="text-xl font-semibold text-organic-text">Product Management</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Single Product
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600 flex items-center">
                    {filteredProducts.length} of {displayProducts.length} products
                  </div>
                </div>

                {/* Bulk Upload */}
                <BulkProductUpload onUploadComplete={() => fetchProducts()} />

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium text-organic-text">{product.name}</p>
                                  <p className="text-sm text-gray-600">{product.sku || 'No SKU'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="capitalize text-organic-text">{product.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-organic-text">{formatCurrency(product.price)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                product.quantityAvailable > 10 ? 'bg-green-100 text-green-800' :
                                product.quantityAvailable > 5 ? 'bg-yellow-100 text-yellow-800' :
                                product.quantityAvailable > 0 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {product.quantityAvailable || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit Product"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Product"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-organic-text">Order Management</h2>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                  >
                    <option value="all">All Orders</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-organic-text">#{order.orderNumber || order.id}</p>
                              <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-organic-text">{order.userEmail}</p>
                              <p className="text-sm text-gray-600">{order.shipping?.firstName} {order.shipping?.lastName}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-organic-text">{formatCurrency(order.total || 0)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                title="View Order Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Artisans Tab */}
            {activeTab === 'artisans' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-organic-text">Artisan Management</h2>
                  <button
                    onClick={() => setShowArtisanModal(true)}
                    className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Artisan
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayArtisans.map(artisan => (
                    <div key={artisan.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={artisan.profileImage} 
                        alt={artisan.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-organic-text">{artisan.name}</h3>
                            <p className="text-sm text-gray-600">{artisan.title}</p>
                            <p className="text-xs text-gray-500">{artisan.location}</p>
                          </div>
                          {artisan.featured && (
                            <span className="bg-organic-primary text-white px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleEditArtisan(artisan)}
                            className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArtisan(artisan.id)}
                            className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories Tab */}
            {activeTab === 'stories' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-organic-text">Story Management</h2>
                  <button
                    onClick={() => setShowStoryModal(true)}
                    className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Story
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Story</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {displayStories.map(story => (
                          <tr key={story.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {story.featuredImage ? (
                                  <img 
                                    src={story.featuredImage} 
                                    alt={story.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-organic-text">{story.title}</p>
                                  <p className="text-sm text-gray-600">{story.readTime}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-organic-text">{story.author}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="capitalize text-organic-text">{story.category?.replace('-', ' ')}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {story.featured && (
                                  <span className="bg-organic-primary text-white px-2 py-1 text-xs rounded-full">
                                    Featured
                                  </span>
                                )}
                                <span className="text-sm text-gray-600">Published</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditStory(story)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit Story"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStory(story.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Story"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-organic-text">Analytics Dashboard</h2>
                {displayOrders.length > 0 ? (
                  <AdvancedAnalytics />
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Analytics Dashboard</h3>
                    <p className="text-blue-700 mb-4">
                      Analytics will be available once you have orders in your system.
                    </p>
                    <p className="text-blue-600 text-sm">
                      Create some test orders or wait for customer orders to see analytics data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-organic-text">System Settings</h2>
                
                {/* Algolia Sync */}
                <AdminAlgoliaSync />

                {/* Store Information */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-organic-text mb-4">Store Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                      <input
                        type="text"
                        defaultValue="Darjeeling Souls"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                      <input
                        type="email"
                        defaultValue="support@darjeelingsouls.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-organic-text mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-organic-text">Firebase Connection</span>
                      <span className="text-green-600 font-medium">✅ Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-organic-text">Payment Gateway</span>
                      <span className="text-green-600 font-medium">✅ Razorpay Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-organic-text">Email Notifications</span>
                      <span className="text-green-600 font-medium">✅ Configured</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          artisans={displayArtisans}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {showArtisanModal && (
        <ArtisanFormModal
          artisan={editingArtisan}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {showStoryModal && (
        <StoryEditor
          story={editingStory}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}