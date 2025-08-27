import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, ExternalLink, FileText, Globe } from 'lucide-react';
import { PaymentHistoryItem } from '@/hooks/usePaymentHistory';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDetailsModalProps {
  payment: PaymentHistoryItem | null;
  open: boolean;
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  open,
  onClose
}) => {
  const { toast } = useToast();

  if (!payment) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleDownloadInvoice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('download-receipt', {
        body: { paymentId: payment.id }
      });

      if (error) throw error;

      if (data.type === 'redirect') {
        window.open(data.url, '_blank');
        toast({
          title: "Invoice Opened",
          description: "Your invoice has been opened in a new tab.",
        });
      } else if (data.type === 'data') {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Payment Details
            {getStatusBadge(payment.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {payment.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.id, 'Payment ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${Number(payment.amount).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Website Information */}
          {payment.website_name && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Website Name</p>
                    <p className="font-medium">{payment.website_name}</p>
                  </div>
                  {payment.website_url && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website URL</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{payment.website_url}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(payment.website_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Payment Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan Type</span>
                  <span className="font-medium">{payment.plan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{payment.method || 'Card'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownloadInvoice} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};