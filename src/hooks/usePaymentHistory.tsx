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

      setPayments(data || []);
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