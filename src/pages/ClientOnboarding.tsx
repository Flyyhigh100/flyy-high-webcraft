import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

interface ClientInvitation {
  id: string;
  email: string;
  client_name: string;
  website_name: string;
  website_url: string;
  plan_type: string;
  site_id: string;
  status: string;
  expires_at: string;
}

export default function ClientOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const site = searchParams.get('site');
  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== ClientOnboarding Component Mounted ===');
    console.log('ClientOnboarding - URL params:', { 
      token, 
      site, 
      fullURL: window.location.href,
      search: window.location.search,
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    if (token) {
      console.log('Token found, verifying invitation:', token);
      verifyInvitation(token);
    } else {
      console.log('No token found in URL parameters');
      console.log('Available search params:', Object.fromEntries(searchParams.entries()));
      toast({
        title: "Invalid Link",
        description: "This invitation link is missing the required token.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [token, navigate, searchParams]);

  const verifyInvitation = async (inviteToken: string) => {
    try {
      console.log('Verifying invitation token:', inviteToken);
      
      // Verify invitation securely via Edge Function (no direct table access)
      const { data, error } = await supabase.functions.invoke('get-invitation-details', {
        body: { token: inviteToken }
      });

      console.log('Invitation verification result:', { data, error });

      if (error || !data?.success) {
        throw new Error(data?.error || 'INVALID_TOKEN');
      }

      setInvitation(data.invitation as any);
    } catch (error: any) {
      console.error('Invitation verification error:', error);
      
      let title = "Invalid Invitation";
      let description = "This invitation link is not valid.";

      switch (error.message) {
        case 'INVALID_TOKEN':
          title = "Invalid Invitation Link";
          description = "This invitation link is no longer valid. The invitation may have been deleted or the link is incorrect. Please ask for a new invitation to be sent.";
          break;
        case 'ALREADY_USED':
          title = "Invitation Already Used";
          description = "This invitation has already been used to create an account. If you need access, please try logging in or ask for a new invitation.";
          break;
        case 'SUPERSEDED':
          title = "Outdated Invitation";
          description = "This invitation link has been replaced by a newer one. Please use the latest email invite or ask for a new invitation to be sent.";
          break;
        case 'EXPIRED':
          title = "Invitation Expired";
          description = "This invitation has expired. Please ask for a new invitation to be sent.";
          break;
        case 'NOT_PENDING':
          title = "Invitation Not Available";
          description = "This invitation is no longer available for use. Please ask for a new invitation to be sent.";
          break;
        default:
          description = error.message || "Please ask for a new invitation to be sent.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setSignupLoading(true);
    try {
      // Sign up the user with email confirmation bypassed for invited users
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            client_name: invitation.client_name,
            invited_user: true // Mark as invited user
          }
        }
      });

      if (signupError) throw signupError;

      if (authData.user) {
        // Confirm the invited user's email automatically
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('confirm-invited-user', {
            body: { userId: authData.user.id }
          });

          if (functionError) {
            console.error('Failed to confirm user email:', functionError);
          }
        } catch (confirmError) {
          console.error('Error confirming user email:', confirmError);
        }

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

        toast({
          title: "Account Created!",
          description: "Your account has been created successfully and you can now log in.",
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png" 
            alt="Syde Vault" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Client Onboarding</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Welcome to Our Platform!</CardTitle>
            <CardDescription>
              You've been invited to manage your website: <strong>{invitation.website_name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Website Details:</h3>
              <p><strong>Name:</strong> {invitation.website_name}</p>
              <p><strong>URL:</strong> {invitation.website_url}</p>
              <p><strong>Plan:</strong> {invitation.plan_type}</p>
              {(invitation as any).created_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Invitation sent:</strong> {new Date((invitation as any).created_at).toLocaleString()}
                  {(invitation as any).invitation_version && ` (v${(invitation as any).invitation_version})`}
                </p>
              )}
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={signupLoading}>
                {signupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Debug information */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-yellow-700">Current URL: {window.location.href}</p>
          <p className="text-sm text-yellow-700">Token: {token}</p>
          <p className="text-sm text-yellow-700">Site: {site}</p>
        </div>
      </div>
    </div>
  );
}