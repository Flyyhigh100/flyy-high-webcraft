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
  cancel_at_period_end?: boolean;
  canceled_at?: string;
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

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        // Handle specific error types
        if (error.message?.includes('NO_CUSTOMER')) {
          toast({
            title: "No Payment History",
            description: "Please make a payment first to access billing management.",
            variant: "destructive",
          });
        } else if (error.message?.includes('NO_ACTIVE_SUBSCRIPTION')) {
          toast({
            title: "No Active Subscription",
            description: "Please subscribe to a plan first to manage billing.",
            variant: "destructive",
          });
        } else if (error.message?.includes('PORTAL_NOT_CONFIGURED')) {
          toast({
            title: "Portal Unavailable",
            description: "Stripe Customer Portal isn't configured in test mode. Payment method updates are limited in testing.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Billing Portal",
          description: "Opening Stripe billing portal where you can update your payment method.",
        });
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Portal Error",
        description: "Unable to open billing portal. Please contact support for assistance.",
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
                    <Badge className={
                      subscription.cancel_at_period_end 
                        ? 'bg-orange-500 text-white' 
                        : getStatusColor(subscription.status)
                    }>
                      {subscription.cancel_at_period_end 
                        ? 'Cancelling at Period End' 
                        : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                      }
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
                  onClick={handleUpdatePaymentMethod} 
                  className="w-full" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : "Update Payment Method"}
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

            {/* Cancellation Warning */}
            {subscription.cancel_at_period_end && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Subscription Ending:</strong> Your subscription will be cancelled on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}. 
                  You'll continue to have access until then.
                </p>
              </div>
            )}

            {/* Billing Management Information */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p>
                <strong>Billing Management:</strong> The "Update Payment Method" button opens the Stripe Customer Portal where you can securely update your payment information, view invoices, and manage billing details.
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