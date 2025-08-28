import { create } from "zustand";
import { 
  doc, 
  updateDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { emailService } from "../services/emailService";

export const useInventoryStore = create((set, get) => ({
  inventory: {},
  lowStockItems: [],
  loading: false,
  error: null,
  listeners: {},

  // Initialize real-time inventory tracking for a product
  trackProduct: (productId) => {
    const { listeners } = get();
    
    // Don't create duplicate listeners
    if (listeners[productId]) return;

    const unsubscribe = onSnapshot(
      doc(db, "products", productId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          set(state => ({
            inventory: {
              ...state.inventory,
              [productId]: {
                available: data.quantityAvailable || 0,
                reserved: data.reservedQuantity || 0,
                total: data.inventory || 0,
                lastUpdated: new Date().toISOString()
              }
            }
          }));

          // Check for low stock
          get().checkLowStock(productId, data);
        }
      },
      (error) => {
        console.error("Error tracking product inventory:", error);
        set({ error: error.message });
      }
    );

    set(state => ({
      listeners: {
        ...state.listeners,
        [productId]: unsubscribe
      }
    }));
  },

  // Stop tracking a product
  untrackProduct: (productId) => {
    const { listeners } = get();
    if (listeners[productId]) {
      listeners[productId]();
      set(state => ({
        listeners: Object.fromEntries(
          Object.entries(state.listeners).filter(([id]) => id !== productId)
        )
      }));
    }
  },

  // Update product inventory
  updateInventory: async (productId, quantityChange, operation = 'subtract') => {
    set({ error: null });
    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const currentData = productDoc.data();
      const currentQuantity = currentData.quantityAvailable || 0;
      
      let newQuantity;
      if (operation === 'subtract') {
        newQuantity = Math.max(0, currentQuantity - quantityChange);
      } else if (operation === 'add') {
        newQuantity = currentQuantity + quantityChange;
      } else {
        newQuantity = quantityChange; // Direct set
      }

      await updateDoc(productRef, {
        quantityAvailable: newQuantity,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      set(state => ({
        inventory: {
          ...state.inventory,
          [productId]: {
            ...state.inventory[productId],
            available: newQuantity,
            lastUpdated: new Date().toISOString()
          }
        }
      }));

      // Check for low stock after update
      await get().checkLowStock(productId, { ...currentData, quantityAvailable: newQuantity });

      return newQuantity;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Reserve inventory for pending orders
  reserveInventory: async (productId, quantity) => {
    set({ error: null });
    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const currentData = productDoc.data();
      const available = currentData.quantityAvailable || 0;
      const reserved = currentData.reservedQuantity || 0;

      if (available < quantity) {
        throw new Error("Insufficient inventory");
      }

      await updateDoc(productRef, {
        quantityAvailable: available - quantity,
        reservedQuantity: reserved + quantity,
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Release reserved inventory (e.g., when order is cancelled)
  releaseReservedInventory: async (productId, quantity) => {
    set({ error: null });
    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const currentData = productDoc.data();
      const available = currentData.quantityAvailable || 0;
      const reserved = currentData.reservedQuantity || 0;

      await updateDoc(productRef, {
        quantityAvailable: available + quantity,
        reservedQuantity: Math.max(0, reserved - quantity),
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Check for low stock and send alerts
  checkLowStock: async (productId, productData, threshold = 5) => {
    const quantity = productData.quantityAvailable || 0;
    
    if (quantity <= threshold && quantity > 0) {
      // Add to low stock items
      set(state => ({
        lowStockItems: [
          ...state.lowStockItems.filter(item => item.id !== productId),
          {
            id: productId,
            name: productData.name,
            quantity,
            threshold,
            lastAlerted: new Date().toISOString()
          }
        ]
      }));

      // Send email alert (with rate limiting)
      try {
        const lastAlerted = get().lowStockItems.find(item => item.id === productId)?.lastAlerted;
        const now = new Date();
        const lastAlertTime = lastAlerted ? new Date(lastAlerted) : null;
        
        // Only send alert if it's been more than 24 hours since last alert
        if (!lastAlertTime || (now - lastAlertTime) > 24 * 60 * 60 * 1000) {
          await emailService.sendLowStockAlert(productData, threshold);
        }
      } catch (error) {
        console.error("Error sending low stock alert:", error);
      }
    } else if (quantity > threshold) {
      // Remove from low stock items if quantity is back above threshold
      set(state => ({
        lowStockItems: state.lowStockItems.filter(item => item.id !== productId)
      }));
    }
  },

  // Get all low stock products
  fetchLowStockProducts: async (threshold = 5) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "products"),
        where("quantityAvailable", "<=", threshold),
        where("quantityAvailable", ">", 0)
      );
      
      const snapshot = await getDocs(q);
      const lowStockItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        threshold
      }));
      
      set({ lowStockItems, loading: false });
      return lowStockItems;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Bulk update inventory
  bulkUpdateInventory: async (updates) => {
    set({ loading: true, error: null });
    try {
      const updatePromises = updates.map(async ({ productId, quantity, operation = 'set' }) => {
        return get().updateInventory(productId, quantity, operation);
      });
      
      await Promise.all(updatePromises);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get inventory status for multiple products
  getInventoryStatus: (productIds) => {
    const { inventory } = get();
    return productIds.map(id => ({
      productId: id,
      ...inventory[id],
      isLowStock: inventory[id]?.available <= 5,
      isOutOfStock: inventory[id]?.available === 0
    }));
  },

  // Clean up all listeners
  cleanup: () => {
    const { listeners } = get();
    Object.values(listeners).forEach(unsubscribe => unsubscribe());
    set({ listeners: {} });
  },

  clearError: () => set({ error: null }),
}));

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useInventoryStore.getState().cleanup();
  });
}