import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface SecurityLog {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  success: boolean;
  created_at: string;
}

interface RateLimit {
  id: string;
  ip_address: string;
  endpoint: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

const SecurityDashboard = () => {
  const { toast } = useToast();
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      // Fetch recent security logs
      const { data: logs, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching security logs:', logsError);
        toast({
          title: 'Error',
          description: 'Failed to fetch security logs',
          variant: 'destructive'
        });
      } else {
        setSecurityLogs((logs || []).map(log => ({
          ...log,
          ip_address: log.ip_address as string,
          user_agent: log.user_agent as string,
          user_id: log.user_id as string
        })));
      }

      // Fetch current rate limits
      const { data: limits, error: limitsError } = await supabase
        .from('rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (limitsError) {
        console.error('Error fetching rate limits:', limitsError);
        toast({
          title: 'Error',
          description: 'Failed to fetch rate limits',
          variant: 'destructive'
        });
      } else {
        setRateLimits((limits || []).map(limit => ({
          ...limit,
          ip_address: limit.ip_address as string
        })));
      }
    } catch (error) {
      console.error('Error in fetchSecurityData:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch security data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getEventTypeColor = (eventType: string, success: boolean) => {
    if (!success) return 'destructive';
    
    switch (eventType) {
      case 'admin_access_granted':
        return 'default';
      case 'contact_form_submitted':
      case 'project_inquiry_submitted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getEventTypeIcon = (eventType: string, success: boolean) => {
    if (!success) return <AlertTriangle className="h-4 w-4" />;
    
    switch (eventType) {
      case 'admin_access_granted':
        return <Shield className="h-4 w-4" />;
      case 'contact_form_submitted':
      case 'project_inquiry_submitted':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and rate limiting</p>
        </div>
        <Button onClick={fetchSecurityData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Recent Security Events
            </CardTitle>
            <CardDescription>
              Last 50 security events across all systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {securityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No security events found</p>
              ) : (
                securityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                    <div className="mt-1">
                      {getEventTypeIcon(log.event_type, log.success)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getEventTypeColor(log.event_type, log.success)}>
                          {formatEventType(log.event_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(log.created_at)}
                        </span>
                      </div>
                      
                      {log.ip_address && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {log.ip_address}
                        </div>
                      )}
                      
                      {log.details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {log.details.email && `Email: ${log.details.email}`}
                          {log.details.error && `Error: ${log.details.error}`}
                          {log.details.endpoint && `Endpoint: ${log.details.endpoint}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Current Rate Limits
            </CardTitle>
            <CardDescription>
              Active rate limiting entries by IP and endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {rateLimits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active rate limits</p>
              ) : (
                rateLimits.map((limit) => (
                  <div key={limit.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{limit.endpoint}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {limit.request_count} request{limit.request_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {limit.ip_address}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Window: {getTimeAgo(limit.window_start)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {securityLogs.filter(log => log.success).length}
                </p>
                <p className="text-xs text-muted-foreground">Successful Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {securityLogs.filter(log => !log.success).length}
                </p>
                <p className="text-xs text-muted-foreground">Failed Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {rateLimits.length}
                </p>
                <p className="text-xs text-muted-foreground">Active Rate Limits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(securityLogs.map(log => log.ip_address).filter(Boolean)).size}
                </p>
                <p className="text-xs text-muted-foreground">Unique IPs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;