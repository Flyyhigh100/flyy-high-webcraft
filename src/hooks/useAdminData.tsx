
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData } from "@/types/admin";

// Utility function to ensure we're working with a flat array
const ensureFlatArray = <T,>(data: T[] | T[][]): T[] => {
  if (data.length === 0) return [];
  if (Array.isArray(data[0])) {
    return (data as T[][]).flat();
  }
  return data as T[];
};

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
        // Fetch users from Supabase auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }
        
        if (authUsers && authUsers.users) {
          // Format user data
          const formattedUsers: UserProfile[] = authUsers.users.map(user => ({
            id: user.id,
            email: user.email || '',
            role: 'user', // Default role
            created_at: user.created_at || '',
            user_id: user.id,
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
        
        try {
          // Fetch payments data
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('status', 'completed');
            
          if (!paymentsError && paymentsData) {
            // Format payments with user emails
            const formattedPayments: Payment[] = [];
            
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
            const formattedUpcoming: Payment[] = [];
            
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
