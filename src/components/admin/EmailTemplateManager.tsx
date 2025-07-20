import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, Save, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  variables?: string[];
}

const DEFAULT_TEMPLATES = {
  'client-invitation': {
    name: 'Client Invitation',
    subject: 'Welcome to SydeVault - Manage Your Website',
    html_content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to SydeVault</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">Hi {{clientName}},</h2>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      You've been invited to manage your website <strong>{{websiteName}}</strong> through our platform.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">Your Website Details:</h3>
      <p style="margin: 5px 0; color: #4b5563;"><strong>Website:</strong> {{websiteName}}</p>
      <p style="margin: 5px 0; color: #4b5563;"><strong>URL:</strong> {{websiteUrl}}</p>
      <p style="margin: 5px 0; color: #4b5563;"><strong>Plan:</strong> {{planType}}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitationLink}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Your Account</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Click the button above to create your account and start managing your website.
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
      Best regards,<br>
      SydeVault Team
    </p>
  </div>
</div>`,
    variables: ['clientName', 'websiteName', 'websiteUrl', 'planType', 'invitationLink']
  },
  'payment-reminder-3day': {
    name: '3-Day Payment Reminder',
    subject: 'Friendly Reminder - Payment Due Soon for {{websiteName}}',
    html_content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Payment Due Soon</h1>
  </div>
  
  <div style="padding: 30px; background: #fffbeb;">
    <h2 style="color: #92400e;">Hi {{clientName}},</h2>
    
    <p style="color: #78350f; font-size: 16px; line-height: 1.6;">
      Your payment for <strong>{{websiteName}}</strong> is due in 3 days.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">Payment Details:</h3>
      <p style="margin: 5px 0; color: #78350f;"><strong>Website:</strong> {{websiteName}}</p>
      <p style="margin: 5px 0; color: #78350f;"><strong>Amount Due:</strong> $` + `{{paymentAmount}}` + `</p>
      <p style="margin: 5px 0; color: #78350f;"><strong>Due Date:</strong> {{dueDate}}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{paymentLink}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Make Payment</a>
    </div>
  </div>
</div>`,
    variables: ['clientName', 'websiteName', 'paymentAmount', 'dueDate', 'paymentLink']
  },
  'payment-reminder-7day': {
    name: '7-Day Payment Overdue',
    subject: 'Payment Overdue - {{websiteName}} - Action Required',
    html_content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Payment Overdue</h1>
  </div>
  
  <div style="padding: 30px; background: #fff7ed;">
    <h2 style="color: #c2410c;">Hi {{clientName}},</h2>
    
    <p style="color: #9a3412; font-size: 16px; line-height: 1.6;">
      Your payment for <strong>{{websiteName}}</strong> is now 7 days overdue.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #fed7aa;">
      <h3 style="margin: 0 0 10px 0; color: #c2410c;">Overdue Payment:</h3>
      <p style="margin: 5px 0; color: #9a3412;"><strong>Amount Due:</strong> $` + `{{paymentAmount}}` + `</p>
      <p style="margin: 5px 0; color: #9a3412;"><strong>Days Overdue:</strong> {{daysOverdue}}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{paymentLink}}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Now</a>
    </div>
  </div>
