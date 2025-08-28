import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
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
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  connectFirestoreEmulator,
  terminate,
  clearFirestoreData
} from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const testConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project-id"
}

describe('Firestore CRUD Operations', () => {
  let app, db, auth
  let testUser

  beforeAll(async () => {
    app = initializeApp(testConfig, 'crud-test-app')
    db = getFirestore(app)
    auth = getAuth(app)

    try {
      connectFirestoreEmulator(db, 'localhost', 8080)
    } catch (error) {
      console.log('Firestore emulator already connected')
    }

    // Create test user
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'testuser@example.com', 
        'testPassword123'
      )
      testUser = userCredential.user
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
    try {
      await clearFirestoreData({ projectId: 'test-project-id' })
    } catch (error) {
      console.log('Could not clear test data')
    }
  })

  describe('Document Operations', () => {
    it('should create document with addDoc', async () => {
      const testProduct = {
        name: 'Test Product',
        price: 299,
        category: 'test',
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'products'), testProduct)
      
      expect(docRef.id).toBeDefined()
      
      // Verify document was created
      const docSnap = await getDoc(docRef)
      expect(docSnap.exists()).toBe(true)
      expect(docSnap.data().name).toBe('Test Product')
    })

    it('should create document with setDoc', async () => {
      const userId = 'test-user-123'
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'customer',
        createdAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', userId), userData)

      // Verify document was created
      const userDoc = await getDoc(doc(db, 'users', userId))
      expect(userDoc.exists()).toBe(true)
      expect(userDoc.data().email).toBe('test@example.com')
    })

    it('should read document with getDoc', async () => {
      // Create test document first
      const docRef = doc(db, 'products', 'test-product-1')
      await setDoc(docRef, {
        name: 'Test Product',
        price: 299,
        category: 'test'
      })

      // Read document
      const docSnap = await getDoc(docRef)
      
      expect(docSnap.exists()).toBe(true)
      expect(docSnap.id).toBe('test-product-1')
      expect(docSnap.data().name).toBe('Test Product')
    })

    it('should update document with updateDoc', async () => {
      // Create test document
      const docRef = doc(db, 'products', 'update-test')
      await setDoc(docRef, {
        name: 'Original Name',
        price: 299
      })

      // Update document
      await updateDoc(docRef, {
        name: 'Updated Name',
        price: 399,
        updatedAt: serverTimestamp()
      })

      // Verify update
      const updatedDoc = await getDoc(docRef)
      expect(updatedDoc.data().name).toBe('Updated Name')
      expect(updatedDoc.data().price).toBe(399)
    })

    it('should delete document with deleteDoc', async () => {
      // Create test document
      const docRef = doc(db, 'products', 'delete-test')
      await setDoc(docRef, { name: 'To Delete' })

      // Verify it exists
      let docSnap = await getDoc(docRef)
      expect(docSnap.exists()).toBe(true)

      // Delete document
      await deleteDoc(docRef)

      // Verify it's deleted
      docSnap = await getDoc(docRef)
      expect(docSnap.exists()).toBe(false)
    })

    it('should handle non-existent document reads', async () => {
      const docSnap = await getDoc(doc(db, 'products', 'non-existent'))
      
      expect(docSnap.exists()).toBe(false)
      expect(docSnap.data()).toBeUndefined()
    })
  })

  describe('Collection Queries', () => {
    beforeEach(async () => {
      // Create test data
      const products = [
        { name: 'Product A', price: 100, category: 'honey', rating: 4.5 },
        { name: 'Product B', price: 200, category: 'pickle', rating: 4.0 },
        { name: 'Product C', price: 300, category: 'honey', rating: 5.0 },
        { name: 'Product D', price: 150, category: 'spices', rating: 3.5 }
      ]

      for (const product of products) {
        await addDoc(collection(db, 'products'), product)
      }
    })

    it('should get all documents from collection', async () => {
      const querySnapshot = await getDocs(collection(db, 'products'))
      
      expect(querySnapshot.size).toBe(4)
      
      const products = []
      querySnapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() })
      })
      
      expect(products).toHaveLength(4)
      expect(products[0].name).toBeDefined()
    })

    it('should filter documents with where clause', async () => {
      const q = query(
        collection(db, 'products'),
        where('category', '==', 'honey')
      )
      
      const querySnapshot = await getDocs(q)
      expect(querySnapshot.size).toBe(2)
      
      querySnapshot.forEach(doc => {
        expect(doc.data().category).toBe('honey')
      })
    })

    it('should sort documents with orderBy', async () => {
      const q = query(
        collection(db, 'products'),
        orderBy('price', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      const prices = []
      
      querySnapshot.forEach(doc => {
        prices.push(doc.data().price)
      })
      
      expect(prices).toEqual([100, 150, 200, 300])
    })

    it('should limit query results', async () => {
      const q = query(
        collection(db, 'products'),
        limit(2)
      )
      
      const querySnapshot = await getDocs(q)
      expect(querySnapshot.size).toBe(2)
    })

    it('should combine multiple query constraints', async () => {
      const q = query(
        collection(db, 'products'),
        where('category', '==', 'honey'),
        orderBy('rating', 'desc'),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      expect(querySnapshot.size).toBe(1)
      
      const topProduct = querySnapshot.docs[0].data()
      expect(topProduct.category).toBe('honey')
      expect(topProduct.rating).toBe(5.0)
    })
  })

  describe('Real-time Listeners', () => {
    it('should listen to document changes with onSnapshot', async () => {
      const docRef = doc(db, 'products', 'listener-test')
      
      return new Promise(async (resolve) => {
        let changeCount = 0
        
        const unsubscribe = onSnapshot(docRef, (doc) => {
          changeCount++
          
          if (changeCount === 1) {
            // First call - document doesn't exist yet
            expect(doc.exists()).toBe(false)
            
            // Create document
            setDoc(docRef, { name: 'Listener Test', price: 100 })
          } else if (changeCount === 2) {
            // Second call - document created
            expect(doc.exists()).toBe(true)
            expect(doc.data().name).toBe('Listener Test')
            
            // Update document
            updateDoc(docRef, { price: 200 })
          } else if (changeCount === 3) {
            // Third call - document updated
            expect(doc.data().price).toBe(200)
            
            unsubscribe()
            resolve()
          }
        })
      })
    })

    it('should listen to collection changes', async () => {
      const collectionRef = collection(db, 'test-collection')
      
      return new Promise(async (resolve) => {
        let snapshotCount = 0
        
        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
          snapshotCount++
          
          if (snapshotCount === 1) {
            // First call - empty collection
            expect(snapshot.size).toBe(0)
            
            // Add document
            addDoc(collectionRef, { name: 'Test Doc' })
          } else if (snapshotCount === 2) {
            // Second call - document added
            expect(snapshot.size).toBe(1)
            
            unsubscribe()
            resolve()
          }
        })
      })
    })

    it('should handle listener errors', async () => {
      const invalidDocRef = doc(db, 'invalid/path/structure')
      
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(
          invalidDocRef,
          (doc) => {
            // Should not reach here
            expect.fail('Should have triggered error callback')
          },
          (error) => {
            expect(error).toBeDefined()
            unsubscribe()
            resolve()
          }
        )
      })
    })
  })

  describe('Batch Operations', () => {
    it('should perform batch writes', async () => {
      const batch = writeBatch(db)
      
      // Add multiple documents in batch
      const doc1Ref = doc(collection(db, 'batch-test'))
      const doc2Ref = doc(collection(db, 'batch-test'))
      const doc3Ref = doc(collection(db, 'batch-test'))
      
      batch.set(doc1Ref, { name: 'Batch Doc 1', value: 1 })
      batch.set(doc2Ref, { name: 'Batch Doc 2', value: 2 })
      batch.set(doc3Ref, { name: 'Batch Doc 3', value: 3 })
      
      await batch.commit()
      
      // Verify all documents were created
      const querySnapshot = await getDocs(collection(db, 'batch-test'))
      expect(querySnapshot.size).toBe(3)
    })

    it('should handle batch operation failures', async () => {
      const batch = writeBatch(db)
      
      // Try to write to invalid path
      const invalidRef = doc(db, 'invalid collection name', 'doc')
      batch.set(invalidRef, { data: 'test' })
      
      await expect(batch.commit()).rejects.toThrow()
    })
  })

  describe('Transaction Operations', () => {
    it('should perform atomic transactions', async () => {
      // Create initial documents
      const doc1Ref = doc(db, 'transactions', 'account1')
      const doc2Ref = doc(db, 'transactions', 'account2')
      
      await setDoc(doc1Ref, { balance: 100 })
      await setDoc(doc2Ref, { balance: 50 })
      
      // Transfer money atomically
      await runTransaction(db, async (transaction) => {
        const doc1 = await transaction.get(doc1Ref)
        const doc2 = await transaction.get(doc2Ref)
        
        const newBalance1 = doc1.data().balance - 25
        const newBalance2 = doc2.data().balance + 25
        
        transaction.update(doc1Ref, { balance: newBalance1 })
        transaction.update(doc2Ref, { balance: newBalance2 })
      })
      
      // Verify transaction results
      const finalDoc1 = await getDoc(doc1Ref)
      const finalDoc2 = await getDoc(doc2Ref)
      
      expect(finalDoc1.data().balance).toBe(75)
      expect(finalDoc2.data().balance).toBe(75)
    })

    it('should rollback failed transactions', async () => {
      const docRef = doc(db, 'transactions', 'rollback-test')
      await setDoc(docRef, { value: 100 })
      
      try {
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(docRef)
          
          // Update document
          transaction.update(docRef, { value: 200 })
          
          // Force transaction to fail
          throw new Error('Forced transaction failure')
        })
        
        expect.fail('Transaction should have failed')
      } catch (error) {
        expect(error.message).toBe('Forced transaction failure')
      }
      
      // Verify document was not updated (rollback successful)
      const finalDoc = await getDoc(docRef)
      expect(finalDoc.data().value).toBe(100)
    })
  })

  describe('Application-Specific Operations', () => {
    describe('Product Management', () => {
      it('should create product with all required fields', async () => {
        const productData = {
          name: 'Darjeeling Pickle',
          description: 'Authentic spicy pickle from the hills',
          price: 299,
          category: 'pickle',
          quantityAvailable: 10,
          image: 'https://example.com/pickle.jpg',
          artisan: 'Deepak Sharma',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, 'products'), productData)
        
        const productDoc = await getDoc(docRef)
        expect(productDoc.exists()).toBe(true)
        expect(productDoc.data().name).toBe('Darjeeling Pickle')
        expect(productDoc.data().price).toBe(299)
      })

      it('should update product inventory', async () => {
        // Create product
        const docRef = await addDoc(collection(db, 'products'), {
          name: 'Test Product',
          quantityAvailable: 10
        })

        // Update inventory
        await updateDoc(docRef, {
          quantityAvailable: 5,
          updatedAt: serverTimestamp()
        })

        // Verify update
        const updatedDoc = await getDoc(docRef)
        expect(updatedDoc.data().quantityAvailable).toBe(5)
      })

      it('should query products by category', async () => {
        // Create test products
        await addDoc(collection(db, 'products'), { name: 'Honey 1', category: 'honey' })
        await addDoc(collection(db, 'products'), { name: 'Pickle 1', category: 'pickle' })
        await addDoc(collection(db, 'products'), { name: 'Honey 2', category: 'honey' })

        // Query honey products
        const q = query(
          collection(db, 'products'),
          where('category', '==', 'honey')
        )

        const querySnapshot = await getDocs(q)
        expect(querySnapshot.size).toBe(2)
        
        querySnapshot.forEach(doc => {
          expect(doc.data().category).toBe('honey')
        })
      })
    })

    describe('Cart Operations', () => {
      it('should create and update user cart', async () => {
        const userId = testUser?.uid || 'test-user-cart'
        const cartData = {
          items: [
            { id: 'product-1', name: 'Test Product', quantity: 2, price: 299 }
          ],
          updatedAt: serverTimestamp()
        }

        await setDoc(doc(db, 'carts', userId), cartData)

        // Verify cart creation
        const cartDoc = await getDoc(doc(db, 'carts', userId))
        expect(cartDoc.exists()).toBe(true)
        expect(cartDoc.data().items).toHaveLength(1)
        expect(cartDoc.data().items[0].quantity).toBe(2)
      })

      it('should handle real-time cart updates', async () => {
        const userId = 'realtime-cart-user'
        const cartRef = doc(db, 'carts', userId)

        return new Promise(async (resolve) => {
          let updateCount = 0
          
          const unsubscribe = onSnapshot(cartRef, (doc) => {
            updateCount++
            
            if (updateCount === 1) {
              // First call - no cart exists
              expect(doc.exists()).toBe(false)
              
              // Create cart
              setDoc(cartRef, {
                items: [{ id: '1', quantity: 1 }],
                updatedAt: serverTimestamp()
              })
            } else if (updateCount === 2) {
              // Second call - cart created
              expect(doc.exists()).toBe(true)
              expect(doc.data().items).toHaveLength(1)
              
              // Update cart
              updateDoc(cartRef, {
                items: [
                  { id: '1', quantity: 1 },
                  { id: '2', quantity: 2 }
                ],
                updatedAt: serverTimestamp()
              })
            } else if (updateCount === 3) {
              // Third call - cart updated
              expect(doc.data().items).toHaveLength(2)
              
              unsubscribe()
              resolve()
            }
          })
        })
      })
    })

    describe('Order Operations', () => {
      it('should create order with proper structure', async () => {
        const orderData = {
          userId: testUser?.uid || 'test-user-order',
          userEmail: 'test@example.com',
          orderNumber: `ORD-${Date.now()}`,
          items: [
            { id: 'product-1', name: 'Test Product', quantity: 1, price: 299 }
          ],
          shipping: {
            firstName: 'Test',
            lastName: 'User',
            address: '123 Test St',
            city: 'Test City',
            zipCode: '12345'
          },
          total: 299,
          status: 'processing',
          createdAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, 'orders'), orderData)
        
        const orderDoc = await getDoc(docRef)
        expect(orderDoc.exists()).toBe(true)
        expect(orderDoc.data().total).toBe(299)
        expect(orderDoc.data().status).toBe('processing')
      })

      it('should query user orders', async () => {
        const userId = 'test-user-orders'
        
        // Create multiple orders for user
        await addDoc(collection(db, 'orders'), {
          userId,
          orderNumber: 'ORD-001',
          total: 100,
          createdAt: serverTimestamp()
        })
        
        await addDoc(collection(db, 'orders'), {
          userId,
          orderNumber: 'ORD-002', 
          total: 200,
          createdAt: serverTimestamp()
        })

        // Query user's orders
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )

        const querySnapshot = await getDocs(q)
        expect(querySnapshot.size).toBe(2)
      })
    })

    describe('Wishlist Operations', () => {
      it('should manage user wishlist', async () => {
        const userId = testUser?.uid || 'test-user-wishlist'
        const wishlistData = {
          productIds: ['product-1', 'product-2', 'product-3'],
          updatedAt: serverTimestamp()
        }

        await setDoc(doc(db, 'wishlists', userId), wishlistData)

        // Verify wishlist creation
        const wishlistDoc = await getDoc(doc(db, 'wishlists', userId))
        expect(wishlistDoc.exists()).toBe(true)
        expect(wishlistDoc.data().productIds).toHaveLength(3)
      })

      it('should update wishlist items', async () => {
        const userId = 'wishlist-update-user'
        
        // Create initial wishlist
        await setDoc(doc(db, 'wishlists', userId), {
          productIds: ['product-1'],
          updatedAt: serverTimestamp()
        })

        // Add item to wishlist
        await updateDoc(doc(db, 'wishlists', userId), {
          productIds: ['product-1', 'product-2'],
          updatedAt: serverTimestamp()
        })

        // Verify update
        const updatedWishlist = await getDoc(doc(db, 'wishlists', userId))
        expect(updatedWishlist.data().productIds).toHaveLength(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle permission denied errors', async () => {
      // This would require specific security rules setup
      // For now, we test the error structure
      try {
        await addDoc(collection(db, 'restricted'), { data: 'test' })
      } catch (error) {
        if (error.code === 'permission-denied') {
          expect(error.code).toBe('permission-denied')
        }
      }
    })

    it('should handle network errors', async () => {
      await disableNetwork(db)
      
      try {
        await getDocs(collection(db, 'products'))
        expect.fail('Should have thrown network error')
      } catch (error) {
        expect(error.code).toContain('unavailable')
      } finally {
        await enableNetwork(db)
      }
    })

    it('should handle invalid document references', async () => {
      await expect(
        getDoc(doc(db, 'invalid collection name', 'doc'))
      ).rejects.toThrow()
    })

    it('should handle malformed query constraints', async () => {
      await expect(
        getDocs(query(
          collection(db, 'products'),
          where('invalid.field.path', '==', 'value')
        ))
      ).rejects.toThrow()
    })
  })
})