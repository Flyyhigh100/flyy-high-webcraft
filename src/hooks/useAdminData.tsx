
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
      console.log("Fetching admin data via edge function...");
      
      // Get current session for authorization header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error("Session error:", sessionError);
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log("Calling admin service for user:", session.user.email);
      
      // Call the admin service edge function
      const { data, error } = await supabase.functions.invoke('admin-service', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Admin service error:', error);
        throw new Error(error.message || 'Failed to fetch admin data');
      }
      
      if (!data) {
        throw new Error('No data returned from admin service');
      }
      
      console.log("Admin data received:", {
        profilesCount: data.profiles?.length || 0,
        paymentsCount: data.payments?.length || 0,
        upcomingPaymentsCount: data.upcomingPayments?.length || 0,
        websitesCount: data.clientWebsites?.length || 0
      });
      
      // Set all the data from the edge function response
      setUsers(data.profiles || []);
      setPayments(data.payments || []);
      setUpcomingPayments(data.upcomingPayments || []);
      setClientWebsites(data.clientWebsites || []);
      setRevenueData(data.revenueData || {
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
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
