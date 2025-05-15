
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Payment, UserProfile, RevenueData } from "@/types/admin";
import { 
  fetchProfiles, 
  checkPaymentsTableExists, 
  fetchCompletedPayments, 
  fetchUpcomingPayments, 
  calculateRevenueData 
} from "@/utils/adminUtils";
import { useAdminRoleManagement } from "@/hooks/useAdminRoleManagement";

export function useAdminData() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
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
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching admin data...");
        
        // Fetch profiles
        const profilesData = await fetchProfiles();
        setUsers(profilesData);
        
        // Check if payments table exists and fetch payment data
        const tableExists = await checkPaymentsTableExists();
        
        if (tableExists) {
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
    await adminRoleMutation(userId, users, setUsers);
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
