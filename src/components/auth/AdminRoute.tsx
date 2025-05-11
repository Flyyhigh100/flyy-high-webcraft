
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
    console.log("AdminRoute: Starting admin access check");
    console.log("Current auth state - isAdmin:", isAdmin, "User:", user?.email);
    
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      
      // First check if user is authenticated
      if (!isLoading && !user) {
        console.log("AdminRoute: No user found, redirecting to login");
        navigate('/login', { replace: true });
        return;
      }
      
      console.log(`AdminRoute: User authenticated: ${user?.email}`);
      
      // Then check admin status through multiple methods
      if (!isLoading && user) {
        // Method 1: Direct email check (most reliable)
        if (user.email === 'flyyhigh824@gmail.com') {
          console.log('AdminRoute: Admin access granted via direct email match');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 2: Check isAdmin state from AuthContext
        console.log('AdminRoute: Checking isAdmin state:', isAdmin);
        if (isAdmin) {
          console.log('AdminRoute: Admin access granted via AuthContext isAdmin state');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 3: Force a fresh check of admin status from AuthContext
        console.log('AdminRoute: Running refreshed admin status check');
        const refreshedAdminStatus = await checkAdminStatus();
        console.log('AdminRoute: Refreshed admin status result:', refreshedAdminStatus);
        if (refreshedAdminStatus) {
          console.log('AdminRoute: Admin access granted via refreshed admin status');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // Method 4: Check localStorage fallback
        const localStorageAdmin = localStorage.getItem('flyy_high_admin');
        console.log('AdminRoute: Checking localStorage admin status:', localStorageAdmin);
        if (localStorageAdmin === 'true') {
          console.log('AdminRoute: Admin access granted via localStorage fallback');
          setHasAdminAccess(true);
          setIsCheckingAccess(false);
          return;
        }
        
        // If all methods fail, redirect to dashboard
        console.log('AdminRoute: No admin access found, redirecting to dashboard');
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
