import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingInvitation {
  id: string;
  email: string;
  client_name: string;
  website_name: string;
  website_url: string;
  plan_type: string;
  next_payment_amount: number;
  status: string;
  expires_at: string;
  created_at: string;
  site_id: string;
}

export function PendingInvitationsTable() {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingInvitations = async () => {
    try {
      // Phase 4: Query only necessary fields, minimize sensitive data exposure
      const { data, error } = await supabase
        .from('client_invitations')
        .select('id, email, client_name, website_name, website_url, plan_type, next_payment_amount, status, expires_at, created_at, site_id')
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const handleResend = async (invitationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('resend-invitation', {
        body: { invitation_id: invitationId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });

      fetchPendingInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (invitationId: string, siteId: string) => {
    if (!confirm('Delete this invitation? The associated website will also be removed.')) return;

    try {
      // Delete invitation
      const { error: inviteError } = await supabase
        .from('client_invitations')
        .delete()
        .eq('id', invitationId);

      if (inviteError) throw inviteError;

      // Delete associated website if it has no user
      const { error: siteError } = await supabase
        .from('websites')
        .delete()
        .eq('id', siteId)
        .is('user_id', null);

      if (siteError) console.warn('Website deletion warning:', siteError);

      toast({
        title: 'Success',
        description: 'Invitation deleted successfully',
      });

      fetchPendingInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (invitation: PendingInvitation) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = expiresAt < now;

    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="secondary">Pending</Badge>;
  };

  if (loading) {
    return <div>Loading pending invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending invitations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const now = new Date();
              const expiresAt = new Date(invitation.expires_at);
              const isExpired = expiresAt < now;

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.client_name}</div>
                      <div className="text-sm text-muted-foreground">{invitation.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.website_name}</div>
                      <div className="text-sm text-muted-foreground">{invitation.website_url}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="capitalize">{invitation.plan_type}</div>
                      <div className="text-sm text-muted-foreground">${invitation.next_payment_amount}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invitation)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <span className="text-sm text-destructive">Expired</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(expiresAt, { addSuffix: true })}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(invitation.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(invitation.id, invitation.site_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
