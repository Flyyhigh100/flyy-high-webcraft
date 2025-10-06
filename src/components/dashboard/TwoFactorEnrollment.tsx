import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import QRCode from "react-qr-code";

interface TwoFactorEnrollmentProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorEnrollment({ onSuccess, onCancel }: TwoFactorEnrollmentProps) {
  const [step, setStep] = useState<'enroll' | 'verify' | 'recovery'>('enroll');
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Step 1: Enroll and get QR code
  const handleEnroll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize 2FA enrollment');
      console.error('Enrollment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify the code
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode
      });

      if (verify.error) throw verify.error;

      // Generate recovery codes
      const codes = generateRecoveryCodes(10);
      await storeRecoveryCodes(codes);
      setRecoveryCodes(codes);
      setStep('recovery');

      toast({
        title: "2FA Enabled Successfully",
        description: "Two-factor authentication has been activated for your account.",
      });
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate recovery codes
  const generateRecoveryCodes = (count: number): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  // Store hashed recovery codes in database
  const storeRecoveryCodes = async (codes: string[]) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const hashedCodes = await Promise.all(
      codes.map(async (code) => {
        // Simple hash using crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(code);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      })
    );

    await supabase.from('recovery_codes').insert(
      hashedCodes.map(hash => ({
        user_id: user.id,
        code_hash: hash,
        used: false
      }))
    );
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast({
      title: "Copied",
      description: "Recovery codes copied to clipboard",
    });
  };

  const downloadRecoveryCodes = () => {
    const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sydevault-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Recovery codes saved to your device",
    });
  };

  // Start enrollment on mount
  if (step === 'enroll' && !qrCode) {
    handleEnroll();
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {step === 'enroll' && 'Setting up 2FA...'}
          {step === 'verify' && 'Scan QR Code'}
          {step === 'recovery' && 'Save Recovery Codes'}
        </CardTitle>
        <CardDescription>
          {step === 'enroll' && 'Initializing two-factor authentication'}
          {step === 'verify' && 'Scan with Google Authenticator, Authy, 1Password, or any TOTP app'}
          {step === 'recovery' && 'Store these codes in a safe place. You can use them if you lose access to your authenticator.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'enroll' && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {step === 'verify' && (
          <>
            <div className="flex flex-col items-center space-y-4">
              {qrCode && (
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={qrCode} size={200} />
                </div>
              )}
              
              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-center">Can't scan? Enter this code manually:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="bg-muted px-3 py-2 rounded text-sm font-mono">{secret}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast({ title: "Copied", description: "Secret key copied" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Enter the 6-digit code from your app:</p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'recovery' && (
          <>
            <Alert className="bg-amber-50 text-amber-900 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                Save these codes now! You won't be able to see them again.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-1 font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  <code>{code}</code>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={copyRecoveryCodes}
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Codes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadRecoveryCodes}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is now active on your account!
              </AlertDescription>
            </Alert>

            <Button onClick={onSuccess} className="w-full">
              Done
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
