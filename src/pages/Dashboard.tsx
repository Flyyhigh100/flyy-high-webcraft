
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldCheck, Mail, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import HostingManager from "@/components/dashboard/HostingManager";
import { SubscriptionManager } from "@/components/dashboard/SubscriptionManager";
import { EmailChangeForm } from "@/components/dashboard/EmailChangeForm";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user, isLoading, isAdmin, checkAdminStatus } = useAuth();
  const [saveLoading, setSaveLoading] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('marketing_opt_in')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error loading user settings:', error);
          } else if (profile) {
            setMarketingOptIn(profile.marketing_opt_in ?? true);
          }
          setSettingsLoaded(true);
        } catch (error) {
          console.error('Error loading user settings:', error);
          setSettingsLoaded(true);
        }
      }
    };

    loadUserSettings();
  }, [user]);

  // Recheck admin status on mount
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (user) {
        const isUserAdmin = await checkAdminStatus();
        console.log("Dashboard: Admin status verification result:", isUserAdmin);
        
        if (isUserAdmin) {
          toast({
            title: "Admin Access Available",
            description: "You have administrator privileges. Access the admin dashboard from the button above.",
          });
        }
      }
    };
    
    verifyAdminStatus();
  }, [user, checkAdminStatus, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          marketing_opt_in: marketingOptIn,
          marketing_updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-500">Manage your account and website settings</p>
        </div>
        
        {/* SUPER PROMINENT ADMIN BUTTON IF ADMIN */}
        {isAdmin && (
          <Link to="/admin">
            <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-6 py-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Admin Dashboard
            </Button>
          </Link>
        )}
      </div>
      
      {/* Admin Notice - VERY VISIBLE admin access notification */}
      {isAdmin && (
        <div className="mb-8 bg-purple-100 border-2 border-purple-300 rounded-md p-6">
          <div className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-purple-700 mr-3" />
            <div>
              <h3 className="font-bold text-lg text-purple-800">Admin Access Detected</h3>
              <p className="text-purple-700 text-md">
                You have administrator privileges. Access the admin dashboard by clicking the button above or by navigating to{" "}
                <Link to="/admin" className="underline font-bold">
                  /admin
                </Link>
              </p>
              <div className="mt-3">
                <Link to="/admin">
                  <Button variant="outline" className="border-purple-400 text-purple-700 hover:bg-purple-200">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="websites">Your Website</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex space-x-2">
                    <Input id="email" value={user?.email || ''} disabled className="flex-1" />
                    <Dialog open={showEmailChange} onOpenChange={setShowEmailChange}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <EmailChangeForm 
                          currentEmail={user?.email || ''} 
                          onClose={() => setShowEmailChange(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input id="company" defaultValue="" placeholder="Enter your company name" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/forgot-password" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </Link>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="websites">
          <HostingManager />
        </TabsContent>
        
        <TabsContent value="billing">
          <SubscriptionManager />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive updates and alerts via email
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Updates</Label>
                    <p className="text-sm text-gray-500">
                      Receive tips, special offers, and product updates from SydeVault
                    </p>
                  </div>
                  <Switch 
                    checked={marketingOptIn} 
                    onCheckedChange={setMarketingOptIn}
                    disabled={!settingsLoaded}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saveLoading}>
                {saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
