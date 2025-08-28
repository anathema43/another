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
import AdvancedAnalytics from "../components/AdvancedAnalytics";
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
  const [selectedCustomerSegment, setSelectedCustomerSegment] = useState('all');
  const [communicationHistory, setCommunicationHistory] = useState({});

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
          .reduce((sum, order) => sum + (order.total || 0), 0),
        lastOrderDate: orders
          .filter(order => order.userId === doc.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt,
        firstOrderDate: orders
          .filter(order => order.userId === doc.id)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt
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

  // Customer segmentation logic
  const getCustomerSegment = (customer) => {
    const totalSpent = customer.totalSpent || 0;
    const orderCount = customer.orderCount || 0;
    const daysSinceLastOrder = customer.lastOrderDate 
      ? (Date.now() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (totalSpent > 1500 && orderCount >= 3) return 'Champions';
    if (totalSpent >= 800 && orderCount >= 2 && totalSpent <= 1500) return 'Loyal';
    if (orderCount === 1 && totalSpent >= 500) return 'Potential';
    if (orderCount === 1 && totalSpent < 500) return 'New';
    if (daysSinceLastOrder > 60 && orderCount > 1) return 'At Risk';
    if (daysSinceLastOrder > 120) return 'Lost';
    return 'New';
  };

  const getSegmentColor = (segment) => {
    const colors = {
      'Champions': 'bg-green-100 text-green-800',
      'Loyal': 'bg-blue-100 text-blue-800',
      'Potential': 'bg-purple-100 text-purple-800',
      'New': 'bg-yellow-100 text-yellow-800',
      'At Risk': 'bg-orange-100 text-orange-800',
      'Lost': 'bg-red-100 text-red-800'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  const getSegmentDescription = (segment) => {
    const descriptions = {
      'Champions': 'High value, frequent buyers',
      'Loyal': 'Regular buyers with good value',
      'Potential': 'Recent customers with good first purchase',
      'New': 'First-time buyers',
      'At Risk': 'Haven\'t purchased recently',
      'Lost': 'Long-time inactive customers'
    };
    return descriptions[segment] || 'Customer';
  };

  // Customer action handlers
  const handleCustomerAction = async (customerId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;
    
    try {
      if (!db) {
        setMessage(`✅ Demo mode - Customer would be ${action}d in production`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const customerRef = doc(db, 'users', customerId);
      
      switch (action) {
        case 'suspend':
          await updateDoc(customerRef, { 
            suspended: true, 
            suspendedAt: new Date().toISOString(),
            suspendedBy: currentUser.uid
          });
          setMessage('✅ Customer suspended successfully');
          break;
        case 'activate':
          await updateDoc(customerRef, { 
            suspended: false, 
            activatedAt: new Date().toISOString(),
            activatedBy: currentUser.uid
          });
          setMessage('✅ Customer activated successfully');
          break;
      }
      
      // Refresh customer data
      await fetchCustomers();
      setSelectedCustomer(null);
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordReset = async (email) => {
    try {
      if (!auth) {
        setMessage('✅ Demo mode - Password reset email would be sent in production');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset email sent successfully');
      
      // Log communication
      logCommunication(email, 'Password Reset', 'Password reset email sent');
      
    } catch (error) {
      setMessage(`❌ Error sending password reset: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendEmail = async (email) => {
    const subject = prompt('Enter email subject:');
    const message = prompt('Enter email message:');
    
    if (!subject || !message) return;
    
    try {
      // In production, this would use your email service
      setMessage('✅ Demo mode - Email would be sent in production');
      
      // Log communication
      logCommunication(email, 'Admin Email', subject);
      
    } catch (error) {
      setMessage(`❌ Error sending email: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const logCommunication = (email, type, subject) => {
    setCommunicationHistory(prev => ({
      ...prev,
      [email]: [
        ...(prev[email] || []),
        {
          type,
          subject,
          date: new Date().toISOString(),
          sentBy: currentUser.uid
        }
      ].slice(-10) // Keep last 10 communications
    }));
  };

  const getCommunicationHistory = (email) => {
    return communicationHistory[email] || [];
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
    customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(customer => {
    if (selectedCustomerSegment === 'all') return true;
    const segment = getCustomerSegment(customer);
    return segment.toLowerCase().includes(selectedCustomerSegment);
  });

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
    