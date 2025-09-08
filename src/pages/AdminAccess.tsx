
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAccess() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [accessKey, setAccessKey] = useState("");
  const [message, setMessage] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    if (!user || !session) {
      setMessage("You must be logged in to access this page.");
    } else {
      setMessage(`Logged in as ${user.email}. Enter the admin access key to continue.`);
    }
  }, [user, session]);
  
  const grantAdminAccess = async () => {
    if (!user || !session) {
      setMessage("You must be logged in to become an admin.");
      return;
    }
    
    if (!accessKey.trim()) {
      setMessage("Please enter an access key.");
      return;
    }
    
    setIsGranting(true);
    setMessage("Verifying access key...");
    
    try {
      // Call the secure admin-access edge function
      const { data, error } = await supabase.functions.invoke('admin-access', {
        body: { accessKey: accessKey.trim() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Admin access error:", error);
        
        // Handle specific error cases
        if (error.message?.includes('Too many attempts')) {
          setMessage("Too many attempts. Please try again in 15 minutes.");
          toast({
            title: "Rate Limited",
            description: "Too many admin access attempts. Please wait before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Invalid access key')) {
          setMessage("Invalid access key. Please try again.");
          toast({
            title: "Invalid Key",
            description: "The access key you entered is incorrect.",
            variant: "destructive",
          });
        } else {
          setMessage("Error granting admin access. Please try again.");
          toast({
            title: "Error",
            description: "Unable to grant admin access. Please contact support if this persists.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.success) {
        setMessage("Admin access granted! Redirecting to admin dashboard...");
        toast({
          title: "Success!",
          description: "Admin access has been granted successfully.",
        });
        
        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setMessage("Unexpected response from server. Please try again.");
      }
      
    } catch (err) {
      console.error("Error granting admin access:", err);
      setMessage("Network error. Please check your connection and try again.");
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };
  
  return (
    <div className="container mx-auto pt-12 pb-24 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Enter your admin access key to enable admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {message}
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={!user || isGranting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={grantAdminAccess}
            disabled={!user || !accessKey || isGranting}
          >
            {isGranting ? "Processing..." : "Enable Admin Access"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
