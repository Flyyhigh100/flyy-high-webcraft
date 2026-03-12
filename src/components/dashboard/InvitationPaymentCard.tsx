import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getPlanPrice, getPlanAnnualTotal } from '@/utils/planDisplayNames';

interface InvitationPaymentCardProps {
  plan: string;
  amount: number;
  isPaid: boolean;
  siteId?: string;
  onPaymentSuccess?: () => void;
}

export const InvitationPaymentCard: React.FC<InvitationPaymentCardProps> = ({
  plan,
  amount,
  isPaid,
  siteId,
  onPaymentSuccess
}) => {
  const { toast } = useToast();

  const monthlyRate = getPlanPrice(plan, 'monthly');
  const yearlyTotal = getPlanAnnualTotal(plan);
  const yearlyMonthlyEquiv = getPlanPrice(plan, 'yearly');
  const yearlySavings = (monthlyRate * 12) - yearlyTotal;

  const handlePayForPlan = async (billingCycle: 'monthly' | 'yearly') => {
    try {
      const checkoutAmount = billingCycle === 'yearly' ? yearlyTotal * 100 : monthlyRate * 100;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan: plan.toLowerCase() as 'basic' | 'pro',
          siteId: siteId,
          invitation_payment: true,
          amount: checkoutAmount,
          billingCycle
        }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to Payment",
        description: "Opening secure payment page...",
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPaid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          )}
          {isPaid ? "Your Plan" : "Choose Your Billing Cycle"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2 capitalize">
            {plan} Plan
          </Badge>
        </div>

        {isPaid ? (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">${amount.toFixed(2)}/month</p>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Paid & Active
            </Badge>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly option */}
            <div className="border rounded-lg p-4 space-y-3 bg-background">
              <div>
                <p className="text-xl font-bold">${monthlyRate}/mo</p>
                <p className="text-sm text-muted-foreground">Billed monthly</p>
              </div>
              <Button
                onClick={() => handlePayForPlan('monthly')}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Monthly
              </Button>
            </div>

            {/* Yearly option */}
            <div className="border-2 border-primary rounded-lg p-4 space-y-3 bg-background relative">
              <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                Save ${yearlySavings}/yr
              </Badge>
              <div>
                <p className="text-xl font-bold">${yearlyTotal}/yr</p>
                <p className="text-sm text-muted-foreground">
                  ${yearlyMonthlyEquiv}/mo equivalent
                </p>
              </div>
              <Button
                onClick={() => handlePayForPlan('yearly')}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Yearly
              </Button>
            </div>
          </div>
        )}

        {!isPaid && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Payment Required:</strong> Select a billing cycle to activate your website hosting and access all features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};