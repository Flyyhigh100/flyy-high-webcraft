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
}

export const usePaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .select('id, amount, status, payment_date, plan_type, method')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payment history:', fetchError);
        setError('Failed to load payment history');
        return;
      }

      console.log('PaymentHistory: Fetched payments:', data?.length || 0, 'payments');
      setPayments(data || []);
      
      // If no payments found, suggest reconciliation
      if (!data || data.length === 0) {
        console.log('PaymentHistory: No payments found, user may need reconciliation');
      }
    } catch (err) {
      console.error('Error in fetchPayments:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments
  };
};