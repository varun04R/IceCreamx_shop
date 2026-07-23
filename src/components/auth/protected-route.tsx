import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { Loader } from '@/components/ui/loader';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
