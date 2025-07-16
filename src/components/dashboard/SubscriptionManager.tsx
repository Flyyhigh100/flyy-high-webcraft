import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";

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

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
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

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
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

  if (loading) {
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
        {subscriptions.length > 0 && (
          <Button onClick={handleManageSubscription} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscriptions</CardTitle>
            <CardDescription>
              Choose a hosting plan to get started with your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Plan</CardTitle>
                  <CardDescription>Perfect for small websites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">$15/month</div>
                  <Button 
                    onClick={() => handleCreateCheckout('basic')}
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe to Basic
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Standard Plan</CardTitle>
                  <CardDescription>Great for growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">$19.99/month</div>
                  <Button 
                    onClick={() => handleCreateCheckout('standard')}
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe to Standard
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>For high-traffic websites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">$29.99/month</div>
                  <Button 
                    onClick={() => handleCreateCheckout('premium')}
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe to Premium
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
      )}
    </div>
  );
}