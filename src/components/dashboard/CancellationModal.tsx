import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  planType: string;
  onCancellationComplete: () => void;
}

const CANCELLATION_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'not_using_features', label: 'Not using enough features' },
  { id: 'found_alternative', label: 'Found a better alternative' },
  { id: 'technical_issues', label: 'Technical issues' },
  { id: 'poor_support', label: 'Poor customer support' },
  { id: 'temporary_pause', label: 'Temporary pause needed' },
  { id: 'other', label: 'Other reason' }
];

export function CancellationModal({ 
  isOpen, 
  onClose, 
  subscriptionId, 
  planType,
  onCancellationComplete 
}: CancellationModalProps) {
  const [step, setStep] = useState<'reason' | 'retention' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [comment, setComment] = useState('');
  const [cancelTiming, setCancelTiming] = useState<'period_end' | 'now'>('period_end');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);

  if (!isOpen) return null;

  const handleReasonSubmit = () => {
    // Show retention offer for certain reasons
    if (['too_expensive', 'not_using_features', 'temporary_pause'].includes(selectedReason)) {
      setShowRetentionOffer(true);
      setStep('retention');
    } else {
      setStep('confirm');
    }
  };

  const handleRetentionDecline = () => {
    setStep('confirm');
  };

  const handleRetentionAccept = () => {
    // Handle retention offer acceptance (e.g., redirect to plan change)
    toast({
      title: "Great choice!",
      description: "Let's find a plan that works better for you.",
    });
    onClose();
    // Could redirect to plan selection or show different options
  };

  const handleCancellation = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId,
          cancelAt: cancelTiming,
          reason: selectedReason,
          comment: comment.trim() || undefined
        }
      });

      if (error) throw error;

      toast({
        title: cancelTiming === 'now' ? "Subscription Cancelled" : "Cancellation Scheduled",
        description: cancelTiming === 'now' 
          ? "Your subscription has been cancelled immediately."
          : "Your subscription will be cancelled at the end of the current billing period.",
      });

      onCancellationComplete();
      onClose();
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRetentionOffer = () => {
    switch (selectedReason) {
      case 'too_expensive':
        return {
          title: "Special Discount Offer",
          description: "We'd like to offer you 25% off your next 3 months, or you could downgrade to our Basic plan for $5/month.",
          action: "Accept 25% Discount"
        };
      case 'not_using_features':
        return {
          title: "Simplified Plan",
          description: "Consider our Basic plan with essential features only for $5/month, or we can help you discover features you might find useful.",
          action: "Switch to Basic Plan"
        };
      case 'temporary_pause':
        return {
          title: "Pause Your Subscription",
          description: "We can pause your subscription for up to 3 months instead of cancelling. You'll keep your data and settings.",
          action: "Pause Subscription"
        };
      default:
        return null;
    }
  };

  const retentionOffer = getRetentionOffer();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Cancel {planType} Plan
            </CardTitle>
            <CardDescription>
              We're sorry to see you go. Please help us improve by sharing your feedback.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'reason' && (
            <>
              <div>
                <Label className="text-base font-medium">Why are you cancelling?</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-3">
                  {CANCELLATION_REASONS.map((reason) => (
                    <div key={reason.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.id} id={reason.id} />
                      <Label htmlFor={reason.id}>{reason.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="comment" className="text-base font-medium">
                  Additional feedback (optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Help us improve by sharing more details..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Keep My Plan
                </Button>
                <Button 
                  onClick={handleReasonSubmit}
                  disabled={!selectedReason}
                  variant="destructive"
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'retention' && retentionOffer && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{retentionOffer.title}</h3>
                <p className="text-blue-700 text-sm mb-4">{retentionOffer.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRetentionAccept}>
                    {retentionOffer.action}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRetentionDecline}>
                    No Thanks
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div>
                <Label className="text-base font-medium">When should we cancel your subscription?</Label>
                <RadioGroup value={cancelTiming} onValueChange={(value) => setCancelTiming(value as "period_end" | "now")} className="mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="period_end" id="period_end" />
                    <Label htmlFor="period_end">At the end of current billing period (recommended)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now">Cancel immediately</Label>
                  </div>
                </RadioGroup>
              </div>

              {cancelTiming === 'now' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    <strong>Warning:</strong> You will lose access to premium features immediately and won't receive a refund for the current billing period.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Keep My Plan
                </Button>
                <Button 
                  onClick={handleCancellation}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}