
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4, Globe, Mail, Megaphone, RefreshCw } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const {
    users,
    setUsers,
    payments,
    upcomingPayments,
    isLoading,
    revenueData,
    refreshData
  } = useAdminData();

  const handleGlobalReconciliation = async () => {
    setReconciliationLoading(true);
    try {
      console.log('AdminDashboard: Starting global payment reconciliation...');
      
      // For now, let's run reconciliation for the current admin user
      // In a real system, you'd want a separate admin endpoint that handles all users
      const { data, error } = await supabase.functions.invoke('reconcile-payments');
      
      if (error) {
        console.error('Global reconciliation failed:', error);
        toast({
          title: "Reconciliation Failed",
          description: "Unable to sync payment history. Please contact support.",
          variant: "destructive",
        });
      } else {
        console.log('Global reconciliation result:', data);
        toast({
          title: "Payment History Synced",
          description: `Global reconciliation completed. Found ${data.paymentsReconciled || 0} payments.`,
        });
        
        // Refresh admin data
        refreshData();
      }
    } catch (error) {
      console.error('Error during global reconciliation:', error);
      toast({
        title: "Reconciliation Error", 
        description: "An unexpected error occurred during reconciliation.",
        variant: "destructive",
      });
    } finally {
      setReconciliationLoading(false);
    }
  };
  
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>
                          View completed payment transactions
                        </CardDescription>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button 
                          onClick={handleGlobalReconciliation}
                          disabled={reconciliationLoading}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className={`h-4 w-4 ${reconciliationLoading ? 'animate-spin' : ''}`} />
                          {reconciliationLoading ? 'Syncing...' : 'Sync All Payments'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {payments.length > 0 ? (
                      <PaymentsTable payments={payments} />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-4">No payment data available</p>
                        <p className="text-sm mb-4">Try syncing payments to load missing data.</p>
                        <Button 
                          onClick={handleGlobalReconciliation}
                          disabled={reconciliationLoading}
                          variant="outline"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${reconciliationLoading ? 'animate-spin' : ''}`} />
                          {reconciliationLoading ? 'Syncing...' : 'Sync Payments'}
                        </Button>
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
