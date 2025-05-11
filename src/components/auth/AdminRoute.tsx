
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminRouteProps {
  redirectPath?: string;
}

export function AdminRoute({ redirectPath = '/dashboard' }: AdminRouteProps) {
  const { user, isLoading, isAdmin, checkAdminStatus } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      console.log('Verifying admin access...');
      console.log('User:', user?.email);
      console.log('Is admin from context:', isAdmin);
      
      // First check if user is authenticated
      if (!isLoading && !user) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      
      // Then check admin status through multiple methods
      if (!isLoading && user) {
        try {
          // Method 1: Check isAdmin state from AuthContext
          if (isAdmin) {
            console.log('Admin access granted via AuthContext isAdmin state');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard",
            });
            return;
          }
          
          // Method 2: Force a fresh check of admin status from database
          console.log('Checking admin status from database...');
          const dbAdminAccess = await checkAdminStatus();
          console.log('Database admin check result:', dbAdminAccess);
          if (dbAdminAccess) {
            console.log('Admin access granted via database check');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard",
            });
            return;
          }
          
          // Method 3: Check localStorage fallback (for cases where DB fails)
          const localStorageAdmin = localStorage.getItem('flyy_high_admin');
          console.log('localStorage admin check:', localStorageAdmin);
          if (localStorageAdmin === 'true') {
            console.log('Admin access granted via localStorage fallback');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard (via localStorage)",
            });
            return;
          }
          
          // Method 4: Known admin email check
          if (user.email === 'flyyhigh824@gmail.com') {
            console.log('Admin access granted via hardcoded email match');
            // Save to localStorage as fallback for future
            localStorage.setItem('flyy_high_admin', 'true');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard (via email match)",
            });
            return;
          }
          
          // If all methods fail, redirect to dashboard
          console.log('All admin access checks failed, redirecting to', redirectPath);
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive",
          });
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error('Error during admin access verification:', error);
          toast({
            title: "Error",
            description: "Failed to verify admin access",
            variant: "destructive",
          });
          navigate(redirectPath, { replace: true });
        }
      }
      
      setIsCheckingAccess(false);
    };
    
    verifyAccess();
  }, [user, isLoading, navigate, redirectPath, checkAdminStatus, isAdmin, toast]);

  if (isLoading || isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated and has admin access, render the child route
  return hasAdminAccess ? <Outlet /> : null;
}
