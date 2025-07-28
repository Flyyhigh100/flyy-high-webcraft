import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Mail, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ClientInvitation {
  id: string;
  email: string;
  client_name: string;
  website_name: string;
  website_url: string;
  plan_type: string;
  status: string;
  created_at: string;
  used_at: string | null;
  expires_at: string;
  next_payment_amount: number;
  site_id: string;
  superseded_at?: string | null;
  invitation_version?: number;
  created_by_name?: string;
}

export function ClientInvitationsTable() {
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const getStatusBadge = (invitation: ClientInvitation) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (invitation.status === 'used') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    }
    
    if (invitation.status === 'superseded') {
      return <Badge variant="outline" className="text-orange-600 border-orange-200"><XCircle className="w-3 h-3 mr-1" />Superseded</Badge>;
    }
    
    if (now > expiresAt) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const resendInvitation = async (invitation: ClientInvitation) => {
    try {
      const { error } = await supabase.functions.invoke('invite-client', {
        body: {
          email: invitation.email,
          clientName: invitation.client_name,
          websiteName: invitation.website_name,
          websiteUrl: invitation.website_url,
          planType: invitation.plan_type,
          nextPaymentAmount: invitation.next_payment_amount,
          siteId: invitation.site_id
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Resent",
        description: `New invitation sent to ${invitation.email}`,
      });
      
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (invitation: ClientInvitation) => {
    if (!confirm(`Delete invitation for ${invitation.client_name} (${invitation.email})?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('client_invitations')
        .delete()
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitation Deleted",
        description: `Invitation for ${invitation.client_name} has been deleted`,
      });
      
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Invitations</CardTitle>
            <CardDescription>
              Track invitation status and resend if needed
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInvitations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
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
                        <div className="font-medium capitalize">{invitation.plan_type}</div>
                        <div className="text-sm text-muted-foreground">
                          ${invitation.next_payment_amount}/month
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invitation)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(invitation.created_at), 'h:mm a')}
                        {invitation.invitation_version && ` (v${invitation.invitation_version})`}
                      </div>
                      {invitation.created_by_name && (
                        <div className="text-xs text-muted-foreground">
                          by {invitation.created_by_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {invitation.used_at ? (
                        <div className="text-sm">
                          {format(new Date(invitation.used_at), 'MMM dd, yyyy')}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(invitation.used_at), 'h:mm a')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {(invitation.status === 'pending' || invitation.status === 'superseded' || new Date() > new Date(invitation.expires_at)) && invitation.status !== 'used' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendInvitation(invitation)}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            {invitation.status === 'pending' && new Date() < new Date(invitation.expires_at) ? 'Resend' : 'Send New'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInvitation(invitation)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}