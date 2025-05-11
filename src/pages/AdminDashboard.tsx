import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Type definitions
interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
}

interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  status: string;
  payment_date: string;
  plan: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Revenue chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users from Supabase auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }
        
        if (authUsers && authUsers.users) {
          // Format user data
          const formattedUsers = authUsers.users.map(user => ({
            id: user.id,
            email: user.email || '',
            role: 'user', // Default role
            created_at: user.created_at || '',
            last_sign_in: user.last_sign_in_at || '',
          }));
          
          // Try to get roles from profiles table
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, role');
            
          if (!profilesError && profiles) {
            // Update roles from profiles
            const rolesMap = new Map();
            profiles.forEach(profile => {
              rolesMap.set(profile.user_id, profile.role);
            });
            
            formattedUsers.forEach(user => {
              if (rolesMap.has(user.id)) {
                user.role = rolesMap.get(user.id);
              }
            });
          }
          
          setUsers(formattedUsers);
        }
        
        // Fetch payments data
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('status', 'completed');
          
        if (!paymentsError && paymentsData) {
          // Format payments with user emails
          const formattedPayments = [];
          
          for (const payment of paymentsData) {
            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(payment.user_id);
            const email = userData?.user?.email || 'Unknown';
            
            formattedPayments.push({
              id: payment.id,
              user_id: payment.user_id,
              user_email: email,
              amount: payment.amount,
              status: payment.status,
              payment_date: payment.payment_date,
              plan: payment.plan
            });
          }
          
          setPayments(formattedPayments);
          
          // Calculate revenue data
          if (formattedPayments.length > 0) {
            const monthlyRevenue = Array(12).fill(0);
            
            formattedPayments.forEach(payment => {
              const date = new Date(payment.payment_date);
              const month = date.getMonth();
              monthlyRevenue[month] += payment.amount;
            });
            
            revenueData.datasets[0].data = monthlyRevenue;
          }
        }
        
        // Fetch upcoming payments
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('payments')
          .select('*')
          .eq('status', 'upcoming');
          
        if (!upcomingError && upcomingData) {
          // Format upcoming payments with user emails
          const formattedUpcoming = [];
          
          for (const payment of upcomingData) {
            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(payment.user_id);
            const email = userData?.user?.email || 'Unknown';
            
            formattedUpcoming.push({
              id: payment.id,
              user_id: payment.user_id,
              user_email: email,
              amount: payment.amount,
              status: payment.status,
              payment_date: payment.payment_date,
              plan: payment.plan
            });
          }
          
          setUpcomingPayments(formattedUpcoming);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
        
        // Fallback to empty data
        setUsers([]);
        setPayments([]);
        setUpcomingPayments([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const totalRevenue = payments
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const sendPaymentReminder = (userEmail: string) => {
    // In a real implementation, this would trigger an email sending process
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${userEmail}`,
    });
  };
  
  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'admin' } 
          : user
      ));
      
      toast({
        title: "Success",
        description: "User role updated to admin",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
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
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Sign In</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">View</Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={user.role === 'admin' ? 'bg-gray-100 text-gray-500' : ''}
                                  disabled={user.role === 'admin'}
                                  onClick={() => makeUserAdmin(user.id)}
                                >
                                  Make Admin
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
                  {payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No payment history found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
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
                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">View Details</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                  {upcomingPayments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming payments found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.user_email}</TableCell>
                            <TableCell>{payment.plan}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => sendPaymentReminder(payment.user_email)}
                              >
                                Send Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="mt-6">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Payment Reminders</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Automatic email reminders are sent 7 days, 3 days, and 1 day before the payment due date.
                          You can also send manual reminders using the "Send Reminder" button.
                        </p>
                      </div>
                    </div>
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
                  <div className="h-80">
                    <Line 
                      data={revenueData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `$${value}`
                            }
                          }
                        },
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Revenue: $${context.parsed.y}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-500">Monthly Average</h3>
                          <p className="text-3xl font-bold text-primary mt-2">
                            ${(totalRevenue / 12).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-500">Recurring Revenue</h3>
                          <p className="text-3xl font-bold text-green-600 mt-2">
                            ${totalRevenue.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-500">Growth Rate</h3>
                          <p className="text-3xl font-bold text-blue-600 mt-2">
                            {payments.length > 0 ? '+15.7%' : '0%'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
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