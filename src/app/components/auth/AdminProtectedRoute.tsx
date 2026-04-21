import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated: userLoggedIn, isLoading: userLoading } = useAuth();
  const { admin, loading: adminLoading } = useAdminAuth();
  const location = useLocation();
  const isLoading = userLoading || adminLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Checking access...</p>
        </div>
      </div>
    );
  }

  // KALAU USER UDAH LOGIN (AuthContext), BLOCK dari admin panel → redirect HOME
  if (userLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // KALAU BUKAN ADMIN, redirect ke admin login
  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ADMIN OK → render children
  return children;
};
