
import React, { useState } from 'react';
import { ClientWebsiteTable } from './ClientWebsiteTable';
import { ClientWebsiteDetails } from './ClientWebsiteDetails';
import { PaymentCollectionTools } from '../PaymentCollectionTools';
import { ClientInviteModal } from '../ClientInviteModal';
import { ClientWebsite } from "@/types/admin";
import { useAdminData } from "@/hooks/useAdminData";

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
  
  if (sortedClients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No client websites found. Please check your database connection.
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
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
      
      <ClientWebsiteDetails 
        client={selectedClient}
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
      />
    </>
  );
}
