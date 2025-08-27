import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: string;
  payment_date: string;
  plan_type: string;
  method?: string;
  website_name?: string;
  website_url?: string;
  site_id?: string;
}

export const usePaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  const fetchPayments = async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('PaymentHistory: Fetching payments for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          id, 
          amount, 
          status, 
          payment_date, 
          plan_type, 
          method,
          site_id,
          websites:site_id (
            name,
            url
          )
        `)
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payment history:', fetchError);
        setError('Failed to load payment history');
        return;
      }

      console.log('PaymentHistory: Fetched payments:', data?.length || 0, 'payments');
      
      // Transform data to include website information
      const paymentsWithWebsites = (data || []).map((payment: any) => ({
        ...payment,
        website_name: payment.websites?.name,
        website_url: payment.websites?.url,
      }));
      
      setPayments(paymentsWithWebsites);
      
      // Auto-sync if no payments found (first load only)
      if ((!data || data.length === 0) && !isAutoSyncing) {
        console.log('PaymentHistory: No payments found, auto-syncing...');
        await handleAutoSync();
      }
    } catch (err) {
      console.error('Error in fetchPayments:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSync = async () => {
    if (!user) return;
    
    try {
      setIsAutoSyncing(true);
      console.log('PaymentHistory: Starting auto-sync reconciliation');
      
      const { data, error } = await supabase.functions.invoke('reconcile-payments', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      console.log('PaymentHistory: Auto-sync completed', data);
      
      // Refetch payments after reconciliation (without auto-sync to avoid recursion)
      const { data: refreshedData, error: refreshError } = await supabase
        .from('payments')
        .select(`
          id, 
          amount, 
          status, 
          payment_date, 
          plan_type, 
          method,
          site_id,
          websites:site_id (
            name,
            url
          )
        `)
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (!refreshError) {
        const paymentsWithWebsites = (refreshedData || []).map((payment: any) => ({
          ...payment,
          website_name: payment.websites?.name,
          website_url: payment.websites?.url,
        }));
        setPayments(paymentsWithWebsites);
      }
    } catch (err) {
      console.error('PaymentHistory: Auto-sync failed:', err);
      // Don't set error state for auto-sync failures to avoid confusing users
    } finally {
      setIsAutoSyncing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return {
    payments,
    loading,
    error,
    isAutoSyncing,
    refetch: fetchPayments
  };
};