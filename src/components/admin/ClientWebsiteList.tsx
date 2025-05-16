
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, DollarSign, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientWebsite } from "@/types/admin";
import { useAdminData } from "@/hooks/useAdminData";

export function ClientWebsiteList() {
  const { clientWebsites, isLoading } = useAdminData();
  const [selectedClient, setSelectedClient] = useState<ClientWebsite | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Sort clients alphabetically by name (though they should already be sorted from the API)
  const sortedClients = [...(clientWebsites || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const handleViewDetails = (client: ClientWebsite) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (sortedClients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No client websites found. Please check your database connection.
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client/Project Name</TableHead>
            <TableHead className="w-[150px]">Plan Type</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                <Badge className={client.planType === 'Premium' ? 'bg-purple-500' : 
                                client.planType === 'Standard' ? 'bg-blue-500' : 'bg-gray-500'}>
                  {client.planType}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(client)}
                    className="flex items-center gap-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Details</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(client.url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Client Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Website URL</h4>
              <div className="flex items-center">
                <a 
                  href={selectedClient?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {selectedClient?.url}
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Plan Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Type</span>
                    <Badge className={selectedClient?.planType === 'Premium' ? 'bg-purple-500' : 
                                    selectedClient?.planType === 'Standard' ? 'bg-blue-500' : 'bg-gray-500'}>
                      {selectedClient?.planType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Next Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Date</span>
                      <span>{new Date(selectedClient?.nextPaymentDate || "").toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">${selectedClient?.nextPaymentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <DollarSign className="mr-1 h-4 w-4" />
                Payment History
              </h4>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">
                  No previous payment records found.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-4">
              <Button 
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => window.open(selectedClient?.url, '_blank')}
                className="flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Website
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
