
import React, { useState } from 'react';
import { ClientWebsiteTable } from './ClientWebsiteTable';
import { ClientWebsiteDetails } from './ClientWebsiteDetails';
import { PaymentCollectionTools } from '../PaymentCollectionTools';
import { ClientInviteModal } from '../ClientInviteModal';
import { BulkClientImport } from '../BulkClientImport';
import { EmailTemplateManager } from '../EmailTemplateManager';
import { EnhancedPaymentReminders } from '../EnhancedPaymentReminders';
import { ClientWebsite } from "@/types/admin";
import { useAdminData } from "@/hooks/useAdminData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ClientWebsiteList() {
  const { clientWebsites, isLoading, refreshData } = useAdminData();
  const [selectedClient, setSelectedClient] = useState<ClientWebsite | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Sort clients alphabetically by name
  const sortedClients = [...(clientWebsites || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const handleViewDetails = (client: ClientWebsite) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Don't return early if no clients - we want to show the invite button
  
  return (
    <Tabs defaultValue="websites" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="websites">Client Websites</TabsTrigger>
        <TabsTrigger value="import">Bulk Import</TabsTrigger>
        <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
        <TabsTrigger value="templates">Email Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="websites">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Client Websites</h2>
              <p className="text-gray-500">Manage client websites and invitations</p>
            </div>
            <ClientInviteModal onRefresh={refreshData} />
          </div>
          
          <PaymentCollectionTools onRefresh={refreshData} />
          
          <ClientWebsiteTable 
            clients={sortedClients}
            onViewDetails={handleViewDetails}
            onRefresh={refreshData}
          />
        </div>
      </TabsContent>

      <TabsContent value="import">
        <BulkClientImport onRefresh={refreshData} />
      </TabsContent>

      <TabsContent value="reminders">
        <EnhancedPaymentReminders />
      </TabsContent>

      <TabsContent value="templates">
        <EmailTemplateManager />
      </TabsContent>

      <ClientWebsiteDetails 
        client={selectedClient}
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
      />
    </Tabs>
  );
}
