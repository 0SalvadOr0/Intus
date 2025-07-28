import { useAuth } from '@/contexts/AuthContext';
import { AdminLogin } from '@/components/AdminLogin';
import { LoadingSpinner } from '@/components/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accesso Negato</h1>
          <p className="text-muted-foreground mb-6">
            Non hai i permessi necessari per accedere a questa sezione.
          </p>
          <p className="text-sm text-muted-foreground">
            Solo gli amministratori di sistema possono accedere alla dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
