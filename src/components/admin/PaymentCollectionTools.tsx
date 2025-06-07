
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  RefreshCw, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Play
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { triggerDailyPaymentCheck, updatePaymentStatuses } from '@/utils/paymentReminderUtils';

interface PaymentCollectionToolsProps {
  onRefresh?: () => void;
}

export function PaymentCollectionTools({ onRefresh }: PaymentCollectionToolsProps) {
  const { toast } = useToast();
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false);

  const handleDailyCheck = async () => {
    setIsRunningCheck(true);
    try {
      const result = await triggerDailyPaymentCheck();
      
      toast({
        title: "Payment Check Complete",
        description: `Checked ${result.checkedWebsites} websites, sent ${result.remindersSent} reminders`,
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error running daily check:', error);
      toast({
        title: "Error",
        description: "Failed to run daily payment check",
        variant: "destructive",
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleUpdateStatuses = async () => {
    setIsUpdatingStatuses(true);
    try {
      await updatePaymentStatuses();
      
      toast({
        title: "Status Update Complete",
        description: "All payment statuses have been updated",
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating statuses:', error);
      toast({
        title: "Error",
        description: "Failed to update payment statuses",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatuses(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Payment Collection Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={handleDailyCheck}
              disabled={isRunningCheck}
              className="w-full flex items-center"
            >
              {isRunningCheck ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Payment Check & Send Reminders
            </Button>
            <p className="text-sm text-gray-500">
              Check all websites for overdue payments and send automatic reminders
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUpdateStatuses}
              disabled={isUpdatingStatuses}
              variant="outline"
              className="w-full flex items-center"
            >
              {isUpdatingStatuses ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Update Payment Statuses
            </Button>
            <p className="text-sm text-gray-500">
              Refresh payment statuses based on current dates
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Reminder Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">3 Days Overdue</span>
              <Badge className="bg-yellow-100 text-yellow-800">First Reminder</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">7 Days Overdue</span>
              <Badge className="bg-orange-100 text-orange-800">Urgent Notice</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">14 Days Overdue</span>
              <Badge className="bg-red-100 text-red-800">Final Notice</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">30 Days Overdue</span>
              <Badge className="bg-red-200 text-red-900">Suspension</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
