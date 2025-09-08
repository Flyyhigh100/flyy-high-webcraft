
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Direct database check - most reliable
      if (user) {
        try {
          // Email-based admin check removed for security
          
          // Method 2: Query the profile directly
          console.log('AdminRoute: Querying profile for user:', user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error checking profile:', error);
            console.error('Auth session during error:', await supabase.auth.getSession());
            // Don't fail here, try other methods
          } else {
            console.log('AdminRoute: Profile query result:', data);
          }
          
          if (data && data.role === 'admin') {
            console.log('AdminRoute: Admin access granted via database role');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            return;
          }
          
          // Method 3: Check isAdmin state
          if (isAdmin) {
            console.log('AdminRoute: Admin access granted via AuthContext isAdmin state');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            return;
          }
          
          // Method 4: Force a fresh check of admin status
          const refreshedAdminStatus = await checkAdminStatus();
          console.log('AdminRoute: Refreshed admin status check:', refreshedAdminStatus);
          if (refreshedAdminStatus) {
            console.log('AdminRoute: Admin access granted via refreshed check');
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            return;
          }
          
          // localStorage-based admin fallback removed for security
          
          // If all checks fail, redirect
          console.log('AdminRoute: No admin access confirmed, redirecting');
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this page",
            variant: "destructive",
          });
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error('Error verifying admin status:', error);
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
  return (hasAdminAccess) ? <Outlet /> : null;
}
