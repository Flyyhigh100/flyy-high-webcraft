
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
          // Check if payments table exists before querying
          const { data, error } = await supabase
            .rpc<boolean>('table_exists', { table_name: 'payments', schema_name: 'public' });
          
          const tableExists = data === true;
          
          // Only fetch payments if the table exists
          if (tableExists) {
            // Fetch completed payments
            const { data: paymentsData, error: paymentsError } = await supabase.rpc<Payment[]>('get_completed_payments');
            
            if (!paymentsError && paymentsData) {
              // Ensure we're working with a flat array of Payment objects
              const paymentsList = ensureFlatArray(paymentsData);
              setPayments(paymentsList);
            }
            
            // Fetch upcoming payments
            const { data: upcomingData, error: upcomingError } = await supabase.rpc<Payment[]>('get_upcoming_payments');
            
            if (!upcomingError && upcomingData) {
              // Ensure we're working with a flat array of Payment objects
              const upcomingList = ensureFlatArray(upcomingData);
              setUpcomingPayments(upcomingList);
            }
          } else {
            console.log('Payments table does not exist yet');
            // Set empty arrays if table doesn't exist
            setPayments([]);
            setUpcomingPayments([]);
          }
        } catch (error) {
          console.error('Error fetching payments:', error);
          // Fallback to empty arrays
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

  // Helper function to ensure we always get a flat array of payments
  const ensureFlatArray = <T,>(data: T | T[] | T[][]): T[] => {
    if (!data) return [];
    if (!Array.isArray(data)) return [data];
    if (data.length === 0) return [];
    if (Array.isArray(data[0])) return (data as T[][]).flat();
    return data as T[];
  };

  return {
    users,
    setUsers,
    payments,
    upcomingPayments,
    isLoading
  };
}
