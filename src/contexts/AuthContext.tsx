
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Types for our AuthContext
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  hasMfaEnabled: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; data: any }>;
  updatePassword: (password: string) => Promise<{ error: Error | null; data: any }>;
  checkAdminStatus: () => Promise<boolean>;
  checkMfaStatus: () => Promise<boolean>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasMfaEnabled, setHasMfaEnabled] = useState<boolean>(false);

  // Track last sign-in via Edge Function
  const trackSignIn = async () => {
    try {
      await supabase.functions.invoke('track-signin', {
        body: { userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown' }
      });
    } catch (err) {
      console.error('track-signin failed', err);
    }
  };

  // Strict admin check using DB only
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin', { _user_id: user.id });

      if (rpcError) {
        console.error('is_admin RPC failed:', rpcError.message);
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(!!isAdminRpc);
      return !!isAdminRpc;
    } catch (err) {
      console.error('Error in admin check:', err);
      setIsAdmin(false);
      return false;
    }
  };

  // Check if user has MFA enabled
  const checkMfaStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const enrolledFactors = data?.totp || [];
      const mfaEnabled = enrolledFactors.length > 0;
      setHasMfaEnabled(mfaEnabled);
      return mfaEnabled;
    } catch (err) {
      console.error('Error checking MFA status:', err);
      setHasMfaEnabled(false);
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
  console.log("Checking admin and MFA status during initial session");
  await checkAdminStatus();
  await checkMfaStatus();
  setTimeout(() => { trackSignIn(); }, 0);
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
      console.log("User authenticated, checking admin and MFA status");
      await checkAdminStatus();
      await checkMfaStatus();
      setTimeout(() => { trackSignIn(); }, 0);
    } else {
      console.log("No user or session, setting isAdmin and MFA to false");
      setIsAdmin(false);
      setHasMfaEnabled(false);
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
  const res = await supabase.auth.signInWithPassword({ email, password });
  if (!res.error) {
    setTimeout(() => { trackSignIn(); }, 0);
  }
  return res;
};
  
  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
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
    hasMfaEnabled,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkAdminStatus,
    checkMfaStatus,
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
