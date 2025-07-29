import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExternalLink, Globe, CreditCard, Calendar, Shield } from 'lucide-react';
import { useUserWebsites } from '@/hooks/useUserWebsites';

const HostingManager = () => {
  const { websites, isLoading, updateAutoRenewal } = useUserWebsites();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'overdue_3d':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Overdue</Badge>;
      case 'overdue_7d':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Overdue</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Not set';
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Website</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Website Found</h3>
              <p className="text-muted-foreground">
                It looks like you haven't been assigned a website yet. Please contact support if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryWebsite = websites[0]; // For SydeVault, users typically have one website

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Website</h2>
        <Button variant="outline" asChild>
          <a href={primaryWebsite.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Site
          </a>
        </Button>
      </div>

      {/* Website Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {primaryWebsite.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Website URL</Label>
              <div className="flex items-center gap-2">
                <a 
                  href={primaryWebsite.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {primaryWebsite.url}
                </a>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Hosting Status</Label>
              <div>{getStatusBadge(primaryWebsite.payment_status)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Hosting Plan</Label>
              <Badge variant="outline" className="w-fit">
                {primaryWebsite.plan_type}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{formatDate(primaryWebsite.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Hosting Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Next Payment Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(primaryWebsite.next_payment_date)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Monthly Hosting Fee</Label>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{formatAmount(primaryWebsite.next_payment_amount)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto-Renewal</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically charge your card each month to keep your website live
                </p>
              </div>
              <Switch
                checked={true} // For now, defaulting to true
                onCheckedChange={(checked) => updateAutoRenewal(primaryWebsite.id, checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hosting Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Hosting Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 99.9% Uptime Guarantee</li>
                <li>• SSL Certificate Included</li>
                <li>• CDN for Fast Loading</li>
                <li>• Regular Backups</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Support & Maintenance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 24/7 Technical Support</li>
                <li>• Security Updates</li>
                <li>• Performance Monitoring</li>
                <li>• Content Updates Available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your website is fully managed by SydeVault. We handle all technical aspects including hosting, 
              security, backups, and updates. Your monthly fee covers all hosting and maintenance services.
            </p>
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for any questions about your hosting service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostingManager;