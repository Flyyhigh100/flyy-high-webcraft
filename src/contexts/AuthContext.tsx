
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

// Admin email - hardcoded for simplicity
const ADMIN_EMAIL = 'flyyhigh824@gmail.com';

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Simple admin check - just compare email with hardcoded admin email
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user email matches admin email
    const isUserAdmin = user.email === ADMIN_EMAIL;
    
    // Enhanced logging for debugging admin status
    console.log(`Admin check: User email (${user.email}) ${isUserAdmin ? 'MATCHES' : 'does NOT match'} admin email (${ADMIN_EMAIL})`);
    console.log(`Is admin before update: ${isAdmin}, Setting to: ${isUserAdmin}`);
    
    // Always set the isAdmin state based on the email check
    setIsAdmin(isUserAdmin);
    
    // Store this in localStorage as a fallback mechanism
    if (isUserAdmin) {
      localStorage.setItem('flyy_high_admin', 'true');
      console.log('Admin status saved to localStorage: true');
    } else {
      // Clear admin status if not admin
      localStorage.removeItem('flyy_high_admin');
      console.log('Admin status removed from localStorage');
    }
    
    return isUserAdmin;
  };

  useEffect(() => {
    // Get current session from Supabase
    async function getInitialSession() {
      setIsLoading(true);
      
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session ? "Session found" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("Checking admin status during initial session");
        await checkAdminStatus();
      }
      
      setIsLoading(false);
    }
    
    getInitialSession();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state change detected:", _event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("User authenticated, checking admin status");
          await checkAdminStatus();
        } else {
          console.log("No user or session, setting isAdmin to false");
          setIsAdmin(false);
          localStorage.removeItem('flyy_high_admin');
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
    await supabase.auth.signOut();
    localStorage.removeItem('flyy_high_admin');
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
