import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  source: string | null;
}

export function NewsletterSubscribersTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers' as any)
        .select('*')
        .order('subscribed_at', { ascending: false }) as any;

      if (!error && data) {
        setSubscribers(data);
      }
      setLoading(false);
    };
    fetchSubscribers();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading subscribers...</div>;
  }

  if (subscribers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No subscribers yet.</div>;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Subscribed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{sub.source || 'unknown'}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(sub.subscribed_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
