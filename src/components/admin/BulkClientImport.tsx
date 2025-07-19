import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileText, Users } from "lucide-react";

interface BulkClientImportProps {
  onRefresh: () => void;
}

interface ClientData {
  name: string;
  email: string;
  websiteName: string;
  websiteUrl: string;
  planType: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

export function BulkClientImport({ onRefresh }: BulkClientImportProps) {
  const [csvData, setCsvData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = `name,email,websiteName,websiteUrl,planType,nextPaymentDate,nextPaymentAmount
John Doe,john@example.com,John's Website,https://johndoe.com,basic,2024-02-15,15.00
Jane Smith,jane@example.com,Jane's Blog,https://janesmith.com,standard,2024-02-20,19.99`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const parseCSV = (csv: string): ClientData[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data: ClientData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 5) {
        data.push({
          name: values[0],
          email: values[1],
          websiteName: values[2],
          websiteUrl: values[3],
          planType: values[4],
          nextPaymentDate: values[5] || undefined,
          nextPaymentAmount: values[6] ? parseFloat(values[6]) : undefined,
        });
      }
    }
    
    return data;
  };

  const handleBulkImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const clients = parseCSV(csvData);
      if (clients.length === 0) {
        throw new Error("No valid client data found in CSV");
      }

      let successCount = 0;
      let errorCount = 0;

      for (const client of clients) {
        try {
          // Send invitation to each client
          const { data, error } = await supabase.functions.invoke('invite-client', {
            body: {
              email: client.email,
              clientName: client.name,
              websiteName: client.websiteName,
              websiteUrl: client.websiteUrl,
              planType: client.planType,
              siteId: null, // Will be created during onboarding
              nextPaymentDate: client.nextPaymentDate,
              nextPaymentAmount: client.nextPaymentAmount,
            }
          });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Error importing client ${client.name}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Bulk Import Complete",
        description: `Successfully imported ${successCount} clients. ${errorCount} errors.`,
      });

      if (successCount > 0) {
        onRefresh();
        setCsvData('');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import clients",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Client Import
        </CardTitle>
        <CardDescription>
          Import multiple clients from CSV data. This will send invitation emails to all clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="csv-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </label>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-data">CSV Data</Label>
          <Textarea
            id="csv-data"
            placeholder="Paste CSV data here or upload a file above..."
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Format Requirements:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Required: name, email, websiteName, websiteUrl, planType</li>
            <li>• Optional: nextPaymentDate (YYYY-MM-DD), nextPaymentAmount (decimal)</li>
            <li>• Plan types: basic, standard, premium</li>
            <li>• Each client will receive an invitation email</li>
          </ul>
        </div>

        <Button 
          onClick={handleBulkImport} 
          disabled={isProcessing || !csvData.trim()}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Import Clients"}
        </Button>
      </CardContent>
    </Card>
  );
}