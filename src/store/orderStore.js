import { create } from "zustand";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";

export const useOrderStore = create((set, get) => ({
  orders: [],
  userOrders: [],
  loading: false,
  error: null,

  // Fetch all orders (admin only)
  fetchOrders: async (userId = null) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, "orders"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      }
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      if (userId) {
        set({ userOrders: orders, loading: false });
      } else {
        set({ orders, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch user-specific orders
  fetchUserOrders: async () => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) return;
    
    await get().fetchOrders(currentUser.uid);
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },
  addOrder: async (order) => {
    set({ error: null });
    try {
      const orderData = {
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "orders"), orderData);
      const newOrder = { ...orderData, id: docRef.id };
      
      set({ 
        orders: [...get().orders, newOrder],
        userOrders: [...get().userOrders, newOrder]
      });
      
      return docRef.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  createOrder: async (orderData) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error("User not authenticated");
    
    const order = {
      ...orderData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      status: "processing",
      orderNumber: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    try {
      const orderId = await get().addOrder(order);
      return { ...order, id: orderId };
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (id, status, additionalData = {}) => {
    set({ error: null });
    try {
      const updateData = {
        status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      };
      
      await updateDoc(doc(db, "orders", id), updateData);
      
      // Get the updated order for email notifications
      const updatedOrder = get().orders.find(order => order.id === id) || 
                          get().userOrders.find(order => order.id === id);
      
      if (updatedOrder) {
        // Send status update email
        try {
          const { emailService } = await import('../services/emailService');
          await emailService.sendOrderStatusUpdate({ ...updatedOrder, ...updateData }, status);
        } catch (emailError) {
          console.error('Error sending status update email:', emailError);
        }
      }
      
      set({
        orders: get().orders.map(order =>
          order.id === id ? { ...order, ...updateData } : order
        ),
        userOrders: get().userOrders.map(order =>
          order.id === id ? { ...order, ...updateData } : order
        ),
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Calculate order statistics (for admin)
  getOrderStats: () => {
    const { orders } = get();
    
    const stats = {
      total: orders.length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
    
    return stats;
  },

  clearError: () => set({ error: null }),
}));
