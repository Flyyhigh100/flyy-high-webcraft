
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { ClientWebsite } from "@/types/admin";
import { getPlanBadgeColor } from './clientWebsiteUtils';

interface ClientWebsiteTableProps {
  clients: ClientWebsite[];
  onViewDetails: (client: ClientWebsite) => void;
}

export function ClientWebsiteTable({ clients, onViewDetails }: ClientWebsiteTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client/Project Name</TableHead>
          <TableHead className="w-[150px]">Plan Type</TableHead>
          <TableHead className="w-[200px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>
              <Badge className={getPlanBadgeColor(client.planType)}>
                {client.planType}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(client)}
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
  );
}
