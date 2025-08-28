// Centralized API Service for consistent error handling and request management
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Add authentication token to headers
  getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return token ? { ...this.defaultHeaders, Authorization: `Bearer ${token}` } : this.defaultHeaders;
  }

  // Generic request method with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails, use empty object
          }
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Network error: Please check your internet connection');
      }
      
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Specialized methods for common operations
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...this.getAuthHeaders(),
        'Content-Type': undefined,
      },
    });
  }

  // Razorpay specific methods
  async createRazorpayOrder(orderData) {
    return this.post('/api/razorpay/create-order', orderData);
  }

  async verifyRazorpayPayment(paymentData) {
    return this.post('/api/razorpay/verify-payment', paymentData);
  }

  async processRefund(refundData) {
    return this.post('/api/razorpay/refund', refundData);
  }

  // Product methods
  async getProducts(filters = {}) {
    return this.get('/api/products', filters);
  }

  async getProduct(id) {
    return this.get(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/api/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/api/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/api/products/${id}`);
  }

  // Order methods
  async createOrder(orderData) {
    return this.post('/api/orders', orderData);
  }

  async getOrders(filters = {}) {
    return this.get('/api/orders', filters);
  }

  async updateOrderStatus(orderId, status, additionalData = {}) {
    return this.put(`/api/orders/${orderId}/status`, { status, ...additionalData });
  }

  // User methods
  async getUserProfile(userId) {
    return this.get(`/api/users/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.put(`/api/users/${userId}`, profileData);
  }

  // Contact form
  async submitContactForm(formData) {
    return this.post('/api/contact', formData);
  }
}

export const apiService = new ApiService();
export default apiService;