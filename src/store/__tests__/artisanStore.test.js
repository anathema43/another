import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useArtisanStore } from '../artisanStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn()
}))

describe('ArtisanStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useArtisanStore.setState({ 
      artisans: [], 
      featuredArtisans: [], 
      loading: false, 
      error: null 
    });
  });

  it('should initialize with empty state', () => {
    const { artisans, featuredArtisans, loading, error } = useArtisanStore.getState();
    
    expect(artisans).toEqual([]);
    expect(featuredArtisans).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  it('should fetch artisans successfully', async () => {
    const { getDocs } = require('firebase/firestore');
    const mockArtisans = [
      { id: '1', name: 'Deepak Sharma', location: 'Darjeeling' },
      { id: '2', name: 'Laxmi Devi', location: 'Manali' }
    ];
    
    getDocs.mockResolvedValue({
      docs: mockArtisans.map(artisan => ({
        id: artisan.id,
        data: () => ({ name: artisan.name, location: artisan.location })
      }))
    });
    
    const { fetchArtisans } = useArtisanStore.getState();
    await fetchArtisans();
    
    const { artisans, loading } = useArtisanStore.getState();
    expect(artisans).toHaveLength(2);
    expect(artisans[0].name).toBe('Deepak Sharma');
    expect(loading).toBe(false);
  });

  it('should fetch featured artisans', async () => {
    const { getDocs } = require('firebase/firestore');
    const mockFeaturedArtisans = [
      { id: '1', name: 'Deepak Sharma', featured: true }
    ];
    
    getDocs.mockResolvedValue({
      docs: mockFeaturedArtisans.map(artisan => ({
        id: artisan.id,
        data: () => artisan
      }))
    });
    
    const { fetchFeaturedArtisans } = useArtisanStore.getState();
    await fetchFeaturedArtisans();
    
    const { featuredArtisans } = useArtisanStore.getState();
    expect(featuredArtisans).toHaveLength(1);
    expect(featuredArtisans[0].featured).toBe(true);
  });

  it('should get artisan by ID', async () => {
    const { getDoc } = require('firebase/firestore');
    const mockArtisan = { id: '1', name: 'Deepak Sharma', location: 'Darjeeling' };
    
    getDoc.mockResolvedValue({
      exists: () => true,
      id: mockArtisan.id,
      data: () => ({ name: mockArtisan.name, location: mockArtisan.location })
    });
    
    const { getArtisanById } = useArtisanStore.getState();
    const result = await getArtisanById('1');
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('Deepak Sharma');
  });

  it('should add new artisan', async () => {
    const { addDoc } = require('firebase/firestore');
    const newArtisan = {
      name: 'New Artisan',
      location: 'Kashmir',
      experience: 15
    };
    
    addDoc.mockResolvedValue({ id: 'new-id' });
    
    const { addArtisan } = useArtisanStore.getState();
    const result = await addArtisan(newArtisan);
    
    expect(addDoc).toHaveBeenCalled();
    expect(result).toBe('new-id');
    
    const { artisans } = useArtisanStore.getState();
    expect(artisans).toHaveLength(1);
    expect(artisans[0].name).toBe('New Artisan');
  });

  it('should update artisan', async () => {
    const { updateDoc } = require('firebase/firestore');
    
    // Set initial state
    useArtisanStore.setState({
      artisans: [{ id: '1', name: 'Old Name', location: 'Old Location' }]
    });
    
    updateDoc.mockResolvedValue();
    
    const { updateArtisan } = useArtisanStore.getState();
    await updateArtisan('1', { name: 'Updated Name' });
    
    expect(updateDoc).toHaveBeenCalled();
    
    const { artisans } = useArtisanStore.getState();
    expect(artisans[0].name).toBe('Updated Name');
  });

  it('should delete artisan', async () => {
    const { deleteDoc } = require('firebase/firestore');
    
    // Set initial state
    useArtisanStore.setState({
      artisans: [
        { id: '1', name: 'Artisan 1' },
        { id: '2', name: 'Artisan 2' }
      ]
    });
    
    deleteDoc.mockResolvedValue();
    
    const { deleteArtisan } = useArtisanStore.getState();
    await deleteArtisan('1');
    
    expect(deleteDoc).toHaveBeenCalled();
    
    const { artisans } = useArtisanStore.getState();
    expect(artisans).toHaveLength(1);
    expect(artisans[0].id).toBe('2');
  });

  it('should get artisan products', async () => {
    const { getDocs } = require('firebase/firestore');
    const mockProducts = [
      { id: 'p1', name: 'Product 1', artisanId: 'a1' },
      { id: 'p2', name: 'Product 2', artisanId: 'a1' }
    ];
    
    getDocs.mockResolvedValue({
      docs: mockProducts.map(product => ({
        id: product.id,
        data: () => product
      }))
    });
    
    const { getArtisanProducts } = useArtisanStore.getState();
    const result = await getArtisanProducts('a1');
    
    expect(result).toHaveLength(2);
    expect(result[0].artisanId).toBe('a1');
  });

  it('should handle errors gracefully', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockRejectedValue(new Error('Network error'));
    
    const { fetchArtisans } = useArtisanStore.getState();
    
    try {
      await fetchArtisans();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
    
    const { error: storeError, loading } = useArtisanStore.getState();
    expect(storeError).toBe('Network error');
    expect(loading).toBe(false);
  });

  it('should clear errors', () => {
    useArtisanStore.setState({ error: 'Some error' });
    
    const { clearError } = useArtisanStore.getState();
    clearError();
    
    const { error } = useArtisanStore.getState();
    expect(error).toBe(null);
  });
});