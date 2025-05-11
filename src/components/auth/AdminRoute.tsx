import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  redirectPath?: string;
}

export function AdminRoute({ redirectPath = '/dashboard' }: AdminRouteProps) {
  const { user, isLoading, isAdmin, checkAdminStatus } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      
      // First check if user is authenticated
      if (!isLoading && !user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Then check admin status through multiple methods
      if (!isLoading && user) {
        // Method 1: Check isAdmin state from AuthContext
        if (isAdmin) {
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 2: Force a fresh check of admin status from database
        const dbAdminAccess = await checkAdminStatus();
        if (dbAdminAccess) {
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 3: Check localStorage fallback (for cases where DB fails)
        const localStorageAdmin = localStorage.getItem('flyy_high_admin');
        if (localStorageAdmin === 'true') {
          console.log('Admin access granted via localStorage fallback');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 4: Known admin email check
        if (user.email === 'flyyhigh824@gmail.com') {
          console.log('Admin access granted via hardcoded email match');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // If all methods fail, redirect to dashboard
        navigate(redirectPath, { replace: true });
      }
      
      setIsCheckingAccess(false);
    };
    
    verifyAccess();
  }, [user, isLoading, navigate, redirectPath, checkAdminStatus, isAdmin]);

  if (isLoading || isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated and has admin access, render the child route
  return (hasAdminAccess) ? <Outlet /> : null;
} 