import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Security testing setup
global.securityTestMode = true;

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()), // Returns unsubscribe function
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve())
  })),
  serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ children }) => children || null,
    useNavigate: () => vi.fn(),
  };
});

const mockFirebase = {
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn()
  },
  firestore: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: true,
          data: () => ({ 
            name: 'Test Product', 
            price: 299,
            role: 'customer' // Default role for security testing
          })
        })),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve())
      })),
      get: vi.fn(() => Promise.resolve({ 
        docs: [
          { 
            id: '1',
            data: () => ({ 
              name: 'Test Product', 
              price: 299,
              quantityAvailable: 10
            })
          }
        ] 
      })),
      add: vi.fn(() => Promise.resolve({ id: 'new-doc-id' }))
    }))
  }
};

// Mock admin role verification
global.mockAdminRole = (isAdmin = false) => {
  mockFirebase.firestore.collection().doc().get.mockResolvedValue({
    exists: true,
    data: () => ({ role: isAdmin ? 'admin' : 'customer' })
  });
};

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

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Map([['content-type', 'application/json']])
  })
);

// Mock file validation
global.validateFileUpload = vi.fn((file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  return {
    valid: file.size <= maxSize && allowedTypes.includes(file.type),
    error: file.size > maxSize ? 'File too large' : 
           !allowedTypes.includes(file.type) ? 'Invalid file type' : null
  };
});

// Setup console.error to fail tests on React warnings
const originalError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      throw new Error(`Console error: ${args[0]}`);
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
  vi.clearAllMocks();
});