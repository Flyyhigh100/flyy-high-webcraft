
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAccess() {
  const { user, session } = useAuth();
  const [accessKey, setAccessKey] = useState("");
  const [message, setMessage] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const navigate = useNavigate();

  // The admin access key - hardcoded for simplicity (this is intentional)
  const ADMIN_KEY = "flyyHighAdmin2023";
  
  // Check if user is logged in
  useEffect(() => {
    if (!user || !session) {
      setMessage("You must be logged in to access this page.");
    } else {
      setMessage(`Logged in as ${user.email}. Enter the admin access key to continue.`);
    }
  }, [user, session]);
  
  const grantAdminAccess = async () => {
    if (!user) {
      setMessage("You must be logged in to become an admin.");
      return;
    }
    
    if (accessKey !== ADMIN_KEY) {
      setMessage("Invalid access key. Please try again.");
      return;
    }
    
    setIsGranting(true);
    setMessage("Granting admin access...");
    
    try {
      // Make sure the profiles table exists - we'll cast the function name to any to avoid type issues
      await supabase.rpc('create_profiles_if_not_exists' as any);
      
      // Update or insert the profile with admin role using a properly typed approach
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          email: user.email,
          role: 'admin'
        } as any);
      
      if (error) {
        console.error("Database error:", error);
        setMessage("Error updating profile in database. Using local storage fallback.");
        
        // Fallback: Store admin status in localStorage
        localStorage.setItem('flyy_high_admin', 'true');
        
        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
        
        return;
      }
      
      setMessage("Admin access granted! Redirecting to admin dashboard...");
      
      // Navigate to admin dashboard
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error("Error granting admin access:", err);
      setMessage("Error granting admin access. Please try again.");
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
