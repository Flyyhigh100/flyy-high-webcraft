
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
    console.log("Current auth state - User:", user?.email);
    
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      
      // First check if user is authenticated
      if (!isLoading && !user) {
        console.log("AdminRoute: No user found, redirecting to login");
        // Log failed admin access attempt
        try {
          await supabase.from('security_logs').insert({
            event_type: 'admin_access_denied',
            details: { reason: 'not_authenticated', ip: 'unknown' },
            success: false
          });
        } catch (e) {
          console.error('Failed to log security event:', e);
        }
        navigate('/login', { replace: true });
        return;
      }
      
      console.log(`AdminRoute: User authenticated: ${user?.email}`);
      
      // Use only the secure is_admin RPC function for verification
      if (user) {
        try {
          console.log('AdminRoute: Checking admin status via secure RPC');
          const { data: isAdminResult, error } = await supabase
            .rpc('is_admin', { _user_id: user.id });
            
          if (error) {
            console.error('Error checking admin status:', error);
            // Log failed admin verification
            try {
              await supabase.from('security_logs').insert({
                event_type: 'admin_verification_error',
                details: { error: error.message, user_id: user.id },
                success: false
              });
            } catch (e) {
              console.error('Failed to log security event:', e);
            }
            
            toast({
              title: "Error",
              description: "Failed to verify admin access",
              variant: "destructive",
            });
            navigate(redirectPath, { replace: true });
            return;
          }
          
          if (isAdminResult) {
            console.log('AdminRoute: Admin access granted');
            // Log successful admin access
            try {
              await supabase.from('security_logs').insert({
                event_type: 'admin_access_granted',
                details: { user_id: user.id, email: user.email },
                success: true
              });
            } catch (e) {
              console.error('Failed to log security event:', e);
            }
            
            setHasAdminAccess(true);
            setIsCheckingAccess(false);
            return;
          }
          
          // Access denied - log and redirect
          console.log('AdminRoute: Admin access denied - insufficient privileges');
          try {
            await supabase.from('security_logs').insert({
              event_type: 'admin_access_denied',
              details: { reason: 'insufficient_privileges', user_id: user.id, email: user.email },
              success: false
            });
          } catch (e) {
            console.error('Failed to log security event:', e);
          }
          
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this page",
            variant: "destructive",
          });
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error('Error verifying admin status:', error);
          // Log security error
          try {
            await supabase.from('security_logs').insert({
              event_type: 'admin_verification_error',
              details: { error: error.message, user_id: user.id },
              success: false
            });
          } catch (e) {
            console.error('Failed to log security event:', e);
          }
          
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
  }, [user, isLoading, navigate, redirectPath, toast]);

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
