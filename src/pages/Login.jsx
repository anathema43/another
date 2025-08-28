// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getAndClearRedirectPath, determineRedirectPath } from "../utils/redirectUtils";
import Logo from "../components/Logo";
import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login, sendPasswordResetEmail, error: authError, clearError } = useAuthStore();

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use auth store login method (handles both Firebase and demo mode)
      await login(email, password);
      
      // Navigate after successful login
      const { userProfile } = useAuthStore.getState();
      const savedRedirectPath = getAndClearRedirectPath();
      const redirectPath = determineRedirectPath(userProfile, savedRedirectPath);
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      // Error is now handled by authStore with specific error codes
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      return;
    }
    
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(resetEmail);
      // Success is handled by authStore
    } catch (error) {
      // Error is handled by authStore
      console.error('Password reset error:', error);
    } finally {
      setResetLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "user-not-found":
        return "No account found with this email address.";
      case "wrong-password":
        return "Incorrect password.";
      case "invalid-email":
        return "Please enter a valid email address.";
      case "user-disabled":
        return "This account has been disabled. Please contact support.";
      case "too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "password-reset-sent":
        return "✅ Password reset email sent! Check your inbox.";
      case "reset-user-not-found":
        return "No account found with this email address.";
      case "reset-invalid-email":
        return "Please enter a valid email address.";
      case "reset-too-many-requests":
        return "Too many requests. Please try again later.";
      case "password-reset-error":
        return "Failed to send password reset email. Please try again.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const isSuccessMessage = authError === "password-reset-sent";
  const showSignUpButton = authError === "user-not-found";
  const highlightForgotPassword = authError === "wrong-password";

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (authError) clearError();
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (authError) clearError();
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-himalaya-light" role="main">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <Logo className="text-nyano-terracotta justify-center" size="default" linkTo="/" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-himalaya-dark text-center">Sign In to Darjeeling Souls</h1>
        
        {/* Intelligent Error/Success Messages */}
        {authError && (
          <div className={`p-3 mb-4 rounded-lg border ${
            isSuccessMessage 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : 'bg-red-100 text-red-700 border-red-200'
          }`} role="alert" aria-live="assertive">
            <div className="flex items-center">
              {isSuccessMessage ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {getErrorMessage(authError)}
            </div>
          </div>
        )}

        {/* Sign Up Instead Button for User Not Found */}
        {showSignUpButton && (
          <div className="mb-4">
            <Link 
              to="/signup"
              className="w-full bg-organic-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all text-center block"
            >
              Create Account Instead
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-himalaya-dark font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={validationErrors.email ? 'true' : 'false'}
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
              value={email}
              onChange={handleEmailChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              data-cy="login-email"
            />
            {validationErrors.email && (
              <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.email}
              </p>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-himalaya-dark font-medium">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setResetEmail(email);
                }}
                className={`text-sm underline transition-all ${
                  highlightForgotPassword 
                    ? 'text-organic-primary font-semibold text-base' 
                    : 'text-gray-600 hover:text-organic-primary'
                }`}
                data-cy="forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={validationErrors.password ? 'true' : 'false'}
              aria-describedby={validationErrors.password ? 'password-error' : undefined}
              value={password}
              onChange={handlePasswordChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              data-cy="login-password"
            />
            {validationErrors.password && (
              <p id="password-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.password}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-organic-primary hover:opacity-90 text-white font-semibold rounded py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2"
            aria-describedby={loading ? 'loading-status' : undefined}
            data-cy="login-submit"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
          {loading && (
            <p id="loading-status" className="sr-only" aria-live="polite">
              Signing you in, please wait...
            </p>
          )}
        </form>
        
        <div className="mt-4 text-center text-himalaya-dark">
          New here?{" "}
          <Link to="/signup" className="underline hover:text-himalaya-dark focus:outline-none focus:ring-2 focus:ring-himalaya focus:ring-offset-2 rounded">
            Create an account
          </Link>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-organic-text">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  clearError();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Reset your password</p>
                <p className="text-gray-600 text-sm">We'll send you a secure reset link</p>
              </div>
            </div>
            
            {authError && authError.startsWith('reset-') && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                authError === 'password-reset-sent'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {getErrorMessage(authError)}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-organic-text font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                  placeholder="Enter your email address"
                  data-cy="reset-email"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail.trim()}
                  className="flex-1 bg-organic-primary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-cy="reset-submit"
                >
                  {resetLoading ? "Sending..." : "Send Reset Email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    clearError();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            {authError === 'password-reset-sent' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the reset link in the email</li>
                  <li>3. Set your new password</li>
                  <li>4. Return here to login</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
