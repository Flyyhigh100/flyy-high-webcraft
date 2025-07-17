
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

  // Improved admin check that queries the database directly
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    console.log("Checking admin status for user:", user.email);
    
    try {
      // Method 1: Check email directly (most reliable fallback)
      const adminEmail = 'flyyhigh824@gmail.com';
      if (user.email === adminEmail) {
        console.log(`Email match found: ${user.email} is admin`);
        setIsAdmin(true);
        localStorage.setItem('flyy_high_admin', 'true');
        return true;
      }
      
      // Method 2: Query the profiles table for role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error checking profile role:", error);
      }
      
      if (profile && profile.role === 'admin') {
        console.log("Database role check: User is admin");
        setIsAdmin(true);
        localStorage.setItem('flyy_high_admin', 'true');
        return true;
      } else {
        console.log("Database role check: User is NOT admin", profile);
      }
      
      // Method 3: Check localStorage fallback
      const localStorageAdmin = localStorage.getItem('flyy_high_admin');
      if (localStorageAdmin === 'true') {
        console.log("localStorage fallback: User is admin");
        setIsAdmin(true);
        return true;
      }
      
      // If we get here, user is not admin
      console.log("Final determination: User is NOT admin");
      setIsAdmin(false);
      localStorage.removeItem('flyy_high_admin');
      return false;
    } catch (err) {
      console.error("Error in admin check:", err);
      return false;
    }
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
    const redirectUrl = `${window.location.origin}/login`;
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
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
