import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Types for our AuthContext
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; data: any }>;
  updatePassword: (password: string) => Promise<{ error: Error | null; data: any }>;
  checkAdminStatus: () => Promise<boolean>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check if user is an admin by querying a profile or role table
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('Checking admin status for user:', user.email);
      
      // TEMPORARY: Force admin to true for testing until DB is set up properly
      console.log('⚠️ FORCING ADMIN STATUS TO TRUE FOR TESTING');
      setIsAdmin(true);
      return true;
      
      /*
      // Try querying the profiles table to check admin role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      console.log('Admin check query result:', data, error);
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      // If the user has an admin role, return true
      const isUserAdmin = data?.role === 'admin';
      console.log('Is user admin?', isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
      */
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    // Get current session from Supabase
    async function getInitialSession() {
      setIsLoading(true);
      
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session?.user?.email || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus();
      }
      
      setIsLoading(false);
    }
    
    getInitialSession();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change event:', _event, session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus();
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign up function
  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };
  
  // Sign out function
  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    console.log('Signed out. Session should be null now.');
    
    // Force clear local storage and reload for complete logout
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/login';
  };
  
  // Reset password function (sends reset email)
  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };
  
  // Update password function (used after password reset)
  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };
  
  // The value passed to the provider
  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkAdminStatus,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 