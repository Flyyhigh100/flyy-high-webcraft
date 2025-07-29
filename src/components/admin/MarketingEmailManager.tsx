import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Users, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketingSubscriber {
  id: string;
  email: string;
  marketing_opt_in: boolean;
  marketing_updated_at: string;
  created_at: string;
}

export const MarketingEmailManager = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const fetchMarketingSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, marketing_opt_in, marketing_updated_at, created_at')
        .eq('marketing_opt_in', true)
        .not('email', 'is', null)
        .order('marketing_updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscribers:', error);
        toast({
          title: "Error",
          description: "Failed to load marketing subscribers",
          variant: "destructive",
        });
      } else {
        setSubscribers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingSubscribers();
  }, []);

  const handleSendMarketingEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both subject and content for the email",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          subject: emailSubject,
          content: emailContent,
          recipients: subscribers.map(s => s.email)
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Sent Successfully",
        description: `Marketing email sent to ${subscribers.length} subscribers`,
      });

      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Send Failed",
        description: "Failed to send marketing email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const optInCount = subscribers.filter(s => s.marketing_opt_in).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{optInCount}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opt-in Rate</p>
                <p className="text-2xl font-bold">
                  {subscribers.length > 0 ? Math.round((optInCount / subscribers.length) * 100) : 0}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaign</p>
                <p className="text-lg font-semibold text-muted-foreground">Ready to Send</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList>
          <TabsTrigger value="subscribers">
            <Users className="mr-2 h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marketing Subscribers</CardTitle>
                  <CardDescription>
                    Users who have opted in to receive marketing emails
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchMarketingSubscribers}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Opted In</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">
                            {subscriber.email}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={subscriber.marketing_opt_in ? "default" : "secondary"}
                              className={subscriber.marketing_opt_in ? "bg-green-100 text-green-800" : ""}
                            >
                              {subscriber.marketing_opt_in ? "Subscribed" : "Unsubscribed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(subscriber.marketing_updated_at)}
                          </TableCell>
                          <TableCell>
                            {formatDate(subscriber.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {subscribers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No marketing subscribers found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Marketing Email</CardTitle>
              <CardDescription>
                Send a marketing email to all {optInCount} subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  disabled={sendingEmail}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Enter your marketing email content here..."
                  className="min-h-[200px]"
                  disabled={sendingEmail}
                />
              </div>

              {previewMode && (
                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Email Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <strong>Subject:</strong> {emailSubject || "No subject"}
                      </div>
                      <div>
                        <strong>Content:</strong>
                        <div className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
                          {emailContent || "No content"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  disabled={sendingEmail}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {previewMode ? "Hide Preview" : "Preview"}
                </Button>
                
                <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      disabled={!emailSubject.trim() || !emailContent.trim() || sendingEmail || optInCount === 0}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to {optInCount} Subscribers
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Email Send</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to send this marketing email to {optInCount} subscribers?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <p><strong>Subject:</strong> {emailSubject}</p>
                        <p><strong>Recipients:</strong> {optInCount} subscribers</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendMarketingEmail} disabled={sendingEmail}>
                        {sendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Email
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};