
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';
import DomainManager from '@/components/dashboard/DomainManager';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import PlanManager from '@/components/dashboard/PlanManager';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  // In a real app, this would come from your backend/database
  const [currentPlan, setCurrentPlan] = useState({
    name: 'Hosting Basic',
    price: '$15/month',
    renewalDate: '2025-06-09',
    status: 'active',
  });

  const { toast } = useToast();
  
  const handleUpgrade = () => {
    toast({
      title: "Upgrade initialized",
      description: "You'll be redirected to payment page to complete the upgrade.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-secondary/30 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Hosting Dashboard</h1>
            <p className="text-gray-600">Manage your website hosting services</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Summary */}
            <Card className="lg:col-span-3">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <span>Account Summary</span>
                  <Badge className="bg-green-500">{currentPlan.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                    <p className="text-lg font-semibold">{currentPlan.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Monthly Fee</h3>
                    <p className="text-lg font-semibold">{currentPlan.price}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Next Renewal</h3>
                    <p className="text-lg font-semibold">{currentPlan.renewalDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Dashboard Tabs */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="plan" className="w-full">
                <TabsList className="w-full justify-start mb-6 bg-transparent border-b border-gray-200 rounded-none">
                  <TabsTrigger value="plan" className="text-base py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-flyy-600 rounded-none data-[state=active]:shadow-none">
                    My Plan
                  </TabsTrigger>
                  <TabsTrigger value="domains" className="text-base py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-flyy-600 rounded-none data-[state=active]:shadow-none">
                    Domains
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="text-base py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-flyy-600 rounded-none data-[state=active]:shadow-none">
                    Billing History
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-base py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-flyy-600 rounded-none data-[state=active]:shadow-none">
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="plan">
                  <PlanManager currentPlan={currentPlan} onUpgrade={handleUpgrade} />
                </TabsContent>
                
                <TabsContent value="domains">
                  <DomainManager />
                </TabsContent>
                
                <TabsContent value="billing">
                  <PaymentHistory />
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                            <div>
                              <h4 className="font-medium text-yellow-800">Authentication Not Enabled</h4>
                              <p className="text-yellow-700 text-sm mt-1">
                                This dashboard is currently in demonstration mode without secure authentication. 
                                Authentication will be added in a future update for secure account access.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-2">Account Information</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Name</span>
                                <span>Demo User</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span>demo@example.com</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Preferences</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Email Notifications</span>
                                <span className="text-gray-400">Not configured</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="mt-4" variant="outline">Update Profile Information</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
