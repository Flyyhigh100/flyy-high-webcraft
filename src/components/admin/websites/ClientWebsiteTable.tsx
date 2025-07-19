
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Link as LinkIcon, Mail, AlertTriangle } from "lucide-react";
import { ClientWebsite } from "@/types/admin";
import { getPlanBadgeColor } from './clientWebsiteUtils';
import { getPaymentStatusColor, getPaymentStatusLabel, sendPaymentReminder } from '@/utils/paymentReminderUtils';
import { useToast } from "@/components/ui/use-toast";

interface ClientWebsiteTableProps {
  clients: ClientWebsite[];
  onViewDetails: (client: ClientWebsite) => void;
  onRefresh?: () => void;
}

export function ClientWebsiteTable({ clients, onViewDetails, onRefresh }: ClientWebsiteTableProps) {
  const { toast } = useToast();

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No client websites found. Use the "Invite Client" button above to add your first client.
      </div>
    );
  }

  const handleSendReminder = async (client: ClientWebsite, reminderType: '3_day' | '7_day' | '14_day' | '30_day' | 'final_notice') => {
    try {
      await sendPaymentReminder({
        siteId: client.id,
        reminderType,
        manualSend: true
      });

      toast({
        title: "Reminder Sent",
        description: `${reminderType.replace('_', '-')} payment reminder sent to ${client.name}`,
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send payment reminder",
        variant: "destructive",
      });
    }
  };

  const getReminderButtonType = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'overdue_3d':
        return '3_day';
      case 'overdue_7d':
        return '7_day';
      case 'overdue_14d':
        return '14_day';
      case 'overdue_30d':
        return '30_day';
      case 'suspended':
        return 'final_notice';
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client/Project Name</TableHead>
          <TableHead className="w-[120px]">Plan Type</TableHead>
          <TableHead className="w-[140px]">Payment Status</TableHead>
          <TableHead className="w-[120px]">Next Payment</TableHead>
          <TableHead className="w-[280px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const reminderType = getReminderButtonType(client.paymentStatus || 'current');
          const isOverdue = client.paymentStatus && client.paymentStatus !== 'current';
          
          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {client.name}
                  {isOverdue && (
                    <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getPlanBadgeColor(client.planType)}>
                  {client.planType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPaymentStatusColor(client.paymentStatus || 'current')}>
                  {getPaymentStatusLabel(client.paymentStatus || 'current')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{new Date(client.nextPaymentDate || "").toLocaleDateString()}</div>
                  <div className="text-gray-500">${client.nextPaymentAmount.toFixed(2)}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails(client)}
                    className="flex items-center gap-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Details</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(client.url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit</span>
                  </Button>
                  {reminderType && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendReminder(client, reminderType)}
                      className="flex items-center gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send Reminder</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
