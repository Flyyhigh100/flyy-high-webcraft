
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Payment } from "@/types/admin";
import { sendPaymentReminder } from "@/utils/paymentReminderUtils";

interface UpcomingPaymentsTableProps {
  upcomingPayments: Payment[];
}

export function UpcomingPaymentsTable({ upcomingPayments }: UpcomingPaymentsTableProps) {
  const { toast } = useToast();

  const sendReminder = async (payment: Payment) => {
    try {
      const dueDate = new Date(payment.payment_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const reminderType = daysUntilDue <= 1 ? 'upcoming_1d' : daysUntilDue <= 3 ? 'upcoming_3d' : 'upcoming_7d';

      await sendPaymentReminder({ siteId: payment.id, reminderType, manualSend: true });

      toast({
        title: "Reminder Sent",
        description: `Payment reminder (${reminderType.replace('_', ' ')}) sent to ${payment.user_email}`,
      });
    } catch (e: any) {
      toast({
        title: "Failed",
        description: e.message || 'Failed to send reminder',
        variant: "destructive",
      });
    }
  };

  if (upcomingPayments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No upcoming payments found
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcomingPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.user_email}</TableCell>
              <TableCell>{payment.plan}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendReminder(payment)}
                >
                  Send Reminder
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Payment Reminders</h4>
            <p className="text-sm text-amber-700 mt-1">
              Automatic email reminders are sent 7 days, 3 days, and 1 day before the payment due date.
              You can also send manual reminders using the "Send Reminder" button.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
