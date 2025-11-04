import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../utilities/auth';

/**
 * Protected Route Component
 * Protects routes that require authentication
 */
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auths/auth-login" replace />;
  }

  return children;
};

/**
 * Admin Protected Route Component
 * Protects routes that require admin privileges
 */
export const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auths/auth-login" replace />;
  }

  if (!isAdmin()) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied!</h4>
          <p>You do not have permission to access this page. Only administrators can access this section.</p>
          <hr />
          <p className="mb-0">If you believe this is an error, please contact your system administrator.</p>
        </div>
      </div>
    );
  }

  return children;
};
