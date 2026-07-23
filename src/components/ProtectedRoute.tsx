/**
 * ProtectedRoute — guards routes that require auth (and optionally admin role).
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from './Spinner';

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner label="Checking your session…" />;

  if (!user) {
    return (
      <Navigate
        to={requireAdmin ? '/admin/login' : '/login'}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
