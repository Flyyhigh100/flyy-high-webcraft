
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useAdminData } from "@/hooks/useAdminData";
import { UserAccountsTable } from "@/components/admin/UserAccountsTable";

export default function AdminDashboard() {
  const { toast } = useToast();
  const {
    users,
    setUsers,
    payments,
    upcomingPayments,
    isLoading,
    revenueData
  } = useAdminData();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage users, monitor payments, and view analytics</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
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
                    <p className="text-2xl font-bold">$0.00</p>
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
          
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="accounts">
                <User className="mr-2 h-4 w-4" />
                User Accounts
              </TabsTrigger>
              <TabsTrigger value="payments">
                <DollarSign className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <CalendarClock className="mr-2 h-4 w-4" />
                Upcoming Payments
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart4 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            {/* User Accounts Tab */}
            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <CardTitle>All User Accounts</CardTitle>
                  <CardDescription>
                    Manage user accounts and roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserAccountsTable users={users} setUsers={setUsers} />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>
                    View and manage payment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No payment data available
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Upcoming Payments Tab */}
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>
                    Payment reminders and upcoming charges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No upcoming payments
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>
                    Monitor revenue trends and payment activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No analytics data available
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
