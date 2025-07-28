import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

// Completely standalone invite page - NO auth context, NO layout, NO dependencies
export default function Invite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const site = searchParams.get('site');

  useEffect(() => {
    console.log('=== INVITE PAGE MOUNTED ===');
    console.log('URL:', window.location.href);
    console.log('Token:', token);
    console.log('Site:', site);
    
    if (!token) {
      setStatus('error');
      setError('No invitation token found in URL');
      return;
    }

    // Verify invitation directly
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      console.log('Verifying token:', token);
      
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      console.log('Invitation query result:', { data, error });

      if (error || !data) {
        setStatus('error');
        setError('Invalid or expired invitation token');
        return;
      }

      setInvitation(data);
      setStatus('ready');
    } catch (err) {
      console.error('Error verifying invitation:', err);
      setStatus('error');
      setError('Failed to verify invitation');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      console.log('Creating account for:', invitation.email);
      
      // Sign up the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            client_name: invitation.client_name,
            invited_user: true
          }
        }
      });

      if (signupError) throw signupError;

      if (authData.user) {
        // Update website to link to user
        await supabase
          .from('websites')
          .update({ user_id: authData.user.id })
          .eq('id', invitation.site_id);

        // Mark invitation as used
        await supabase
          .from('client_invitations')
          .update({ 
            status: 'used',
            used_at: new Date().toISOString()
          })
          .eq('id', invitation.id);

        // Confirm user email via edge function
        try {
          await supabase.functions.invoke('confirm-invited-user', {
            body: { userId: authData.user.id }
          });
        } catch (confirmError) {
          console.error('Email confirmation failed:', confirmError);
        }

        setStatus('success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    }
  };

  // Simple loading state
  if (status === 'loading') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1>Loading invitation...</h1>
        <p>URL: {window.location.href}</p>
        <p>Token: {token}</p>
        <p>Site: {site}</p>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: 'red' }}>Invitation Error</h1>
        <p>{error}</p>
        <p>URL: {window.location.href}</p>
        <p>Token: {token}</p>
        <button onClick={() => window.location.href = '/login'}>Go to Login</button>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: 'green' }}>Account Created Successfully!</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  // Main form
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img 
          src="/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png" 
          alt="Syde Vault" 
          style={{ height: '80px', margin: '0 auto 20px' }}
        />
        <h1>Welcome to SydeVault!</h1>
        <p>Complete your account setup for: <strong>{invitation?.website_name}</strong></p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Website Details:</h3>
        <p><strong>Name:</strong> {invitation?.website_name}</p>
        <p><strong>URL:</strong> {invitation?.website_url}</p>
        <p><strong>Plan:</strong> {invitation?.plan_type}</p>
        <p><strong>Email:</strong> {invitation?.email}</p>
      </div>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <button 
          type="submit"
          style={{ 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Create Account
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>Token:</strong> {token}</p>
        <p><strong>Site:</strong> {site}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}