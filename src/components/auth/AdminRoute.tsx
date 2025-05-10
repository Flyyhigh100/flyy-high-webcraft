import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  redirectPath?: string;
}

export function AdminRoute({ redirectPath = '/dashboard' }: AdminRouteProps) {
  const { user, isLoading, isAdmin, checkAdminStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      // First check if user is authenticated
      if (!isLoading && !user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Then check admin status
      if (!isLoading && user) {
        const hasAdminAccess = await checkAdminStatus();
        if (!hasAdminAccess) {
          navigate(redirectPath, { replace: true });
        }
      }
    };
    
    verifyAccess();
  }, [user, isLoading, navigate, redirectPath, checkAdminStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated and is admin, render the child route
  return (user && isAdmin) ? <Outlet /> : null;
} 