import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Loader2, ExternalLink, ArrowUpDown } from "lucide-react";
import { useInvitationStatus } from '@/hooks/useInvitationStatus';
import { InvitationPaymentCard } from './InvitationPaymentCard';
import { useUserWebsites } from '@/hooks/useUserWebsites';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  current_period_end: string;
  site_id: string;
  websites?: {
    name: string;
    url: string;
  };
}

export function ImprovedSubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { invitationStatus, loading: invitationLoading, refetch: refetchInvitation } = useInvitationStatus();
  const { websites } = useUserWebsites();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
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

  const handleCreateCheckout = async (plan: 'basic' | 'standard' | 'premium', siteId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, siteId }
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

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        const msg = error.message || '';
        if (msg.includes('PORTAL_NOT_CONFIGURED') || msg.includes('No configuration provided')) {
          toast({
            title: "Billing Portal Unavailable",
            description: "Use Make Payment Now to manage cards or change plans. The advanced portal isn't configured yet.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plan Management</h2>
        {hasActiveSubscription && (
          <Button onClick={handleManageSubscription} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Billing (Advanced)
          </Button>
        )}
      </div>

      {/* Show invitation card if user has one */}
      {invitationStatus.hasActiveInvitation && (
        <InvitationPaymentCard
          plan={invitationStatus.invitationPlan!}
          amount={invitationStatus.invitationAmount!}
          isPaid={invitationStatus.isPaid}
          onPaymentSuccess={refetchInvitation}
        />
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
                <Button onClick={handleManageSubscription} variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage
                </Button>
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
                <div className="text-2xl font-bold mb-4">$15/month</div>
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
                <div className="text-2xl font-bold mb-4">$19.99/month</div>
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
                <div className="text-2xl font-bold mb-4">$29.99/month</div>
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
                      <Button onClick={handleManageSubscription} variant="outline">
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
    </div>
  );
}