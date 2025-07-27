
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";

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
    planType: 'basic',
    nextPaymentDate: new Date().toISOString().split('T')[0], // Today's date as default
    nextPaymentAmount: 15.00 // Default amount based on basic plan
  });
  const { toast } = useToast();

  // Update payment amount when plan type changes
  const handlePlanTypeChange = (value: string) => {
    let amount = 15.00;
    switch (value) {
      case 'standard':
        amount = 19.99;
        break;
      case 'premium':
        amount = 29.99;
        break;
      default:
        amount = 15.00;
    }
    setFormData({ ...formData, planType: value, nextPaymentAmount: amount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Extract site name from URL for database storage
      const websiteName = formData.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      // Create the website record with payment details
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .insert({
          name: websiteName,
          url: formData.websiteUrl,
          plan_type: formData.planType,
          next_payment_date: formData.nextPaymentDate,
          next_payment_amount: formData.nextPaymentAmount
        })
        .select()
        .single();

      if (websiteError) throw websiteError;

      // Send invitation with payment details
      const { data, error } = await supabase.functions.invoke('invite-client', {
        body: {
          email: formData.email,
          clientName: formData.clientName,
          websiteName,
          websiteUrl: formData.websiteUrl,
          planType: formData.planType,
          nextPaymentDate: formData.nextPaymentDate,
          nextPaymentAmount: formData.nextPaymentAmount,
          siteId: websiteData.id
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent!",
        description: `Client invitation has been sent to ${formData.email}`,
      });

      setFormData({
        email: '',
        clientName: '',
        websiteUrl: '',
        planType: 'basic',
        nextPaymentDate: new Date().toISOString().split('T')[0],
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
              <Label htmlFor="planType" className="text-right">
                Plan Type
              </Label>
              <Select value={formData.planType} onValueChange={handlePlanTypeChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - $15/month</SelectItem>
                  <SelectItem value="standard">Standard - $19.99/month</SelectItem>
                  <SelectItem value="premium">Premium - $29.99/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextPaymentDate" className="text-right">
                Next Payment Date
              </Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={formData.nextPaymentDate}
                onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                className="col-span-3"
                required
              />
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
                onChange={(e) => setFormData({ ...formData, nextPaymentAmount: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                required
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
