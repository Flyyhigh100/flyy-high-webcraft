
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Payment } from "@/types/admin";

interface PaymentsTableProps {
  payments: Payment[];
  showStatus?: boolean;
}

export function PaymentsTable({ payments, showStatus = true }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payment history found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          {showStatus && <TableHead>Status</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.user_email}</TableCell>
            <TableCell>{payment.plan}</TableCell>
            <TableCell>${payment.amount.toFixed(2)}</TableCell>
            {showStatus && (
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  payment.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </span>
              </TableCell>
            )}
            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">View Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
