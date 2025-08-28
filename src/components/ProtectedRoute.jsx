import React from 'react';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';
import { Navigate, useLocation } from 'react-router-dom';
import { saveRedirectPath } from '../utils/redirectUtils';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    saveRedirectPath(location.pathname);
    return React.createElement(Navigate, { to: "/login", replace: true });
  }

  return children;
}