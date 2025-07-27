
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4, Globe, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useAdminData } from "@/hooks/useAdminData";
import { UserAccountsTable } from "@/components/admin/UserAccountsTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { UpcomingPaymentsTable } from "@/components/admin/UpcomingPaymentsTable";
import { RevenueAnalytics } from "@/components/admin/RevenueAnalytics";
import { ClientWebsiteList } from "@/components/admin/ClientWebsiteList";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";
import { ClientInvitationsTable } from "@/components/admin/ClientInvitationsTable";

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
          <AdminSummaryCards 
            users={users} 
            payments={payments} 
            upcomingPayments={upcomingPayments} 
          />
          
          <Tabs defaultValue="websites" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="websites">
                <Globe className="mr-2 h-4 w-4" />
                Client Websites
              </TabsTrigger>
              <TabsTrigger value="invitations">
                <Mail className="mr-2 h-4 w-4" />
                Invitations
              </TabsTrigger>
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
            
            {/* Client Websites Tab */}
            <TabsContent value="websites">
              <Card>
                <CardHeader>
                  <CardTitle>Client Websites</CardTitle>
                  <CardDescription>
                    Manage and monitor all client websites and projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientWebsiteList />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Client Invitations Tab */}
            <TabsContent value="invitations">
              <ClientInvitationsTable />
            </TabsContent>
            
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
                  {payments.length > 0 ? (
                    <PaymentsTable payments={payments} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No payment data available
                    </div>
                  )}
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
                  {upcomingPayments.length > 0 ? (
                    <UpcomingPaymentsTable upcomingPayments={upcomingPayments} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming payments
                    </div>
                  )}
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
                  {payments.length > 0 ? (
                    <RevenueAnalytics payments={payments} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No analytics data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
