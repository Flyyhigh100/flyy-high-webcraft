import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { CancellationModal } from "./CancellationModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  current_period_end: string;
  stripe_subscription_id: string;
}

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onSubscriptionUpdated: () => void;
}

export const SubscriptionManagementModal = ({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdated,
}: SubscriptionManagementModalProps) => {
  const [showCancellation, setShowCancellation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        // If customer portal fails (common in test mode), show alternative options
        if (error.message?.includes('billing portal')) {
          toast({
            title: "Billing Portal Unavailable",
            description: "Use the options below to manage your subscription.",
            variant: "default",
          });
          return;
        }
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open billing portal. Please use the options below.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancellationComplete = () => {
    setShowCancellation(false);
    onSubscriptionUpdated();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showCancellation} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Manage Subscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-3">
              <h3 className="font-medium">Current Plan</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{subscription.plan_type} Plan</span>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatAmount(subscription.amount)}/month
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Billing Information */}
            <div className="space-y-3">
              <h3 className="font-medium">Billing Information</h3>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Next billing date: {formatDate(subscription.current_period_end)}</span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="font-medium">Manage Your Subscription</h3>
              <div className="space-y-2">
                <Button 
                  onClick={handleManageBilling} 
                  className="w-full" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? "Opening..." : "Update Payment Method"}
                </Button>
                
                <Button 
                  onClick={() => setShowCancellation(true)}
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </div>

            {/* Note about billing portal */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p>
                <strong>Note:</strong> Some billing features may be limited in test mode. 
                For full billing management, please contact support.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CancellationModal
        isOpen={showCancellation}
        onClose={() => setShowCancellation(false)}
        subscriptionId={subscription.stripe_subscription_id}
        planType={subscription.plan_type}
        onCancellationComplete={handleCancellationComplete}
      />
    </>
  );
};