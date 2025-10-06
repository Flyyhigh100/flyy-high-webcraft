import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';

// Completely standalone invite page - NO auth context, NO layout, NO dependencies
export default function Invite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      
      // Use secure edge function to verify invitation
      const { data, error } = await supabase.functions.invoke('get-invitation-details', {
        body: { token }
      });

      console.log('Invitation verification result:', { data, error });

      if (error || !data?.success) {
        setStatus('error');
        setError(data?.error || 'Invalid or expired invitation token');
        return;
      }

      setInvitation(data.invitation);
      setStatus('ready');
    } catch (err) {
      console.error('Error verifying invitation:', err);
      setStatus('error');
      setError('Failed to verify invitation');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue');
      return;
    }

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
        // Securely accept invitation via Edge Function (no direct table writes)
        try {
          const { data: acceptData, error: acceptError } = await supabase.functions.invoke('accept-invitation', {
            body: { token }
          });
          if (acceptError || !acceptData?.success) {
            console.error('Accept invitation failed:', acceptError || acceptData?.error);
          }
        } catch (acceptErr) {
          console.error('Error accepting invitation:', acceptErr);
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

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold">Loading invitation...</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-primary">Account Created Successfully!</h1>
              <p className="text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png" 
              alt="SydeVault" 
              className="h-32 w-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold syde-vault-logo">Welcome to SydeVault!</h1>
            <p className="text-muted-foreground">Complete your account setup for: <strong className="text-foreground">{invitation?.website_name}</strong></p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Website Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{invitation?.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">URL:</span>
                <span className="text-primary">{invitation?.website_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <span className="text-accent font-medium">{invitation?.plan_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{invitation?.email}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter your password (min. 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit"
              className="w-full"
              disabled={!termsAccepted}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}