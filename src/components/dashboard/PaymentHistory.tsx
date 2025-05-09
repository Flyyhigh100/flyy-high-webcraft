
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DownloadCloud, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentHistory = () => {
  const { toast } = useToast();
  
  // Mock payment history data
  const payments = [
    {
      id: 'INV-001',
      date: '2025-05-01',
      amount: 15.00,
      status: 'paid',
      description: 'Monthly Hosting Plan - Basic',
      invoiceUrl: '#'
    },
    {
      id: 'INV-002',
      date: '2025-04-01',
      amount: 15.00,
      status: 'paid',
      description: 'Monthly Hosting Plan - Basic',
      invoiceUrl: '#'
    },
    {
      id: 'INV-003',
      date: '2025-03-01',
      amount: 15.00,
      status: 'paid',
      description: 'Monthly Hosting Plan - Basic',
      invoiceUrl: '#'
    }
  ];
  
  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Download",
      description: `Invoice ${invoiceId} is being prepared for download.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': 
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending': 
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed': 
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'refunded': 
        return <Badge className="bg-blue-500">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Billing History</h2>
        <Button variant="outline">
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
              <div className="flex items-center justify-end">
                <Button variant="outline" className="mr-2">Update Payment Method</Button>
                <Button className="bg-flyy-600 hover:bg-flyy-700">Make Payment</Button>
              </div>
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
                    <td className="py-3 px-4 font-medium">{payment.id}</td>
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">{payment.description}</td>
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
            <div className="text-center py-8 text-gray-500">
              No payment history found.
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
