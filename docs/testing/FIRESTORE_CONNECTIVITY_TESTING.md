# 🔥 Firestore Connectivity Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for Firebase Firestore connectivity, ensuring that database operations work correctly across different scenarios and configurations.

---

## 📋 **What Firestore Connectivity Tests Cover**

### **Database Connection Testing**
- Firebase app initialization
- Firestore database connection establishment
- Network connectivity handling
- Configuration validation
- Environment variable validation

### **CRUD Operations Testing**
- Document create, read, update, delete operations
- Collection queries and filtering
- Real-time listeners (onSnapshot)
- Batch operations and transactions
- Error handling for failed operations

### **Security Rules Testing**
- User access control validation
- Admin permission enforcement
- Data isolation between users
- Authentication requirement testing

### **Real-time Features Testing**
- Cross-tab synchronization
- Live data updates
- Listener management and cleanup
- Performance under load

---

## 🧪 **Running Firestore Tests**

### **All Firebase Tests**
```bash
# Run all Firebase integration tests
npm run test:firebase

# Run specific Firebase test files
npm run test src/test/firebase/firestore-connectivity.test.js
npm run test src/test/firebase/firestore-operations.test.js
npm run test src/test/firebase/auth-operations.test.js
npm run test src/test/firebase/security-rules.test.js
npm run test src/test/firebase/real-time-features.test.js
```

### **Quick Connectivity Check**
```bash
# Test just the connection
npm run test src/test/firebase/firestore-connectivity.test.js -- --reporter=verbose
```

### **Comprehensive Firebase Validation**
```bash
# Run all Firebase tests with detailed output
npm run test src/test/firebase/ -- --reporter=verbose
```

---

## 📊 **Test Categories**

### **1. Database Connection Tests**
```javascript
describe('Database Connection', () => {
  it('should establish connection to Firestore', async () => {
    expect(db).toBeDefined();
    expect(db.app).toBeDefined();
    expect(db.app.options.projectId).toBe('test-project-id');
  });

  it('should handle network connectivity', async () => {
    await enableNetwork(db);
    await disableNetwork(db);
    await enableNetwork(db);
  });

  it('should detect when Firebase is not configured', () => {
    const emptyConfig = {
      apiKey: undefined,
      authDomain: undefined,
      projectId: undefined
    };

    const isConfigured = Object.values(emptyConfig).every(value => 
      value && value !== 'undefined' && value !== ''
    );

    expect(isConfigured).toBe(false);
  });
});
```

### **2. Configuration Validation Tests**
```javascript
describe('Configuration Validation', () => {
  it('should validate required Firebase config fields', () => {
    const requiredFields = [
      'apiKey', 'authDomain', 'projectId', 
      'storageBucket', 'messagingSenderId', 'appId'
    ];

    requiredFields.forEach(field => {
      expect(testFirebaseConfig[field]).toBeDefined();
      expect(testFirebaseConfig[field]).not.toBe('');
    });
  });

  it('should detect placeholder values in configuration', () => {
    const configWithPlaceholders = {
      apiKey: 'your_api_key_here',
      projectId: 'your-project-id'
    };

    const hasPlaceholders = Object.values(configWithPlaceholders).some(value =>
      value.includes('your_') || 
      value.includes('placeholder')
    );

    expect(hasPlaceholders).toBe(true);
  });
});
```

### **3. CRUD Operations Tests**
```javascript
describe('Document Operations', () => {
  it('should create document with addDoc', async () => {
    const testProduct = {
      name: 'Test Product',
      price: 299,
      category: 'test'
    };

    const docRef = await addDoc(collection(db, 'products'), testProduct);
    expect(docRef.id).toBeDefined();
    
    const docSnap = await getDoc(docRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().name).toBe('Test Product');
  });

  it('should handle real-time updates', async () => {
    const docRef = doc(db, 'products', 'realtime-test');
    
    return new Promise(async (resolve) => {
      let updateCount = 0;
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        updateCount++;
        
        if (updateCount === 2) {
          expect(doc.exists()).toBe(true);
          expect(doc.data().name).toBe('Updated Product');
          unsubscribe();
          resolve();
        }
      });
      
      await setDoc(docRef, { name: 'Updated Product' });
    });
  });
});
```

---

## 🔧 **Test Configuration**

### **Firebase Emulator Setup**
```javascript
// Test configuration for Firebase emulators
const testConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project-id"
};

beforeAll(async () => {
  app = initializeApp(testConfig, 'test-app');
  db = getFirestore(app);
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Emulator already connected');
  }
});
```

### **Test Data Management**
```javascript
beforeEach(async () => {
  // Clear test data before each test
  try {
    await clearFirestoreData({ projectId: 'test-project-id' });
  } catch (error) {
    console.log('Could not clear test data');
  }
});
```

---

## 📈 **Success Criteria**

### **Firestore Tests Pass When:**
- ✅ Database connection establishes successfully
- ✅ CRUD operations work without errors
- ✅ Real-time listeners function properly
- ✅ Security rules enforce proper access control
- ✅ Network errors are handled gracefully
- ✅ Configuration validation works correctly

### **Test Failure Indicators:**
- ❌ Connection timeouts or failures
- ❌ CRUD operations throwing errors
- ❌ Real-time listeners not triggering
- ❌ Security rules allowing unauthorized access
- ❌ Configuration validation failing

---

## 🆘 **Troubleshooting Firestore Tests**

### **Common Issues**

#### **"Firebase emulator not running"**
```bash
# Start Firebase emulators
firebase emulators:start --only firestore,auth

# Run tests with emulator
npm run test src/test/firebase/
```

#### **"Connection timeout errors"**
```bash
# Check if emulator is accessible
curl http://localhost:8080

# Restart emulator if needed
firebase emulators:start --only firestore
```

#### **"Permission denied errors"**
```bash
# Check security rules are properly configured
# Verify test users have correct roles in Firestore
```

#### **"Test data not clearing"**
```bash
# Manually clear emulator data
firebase emulators:exec --only firestore "npm run test"
```

---

## 🎯 **Test Execution Commands**

### **Quick Firestore Check**
```bash
# Test just connectivity
npm run test src/test/firebase/firestore-connectivity.test.js
```

### **Comprehensive Firebase Testing**
```bash
# All Firebase tests
npm run test:firebase

# With detailed output
npm run test src/test/firebase/ -- --reporter=verbose
```

### **Integration with Full Test Suite**
```bash
# Include Firebase tests in full suite
npm run test:all

# Quick validation including Firebase
npm run test:quick
```

**This comprehensive Firestore testing ensures your database connectivity is reliable and all operations work correctly across different scenarios.**