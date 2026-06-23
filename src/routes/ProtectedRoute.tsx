import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { StoredUser } from '../utils/auth';

type ProtectedRouteProps = {
  roles?: StoredUser['role'][];
};

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
