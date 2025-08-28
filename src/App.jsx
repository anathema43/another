import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import About from "./pages/About";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Disclaimer from "./pages/Disclaimer";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import ArtisansDirectory from "./pages/ArtisansDirectory";
import ArtisanProfile from "./pages/ArtisanProfile";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import DevelopmentRoadmap from "./pages/DevelopmentRoadmap";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useWishlistStore } from "./store/wishlistStore";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { fetchUser, loading } = useAuthStore();
  const { loadCart, subscribeToCart } = useCartStore();
  const { loadWishlist, subscribeToWishlist } = useWishlistStore();
  
  useEffect(() => {
    try {
      const unsub = fetchUser();
      loadCart();
      loadWishlist();
      
      // Set up real-time listeners when user is authenticated
      const { currentUser } = useAuthStore.getState();
      if (currentUser) {
        subscribeToCart();
        subscribeToWishlist();
      }
      
      return () => unsub && unsub();
    } catch (error) {
      // Firebase not configured, running in demo mode
    }
  }, [fetchUser, loadCart, loadWishlist, subscribeToCart, subscribeToWishlist]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-organic-background">
          <Navbar />
          <main>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ShippingPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Artisan Routes */}
            <Route path="/artisans" element={<ArtisansDirectory />} />
            <Route path="/artisans/:id" element={<ArtisanProfile />} />
            
            {/* Stories Routes */}
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            
            {/* Development Roadmap */}
            <Route path="/roadmap" element={<DevelopmentRoadmap />} />
            
            {/* Protected Routes */}
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
                <Wishlist />
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
