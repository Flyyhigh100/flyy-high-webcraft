
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, DollarSign, CalendarClock, BarChart4 } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";
import { UserAccountsTable } from "@/components/admin/UserAccountsTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { UpcomingPaymentsTable } from "@/components/admin/UpcomingPaymentsTable";
import { RevenueAnalytics } from "@/components/admin/RevenueAnalytics";

export default function AdminDashboard() {
  const { users, setUsers, payments, upcomingPayments, isLoading } = useAdminData();
  
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
                  <PaymentsTable payments={payments} showStatus={true} />
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
                  <UpcomingPaymentsTable upcomingPayments={upcomingPayments} />
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
                  <RevenueAnalytics payments={payments} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
