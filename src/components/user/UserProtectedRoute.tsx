import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredUser } from '../../utils/auth';

function UserProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('busgoToken');
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default UserProtectedRoute;