import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { getAndClearRedirectPath, determineRedirectPath } from "../utils/redirectUtils";
import Logo from "../components/Logo";

export default function Signup() {
  const { signup } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
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
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use auth store signup method (handles both Firebase and demo mode)
      await signup(email, password, name);
      
      // Navigate after successful signup
      const { userProfile } = useAuthStore.getState();
      const savedRedirectPath = getAndClearRedirectPath();
      const redirectPath = determineRedirectPath(userProfile, savedRedirectPath);
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      // Get user-friendly error from auth store
      const { error: authError } = useAuthStore.getState();
      setError(authError || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Clear error when user starts typing
  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'confirmPassword') setConfirmPassword(value);
    
    // Clear errors when user starts typing
    if (error) setError("");
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-himalaya-light to-blue-200" role="main">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <Logo className="text-nyano-terracotta justify-center" size="default" linkTo="/" />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-himalaya-dark">Join Darjeeling Souls</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-lg border border-red-200" role="alert" aria-live="assertive">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-himalaya-dark font-medium mb-1">Full Name</label>
            <input 
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={validationErrors.name ? 'true' : 'false'}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={name} 
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
              data-cy="signup-name"
            />
            {validationErrors.name && (
              <p id="name-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.name}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-himalaya-dark font-medium mb-1">Email Address</label>
            <input 
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={validationErrors.email ? 'true' : 'false'}
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={email} 
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              disabled={loading}
              data-cy="signup-email"
            />
            {validationErrors.email && (
              <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.email}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-himalaya-dark font-medium mb-1">Password</label>
            <input 
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={validationErrors.password ? 'true' : 'false'}
              aria-describedby={validationErrors.password ? 'password-error' : 'password-help'}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={password} 
              onChange={e => handleInputChange('password', e.target.value)}
              placeholder="Create a password"
              disabled={loading}
              data-cy="signup-password"
            />
            <p id="password-help" className="text-gray-600 text-sm mt-1">
              Must be at least 6 characters long
            </p>
            {validationErrors.password && (
              <p id="password-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.password}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-himalaya-dark font-medium mb-1">Confirm Password</label>
            <input 
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={validationErrors.confirmPassword ? 'true' : 'false'}
              aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-himalaya transition-colors ${
                validationErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={confirmPassword} 
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              data-cy="signup-confirm-password"
            />
            {validationErrors.confirmPassword && (
              <p id="confirm-password-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-organic-primary text-white py-2 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2"
            aria-describedby={loading ? 'signup-loading-status' : undefined}
            data-cy="signup-submit"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          {loading && (
            <p id="signup-loading-status" className="sr-only" aria-live="polite">
              Creating your account, please wait...
            </p>
          )}
        </form>
        <div className="mt-4 text-center text-himalaya-dark">
          Already have an account?{" "}
          <Link to="/login" className="text-himalaya underline hover:text-himalaya-dark focus:outline-none focus:ring-2 focus:ring-himalaya focus:ring-offset-2 rounded">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}