import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, UserCircle, DollarSign, CalendarClock, BarChart4, AlertCircle } from "lucide-react";
import { format, addMonths } from "date-fns";
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
  last_sign_in: string;
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
  
  // Mock data for demo purposes
  const mockUsers = [
    { id: '1', email: 'admin@example.com', role: 'admin', created_at: '2023-01-15', last_sign_in: '2023-11-01' },
    { id: '2', email: 'user1@example.com', role: 'user', created_at: '2023-02-20', last_sign_in: '2023-10-28' },
    { id: '3', email: 'user2@example.com', role: 'user', created_at: '2023-03-10', last_sign_in: '2023-10-30' },
    { id: '4', email: 'user3@example.com', role: 'user', created_at: '2023-04-05', last_sign_in: '2023-09-15' },
    { id: '5', email: 'user4@example.com', role: 'user', created_at: '2023-05-22', last_sign_in: '2023-11-02' },
  ];
  
  const mockPayments = [
    { id: 'p1', user_id: '2', user_email: 'user1@example.com', amount: 29.99, status: 'completed', payment_date: '2023-10-01', plan: 'Pro' },
    { id: 'p2', user_id: '3', user_email: 'user2@example.com', amount: 29.99, status: 'completed', payment_date: '2023-10-05', plan: 'Pro' },
    { id: 'p3', user_id: '4', user_email: 'user3@example.com', amount: 19.99, status: 'completed', payment_date: '2023-09-15', plan: 'Basic' },
    { id: 'p4', user_id: '5', user_email: 'user4@example.com', amount: 29.99, status: 'completed', payment_date: '2023-11-01', plan: 'Pro' },
    { id: 'p5', user_id: '2', user_email: 'user1@example.com', amount: 29.99, status: 'pending', payment_date: '2023-11-01', plan: 'Pro' },
  ];
  
  const mockUpcomingPayments = [
    { id: 'up1', user_id: '2', user_email: 'user1@example.com', amount: 29.99, status: 'upcoming', payment_date: '2023-12-01', plan: 'Pro' },
    { id: 'up2', user_id: '3', user_email: 'user2@example.com', amount: 29.99, status: 'upcoming', payment_date: '2023-12-05', plan: 'Pro' },
    { id: 'up3', user_id: '4', user_email: 'user3@example.com', amount: 19.99, status: 'upcoming', payment_date: '2023-11-15', plan: 'Basic' },
  ];
  
  // Revenue chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [0, 0, 0, 19.99, 49.98, 79.97, 99.96, 129.95, 149.94, 179.93, 209.92, 0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  useEffect(() => {
    // Fetch real data in production
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch actual data from Supabase
        // For demo purposes, we'll use mock data
        setUsers(mockUsers);
        setPayments(mockPayments);
        setUpcomingPayments(mockUpcomingPayments);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const totalRevenue = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const sendPaymentReminder = (userEmail: string) => {
    // In a real implementation, this would trigger an email sending process
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${userEmail}`,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage users, monitor payments, and view analytics</p>
      
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
                      <TableCell>{user.created_at}</TableCell>
                      <TableCell>{user.last_sign_in}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={user.role === 'admin' ? 'bg-gray-100 text-gray-500' : ''}
                            disabled={user.role === 'admin'}
                          >
                            Make Admin
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <TableCell>{payment.payment_date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <TableCell>{payment.payment_date}</TableCell>
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
                      <p className="text-3xl font-bold text-primary mt-2">$78.24</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-500">Recurring Revenue</h3>
                      <p className="text-3xl font-bold text-green-600 mt-2">$209.92</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-500">Growth Rate</h3>
                      <p className="text-3xl font-bold text-blue-600 mt-2">+15.7%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 