import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Loader2, Settings } from "lucide-react";
import { useInvitationStatus } from '@/hooks/useInvitationStatus';
import { InvitationPaymentCard } from './InvitationPaymentCard';
import { SubscriptionManagementModal } from './SubscriptionManagementModal';
import { getPlanDisplayName } from '@/utils/planDisplayNames';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  current_period_end: string;
  stripe_subscription_id: string;
  site_id: string;
  websites?: {
    name: string;
    url: string;
  };
}

interface SubscriptionForModal {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  current_period_end: string;
  stripe_subscription_id: string;
  websiteName?: string;
  websiteUrl?: string;
}

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { invitationStatus, loading: invitationLoading, refetch: refetchInvitation } = useInvitationStatus();
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

  const handleCreateCheckout = async (plan: 'basic' | 'pro', siteId?: string) => {
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


  const handleManageSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleSubscriptionUpdate = () => {
    fetchSubscriptions(); // Refresh subscriptions after update
    handleModalClose();
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
        <h2 className="text-2xl font-bold">Subscription Management</h2>
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

      {subscriptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscriptions</CardTitle>
            <CardDescription>
              {invitationStatus.hasActiveInvitation ? 
                "Other available plans (upgrade or downgrade from your invited plan):" : 
                "Choose a hosting plan to get started with your website."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className={invitationStatus.invitationPlan === 'basic' ? 'border-primary bg-primary/5' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanDisplayName('basic')}
                    {invitationStatus.invitationPlan === 'basic' && (
                      <Badge variant="outline">Your Plan</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Everything you need to keep your website online</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">$15/month</div>
                  <Button 
                    onClick={() => handleCreateCheckout('basic')}
                    className="w-full"
                    variant={invitationStatus.invitationPlan === 'basic' ? 'outline' : 'default'}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {invitationStatus.invitationPlan === 'basic' ? 'Current Plan' : 'Subscribe to Hosting Basic'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={invitationStatus.invitationPlan === 'pro' ? 'border-primary bg-primary/5' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanDisplayName('pro')}
                    {invitationStatus.invitationPlan === 'pro' && (
                      <Badge variant="outline">Your Plan</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Enhanced features for growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">$30/month</div>
                  <Button 
                    onClick={() => handleCreateCheckout('pro')}
                    className="w-full"
                    variant={invitationStatus.invitationPlan === 'pro' ? 'outline' : 'default'}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {invitationStatus.invitationPlan === 'pro' ? 'Current Plan' : 'Subscribe to Hosting Pro'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">
                      {getPlanDisplayName(subscription.plan_type)}
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
                  <Button onClick={() => handleManageSubscription(subscription)} variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription Management Modal */}
      {selectedSubscription && (
        <SubscriptionManagementModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          subscription={{
            id: selectedSubscription.id,
            plan_type: selectedSubscription.plan_type,
            status: selectedSubscription.status,
            amount: selectedSubscription.amount / 100, // Convert from cents
            current_period_end: selectedSubscription.current_period_end,
            stripe_subscription_id: selectedSubscription.stripe_subscription_id,
            websiteName: selectedSubscription.websites?.name || 'Website',
            websiteUrl: selectedSubscription.websites?.url || '',
          } as SubscriptionForModal}
          onSubscriptionUpdated={handleSubscriptionUpdate}
        />
      )}
    </div>
  );
}