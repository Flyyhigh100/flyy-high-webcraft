
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4, Globe, Mail, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAdminData } from "@/hooks/useAdminData";
import { UserAccountsTable } from "@/components/admin/UserAccountsTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { UpcomingPaymentsTable } from "@/components/admin/UpcomingPaymentsTable";
import { RevenueAnalytics } from "@/components/admin/RevenueAnalytics";
import { ClientWebsiteList } from "@/components/admin/ClientWebsiteList";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";
import { ClientInvitationsTable } from "@/components/admin/ClientInvitationsTable";
import { MarketingEmailManager } from "@/components/admin/MarketingEmailManager";

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
              <TabsTrigger value="clients">
                <UserCircle className="mr-2 h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="websites">
                <Globe className="mr-2 h-4 w-4" />
                Client Websites
              </TabsTrigger>
              <TabsTrigger value="payments">
                <DollarSign className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart4 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="admin-users">
                <User className="mr-2 h-4 w-4" />
                Admin Users
              </TabsTrigger>
              <TabsTrigger value="marketing">
                <Megaphone className="mr-2 h-4 w-4" />
                Marketing
              </TabsTrigger>
            </TabsList>
            
            {/* Clients Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Client Users</CardTitle>
                  <CardDescription>
                    Manage client accounts and their website access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserAccountsTable 
                    users={users.filter(user => user.role !== 'admin')} 
                    setUsers={setUsers} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Websites Tab */}
            <TabsContent value="websites">
              <ClientWebsiteList />
            </TabsContent>
            
            {/* Consolidated Payments Tab */}
            <TabsContent value="payments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Payments</CardTitle>
                    <CardDescription>
                      Payment reminders and overdue charges
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

                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      View completed payment transactions
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
              </div>
            </TabsContent>
            
            {/* Admin Users Tab */}
            <TabsContent value="admin-users">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>
                    Manage administrator accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserAccountsTable 
                    users={users.filter(user => user.role === 'admin')} 
                    setUsers={setUsers} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Invitations</CardTitle>
                    <CardDescription>
                      Send and manage client invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClientInvitationsTable />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Email Management</CardTitle>
                    <CardDescription>
                      Send marketing emails to subscribers and manage your mailing list
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MarketingEmailManager />
                  </CardContent>
                </Card>
              </div>
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
