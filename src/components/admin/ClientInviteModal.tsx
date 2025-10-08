
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientInviteModalProps {
  onRefresh?: () => void;
}

export function ClientInviteModal({ onRefresh }: ClientInviteModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    clientName: '',
    websiteUrl: '',
    plan: 'basic-monthly', // Combined format: planType-billingCycle
    nextPaymentAmount: 15.00
  });
  const { toast } = useToast();

  // Update payment amount based on combined plan selection
  const handlePlanChange = (value: string) => {
    let amount = 15.00;
    if (value === 'basic-monthly') amount = 15.00;
    else if (value === 'basic-yearly') amount = 120.00;
    else if (value === 'pro-monthly') amount = 30.00;
    else if (value === 'pro-yearly') amount = 240.00;
    
    setFormData({ ...formData, plan: value, nextPaymentAmount: amount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse combined plan
      const [planType, billingCycle] = formData.plan.split('-') as [string, 'monthly' | 'yearly'];
      
      // Extract site name from URL for database storage
      const websiteName = formData.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      // Check for existing website with same URL
      const { data: existingWebsite } = await supabase
        .from('websites')
        .select('id, name')
        .eq('url', formData.websiteUrl)
        .maybeSingle();
      
      if (existingWebsite) {
        toast({
          title: "Website Already Exists",
          description: `A website with URL ${formData.websiteUrl} already exists.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Check for existing pending invitation for this email
      const { data: pendingInvite } = await supabase
        .from('client_invitations')
        .select('id, website_name, status, expires_at')
        .eq('email', formData.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (pendingInvite) {
        toast({
          title: "Pending Invitation Exists",
          description: `${formData.email} already has a pending invitation for ${pendingInvite.website_name}. Please wait for them to accept or resend from the Invitations table.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Create the website record with payment details - no next_payment_date set
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .insert({
          name: websiteName,
          url: formData.websiteUrl,
          plan_type: planType,
          billing_cycle: billingCycle,
          next_payment_amount: formData.nextPaymentAmount,
          payment_status: 'pending_initial_payment',
          initial_payment_received: false
        })
        .select()
        .single();

      if (websiteError) throw websiteError;

      // Send invitation without next_payment_date
      const { data, error } = await supabase.functions.invoke('invite-client', {
        body: {
          email: formData.email,
          clientName: formData.clientName,
          websiteName,
          websiteUrl: formData.websiteUrl,
          planType: planType,
          billingCycle: billingCycle,
          nextPaymentAmount: formData.nextPaymentAmount,
          siteId: websiteData.id
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent!",
        description: `Client invitation has been sent to ${formData.email}. Billing will start when they make their first payment.`,
      });

      setFormData({
        email: '',
        clientName: '',
        websiteUrl: '',
        plan: 'basic-monthly',
        nextPaymentAmount: 15.00
      });
      setOpen(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New Client</DialogTitle>
          <DialogDescription>
            Send an invitation to a client to create their account and manage their website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The billing cycle will start when the client makes their first payment.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane.smith@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Jane Smith"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="websiteUrl" className="text-right">
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                placeholder="https://example.com or www.example.com"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan
              </Label>
              <Select value={formData.plan} onValueChange={handlePlanChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic-monthly">Basic - $15/month</SelectItem>
                  <SelectItem value="basic-yearly">Basic - $120/year ($10/month equivalent)</SelectItem>
                  <SelectItem value="pro-monthly">Pro - $30/month</SelectItem>
                  <SelectItem value="pro-yearly">Pro - $240/year ($20/month equivalent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextPaymentAmount" className="text-right">
                Payment Amount
              </Label>
              <Input
                id="nextPaymentAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.nextPaymentAmount}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
