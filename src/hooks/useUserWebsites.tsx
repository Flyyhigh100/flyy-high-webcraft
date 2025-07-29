import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UserWebsite {
  id: string;
  name: string;
  url: string;
  plan_type: string;
  next_payment_date: string | null;
  next_payment_amount: number | null;
  payment_status: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserWebsites() {
  const [websites, setWebsites] = useState<UserWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserWebsites = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        setWebsites([]);
        return;
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        throw error;
      }

      setWebsites(data || []);
    } catch (error) {
      console.error('Error in fetchUserWebsites:', error);
      toast({
        title: "Error",
        description: "Failed to load your website information",
        variant: "destructive",
      });
      setWebsites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAutoRenewal = async (websiteId: string, autoRenew: boolean) => {
    try {
      const { error } = await supabase
        .from('websites')
        .update({ auto_renew: autoRenew })
        .eq('id', websiteId);

      if (error) throw error;

      setWebsites(prev => 
        prev.map(site => 
          site.id === websiteId 
            ? { ...site, auto_renew: autoRenew } 
            : site
        )
      );
      
      toast({
        title: "Auto-renewal updated",
        description: `Auto-renewal has been ${autoRenew ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-renewal setting",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserWebsites();
  }, []);

  return {
    websites,
    isLoading,
    refetch: fetchUserWebsites,
    updateAutoRenewal
  };
}