import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  connectFirestoreEmulator,
  terminate
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  connectAuthEmulator
} from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'

const testConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project-id"
}

describe('Firestore Security Rules Validation', () => {
  let app, db, auth
  let adminUser, customerUser, anotherCustomer

  beforeAll(async () => {
    app = initializeApp(testConfig, 'security-test-app')
    db = getFirestore(app)
    auth = getAuth(app)

    try {
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectAuthEmulator(auth, 'http://localhost:9099')
    } catch (error) {
      console.log('Emulators already connected')
    }

    // Create test users
    try {
      // Create admin user
      const adminCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@test.com', 
        'adminPassword123'
      )
      adminUser = adminCredential.user

      // Create admin profile in Firestore
      await setDoc(doc(db, 'users', adminUser.uid), {
        email: adminUser.email,
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      })

      // Create customer user
      const customerCredential = await createUserWithEmailAndPassword(
        auth,
        'customer@test.com',
        'customerPassword123'
      )
      customerUser = customerCredential.user

      // Create customer profile
      await setDoc(doc(db, 'users', customerUser.uid), {
        email: customerUser.email,
        displayName: 'Customer User',
        role: 'customer',
        createdAt: new Date().toISOString()
      })

      // Create another customer
      const anotherCredential = await createUserWithEmailAndPassword(
        auth,
        'another@test.com',
        'anotherPassword123'
      )
      anotherCustomer = anotherCredential.user

      await setDoc(doc(db, 'users', anotherCustomer.uid), {
        email: anotherCustomer.email,
        displayName: 'Another Customer',
        role: 'customer',
        createdAt: new Date().toISOString()
      })

    } catch (error) {
      console.log('Test user creation failed:', error.message)
    }
  })

  afterAll(async () => {
    if (app) {
      await terminate(db)
      await deleteApp(app)
    }
  })

  beforeEach(async () => {
    // Sign out before each test
    try {
      await signOut(auth)
    } catch (error) {
      // User might not be signed in
    }
  })

  describe('User Document Access Control', () => {
    it('should allow users to read their own profile', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      const userDoc = await getDoc(doc(db, 'users', customerUser.uid))
      expect(userDoc.exists()).toBe(true)
      expect(userDoc.data().email).toBe('customer@test.com')
    })

    it('should prevent users from reading other users profiles', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        getDoc(doc(db, 'users', anotherCustomer.uid))
      ).rejects.toThrow()
    })

    it('should allow users to update their own profile', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await updateDoc(doc(db, 'users', customerUser.uid), {
        displayName: 'Updated Customer Name',
        updatedAt: new Date().toISOString()
      })

      const updatedDoc = await getDoc(doc(db, 'users', customerUser.uid))
      expect(updatedDoc.data().displayName).toBe('Updated Customer Name')
    })

    it('should prevent users from updating other users profiles', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        updateDoc(doc(db, 'users', anotherCustomer.uid), {
          displayName: 'Hacked Name'
        })
      ).rejects.toThrow()
    })

    it('should validate user data structure on create', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      // Try to create user document with invalid structure
      await expect(
        setDoc(doc(db, 'users', 'new-user-id'), {
          invalidField: 'value'
          // Missing required fields: email, displayName, role
        })
      ).rejects.toThrow()
    })
  })

  describe('Product Access Control', () => {
    it('should allow anyone to read products', async () => {
      // Create test product as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      await addDoc(collection(db, 'products'), {
        name: 'Public Product',
        price: 299,
        category: 'test'
      })

      // Sign out and try to read as unauthenticated user
      await signOut(auth)
      
      const products = await getDocs(collection(db, 'products'))
      expect(products.size).toBeGreaterThan(0)
    })

    it('should allow admin to create products', async () => {
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      const productData = {
        name: 'Admin Created Product',
        description: 'Created by admin',
        price: 499,
        category: 'honey',
        quantityAvailable: 15
      }

      const docRef = await addDoc(collection(db, 'products'), productData)
      expect(docRef.id).toBeDefined()
    })

    it('should prevent customers from creating products', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        addDoc(collection(db, 'products'), {
          name: 'Unauthorized Product',
          price: 100
        })
      ).rejects.toThrow()
    })

    it('should allow admin to update products', async () => {
      // Create product as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      const docRef = await addDoc(collection(db, 'products'), {
        name: 'Original Product',
        price: 299
      })

      // Update product
      await updateDoc(docRef, {
        name: 'Updated Product',
        price: 399
      })

      const updatedDoc = await getDoc(docRef)
      expect(updatedDoc.data().name).toBe('Updated Product')
    })

    it('should prevent customers from updating products', async () => {
      // Create product as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      const docRef = await addDoc(collection(db, 'products'), {
        name: 'Protected Product',
        price: 299
      })

      // Try to update as customer
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        updateDoc(docRef, { name: 'Hacked Product' })
      ).rejects.toThrow()
    })
  })

  describe('Order Access Control', () => {
    it('should allow users to create their own orders', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      const orderData = {
        userId: customerUser.uid,
        userEmail: customerUser.email,
        items: [{ id: 'product-1', quantity: 1, price: 299 }],
        total: 299,
        status: 'processing',
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)
      expect(docRef.id).toBeDefined()
    })

    it('should allow users to read their own orders', async () => {
      // Create order as customer
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: customerUser.uid,
        total: 299,
        status: 'processing'
      })

      // Read own order
      const orderDoc = await getDoc(docRef)
      expect(orderDoc.exists()).toBe(true)
    })

    it('should prevent users from reading other users orders', async () => {
      // Create order as one customer
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: customerUser.uid,
        total: 299
      })

      // Try to read as another customer
      await signInWithEmailAndPassword(auth, 'another@test.com', 'anotherPassword123')
      
      await expect(
        getDoc(docRef)
      ).rejects.toThrow()
    })

    it('should allow admin to read all orders', async () => {
      // Create order as customer
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: customerUser.uid,
        total: 299
      })

      // Read as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      const orderDoc = await getDoc(docRef)
      expect(orderDoc.exists()).toBe(true)
    })

    it('should allow admin to update order status', async () => {
      // Create order as customer
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: customerUser.uid,
        status: 'processing'
      })

      // Update status as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      await updateDoc(docRef, {
        status: 'shipped',
        updatedAt: new Date().toISOString()
      })

      const updatedOrder = await getDoc(docRef)
      expect(updatedOrder.data().status).toBe('shipped')
    })
  })

  describe('Cart and Wishlist Access Control', () => {
    it('should allow users to manage their own cart', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      const cartData = {
        items: [{ id: 'product-1', quantity: 2 }],
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'carts', customerUser.uid), cartData)
      
      const cartDoc = await getDoc(doc(db, 'carts', customerUser.uid))
      expect(cartDoc.exists()).toBe(true)
    })

    it('should prevent users from accessing other users carts', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        getDoc(doc(db, 'carts', anotherCustomer.uid))
      ).rejects.toThrow()
    })

    it('should allow users to manage their own wishlist', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await setDoc(doc(db, 'wishlists', customerUser.uid), {
        productIds: ['product-1', 'product-2']
      })

      const wishlistDoc = await getDoc(doc(db, 'wishlists', customerUser.uid))
      expect(wishlistDoc.exists()).toBe(true)
    })
  })

  describe('Review Access Control', () => {
    it('should allow anyone to read reviews', async () => {
      // Create review as authenticated user
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      await addDoc(collection(db, 'reviews'), {
        productId: 'product-1',
        userId: customerUser.uid,
        rating: 5,
        comment: 'Great product!'
      })

      // Read reviews as unauthenticated user
      await signOut(auth)
      
      const reviews = await getDocs(collection(db, 'reviews'))
      expect(reviews.size).toBeGreaterThan(0)
    })

    it('should allow authenticated users to create reviews', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      const reviewData = {
        productId: 'product-1',
        userId: customerUser.uid,
        rating: 4,
        comment: 'Good product',
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'reviews'), reviewData)
      expect(docRef.id).toBeDefined()
    })

    it('should prevent unauthenticated users from creating reviews', async () => {
      await signOut(auth)
      
      await expect(
        addDoc(collection(db, 'reviews'), {
          productId: 'product-1',
          rating: 5,
          comment: 'Unauthorized review'
        })
      ).rejects.toThrow()
    })

    it('should allow users to update their own reviews', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      const docRef = await addDoc(collection(db, 'reviews'), {
        productId: 'product-1',
        userId: customerUser.uid,
        rating: 4,
        comment: 'Original comment'
      })

      await updateDoc(docRef, {
        rating: 5,
        comment: 'Updated comment'
      })

      const updatedReview = await getDoc(docRef)
      expect(updatedReview.data().comment).toBe('Updated comment')
    })

    it('should prevent users from updating other users reviews', async () => {
      // Create review as one user
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      const docRef = await addDoc(collection(db, 'reviews'), {
        productId: 'product-1',
        userId: customerUser.uid,
        rating: 4,
        comment: 'Original comment'
      })

      // Try to update as another user
      await signInWithEmailAndPassword(auth, 'another@test.com', 'anotherPassword123')
      
      await expect(
        updateDoc(docRef, { comment: 'Hacked comment' })
      ).rejects.toThrow()
    })
  })

  describe('Admin-Only Collections', () => {
    it('should allow admin access to admin collection', async () => {
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      await setDoc(doc(db, 'admin', 'settings'), {
        siteName: 'Darjeeling Souls',
        adminEmail: 'admin@darjeelingsouls.com'
      })

      const adminDoc = await getDoc(doc(db, 'admin', 'settings'))
      expect(adminDoc.exists()).toBe(true)
    })

    it('should prevent customer access to admin collection', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        getDoc(doc(db, 'admin', 'settings'))
      ).rejects.toThrow()
    })

    it('should allow admin access to inventory logs', async () => {
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      await addDoc(collection(db, 'inventory_logs'), {
        productId: 'product-1',
        action: 'restock',
        quantity: 10,
        timestamp: new Date().toISOString()
      })

      const logs = await getDocs(collection(db, 'inventory_logs'))
      expect(logs.size).toBeGreaterThan(0)
    })

    it('should prevent customer access to inventory logs', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        getDocs(collection(db, 'inventory_logs'))
      ).rejects.toThrow()
    })

    it('should allow admin access to analytics data', async () => {
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      await setDoc(doc(db, 'analytics', 'daily-stats'), {
        date: new Date().toISOString(),
        orders: 25,
        revenue: 12500
      })

      const analyticsDoc = await getDoc(doc(db, 'analytics', 'daily-stats'))
      expect(analyticsDoc.exists()).toBe(true)
    })
  })

  describe('Artisan Collection Access', () => {
    it('should allow anyone to read artisan profiles', async () => {
      // Create artisan as admin
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      await addDoc(collection(db, 'artisans'), {
        name: 'Test Artisan',
        location: 'Test Location',
        experience: 10
      })

      // Read as unauthenticated user
      await signOut(auth)
      
      const artisans = await getDocs(collection(db, 'artisans'))
      expect(artisans.size).toBeGreaterThan(0)
    })

    it('should allow admin to create artisan profiles', async () => {
      await signInWithEmailAndPassword(auth, 'admin@test.com', 'adminPassword123')
      
      const artisanData = {
        name: 'Deepak Sharma',
        title: 'Master Pickle Maker',
        location: 'Darjeeling, West Bengal',
        experience: 25
      }

      const docRef = await addDoc(collection(db, 'artisans'), artisanData)
      expect(docRef.id).toBeDefined()
    })

    it('should prevent customers from creating artisan profiles', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      await expect(
        addDoc(collection(db, 'artisans'), {
          name: 'Unauthorized Artisan'
        })
      ).rejects.toThrow()
    })
  })

  describe('Data Validation Rules', () => {
    it('should enforce required fields in user documents', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      // Try to create user document missing required fields
      await expect(
        setDoc(doc(db, 'users', 'invalid-user'), {
          someField: 'value'
          // Missing: email, displayName, role
        })
      ).rejects.toThrow()
    })

    it('should validate role field values', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      // Try to create user with invalid role
      await expect(
        setDoc(doc(db, 'users', customerUser.uid), {
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'invalid-role' // Should only be 'customer' or 'admin'
        })
      ).rejects.toThrow()
    })

    it('should validate order structure on creation', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      // Try to create order missing required fields
      await expect(
        addDoc(collection(db, 'orders'), {
          userId: customerUser.uid
          // Missing: items, total, status
        })
      ).rejects.toThrow()
    })

    it('should validate review structure', async () => {
      await signInWithEmailAndPassword(auth, 'customer@test.com', 'customerPassword123')
      
      // Try to create review missing required fields
      await expect(
        addDoc(collection(db, 'reviews'), {
          userId: customerUser.uid
          // Missing: productId, rating, comment
        })
      ).rejects.toThrow()
    })
  })

  describe('Unauthenticated Access', () => {
    beforeEach(async () => {
      await signOut(auth)
    })

    it('should allow reading public collections when unauthenticated', async () => {
      // These should work without authentication
      const products = await getDocs(collection(db, 'products'))
      const artisans = await getDocs(collection(db, 'artisans'))
      const reviews = await getDocs(collection(db, 'reviews'))

      // Should not throw errors (might be empty but accessible)
      expect(products).toBeDefined()
      expect(artisans).toBeDefined()
      expect(reviews).toBeDefined()
    })

    it('should prevent writing to any collection when unauthenticated', async () => {
      await expect(
        addDoc(collection(db, 'products'), { name: 'Unauthorized Product' })
      ).rejects.toThrow()

      await expect(
        addDoc(collection(db, 'orders'), { total: 100 })
      ).rejects.toThrow()

      await expect(
        addDoc(collection(db, 'reviews'), { rating: 5 })
      ).rejects.toThrow()
    })

    it('should prevent reading private collections when unauthenticated', async () => {
      await expect(
        getDocs(collection(db, 'users'))
      ).rejects.toThrow()

      await expect(
        getDocs(collection(db, 'admin'))
      ).rejects.toThrow()
    })
  })
})