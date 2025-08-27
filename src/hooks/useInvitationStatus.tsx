import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InvitationStatus {
  hasActiveInvitation: boolean;
  invitationPlan?: string;
  invitationAmount?: number;
  invitationId?: string;
  siteId?: string;
  isPaid: boolean;
}

export const useInvitationStatus = () => {
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>({
    hasActiveInvitation: false,
    isPaid: false
  });
  const [loading, setLoading] = useState(true);

  const checkInvitationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Fetch sanitized invitation info via secure RPC (no direct table access)
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_user_invitation_status');
      if (rpcError) throw rpcError;
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

      if (row?.has_active_invitation) {
        // Check if they have an active subscription for this invitation/site
        let { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('site_id', row.site_id)
          .eq('status', 'active')
          .single();

        // Fallback: if no subscription found with site_id, check for any active subscription for the user
        if (!subscription && row.site_id) {
          const { data: fallbackSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .is('site_id', null)
            .single();
          
          subscription = fallbackSubscription;
        }

        setInvitationStatus({
          hasActiveInvitation: true,
          invitationPlan: row.invitation_plan || undefined,
          invitationAmount: row.invitation_amount ?? undefined,
          invitationId: row.invitation_id || undefined,
          siteId: row.site_id || undefined,
          isPaid: !!subscription
        });
      } else {
        setInvitationStatus({
          hasActiveInvitation: false,
          isPaid: false
        });
      }
    } catch (error) {
      console.error('Error checking invitation status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInvitationStatus();
  }, []);

  return { invitationStatus, loading, refetch: checkInvitationStatus };
};