import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Calendar, DollarSign, Send, Clock, CheckCircle } from "lucide-react";
import { sendPaymentReminder } from "@/utils/paymentReminderUtils";

interface PaymentReminderConfig {
  reminderType: 'gentle' | 'firm' | 'final' | 'overdue';
  daysBeforeDue: number;
  emailTemplate: string;
  enabled: boolean;
}

interface ClientWebsiteWithReminder {
  id: string;
  name: string;
  url: string;
  user_id: string;
  plan_type: string;
  payment_status: string;
  next_payment_date: string;
  next_payment_amount: number;
  last_payment_reminder_sent: string | null;
  profile?: {
    email: string;
  };
}

const REMINDER_CONFIGS: PaymentReminderConfig[] = [
  { reminderType: 'gentle', daysBeforeDue: 7, emailTemplate: 'payment-reminder', enabled: true },
  { reminderType: 'firm', daysBeforeDue: 3, emailTemplate: 'payment-reminder', enabled: true },
  { reminderType: 'final', daysBeforeDue: 1, emailTemplate: 'payment-reminder', enabled: true },
  { reminderType: 'overdue', daysBeforeDue: -1, emailTemplate: 'payment-overdue', enabled: true },
];

export function EnhancedPaymentReminders() {
  const [websites, setWebsites] = useState<ClientWebsiteWithReminder[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('payment-reminder');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load websites with payment info
      const { data: websitesData, error: websitesError } = await supabase
        .from('websites')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('next_payment_date', { ascending: true });

      if (websitesError) throw websitesError;

      // Load email templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (templatesError) throw templatesError;

      setWebsites(websitesData || []);
      setEmailTemplates(templatesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment reminder data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReminderStatus = (website: ClientWebsiteWithReminder) => {
    if (!website.next_payment_date) return { status: 'no-date', priority: 0 };

    const today = new Date();
    const dueDate = new Date(website.next_payment_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < -30) return { status: 'suspended', priority: 5 };
    if (daysUntilDue < 0) return { status: 'overdue', priority: 4, days: Math.abs(daysUntilDue) };
    if (daysUntilDue <= 1) return { status: 'urgent', priority: 3, days: daysUntilDue };
    if (daysUntilDue <= 7) return { status: 'soon', priority: 2, days: daysUntilDue };
    
    return { status: 'current', priority: 1, days: daysUntilDue };
  };

  const getStatusBadge = (status: any) => {
    const { status: statusType, days } = status;
    
    switch (statusType) {
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue ({days} days)</Badge>;
      case 'urgent':
        return <Badge variant="destructive">Due in {days} day{days !== 1 ? 's' : ''}</Badge>;
      case 'soon':
        return <Badge variant="secondary">Due in {days} days</Badge>;
      case 'current':
        return <Badge variant="outline">Due in {days} days</Badge>;
      default:
        return <Badge variant="outline">No due date</Badge>;
    }
  };

  const sendReminderEmail = async (website: ClientWebsiteWithReminder, statusType: string) => {
    try {
      const status = calculateReminderStatus(website);
      let reminderType = '3_day';
      
      if (status.status === 'overdue') {
        if (status.days >= 30) reminderType = '30_day';
        else if (status.days >= 14) reminderType = '14_day';
        else if (status.days >= 7) reminderType = '7_day';
        else reminderType = '3_day';
      } else if (status.status === 'urgent') {
        reminderType = 'upcoming_1d';
      } else if (status.status === 'soon') {
        reminderType = status.days <= 3 ? 'upcoming_3d' : 'upcoming_7d';
      }

      await sendPaymentReminder({
        siteId: website.id,
        reminderType: reminderType as any,
        manualSend: true
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder:', error);
      return { success: false, error };
    }
  };

  const sendBulkReminders = async () => {
    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const website of websites) {
        const status = calculateReminderStatus(website);
        
        // Only send reminders for overdue, urgent, or soon statuses
        if (['overdue', 'urgent', 'soon'].includes(status.status)) {
          const templateName = status.status === 'overdue' ? 'overdue' : 'reminder';
          const result = await sendReminderEmail(website, templateName);
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      toast({
        title: "Bulk Reminders Sent",
        description: `Successfully sent ${successCount} reminders. ${errorCount} errors.`,
      });

      if (successCount > 0) {
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Bulk reminder error:', error);
      toast({
        title: "Error",
        description: "Failed to send bulk reminders",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendIndividualReminder = async (website: ClientWebsiteWithReminder) => {
    const result = await sendReminderEmail(website, selectedTemplate);
    
    if (result.success) {
      toast({
        title: "Reminder Sent",
        description: `Payment reminder sent to ${website.name}`,
      });
      loadData();
    } else {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      });
    }
  };

  // Sort websites by priority (highest first)
  const sortedWebsites = websites
    .map(website => ({
      ...website,
      reminderStatus: calculateReminderStatus(website)
    }))
    .sort((a, b) => b.reminderStatus.priority - a.reminderStatus.priority);

  const reminderStats = {
    overdue: sortedWebsites.filter(w => w.reminderStatus.status === 'overdue').length,
    urgent: sortedWebsites.filter(w => w.reminderStatus.status === 'urgent').length,
    soon: sortedWebsites.filter(w => w.reminderStatus.status === 'soon').length,
    suspended: sortedWebsites.filter(w => w.reminderStatus.status === 'suspended').length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{reminderStats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">{reminderStats.urgent}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-yellow-600">{reminderStats.soon}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-gray-600">{reminderStats.suspended}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Payment Reminder Actions
          </CardTitle>
          <CardDescription>
            Send automated payment reminders to clients with upcoming or overdue payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select email template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.name.toLowerCase()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={sendBulkReminders} 
              disabled={isSending}
              size="lg"
            >
              {isSending ? "Sending..." : "Send Bulk Reminders"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Reminders Queue</CardTitle>
          <CardDescription>
            Websites requiring payment reminders, sorted by priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedWebsites.filter(w => w.reminderStatus.priority >= 2).map((website) => (
              <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{website.name}</h4>
                    {getStatusBadge(website.reminderStatus)}
                  </div>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                    <span>Plan: {website.plan_type}</span>
                    <span>Amount: ${website.next_payment_amount}</span>
                    <span>Due: {new Date(website.next_payment_date).toLocaleDateString()}</span>
                    <span>Email: {website.profile?.email || 'No email'}</span>
                  </div>
                  {website.last_payment_reminder_sent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last reminder: {new Date(website.last_payment_reminder_sent).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendIndividualReminder(website)}
                  disabled={!website.profile?.email}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            ))}
            
            {sortedWebsites.filter(w => w.reminderStatus.priority >= 2).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No payment reminders needed at this time!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}