import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecoveryCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryCodesModal({ open, onOpenChange }: RecoveryCodesModalProps) {
  const [recoveryCodes, setRecoveryCodes] = useState<Array<{ code: string; used: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadRecoveryCodes();
    }
  }, [open]);

  const loadRecoveryCodes = async () => {
    setIsLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('recovery_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // We can't show actual codes (they're hashed), so show placeholders
      setRecoveryCodes(
        data?.map((item, i) => ({
          code: `CODE-${i + 1}-****`,
          used: item.used
        })) || []
      );
    } catch (err) {
      console.error('Error loading recovery codes:', err);
      toast({
        title: "Error",
        description: "Failed to load recovery codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecoveryCodes = (count: number): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Delete old codes
      await supabase.from('recovery_codes').delete().eq('user_id', user.id);

      // Generate new codes
      const newCodes = generateRecoveryCodes(10);
      
      // Hash and store new codes
      const hashedCodes = await Promise.all(
        newCodes.map(async (code) => {
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

      // Show new codes to user
      const blob = new Blob([newCodes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sydevault-recovery-codes-new.txt';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Recovery Codes Regenerated",
        description: "New codes have been generated and downloaded. Old codes are now invalid.",
      });

      loadRecoveryCodes();
    } catch (err) {
      console.error('Error regenerating codes:', err);
      toast({
        title: "Error",
        description: "Failed to regenerate recovery codes",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const unusedCount = recoveryCodes.filter(c => !c.used).length;
  const isLowOnCodes = unusedCount < 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recovery Codes</DialogTitle>
          <DialogDescription>
            Use these codes if you lose access to your authenticator app
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {isLowOnCodes && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have {unusedCount} unused codes remaining. Consider regenerating new codes.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Recovery codes are stored securely (hashed). For security, we can't display the actual codes after initial generation.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-1 font-mono text-sm">
              {recoveryCodes.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    <code className={item.used ? 'line-through opacity-50' : ''}>
                      {item.code}
                    </code>
                  </div>
                  {item.used && (
                    <span className="text-xs text-muted-foreground">Used</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unused Codes:</span>
              <span className="font-medium">{unusedCount} / {recoveryCodes.length}</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isLoading || isRegenerating}
            className="w-full sm:w-auto"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Codes
              </>
            )}
          </Button>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