</div>`,
    variables: ['clientName', 'websiteName', 'paymentAmount', 'daysOverdue', 'paymentLink']
  },
  'payment-reminder-14day': {
    name: '14-Day Payment Overdue',
    subject: 'URGENT: Payment 14 Days Overdue - {{websiteName}}',
    html_content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">⚠️ URGENT: Payment Overdue</h1>
  </div>
  
  <div style="padding: 30px; background: #fef2f2;">
    <h2 style="color: #dc2626;">Hi {{clientName}},</h2>
    
    <p style="color: #991b1b; font-size: 16px; line-height: 1.6; font-weight: bold;">
      Your payment for <strong>{{websiteName}}</strong> is now 14 days overdue.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #fca5a5;">
      <h3 style="margin: 0 0 10px 0; color: #dc2626;">Critical Payment Notice:</h3>
      <p style="margin: 5px 0; color: #991b1b;"><strong>Amount Due:</strong> $` + `{{paymentAmount}}` + `</p>
      <p style="margin: 5px 0; color: #991b1b;"><strong>Days Overdue:</strong> {{daysOverdue}}</p>
    </div>
    
    <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0; font-weight: bold;">
        Service suspension may occur if payment is not received soon.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{paymentLink}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Immediately</a>
    </div>
  </div>
</div>`,
    variables: ['clientName', 'websiteName', 'paymentAmount', 'daysOverdue', 'paymentLink']
  },
  'payment-reminder-30day': {
    name: '30-Day Final Notice',
    subject: 'FINAL NOTICE: Payment 30 Days Overdue - Service Suspension Imminent',
    html_content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🚨 FINAL NOTICE</h1>
  </div>
  
  <div style="padding: 30px; background: #fef1f1;">
    <h2 style="color: #7f1d1d;">Hi {{clientName}},</h2>
    
    <p style="color: #7f1d1d; font-size: 16px; line-height: 1.6; font-weight: bold;">
      This is your FINAL NOTICE for <strong>{{websiteName}}</strong>.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 3px solid #dc2626;">
      <h3 style="margin: 0 0 10px 0; color: #7f1d1d;">FINAL NOTICE:</h3>
      <p style="margin: 5px 0; color: #7f1d1d;"><strong>Amount Due:</strong> $` + `{{paymentAmount}}` + `</p>
      <p style="margin: 5px 0; color: #7f1d1d;"><strong>Days Overdue:</strong> {{daysOverdue}}</p>
    </div>
    
    <div style="background: #dc2626; color: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-weight: bold; font-size: 18px;">
        SERVICE WILL BE SUSPENDED WITHOUT IMMEDIATE PAYMENT
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{paymentLink}}" style="background: #7f1d1d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">PAY NOW TO AVOID SUSPENSION</a>
    </div>
  </div>
</div>`,
    variables: ['clientName', 'websiteName', 'paymentAmount', 'daysOverdue', 'paymentLink']
  }
};

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTemplates = async () => {
    setIsLoading(true);
    try {
      for (const [key, template] of Object.entries(DEFAULT_TEMPLATES)) {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: template.name,
            subject: template.subject,
            html_content: template.html_content,
            variables: template.variables
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Default email templates created",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error creating templates:', error);
      toast({
        title: "Error",
        description: "Failed to create default templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      if (editingTemplate.id) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            html_content: editingTemplate.html_content,
            variables: editingTemplate.variables
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            html_content: editingTemplate.html_content,
            variables: editingTemplate.variables
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Email template saved",
      });

      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const getPreviewContent = () => {
    if (!editingTemplate) return '';
    
    // Replace variables with sample data for preview
    let content = editingTemplate.html_content;
    const sampleData = {
      clientName: 'John Doe',
      websiteName: 'johndoe.com',
      paymentAmount: '29.99',
      dueDate: '2024-02-15',
      planType: 'Premium',
      daysOverdue: '5',
      paymentLink: 'https://example.com/pay',
      dashboardLink: 'https://sydevault.com/dashboard'
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return content;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Templates
        </CardTitle>
        <CardDescription>
          Manage email templates for payment reminders and client communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No email templates found</p>
            <Button onClick={createDefaultTemplates}>
              <Plus className="h-4 w-4 mr-2" />
              Create Default Templates
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a template to edit" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  if (template) setEditingTemplate(template);
                }}
                disabled={!selectedTemplate}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingTemplate({
                  id: '',
                  name: '',
                  subject: '',
                  html_content: '',
                  variables: []
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>

            {editingTemplate && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Subject Line</Label>
                    <Input
                      id="template-subject"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-content">HTML Content</Label>
                  <Textarea
                    id="template-content"
                    value={editingTemplate.html_content}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      html_content: e.target.value
                    })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Email Preview: {editingTemplate.name}</DialogTitle>
                      </DialogHeader>
                      <div 
                        dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                        className="border rounded p-4"
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}