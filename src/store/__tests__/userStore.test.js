import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserStore } from '../userStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
}))

vi.mock('./authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { uid: 'test-user-123', email: 'test@example.com' }
    }))
  }
}))

describe('UserStore Address Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ addresses: [], loading: false, error: null });
  });

  it('should initialize with empty addresses', () => {
    const { addresses, loading, error } = useUserStore.getState();
    
    expect(addresses).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('fetchAddresses', () => {
    it('should fetch user addresses from Firestore', async () => {
      const { getDoc } = require('firebase/firestore');
      const mockAddresses = [
        {
          id: 'addr_1',
          label: 'Home',
          recipientName: 'John Doe',
          recipientPhone: '+91 9876543210',
          fullAddress: '123 Test Street, Test City, 123456',
          isDefault: true
        }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ addresses: mockAddresses })
      });
      
      const { fetchAddresses } = useUserStore.getState();
      await fetchAddresses();
      
      const { addresses } = useUserStore.getState();
      expect(addresses).toHaveLength(1);
      expect(addresses[0].recipientName).toBe('John Doe');
    });

    it('should handle missing user document', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => false
      });
      
      const { fetchAddresses } = useUserStore.getState();
      await fetchAddresses();
      
      const { addresses } = useUserStore.getState();
      expect(addresses).toEqual([]);
    });
  });

  describe('addAddress', () => {
    it('should add new address to Firestore', async () => {
      const { updateDoc, arrayUnion } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      arrayUnion.mockReturnValue('mocked-array-union');
      
      const newAddressData = {
        label: 'Work',
        recipientName: 'Jane Smith',
        recipientPhone: '+91 9876543210',
        fullAddress: '456 Work Street, Work City, 654321'
      };
      
      const { addAddress } = useUserStore.getState();
      const result = await addAddress(newAddressData);
      
      expect(updateDoc).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.recipientName).toBe('Jane Smith');
      
      const { addresses } = useUserStore.getState();
      expect(addresses).toHaveLength(1);
    });

    it('should generate unique address ID', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      
      const addressData = {
        label: 'Home',
        recipientName: 'Test User',
        recipientPhone: '+91 9876543210',
        fullAddress: 'Test Address'
      };
      
      const { addAddress } = useUserStore.getState();
      const result1 = await addAddress(addressData);
      const result2 = await addAddress(addressData);
      
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('updateAddress', () => {
    it('should update existing address', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      
      // Set initial state with address
      useUserStore.setState({
        addresses: [{
          id: 'addr_1',
          label: 'Home',
          recipientName: 'Original Name',
          recipientPhone: '+91 9876543210',
          fullAddress: 'Original Address'
        }]
      });
      
      const { updateAddress } = useUserStore.getState();
      await updateAddress('addr_1', { recipientName: 'Updated Name' });
      
      expect(updateDoc).toHaveBeenCalled();
      
      const { addresses } = useUserStore.getState();
      expect(addresses[0].recipientName).toBe('Updated Name');
    });

    it('should throw error for non-existent address', async () => {
      const { updateAddress } = useUserStore.getState();
      
      await expect(updateAddress('non-existent', {}))
        .rejects.toThrow('Address not found');
    });
  });

  describe('deleteAddress', () => {
    it('should delete address from Firestore', async () => {
      const { updateDoc, arrayRemove } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      arrayRemove.mockReturnValue('mocked-array-remove');
      
      const testAddress = {
        id: 'addr_1',
        label: 'Home',
        recipientName: 'To Delete',
        recipientPhone: '+91 9876543210',
        fullAddress: 'Delete This Address'
      };
      
      useUserStore.setState({ addresses: [testAddress] });
      
      const { deleteAddress } = useUserStore.getState();
      await deleteAddress('addr_1');
      
      expect(updateDoc).toHaveBeenCalled();
      expect(arrayRemove).toHaveBeenCalledWith(testAddress);
      
      const { addresses } = useUserStore.getState();
      expect(addresses).toHaveLength(0);
    });
  });

  describe('address utilities', () => {
    it('should get address by ID', () => {
      const testAddresses = [
        { id: 'addr_1', recipientName: 'User 1' },
        { id: 'addr_2', recipientName: 'User 2' }
      ];
      
      useUserStore.setState({ addresses: testAddresses });
      
      const { getAddressById } = useUserStore.getState();
      const address = getAddressById('addr_2');
      
      expect(address.recipientName).toBe('User 2');
    });

    it('should get default address', () => {
      const testAddresses = [
        { id: 'addr_1', recipientName: 'User 1', isDefault: false },
        { id: 'addr_2', recipientName: 'User 2', isDefault: true }
      ];
      
      useUserStore.setState({ addresses: testAddresses });
      
      const { getDefaultAddress } = useUserStore.getState();
      const defaultAddress = getDefaultAddress();
      
      expect(defaultAddress.recipientName).toBe('User 2');
    });

    it('should return first address if no default set', () => {
      const testAddresses = [
        { id: 'addr_1', recipientName: 'First User' },
        { id: 'addr_2', recipientName: 'Second User' }
      ];
      
      useUserStore.setState({ addresses: testAddresses });
      
      const { getDefaultAddress } = useUserStore.getState();
      const defaultAddress = getDefaultAddress();
      
      expect(defaultAddress.recipientName).toBe('First User');
    });

    it('should set default address', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      
      const testAddresses = [
        { id: 'addr_1', recipientName: 'User 1', isDefault: true },
        { id: 'addr_2', recipientName: 'User 2', isDefault: false }
      ];
      
      useUserStore.setState({ addresses: testAddresses });
      
      const { setDefaultAddress } = useUserStore.getState();
      await setDefaultAddress('addr_2');
      
      const { addresses } = useUserStore.getState();
      expect(addresses[0].isDefault).toBe(false);
      expect(addresses[1].isDefault).toBe(true);
    });
  });
});