
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, DollarSign, ExternalLink } from "lucide-react";
import { ClientWebsite } from "@/types/admin";
import { getPlanBadgeColor } from './clientWebsiteUtils';

interface ClientWebsiteDetailsProps {
  client: ClientWebsite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientWebsiteDetails({ client, isOpen, onClose }: ClientWebsiteDetailsProps) {
  if (!client) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{client.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Website URL</h4>
            <div className="flex items-center">
              <a 
                href={client.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {client.url}
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
                  <Badge className={getPlanBadgeColor(client.planType)}>
                    {client.planType}
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
                    <span>{new Date(client.nextPaymentDate || "").toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">${client.nextPaymentAmount.toFixed(2)}</span>
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
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              onClick={() => window.open(client.url, '_blank')}
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Website
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
