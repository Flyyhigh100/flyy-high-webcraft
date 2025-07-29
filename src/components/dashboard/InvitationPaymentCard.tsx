import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvitationPaymentCardProps {
  plan: string;
  amount: number;
  isPaid: boolean;
  onPaymentSuccess?: () => void;
}

export const InvitationPaymentCard: React.FC<InvitationPaymentCardProps> = ({
  plan,
  amount,
  isPaid,
  onPaymentSuccess
}) => {
  const { toast } = useToast();

  const handlePayForPlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan: plan.toLowerCase() as 'basic' | 'standard' | 'premium',
          invitation_payment: true,
          amount: amount * 100 // Convert to cents
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
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
          Your Invited Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2 capitalize">
              {plan} Plan
            </Badge>
            <p className="text-2xl font-bold">
              ${amount.toFixed(2)}/month
            </p>
            <p className="text-sm text-muted-foreground">
              Pre-negotiated hosting rate
            </p>
          </div>
          {isPaid ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Paid & Active
            </Badge>
          ) : (
            <Button onClick={handlePayForPlan} className="bg-primary">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay for Your Plan
            </Button>
          )}
        </div>
        
        {!isPaid && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Payment Required:</strong> This is your assigned hosting plan. 
              Please complete payment to activate your website hosting and access all features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};