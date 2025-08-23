import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Loader2, ExternalLink, ArrowUpDown, Globe, Calendar, AlertTriangle } from "lucide-react";
import { useInvitationStatus } from '@/hooks/useInvitationStatus';
import { InvitationPaymentCard } from './InvitationPaymentCard';
import { useUserWebsites } from '@/hooks/useUserWebsites';
import { SubscriptionManagementModal } from './SubscriptionManagementModal';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  current_period_end: string;
  site_id: string;
  stripe_subscription_id: string;
  websites?: {
    name: string;
    url: string;
  };
}

export function ImprovedSubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [prorationPreview, setProrationPreview] = useState<any>(null);
  const [showProrationModal, setShowProrationModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const { invitationStatus, loading: invitationLoading, refetch: refetchInvitation } = useInvitationStatus();
  const { websites } = useUserWebsites();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
    
    // Refresh data when returning from payment (detect URL parameter or focus)
    const handleFocus = () => {
      fetchSubscriptions();
      refetchInvitation();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchInvitation]);

  // When returning from Stripe checkout, verify the session and sync DB
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment') === 'success';
    const sessionId = params.get('session_id');

    if (paymentSuccess && sessionId) {
      (async () => {
        try {
          const { error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId },
          });
          if (error) throw error;
          toast({ title: 'Payment confirmed', description: 'Your subscription has been activated.' });
          await fetchSubscriptions();
          await refetchInvitation();
        } catch (err: any) {
          console.error('Verification error:', err);
          toast({ title: 'Verification failed', description: err?.message || 'Please contact support.', variant: 'destructive' });
        } finally {
          const url = new URL(window.location.href);
          url.searchParams.delete('payment');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        }
      })();
    }
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          websites (
            name,
            url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Remove duplicates - keep only the most recent subscription per site
      const uniqueSubs = new Map<string, Subscription>();
      (data || []).forEach((sub: Subscription) => {
        const siteKey = sub.site_id || 'no-site';
        const existing = uniqueSubs.get(siteKey);
        if (!existing || new Date(sub.current_period_end) > new Date(existing.current_period_end)) {
          uniqueSubs.set(siteKey, sub);
        }
      });
      
      setSubscriptions(Array.from(uniqueSubs.values()));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProration = async (currentPlan: string, newPlan: 'basic' | 'standard' | 'premium') => {
    try {
      const currentSubscription = subscriptions.find(sub => sub.status === 'active');
      const { data, error } = await supabase.functions.invoke('calculate-proration', {
        body: { 
          currentPlan,
          newPlan,
          newBillingCycle: selectedBillingCycle,
          subscriptionId: currentSubscription?.id
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating proration:', error);
      return null;
    }
  };

  const handleCreateCheckout = async (plan: 'basic' | 'standard' | 'premium', siteId?: string) => {
    try {
      // If user has active subscription and changing plans, show proration preview
      const currentSubscription = subscriptions.find(sub => sub.status === 'active');
      if (currentSubscription && currentSubscription.plan_type !== plan) {
        const proration = await calculateProration(currentSubscription.plan_type, plan);
        if (proration) {
          setProrationPreview({ ...proration, targetPlan: plan, siteId });
          setShowProrationModal(true);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan, 
          siteId,
          billingCycle: selectedBillingCycle,
          ...(prorationPreview?.immediateCharge && { prorationAmount: prorationPreview.immediateCharge })
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const handleManualPayment = async () => {
    if (!websites[0]) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: (websites[0].plan_type || 'standard').toLowerCase() as 'basic' | 'standard' | 'premium',
          siteId: websites[0].id
        }
      });

      if (error) throw error;

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

  const confirmProrationChange = async () => {
    if (!prorationPreview) return;
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        plan: prorationPreview.targetPlan,
        siteId: prorationPreview.siteId || websites[0]?.id,
        billingCycle: selectedBillingCycle,
        prorationAmount: prorationPreview.immediateCharge
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
      return;
    }

    setShowProrationModal(false);
    setProrationPreview(null);
    window.open(data.url, '_blank');
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlanPrice = (plan: 'basic' | 'standard' | 'premium') => {
    const pricing = {
      basic: { monthly: 15, yearly: 10 },
      standard: { monthly: 30, yearly: 20 },
      premium: { monthly: 29.99, yearly: 24 }
    };
    return pricing[plan][selectedBillingCycle];
  };

  const getYearlySavings = (plan: 'basic' | 'standard' | 'premium') => {
    const pricing = {
      basic: { monthly: 15, yearly: 10 },
      standard: { monthly: 30, yearly: 20 },
      premium: { monthly: 29.99, yearly: 24 }
    };
    const monthlyTotal = pricing[plan].monthly * 12;
    const yearlyTotal = pricing[plan].yearly * 12;
    return Math.round(monthlyTotal - yearlyTotal);
  };

  // Get current plan from websites table
  const currentPlan = websites.length > 0 ? websites[0].plan_type.toLowerCase() : null;
  const hasActiveSubscription = subscriptions.length > 0;

  if (loading || invitationLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Not set';
    return `$${amount.toFixed(2)}`;
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

  const primaryWebsite = websites.length > 0 ? websites[0] : null;
  const paymentUrgency = primaryWebsite ? getPaymentUrgency(primaryWebsite) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Website & Billing Management</h2>
        {primaryWebsite && (
          <Button variant="outline" asChild>
            <a href={primaryWebsite.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </a>
          </Button>
        )}
      </div>

      {/* Show invitation card if user has one */}
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
      {primaryWebsite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {primaryWebsite.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Website URL</p>
                <a 
                  href={primaryWebsite.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  {primaryWebsite.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Next Payment</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(primaryWebsite.next_payment_date)}</span>
                  {paymentUrgency === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Due Soon
                    </Badge>
                  )}
                  {paymentUrgency === 'overdue' && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Monthly Fee</p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{formatAmount(primaryWebsite.next_payment_amount)}</span>
                  {!primaryWebsite.auto_renew && (
                    <Button 
                      onClick={handleManualPayment}
                      size="sm"
                      className="text-xs"
                      disabled={!primaryWebsite.next_payment_amount}
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Display */}
      {currentPlan && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="capitalize flex items-center gap-2">
                  {currentPlan} Plan
                  <Badge variant="outline">Current Plan</Badge>
                </CardTitle>
                <CardDescription>
                  {websites[0]?.name} - Active website hosting
                </CardDescription>
              </div>
              {hasActiveSubscription ? (
                <Badge className="bg-green-500">Active Subscription</Badge>
              ) : (
                <Badge variant="outline">Website Plan</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">
                  ${websites[0]?.next_payment_amount?.toFixed(2) || '0.00'}/month
                </p>
                <p className="text-sm text-gray-500">
                  {websites[0]?.next_payment_date 
                    ? `Next payment: ${new Date(websites[0].next_payment_date).toLocaleDateString()}`
                    : 'No payment scheduled'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={async () => {
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
                      }
                    } catch (error) {
                      console.error('Portal error:', error);
                      toast({
                        title: "Portal Error",
                        description: "Unable to open billing portal. Please contact support for assistance.",
                        variant: "destructive",
                      });
                    }
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage
                </Button>
                
                {subscriptions.length > 1 && (
                  <Button
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('cleanup-duplicates');
                        if (error) throw error;
                        
                        toast({
                          title: "Cleanup Complete",
                          description: data.message || "Duplicate subscriptions have been cleaned up.",
                        });
                        
                        // Refresh subscriptions after cleanup
                        await fetchSubscriptions();
                      } catch (error) {
                        console.error('Cleanup error:', error);
                        toast({
                          title: "Cleanup Error",
                          description: "Failed to cleanup duplicates. Please contact support.",
                          variant: "destructive",
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Fix Duplicates
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Change Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Change Plan
          </CardTitle>
          <CardDescription>
            Upgrade or downgrade your hosting plan at any time
          </CardDescription>
          
          <div className="flex items-center justify-center mt-4">
            <span className={`mr-3 ${selectedBillingCycle === 'monthly' ? "font-medium text-primary" : "text-gray-500"}`}>
              Monthly
            </span>
            <div className="relative inline-flex">
              <div className="w-12 h-6 transition duration-200 ease-linear rounded-full bg-gray-300">
                <label 
                  htmlFor="billing-toggle"
                  className={`absolute left-0 w-6 h-6 transition-transform duration-200 ease-linear transform bg-white border-2 rounded-full cursor-pointer ${selectedBillingCycle === 'yearly' ? "translate-x-full border-primary" : "border-gray-300"}`}
                ></label>
                <input 
                  type="checkbox"
                  id="billing-toggle"
                  className="w-full h-full appearance-none focus:outline-none cursor-pointer"
                  checked={selectedBillingCycle === 'yearly'}
                  onChange={() => setSelectedBillingCycle(selectedBillingCycle === 'monthly' ? 'yearly' : 'monthly')}
                />
              </div>
            </div>
            <span className={`ml-3 ${selectedBillingCycle === 'yearly' ? "font-medium text-primary" : "text-gray-500"}`}>
              Yearly <span className="text-green-600 font-medium">(Save up to $120/year)</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className={currentPlan === 'basic' ? 'border-primary bg-primary/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Basic Plan
                  {currentPlan === 'basic' && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>Perfect for small websites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  ${getPlanPrice('basic')}/month
                </div>
                {selectedBillingCycle === 'yearly' && (
                  <p className="text-green-600 text-sm font-medium mb-4">
                    Save ${getYearlySavings('basic')}/year • Billed annually
                  </p>
                )}
                <Button 
                  onClick={() => handleCreateCheckout('basic', websites[0]?.id)}
                  className="w-full"
                  variant={currentPlan === 'basic' ? 'outline' : 'default'}
                  disabled={currentPlan === 'basic'}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === 'basic' ? 'Current Plan' : 'Switch to Basic'}
                </Button>
              </CardContent>
            </Card>

            <Card className={currentPlan === 'standard' ? 'border-primary bg-primary/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Standard Plan
                  {currentPlan === 'standard' && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>Great for growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  ${getPlanPrice('standard')}/month
                </div>
                {selectedBillingCycle === 'yearly' && (
                  <p className="text-green-600 text-sm font-medium mb-4">
                    Save ${getYearlySavings('standard')}/year • Billed annually
                  </p>
                )}
                <Button 
                  onClick={() => handleCreateCheckout('standard', websites[0]?.id)}
                  className="w-full"
                  variant={currentPlan === 'standard' ? 'outline' : 'default'}
                  disabled={currentPlan === 'standard'}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === 'standard' ? 'Current Plan' : 'Switch to Standard'}
                </Button>
              </CardContent>
            </Card>

            <Card className={currentPlan === 'premium' ? 'border-primary bg-primary/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Premium Plan
                  {currentPlan === 'premium' && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>For high-traffic websites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  ${getPlanPrice('premium')}/month
                </div>
                {selectedBillingCycle === 'yearly' && (
                  <p className="text-green-600 text-sm font-medium mb-4">
                    Save ${getYearlySavings('premium')}/year • Billed annually
                  </p>
                )}
                <Button 
                  onClick={() => handleCreateCheckout('premium', websites[0]?.id)}
                  className="w-full"
                  variant={currentPlan === 'premium' ? 'outline' : 'default'}
                  disabled={currentPlan === 'premium'}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === 'premium' ? 'Current Plan' : 'Switch to Premium'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>
              Your current Stripe subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">
                          {subscription.plan_type} Plan
                        </CardTitle>
                        <CardDescription>
                          {subscription.websites?.name || 'Website'} - {subscription.websites?.url}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">
                          ${(subscription.amount / 100).toFixed(2)}/month
                        </p>
                        <p className="text-sm text-gray-500">
                          Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setShowManagementModal(true);
                        }} 
                        variant="outline"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proration Preview Modal */}
      {showProrationModal && prorationPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Plan Change Preview</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Current Plan:</span>
                <span className="font-medium capitalize">{prorationPreview.currentPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>New Plan:</span>
                <span className="font-medium capitalize">{prorationPreview.newPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle:</span>
                <span className="font-medium capitalize">{prorationPreview.newBillingCycle}</span>
              </div>
              {prorationPreview.immediateCharge > 0 && (
                <div className="flex justify-between border-t pt-3">
                  <span>Immediate Charge:</span>
                  <span className="font-medium">${(prorationPreview.immediateCharge / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Next Billing Amount:</span>
                <span className="font-medium">${(prorationPreview.nextBillingAmount / 100).toFixed(2)}</span>
              </div>
              {prorationPreview.savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Savings:</span>
                  <span className="font-medium">${(prorationPreview.savings / 100).toFixed(2)}</span>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-3">{prorationPreview.description}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowProrationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmProrationChange}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management Modal */}
      {selectedSubscription && (
        <SubscriptionManagementModal
          isOpen={showManagementModal}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
          onSubscriptionUpdated={fetchSubscriptions}
        />
      )}
    </div>
  );
}