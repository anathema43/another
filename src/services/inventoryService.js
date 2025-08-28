import { useInventoryStore } from '../store/inventoryStore';

export const inventoryService = {
  initializeInventory: async (productId, initialQuantity) => {
    await useInventoryStore.getState().updateInventory(productId, initialQuantity, 'set');
  },
  checkAvailability: async (productId) => {
    const status = useInventoryStore.getState().getInventoryStatus([productId])[0];
    return status ? status.available : 0;
  }
};