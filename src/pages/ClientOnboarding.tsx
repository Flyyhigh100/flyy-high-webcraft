import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { token, site } = Object.fromEntries(new URLSearchParams(window.location.search));
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ClientOnboarding - URL params:', { token, site, fullURL: window.location.href });
    if (token) {
      verifyInvitation(token);
    } else {
      console.log('No token found in URL parameters');
      toast({
        title: "Invalid Link",
        description: "This invitation link is missing the required token.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [token, navigate]);

  const verifyInvitation = async (inviteToken: string) => {
    try {
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired invitation');
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      setInvitation(data);
    } catch (error: any) {
      toast({
        title: "Invalid Invitation",
        description: error.message,
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

        // Update the website to link to this user
        const { error: websiteError } = await supabase
          .from('websites')
          .update({ user_id: authData.user.id })
          .eq('id', invitation.site_id);

        if (websiteError) console.error('Website update error:', websiteError);

        // Mark invitation as used
        const { error: inviteError } = await supabase
          .from('client_invitations')
          .update({ 
            status: 'used',
            used_at: new Date().toISOString()
          })
          .eq('id', invitation.id);

        if (inviteError) console.error('Invitation update error:', inviteError);

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
    <div className="container mx-auto px-4 py-12 max-w-md">
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
    </div>
  );
}