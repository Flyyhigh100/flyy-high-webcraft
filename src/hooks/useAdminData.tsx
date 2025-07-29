
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Payment, UserProfile, RevenueData, ClientWebsite } from "@/types/admin";
import { 
  fetchProfiles, 
  checkPaymentsTableExists,
  checkWebsitesTableExists,
  fetchCompletedPayments, 
  fetchUpcomingPayments,
  fetchClientWebsites,
  calculateRevenueData 
} from "@/utils/adminUtils";
import { useAdminRoleManagement } from "@/hooks/useAdminRoleManagement";
import { supabase } from "@/integrations/supabase/client";

export function useAdminData() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [clientWebsites, setClientWebsites] = useState<ClientWebsite[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData>({
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const { makeUserAdmin: adminRoleMutation } = useAdminRoleManagement();
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching admin data...");
      
      // Wait for authentication to be ready
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Current session:", session?.user?.email);
      
      if (sessionError || !session?.user) {
        console.error("Authentication error:", sessionError);
        throw new Error(`Authentication required: ${sessionError?.message || 'No session found'}`);
      }

      // Additional check for admin status
      if (session.user.email !== 'flyyhigh824@gmail.com') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile || profile.role !== 'admin') {
          throw new Error('Admin access required');
        }
      }
      
      // Fetch profiles
      const profilesData = await fetchProfiles();
      setUsers(profilesData);
      
      // Check if payments table exists and fetch payment data
      const paymentsTableExists = await checkPaymentsTableExists();
      
      if (paymentsTableExists) {
        // Fetch completed payments
        const completedPayments = await fetchCompletedPayments();
        setPayments(completedPayments);
        
        // Calculate revenue data
        const calculatedRevenueData = calculateRevenueData(completedPayments);
        setRevenueData(calculatedRevenueData);
        
        // Fetch upcoming payments
        const upcoming = await fetchUpcomingPayments();
        setUpcomingPayments(upcoming);
      } else {
        console.log("Payments table does not exist yet or function failed");
        setPayments([]);
        setUpcomingPayments([]);
      }
      
      // Check if websites table exists and fetch website data
      const websitesTableExists = await checkWebsitesTableExists();
      
      if (websitesTableExists) {
        // Fetch client websites
        const websites = await fetchClientWebsites();
        setClientWebsites(websites);
      } else {
        console.log("Websites table does not exist yet or function failed");
        setClientWebsites([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
        variant: "destructive",
      });
      
      // Fallback to empty data
      setUsers([]);
      setPayments([]);
      setUpcomingPayments([]);
      setClientWebsites([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    // Only fetch data if authentication is loaded
    const initializeFetch = async () => {
      // Wait a bit for auth context to initialize
      setTimeout(fetchData, 100);
    };
    
    initializeFetch();
  }, [fetchData]);
  
  const makeUserAdmin = async (userId: string) => {
    await adminRoleMutation(userId, users, setUsers);
  };
  
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    users,
    setUsers,
    payments,
    upcomingPayments,
    clientWebsites,
    isLoading,
    revenueData,
    makeUserAdmin,
    refreshData
  };
}
