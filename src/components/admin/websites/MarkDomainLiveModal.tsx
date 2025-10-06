import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MarkDomainLiveModalProps {
  websiteId: string;
  websiteName: string;
  onSuccess?: () => void;
}

export function MarkDomainLiveModal({ websiteId, websiteName, onSuccess }: MarkDomainLiveModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('websites')
        .update({
          domain_live_date: new Date().toISOString(),
          grace_period_days: gracePeriodDays
        })
        .eq('id', websiteId);

      if (error) throw error;

      toast({
        title: "Domain Marked as Live",
        description: `${websiteName} is now live with a ${gracePeriodDays}-day grace period for payment.`,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark domain as live",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>Mark Live</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Domain as Live</DialogTitle>
          <DialogDescription>
            Set the domain as live and configure a grace period for client payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Alert>
              <AlertDescription>
                When a domain goes live, the client gets a grace period to make their payment without interruption to their site.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                value={websiteName}
                className="col-span-3"
                disabled
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gracePeriod" className="text-right">
                Grace Period
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="gracePeriod"
                  type="number"
                  min="1"
                  max="30"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 7)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                The domain will be marked live immediately. Payment status will remain "current" for {gracePeriodDays} days even if payment is overdue during this period.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Live"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
