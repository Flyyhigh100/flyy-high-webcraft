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

      // Check for pending invitations that match the user's email
      const { data: invitation } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'used') // User has accepted the invitation
        .single();

      if (invitation) {
        // Check if they have an active subscription for this invitation
        let { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('site_id', invitation.site_id)
          .eq('status', 'active')
          .single();

        // Fallback: if no subscription found with site_id, check for any active subscription for the user
        if (!subscription && invitation.site_id) {
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
          invitationPlan: invitation.plan_type,
          invitationAmount: invitation.next_payment_amount,
          invitationId: invitation.id,
          siteId: invitation.site_id,
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