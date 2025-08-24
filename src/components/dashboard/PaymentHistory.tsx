
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DownloadCloud, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { supabase } from '@/integrations/supabase/client';

const PaymentHistory = () => {
  const { toast } = useToast();
  const { payments, loading, error, refetch } = usePaymentHistory();
  
  const handleReconcilePayments = async () => {
    try {
      console.log('PaymentHistory: Starting payment reconciliation...');
      const { data, error } = await supabase.functions.invoke('reconcile-payments');
      
      if (error) {
        console.error('Payment reconciliation failed:', error);
        toast({
          title: "Reconciliation Failed",
          description: "Unable to sync your payment history. Please contact support.",
          variant: "destructive",
        });
      } else {
        console.log('Payment reconciliation result:', data);
        toast({
          title: "Payment History Synced",
          description: `Found and synced ${data.paymentsReconciled || 0} missing payments.`,
        });
        refetch(); // Refresh the payment history
      }
    } catch (error) {
      console.error('Error during reconciliation:', error);
    }
  };
  
  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('download-receipt', {
        body: { paymentId }
      });

      if (error) throw error;

      if (data.type === 'redirect') {
        // Open invoice URL in new tab
        window.open(data.url, '_blank');
        toast({
          title: "Invoice Opened",
          description: "Your invoice has been opened in a new tab.",
        });
      } else if (data.type === 'data') {
        // Generate a simple receipt view
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
          receiptWindow.document.write(`
            <html>
              <head><title>Payment Receipt</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>Payment Receipt</h1>
                <p><strong>Receipt ID:</strong> ${data.receipt.receiptId}</p>
                <p><strong>Date:</strong> ${new Date(data.receipt.date).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> $${data.receipt.amount}</p>
                <p><strong>Plan:</strong> ${data.receipt.planType}</p>
                <p><strong>Status:</strong> ${data.receipt.status}</p>
                <p><strong>Email:</strong> ${data.receipt.userEmail}</p>
              </body>
            </html>
          `);
        }
        toast({
          title: "Receipt Generated",
          description: "Your receipt has been opened in a new tab.",
        });
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'paid': 
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case 'pending': 
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'failed': 
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      case 'refunded': 
        return <Badge className="bg-blue-500 text-white">Refunded</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge className="bg-gray-500 text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-x-2">
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleReconcilePayments} variant="default">
            Sync Payment History
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Billing History</h2>
        <Button variant="outline" onClick={async () => {
          try {
            const { data, error } = await supabase.functions.invoke('download-receipt', {
              body: { downloadAll: true }
            });
            if (error) throw error;
            toast({
              title: "Download Started",
              description: "All invoices download will be available soon.",
            });
          } catch (error) {
            toast({
              title: "Download Failed",
              description: "No invoices available to download.",
              variant: "destructive",
            });
          }
        }}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download All Invoices
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-flyy-600 hover:bg-flyy-700">Make Payment</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Invoice</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{payment.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">${Number(payment.amount).toFixed(2)}</td>
                    <td className="py-3 px-4">{payment.plan_type} Plan - {payment.method || 'Card'}</td>
                    <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center"
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {payments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No payment history found</p>
              <div className="space-y-2">
                <Button 
                  onClick={handleReconcilePayments} 
                  variant="outline"
                  className="w-full"
                >
                  Sync Payment History
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke('download-receipt', {
                        body: { downloadAll: true }
                      });
                      if (error) throw error;
                      toast({
                        title: "Download Started",
                        description: "All invoices download will be available soon.",
                      });
                    } catch (error) {
                      toast({
                        title: "Download Failed",
                        description: "No invoices available to download.",
                        variant: "destructive",
                      });
                    }
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Download All Invoices
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                If you've made payments recently, try syncing your payment history.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-center text-gray-500 text-sm">
                No payment method on file. Add a payment method to enable automatic billing.
              </p>
              <Button className="w-full mt-4">Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Billing Contact</span>
                <span className="font-medium">Demo User</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Billing Email</span>
                <span className="font-medium">billing@example.com</span>
              </div>
              
              <Button variant="outline" className="mt-2">
                Update Billing Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistory;
