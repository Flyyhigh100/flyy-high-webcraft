import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EmailChangeFormProps {
  currentEmail: string;
  onClose: () => void;
}

export function EmailChangeForm({ currentEmail, onClose }: EmailChangeFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Check AAL level (authenticator assurance level)
      const { data: { currentLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMfa = (factors?.totp || []).length > 0;

      // If user has MFA but hasn't verified in this session, require AAL2
      if (hasMfa && currentLevel !== 'aal2') {
        setError("For your security, please sign out and sign in again with your 2FA code before changing your email.");
        return;
      }

      // First verify the password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password,
      });

      if (signInError) {
        setError("Current password is incorrect");
        return;
      }

      // Update email with redirect URL
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      }, {
        emailRedirectTo: `${window.location.origin}/`
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Email change confirmation sent! Check your new email address for a confirmation link.");
      toast({
        title: "Email Change Initiated",
        description: "Please check your new email address and click the confirmation link to complete the change.",
      });

      // Close form after a delay
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Email change error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Change Email Address</CardTitle>
        <CardDescription>
          Enter your new email address and current password to proceed
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-email">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="your.new.email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              disabled={isLoading || !!success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || !!success}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || !!success}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter your current password to confirm this change
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Email...
                </>
              ) : (
                "Change Email"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}