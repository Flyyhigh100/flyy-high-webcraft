
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData } from "@/types/admin";

export function useAdminData() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Revenue data
  const revenueData: RevenueData = {
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
        console.log("Fetching admin data...");
        
        // CHANGE: Instead of using the admin API, query profiles directly
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        if (profilesData) {
          console.log("Profiles data:", profilesData);
          const formattedUsers = profilesData.map(profile => ({
            id: profile.id,
            email: profile.email || '',
            role: profile.role || 'user',
            created_at: profile.created_at || '',
            updated_at: profile.updated_at || '',
            user_id: profile.user_id || profile.id,
            last_sign_in: ''  // We don't have this data from profiles table
          }));
          
          setUsers(formattedUsers);
        } else {
          setUsers([]);
        }
        
        try {
          // Check if payments table exists before querying it
          const { data: tableExistsData, error: tableExistsError } = await supabase
            .rpc('table_exists', { 
              table_name: 'payments', 
              schema_name: 'public' 
            });
          
          // If the payments table exists, fetch the data
          if (!tableExistsError && tableExistsData) {
            // Fetch payments data
            const { data: paymentsData, error: paymentsError } = await supabase
              .from('payments')
              .select('*')
              .eq('status', 'completed');
              
            if (!paymentsError && paymentsData) {
              // Format payments with user emails
              const formattedPayments: Payment[] = [];
              
              for (const payment of paymentsData) {
                // Get user email from profiles
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('email')
                  .eq('id', payment.user_id)
                  .single();
                  
                const email = profileData?.email || 'Unknown';
                
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
              const formattedUpcoming: Payment[] = [];
              
              for (const payment of upcomingData) {
                // Get user email from profiles
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('email')
                  .eq('id', payment.user_id)
                  .single();
                  
                const email = profileData?.email || 'Unknown';
                
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
          } else {
            console.log("Payments table does not exist yet or function failed");
            // If there's an error or the table doesn't exist, set empty arrays for payments
            setPayments([]);
            setUpcomingPayments([]);
          }
        } catch (paymentError) {
          console.error('Error fetching payment data:', paymentError);
          setPayments([]);
          setUpcomingPayments([]);
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
  
  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
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
  
  return {
    users,
    setUsers,
    payments,
    upcomingPayments,
    isLoading,
    revenueData,
    makeUserAdmin
  };
}
