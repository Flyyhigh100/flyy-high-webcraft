import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Globe, CreditCard, Calendar, Shield, HelpCircle, AlertTriangle } from 'lucide-react';
import { useUserWebsites } from '@/hooks/useUserWebsites';
import { useInvitationStatus } from '@/hooks/useInvitationStatus';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvitationPaymentCard } from './InvitationPaymentCard';

const HostingManager = () => {
  const { websites, isLoading, updateAutoRenewal } = useUserWebsites();
  const { invitationStatus, loading: invitationLoading, refetch: refetchInvitation } = useInvitationStatus();
  const { toast } = useToast();

  const handleManualPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: (primaryWebsite.plan_type || 'standard').toLowerCase() as 'basic' | 'standard' | 'premium',
          siteId: primaryWebsite.id
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Processing",
        description: "Redirecting to secure payment page...",
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


  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>;
      case 'overdue_3d':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">3 Days Overdue</Badge>;
      case 'overdue_7d':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">7 Days Overdue</Badge>;
      case 'overdue_14d':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">14 Days Overdue</Badge>;
      case 'overdue_30d':
        return <Badge className="bg-red-200 text-red-900 hover:bg-red-200 border-red-300">30 Days Overdue</Badge>;
      case 'suspended':
        return <Badge className="bg-red-200 text-red-900 hover:bg-red-200 border-red-300">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentUrgency = (website: any) => {
    if (!website.next_payment_date) return null;
    
    const nextPayment = new Date(website.next_payment_date);
    const today = new Date();
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    if (diffDays <= 7) return 'soon';
    return null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Not set';
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading || invitationLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Website</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Website Found</h3>
              <p className="text-muted-foreground">
                It looks like you haven't been assigned a website yet. Please contact support if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryWebsite = websites[0]; // For SydeVault, users typically have one website
  const paymentUrgency = getPaymentUrgency(primaryWebsite);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Website</h2>
          <Button variant="outline" asChild>
            <a href={primaryWebsite.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </a>
          </Button>
        </div>

        {/* Invitation Payment Card - Prominent Display */}
        {invitationStatus.hasActiveInvitation && (
          <InvitationPaymentCard
            plan={invitationStatus.invitationPlan!}
            amount={invitationStatus.invitationAmount!}
            isPaid={invitationStatus.isPaid}
            siteId={invitationStatus.siteId}
            onPaymentSuccess={refetchInvitation}
          />
        )}

      {/* Website Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {primaryWebsite.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Website URL</Label>
              <div className="flex items-center gap-2">
                <a 
                  href={primaryWebsite.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {primaryWebsite.url}
                </a>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Hosting Status</Label>
              <div>{getStatusBadge(primaryWebsite.payment_status)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Hosting Plan</Label>
              <Badge variant="outline" className="w-fit">
                {primaryWebsite.plan_type}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{formatDate(primaryWebsite.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Hosting Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Next Payment Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(primaryWebsite.next_payment_date)}</span>
                {paymentUrgency === 'urgent' && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Due Soon
                  </Badge>
                )}
                {paymentUrgency === 'overdue' && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Monthly Hosting Fee</Label>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{formatAmount(primaryWebsite.next_payment_amount)}</span>
              </div>
            </div>
          </div>

          {/* Manual Payment Section */}
          {!primaryWebsite.auto_renew && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Manual Payment Required</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-renewal is disabled. You need to manually pay before the due date.
                  </p>
                </div>
                <Button 
                  onClick={handleManualPayment}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!primaryWebsite.next_payment_amount}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {/* Payment Method Display */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>•••• •••• •••• 1234</span>
                  <Badge variant="outline" className="text-xs">Visa</Badge>
                </div>
              </div>
              <Button onClick={handleManualPayment} size="sm" disabled={!primaryWebsite.next_payment_amount}>
                Make Payment Now
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Auto-Renewal</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">Why Enable Auto-Renewal?</p>
                        <ul className="text-xs space-y-1">
                          <li>• Prevents service interruption</li>
                          <li>• Protects your website files</li>
                          <li>• Avoids suspension and data loss</li>
                          <li>• 30-day grace period if payment fails</li>
                        </ul>
                        <p className="text-xs text-yellow-600 font-medium">
                          ⚠️ Without auto-renewal, your site may go offline if payment is missed
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  {!primaryWebsite.auto_renew && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Risk
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {primaryWebsite.auto_renew 
                    ? "Your card will be automatically charged each month"
                    : "You must manually pay before each due date"
                  }
                </p>
              </div>
              <Switch
                checked={primaryWebsite.auto_renew}
                onCheckedChange={(checked) => updateAutoRenewal(primaryWebsite.id, checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hosting Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Hosting Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 99.9% Uptime Guarantee</li>
                <li>• SSL Certificate Included</li>
                <li>• CDN for Fast Loading</li>
                <li>• Regular Backups</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Support & Security</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dedicated Technical Support</li>
                <li>• Security Updates</li>
                <li>• Performance Monitoring</li>
                <li>• Content Updates Available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your website is fully managed by SydeVault. We handle all technical aspects including hosting, 
              security, backups, and updates. Your monthly fee covers all hosting services.
            </p>
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for any questions about your hosting service.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
};

export default HostingManager;