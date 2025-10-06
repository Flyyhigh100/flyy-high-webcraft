import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, ShieldCheck, ShieldOff, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TwoFactorEnrollment } from "./TwoFactorEnrollment";
import { RecoveryCodesModal } from "./RecoveryCodesModal";

export function TwoFactorManagement() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const enrolledFactors = data?.totp || [];
      setFactors(enrolledFactors);
      setIsEnabled(enrolledFactors.length > 0);
    } catch (err) {
      console.error('Error checking MFA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (factors.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factors[0].id
      });

      if (error) throw error;

      // Delete recovery codes
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('recovery_codes').delete().eq('user_id', user.id);
      }

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been removed from your account.",
      });

      setIsEnabled(false);
      setFactors([]);
      setShowDisableConfirm(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && factors.length === 0) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Two-Factor Authentication</h3>
              {isEnabled && (
                <Badge variant="default" className="bg-green-500">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEnabled
                ? "Your account is protected with 2FA"
                : "Add an extra layer of security to your account"}
            </p>
          </div>

          {!isEnabled ? (
            <Button onClick={() => setShowEnrollment(true)}>
              Enable 2FA
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowDisableConfirm(true)}
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Disable 2FA
            </Button>
          )}
        </div>

        {isEnabled && factors.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Enrolled Factors:</span>
              <span className="font-medium">{factors.length} device(s)</span>
            </div>
            {factors[0].created_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enrolled On:</span>
                <span className="font-medium">
                  {new Date(factors[0].created_at).toLocaleDateString()}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecoveryCodes(true)}
              className="w-full mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              View Recovery Codes
            </Button>
          </div>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollment} onOpenChange={setShowEnrollment}>
        <DialogContent className="max-w-lg">
          <TwoFactorEnrollment
            onSuccess={() => {
              setShowEnrollment(false);
              checkMfaStatus();
            }}
            onCancel={() => setShowEnrollment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication?</DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account. You can always re-enable it later.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your recovery codes will also be deleted and cannot be recovered.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisableConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recovery Codes Modal */}
      {showRecoveryCodes && (
        <RecoveryCodesModal
          open={showRecoveryCodes}
          onOpenChange={setShowRecoveryCodes}
        />
      )}
    </>
  );
}
