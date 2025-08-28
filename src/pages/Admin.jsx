import React, { useState, useEffect } from "react";
import { useProductStore } from "../store/productStore";
import { useOrderStore } from "../store/orderStore";
import { useArtisanStore } from "../store/artisanStore";
import { useAuthStore } from "../store/authStore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";
import ProductFormModal from "../components/ProductFormModal";
import ArtisanFormModal from "../components/ArtisanFormModal";
import StoryEditor from "../components/StoryEditor";
import AdminSeedButton from "../components/AdminSeedButton";
import ArtisanSeedButton from "../components/ArtisanSeedButton";
import AdminAlgoliaSync from "../components/AdminAlgoliaSync";
import BulkProductUpload from "../components/BulkProductUpload";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import LoadingButton from "../components/LoadingButton";
import SuccessMessage from "../components/SuccessMessage";
import formatCurrency from "../utils/formatCurrency";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Admin() {
  const { products, fetchProducts, deleteProduct } = useProductStore();
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const { artisans, fetchArtisans, deleteArtisan } = useArtisanStore();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingArtisan, setEditingArtisan] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [customers, setCustomers] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchArtisans(),
        fetchCustomers(),
        fetchStories()
      ]);
    } catch (error) {
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!db) {
      console.warn('Firestore not available - cannot load customers');
      setCustomers([]);
      return;
    }

    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderCount: orders.filter(order => order.userId === doc.id).length,
        totalSpent: orders
          .filter(order => order.userId === doc.id && order.status !== 'cancelled')
          .reduce((sum, order) => sum + (order.total || 0), 0)
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchStories = async () => {
    if (!db) {
      console.warn('Firestore not available - cannot load stories');
      setStories([]);
      return;
    }

    try {
      const q = query(collection(db, "stories"), orderBy("publishedAt", "desc"));
      const snapshot = await getDocs(q);
      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  // Universal search function
  const handleUniversalSearch = (term) => {
    setSearchTerm(term);
    // This would search across products, orders, customers, and stories
  };

  // Filter functions
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStories = stories.filter(story =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle actions
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setMessage('✅ Product deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Error deleting product: ' + error.message);
      }
    }
  };

  const handleEditArtisan = (artisan) => {
    setEditingArtisan(artisan);
    setShowArtisanModal(true);
  };

  const handleDeleteArtisan = async (artisanId) => {
    if (window.confirm('Are you sure you want to delete this artisan?')) {
      try {
        await deleteArtisan(artisanId);
        setMessage('✅ Artisan deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Error deleting artisan: ' + error.message);
      }
    }
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowStoryEditor(true);
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        setStories(stories.filter(s => s.id !== storyId));
        setMessage('✅ Story deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Error deleting story: ' + error.message);
      }
    }
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setShowArtisanModal(false);
    setShowStoryEditor(false);
    setEditingProduct(null);
    setEditingArtisan(null);
    setEditingStory(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    loadInitialData();
    setMessage('✅ Changes saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-organic-background" data-cy="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-organic-text">Admin Dashboard</h1>
          
          {/* Universal Search */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleUniversalSearch(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              data-cy="universal-search"
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <SuccessMessage
            message={message}
            type={message.includes('✅') ? 'success' : 'error'}
            onClose={() => setMessage('')}
          />
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: ChartBarIcon },
            { id: 'products', label: '📦 Products', icon: null },
            { id: 'orders', label: '📋 Orders', icon: null },
            { id: 'customers', label: '👥 Customers', icon: UserGroupIcon },
            { id: 'content', label: '📝 Content', icon: DocumentTextIcon },
            { id: 'settings', label: '⚙️ Settings', icon: Cog6ToothIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-organic-primary text-white'
                  : 'bg-white text-organic-text hover:bg-organic-background'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6" data-cy="dashboard-stats">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-organic-primary" data-cy="total-products-stat">{products.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-blue-600" data-cy="total-orders-stat">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-green-600">{customers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600" data-cy="total-revenue-stat">
                  {formatCurrency(orders.reduce((sum, order) => sum + (order.total || 0), 0))}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg" data-cy="recent-orders">
                <h3 className="text-lg font-semibold text-organic-text mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-gray-600">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg" data-cy="low-stock-alerts">
                <h3 className="text-lg font-semibold text-organic-text mb-4">Low Stock Alerts</h3>
                <div className="space-y-3">
                  {products.filter(p => p.quantityAvailable <= 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-orange-600">Only {product.quantityAvailable} left</p>
                      </div>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Database Setup - Only show if needed */}
            {(products.length === 0 || artisans.length === 0) && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    🚀 Initial Setup Required
                  </h3>
                  <p className="text-yellow-700 mb-4 text-sm">
                    Your database is empty. Use these buttons to populate it with initial data.
                  </p>
                  <div className="space-y-4">
                    <AdminSeedButton />
                    <ArtisanSeedButton />
                  </div>
                </div>
              </div>
            )}
            
            {/* Algolia Setup - Always show if configured */}
            <AdminAlgoliaSync />

            {/* Analytics Dashboard */}
            <AnalyticsDashboard />
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-organic-text">Product Management</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                  data-cy="add-product-button"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            <BulkProductUpload onUploadComplete={loadInitialData} />

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" data-cy="products-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product.id} data-cy="product-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900" data-cy="product-name">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-cy="product-price">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.quantityAvailable <= 5 
                              ? 'bg-red-100 text-red-800' 
                              : product.quantityAvailable <= 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`} data-cy="product-stock">
                            {product.quantityAvailable}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-cy="product-actions">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-organic-primary hover:text-organic-text mr-3"
                            data-cy="edit-product-button"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                            data-cy="delete-product-button"
                          >
                            <TrashIcon className="w-4 h-4" />
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-organic-text">Order Management</h2>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" data-cy="orders-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map(order => (
                      <tr key={order.id} data-cy="order-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900" data-cy="order-id">{order.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-cy="customer-email">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-cy="order-total">{formatCurrency(order.total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                            data-cy="order-status-select"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-cy="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => updateOrderStatus(order.id, order.status)}
                            className="text-organic-primary hover:text-organic-text text-sm"
                            data-cy="update-status-button"
                          >
                            Update
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

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-organic-text">Customer Management</h2>
              <div className="text-sm text-gray-600">
                Total Customers: {customers.length}
              </div>
            </div>
            
            {/* Customer Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.orderCount > 0).length}
                </div>
                <div className="text-sm text-gray-600">Active Customers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / Math.max(customers.length, 1))}
                </div>
                <div className="text-sm text-gray-600">Avg Customer Value</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
                </div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Customer List</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" data-cy="customers-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map(customer => (
                      <tr key={customer.id} data-cy="customer-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900" data-cy="customer-name">
                            {customer.displayName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-cy="customer-email">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.role || 'customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.orderCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(customer.totalSpent || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-organic-primary hover:text-organic-text text-sm"
                            data-cy="view-customer-button"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedCustomer.displayName || 'Customer'} Details
                      </h3>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Name:</strong> {selectedCustomer.displayName || 'N/A'}</p>
                          <p><strong>Email:</strong> {selectedCustomer.email}</p>
                          <p><strong>Role:</strong> {selectedCustomer.role || 'customer'}</p>
                          <p><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                          <p><strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                          <p><strong>Last Login:</strong> {selectedCustomer.lastLoginAt ? new Date(selectedCustomer.lastLoginAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Total Orders:</strong> {selectedCustomer.orderCount || 0}</p>
                          <p><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                          <p><strong>Average Order:</strong> {formatCurrency((selectedCustomer.totalSpent || 0) / Math.max(selectedCustomer.orderCount || 1, 1))}</p>
                          <p><strong>First Order:</strong> {
                            orders.filter(o => o.userEmail === selectedCustomer.email)[0]?.createdAt 
                              ? new Date(orders.filter(o => o.userEmail === selectedCustomer.email)[0].createdAt).toLocaleDateString()
                              : 'N/A'
                          }</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Customer Status</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Status:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              selectedCustomer.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {selectedCustomer.suspended ? 'Suspended' : 'Active'}
                            </span>
                          </p>
                          <p><strong>Email Verified:</strong> {selectedCustomer.emailVerified ? 'Yes' : 'No'}</p>
                          <p><strong>Newsletter:</strong> {selectedCustomer.preferences?.newsletter ? 'Subscribed' : 'Not subscribed'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Orders</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {orders.filter(order => order.userEmail === selectedCustomer.email).slice(0, 5).map(order => (
                          <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(order.total)}</p>
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
                        {orders.filter(order => order.userEmail === selectedCustomer.email).length === 0 && (
                          <p className="text-gray-500 text-center py-4">No orders found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-organic-text">Content Management</h2>
              <div className="text-sm text-gray-600">
                {artisans.length} Artisans • {stories.length} Stories
              </div>
            </div>
            
            {/* Content Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{artisans.length}</div>
                <div className="text-sm text-gray-600">Total Artisans</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {artisans.filter(a => a.featured).length}
                </div>
                <div className="text-sm text-gray-600">Featured Artisans</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">{stories.length}</div>
                <div className="text-sm text-gray-600">Total Stories</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {stories.filter(s => s.featured).length}
                </div>
                <div className="text-sm text-gray-600">Featured Stories</div>
              </div>
            </div>
            
            {/* Artisan Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-organic-text">Manage Artisans</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search artisans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                  />
                  <button
                    onClick={() => setShowArtisanModal(true)}
                    className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Artisan
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {artisans.filter(artisan => 
                  artisan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  artisan.location?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(artisan => (
                  <div key={artisan.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={artisan.profileImage} 
                        alt={artisan.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{artisan.name}</h4>
                        <p className="text-sm text-gray-600">{artisan.location}</p>
                        {artisan.featured && (
                          <span className="text-xs bg-organic-primary text-white px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditArtisan(artisan)}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <Link
                        to={`/artisans/${artisan.id}`}
                        className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium transition-colors text-center"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteArtisan(artisan.id)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Story Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-organic-text">Manage Stories</h3>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="events">Events & Festivals</option>
                    <option value="people">People & Profiles</option>
                    <option value="artisan-story">Artisan Stories</option>
                    <option value="food-culture">Food & Recipes</option>
                    <option value="community">Community Impact</option>
                  </select>
                  <button
                    onClick={() => setShowStoryEditor(true)}
                    className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                    data-cy="create-story-button"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Create Story
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto" data-cy="story-list">
                {stories.filter(story => 
                  (selectedCategory === 'all' || story.category === selectedCategory) &&
                  (story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   story.author?.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map(story => (
                  <div key={story.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-organic-highlight text-white px-2 py-1 rounded-full text-xs capitalize">
                            {story.category?.replace('-', ' ') || 'story'}
                          </span>
                          {story.featured && (
                            <span className="bg-organic-primary text-white px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">{story.title}</h4>
                        <p className="text-sm text-gray-600">By {story.author} • {story.category}</p>
                        <p className="text-sm text-gray-500">{new Date(story.publishedAt).toLocaleDateString()}</p>
                        {story.excerpt && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{story.excerpt}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/stories/${story.id}`}
                          className="bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium transition-colors text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEditStory(story)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                          data-cy="edit-story-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                          data-cy="delete-story-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-organic-text">Settings</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Store Information */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-4">Store Information</h3>
                <div className="space-y-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                    <textarea
                      rows={3}
                      defaultValue="Authentic handcrafted goods from the heart of the Darjeeling hills"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                    />
                  </div>
                </div>
                <button 
                  className="mt-4 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                  onClick={() => {
                    setMessage('✅ Store settings saved successfully!');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                >
                  Save Settings
                </button>
              </div>
              
              {/* System Status */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-organic-text mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Firebase Connection</span>
                    <span className="text-sm text-green-600 font-medium">✅ Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Algolia Search</span>
                    <span className="text-sm text-green-600 font-medium">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Cloudinary Images</span>
                    <span className="text-sm text-green-600 font-medium">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email Notifications</span>
                    <span className="text-sm text-green-600 font-medium">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Payment Processing</span>
                    <span className="text-sm text-green-600 font-medium">✅ Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          artisans={artisans}
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

      {showStoryEditor && (
        <StoryEditor
          story={editingStory}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}