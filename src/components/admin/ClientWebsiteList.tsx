
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, DollarSign, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientWebsite {
  id: string;
  name: string;
  url: string;
  planType: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

// Sample data - in a real application, this would come from the database
const sampleClients: ClientWebsite[] = [
  {
    id: "1",
    name: "Robinson and Sons Concrete",
    url: "https://robinsonconcretellc.com/",
    planType: "Premium",
    nextPaymentDate: "2025-06-15",
    nextPaymentAmount: 29.99
  },
  {
    id: "2",
    name: "Q.U.A Home Health Services",
    url: "https://www.homehealthservice.co/",
    planType: "Basic",
    nextPaymentDate: "2025-06-03",
    nextPaymentAmount: 15.00
  },
  {
    id: "3",
    name: "Precision Fabricated Components",
    url: "https://precisionfabricated.com/",
    planType: "Premium",
    nextPaymentDate: "2025-06-10",
    nextPaymentAmount: 29.99
  },
  {
    id: "4",
    name: "Shy's Luxury Hair",
    url: "https://shysluxuryhairstyles.com/",
    planType: "Standard",
    nextPaymentDate: "2025-05-28",
    nextPaymentAmount: 19.99
  }
];

export function ClientWebsiteList() {
  const [selectedClient, setSelectedClient] = useState<ClientWebsite | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Sort clients alphabetically by name
  const sortedClients = [...sampleClients].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const handleViewDetails = (client: ClientWebsite) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };
  
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
