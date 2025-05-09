
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ExternalLink, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DomainManager = () => {
  const { toast } = useToast();
  const [newDomain, setNewDomain] = useState('');
  
  // Mock domain data
  const [domains, setDomains] = useState([
    { 
      id: 1, 
      name: 'example.com', 
      status: 'active',
      autoRenew: true,
      expiryDate: '2026-01-15',
      isPrimary: true
    },
    { 
      id: 2, 
      name: 'my-site.net', 
      status: 'pending',
      autoRenew: false,
      expiryDate: '2026-03-22',
      isPrimary: false
    }
  ]);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDomain) {
      toast({
        title: "Domain name required",
        description: "Please enter a domain name",
        variant: "destructive"
      });
      return;
    }
    
    // Add the new domain (would connect to backend in real app)
    setDomains([...domains, {
      id: domains.length + 1,
      name: newDomain,
      status: 'pending',
      autoRenew: true,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      isPrimary: false
    }]);
    
    toast({
      title: "Domain added",
      description: `${newDomain} has been added and is pending verification`,
    });
    
    setNewDomain('');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': 
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending': 
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'expired': 
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Domain Management</h2>
        <Button className="bg-flyy-600 hover:bg-flyy-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Domain
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Domain Name</th>
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Auto-renew</th>
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Expiry Date</th>
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Primary</th>
                  <th className="py-3 px-2 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{domain.name}</td>
                    <td className="py-3 px-2">{getStatusBadge(domain.status)}</td>
                    <td className="py-3 px-2">
                      {domain.autoRenew 
                        ? <Check className="h-5 w-5 text-green-500" /> 
                        : <X className="h-5 w-5 text-gray-400" />
                      }
                    </td>
                    <td className="py-3 px-2">{domain.expiryDate}</td>
                    <td className="py-3 px-2">
                      {domain.isPrimary 
                        ? <Check className="h-5 w-5 text-green-500" /> 
                        : <Button size="sm" variant="outline" className="px-2 py-0 h-7 text-xs">
                            Set Primary
                          </Button>
                      }
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8">
                          Manage <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {domains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No domains found. Add your first domain above.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connect a New Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input 
                  placeholder="Enter domain name (e.g., yourdomain.com)" 
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <Button type="submit">Add Domain</Button>
            </div>
            <p className="text-sm text-gray-500">
              After adding a domain, you'll need to update your DNS records at your domain registrar.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">DNS Settings</h3>
        <p className="text-sm text-blue-700 mb-3">
          After adding a domain, point it to our servers using these DNS settings:
        </p>
        <div className="bg-white p-3 rounded border border-blue-100 text-sm font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div>A Record:</div>
            <div>192.0.2.1</div>
            <div>CNAME:</div>
            <div>hosting.example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
