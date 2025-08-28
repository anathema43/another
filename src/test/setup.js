import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
const mockFirebase = {
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  firestore: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: vi.fn(() => Promise.resolve()),
      })),
      get: vi.fn(() => Promise.resolve({ docs: [] })),
    })),
  },
};

// Mock Firebase Firestore with testing utilities
vi.mock('firebase/firestore', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    // Mock testing utilities
    clearFirestoreData: vi.fn(() => Promise.resolve()),
    enableNetwork: vi.fn(() => Promise.resolve()),
    disableNetwork: vi.fn(() => {
      const error = new Error("Network unavailable for test");
      error.code = "unavailable";
      return Promise.reject(error);
    }),
  };
});

// Mock Razorpay
global.Razorpay = vi.fn(() => ({
  open: vi.fn(),
  on: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;