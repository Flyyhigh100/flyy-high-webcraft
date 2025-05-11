
import { UserCircle, DollarSign, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Payment, UserProfile } from "@/types/admin";

interface AdminSummaryCardsProps {
  users: UserProfile[];
  payments: Payment[];
  upcomingPayments: Payment[];
}

export function AdminSummaryCards({ users, payments, upcomingPayments }: AdminSummaryCardsProps) {
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Payments</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Payments</p>
              <p className="text-2xl font-bold">{upcomingPayments.length}</p>
            </div>
            <CalendarClock className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
