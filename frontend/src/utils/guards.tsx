import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { dashboardPath, useAuth } from '../context/AuthContext';
import type { Role } from '../types';

/** Redirects to /login (and back afterwards) when the user isn't signed in with an allowed role. */
export function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}&role=${roles[0]}`} replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={`${dashboardPath(user.role)}?denied=1`} replace />;
  }
  return <>{children}</>;
}
