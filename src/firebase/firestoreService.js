// src/firebase/firestoreService.js
import { db } from "./firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, query, where,
} from "firebase/firestore";

/* =========== PRODUCT SERVICES ========== */
// Get all products (from Firestore collection)
export async function getAllProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get a single product by ID
export async function getProductById(id) {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

/* =========== CART SERVICES ========== */
// Get cart for a user
export async function getCartFromFirestore(uid) {
  const docRef = doc(db, "carts", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return [];
  return docSnap.data().items || [];
}
// Save/update cart for a user
export async function saveCartToFirestore(uid, cartItems) {
  await setDoc(doc(db, "carts", uid), { items: cartItems });
}

/* =========== ORDER SERVICES ========== */
// Create order
export async function createOrder(uid, orderData) {
  return await addDoc(collection(db, "orders"), {
    ...orderData,
    userId: uid,
    createdAt: Date.now()
  });
}
// Get orders for a user
export async function getOrdersForUser(uid) {
  const q = query(collection(db, "orders"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* =========== USER SERVICES ========== */
// Save user profile to Firestore
export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}
// Get user profile
export async function getUserProfile(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}

/* =========== WISHLIST SERVICES ========== */
export async function getWishlist(uid) {
  const docSnap = await getDoc(doc(db, "wishlists", uid));
  return docSnap.exists() ? docSnap.data().productIds || [] : [];
}
export async function saveWishlist(uid, productIds) {
  await setDoc(doc(db, "wishlists", uid), { productIds });
}

/* =========== REVIEWS ========== */
export async function addReview(productId, review) {
  await addDoc(collection(db, "products", productId, "reviews"), review);
}
export async function getReviews(productId) {
  const snapshot = await getDocs(collection(db, "products", productId, "reviews"));
  return snapshot.docs.map(doc => doc.data());
}
