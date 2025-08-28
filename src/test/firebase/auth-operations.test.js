import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  connectAuthEmulator
} from 'firebase/auth'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Test configuration
const testConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com", 
  projectId: "test-project-id"
}

describe('Firebase Authentication Operations', () => {
  let app, auth, db
  let testUsers = []

  beforeAll(async () => {
    app = initializeApp(testConfig, 'auth-test-app')
    auth = getAuth(app)
    db = getFirestore(app)

    try {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
    } catch (error) {
      console.log('Emulators already connected')
    }
  })

  afterAll(async () => {
    // Clean up test users
    for (const user of testUsers) {
      try {
        if (user && user.uid) {
          await deleteUser(user)
        }
      } catch (error) {
        console.log('Error cleaning up user:', error.message)
      }
    }

    if (app) {
      await deleteApp(app)
    }
  })

  beforeEach(() => {
    testUsers = []
  })

  describe('User Registration', () => {
    it('should create new user with email and password', async () => {
      const email = `test${Date.now()}@example.com`
      const password = 'testPassword123'
      const displayName = 'Test User'

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      expect(user).toBeDefined()
      expect(user.email).toBe(email)
      expect(user.uid).toBeDefined()

      // Update profile
      await updateProfile(user, { displayName })
      expect(user.displayName).toBe(displayName)

      testUsers.push(user)
    })

    it('should create user profile in Firestore after registration', async () => {
      const email = `profile${Date.now()}@example.com`
      const password = 'testPassword123'
      const displayName = 'Profile Test User'

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      testUsers.push(user)

      // Create user profile document
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'customer',
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)

      // Verify profile was created
      const profileDoc = await getDoc(doc(db, 'users', user.uid))
      expect(profileDoc.exists()).toBe(true)
      expect(profileDoc.data().email).toBe(email)
      expect(profileDoc.data().role).toBe('customer')
    })

    it('should reject registration with invalid email', async () => {
      const invalidEmail = 'invalid-email'
      const password = 'testPassword123'

      await expect(
        createUserWithEmailAndPassword(auth, invalidEmail, password)
      ).rejects.toThrow()
    })

    it('should reject registration with weak password', async () => {
      const email = `weak${Date.now()}@example.com`
      const weakPassword = '123' // Too short

      await expect(
        createUserWithEmailAndPassword(auth, email, weakPassword)
      ).rejects.toThrow()
    })

    it('should prevent duplicate email registration', async () => {
      const email = `duplicate${Date.now()}@example.com`
      const password = 'testPassword123'

      // Create first user
      const userCredential1 = await createUserWithEmailAndPassword(auth, email, password)
      testUsers.push(userCredential1.user)

      // Try to create second user with same email
      await expect(
        createUserWithEmailAndPassword(auth, email, password)
      ).rejects.toThrow()
    })
  })

  describe('User Login', () => {
    let testUser

    beforeEach(async () => {
      // Create test user for login tests
      const email = `login${Date.now()}@example.com`
      const password = 'testPassword123'
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      testUser = userCredential.user
      testUsers.push(testUser)

      // Sign out to test login
      await signOut(auth)
    })

    it('should login with valid credentials', async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        testUser.email, 
        'testPassword123'
      )

      expect(userCredential.user.uid).toBe(testUser.uid)
      expect(userCredential.user.email).toBe(testUser.email)
    })

    it('should reject login with wrong password', async () => {
      await expect(
        signInWithEmailAndPassword(auth, testUser.email, 'wrongPassword')
      ).rejects.toThrow()
    })

    it('should reject login with non-existent user', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'nonexistent@example.com', 'password123')
      ).rejects.toThrow()
    })

    it('should handle malformed email in login', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'invalid-email', 'password123')
      ).rejects.toThrow()
    })
  })

  describe('Password Reset', () => {
    let testUser

    beforeEach(async () => {
      const email = `reset${Date.now()}@example.com`
      const password = 'testPassword123'
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      testUser = userCredential.user
      testUsers.push(testUser)
    })

    it('should send password reset email for valid user', async () => {
      // In emulator, this won't actually send email but should not throw error
      await expect(
        sendPasswordResetEmail(auth, testUser.email)
      ).resolves.not.toThrow()
    })

    it('should handle password reset for non-existent user', async () => {
      await expect(
        sendPasswordResetEmail(auth, 'nonexistent@example.com')
      ).rejects.toThrow()
    })

    it('should validate email format for password reset', async () => {
      await expect(
        sendPasswordResetEmail(auth, 'invalid-email')
      ).rejects.toThrow()
    })
  })

  describe('Session Management', () => {
    let testUser

    beforeEach(async () => {
      const email = `session${Date.now()}@example.com`
      const password = 'testPassword123'
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      testUser = userCredential.user
      testUsers.push(testUser)
    })

    it('should maintain user session after login', async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        testUser.email, 
        'testPassword123'
      )

      expect(auth.currentUser).toBeDefined()
      expect(auth.currentUser.uid).toBe(testUser.uid)
    })

    it('should clear session after logout', async () => {
      await signInWithEmailAndPassword(auth, testUser.email, 'testPassword123')
      expect(auth.currentUser).toBeDefined()

      await signOut(auth)
      expect(auth.currentUser).toBeNull()
    })

    it('should handle auth state changes', async () => {
      return new Promise((resolve) => {
        let callCount = 0
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
          callCount++
          
          if (callCount === 1) {
            // First call - should be null (signed out)
            expect(user).toBeNull()
            
            // Sign in user
            signInWithEmailAndPassword(auth, testUser.email, 'testPassword123')
          } else if (callCount === 2) {
            // Second call - should be signed in user
            expect(user).toBeDefined()
            expect(user.uid).toBe(testUser.uid)
            
            unsubscribe()
            resolve()
          }
        })
      })
    })
  })

  describe('Error Code Handling', () => {
    it('should return specific error codes for different scenarios', async () => {
      // Test user-not-found error
      try {
        await signInWithEmailAndPassword(auth, 'nonexistent@example.com', 'password')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).toBe('auth/user-not-found')
      }

      // Test invalid-email error
      try {
        await signInWithEmailAndPassword(auth, 'invalid-email', 'password')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).toBe('auth/invalid-email')
      }
    })

    it('should handle network errors during authentication', async () => {
      // Disable network to simulate network error
      await disableNetwork(db)
      
      try {
        await signInWithEmailAndPassword(auth, 'test@example.com', 'password')
        expect.fail('Should have thrown network error')
      } catch (error) {
        expect(error.code).toContain('unavailable')
      } finally {
        await enableNetwork(db)
      }
    })
  })
})