
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/admin";

export function useAdminRoleManagement() {
  const { toast } = useToast();
  
  const makeUserAdmin = async (userId: string, users: UserProfile[], setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>) => {
    try {
      // Add admin role to user_roles table instead of updating profiles
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' })
        .select()
        .single();
        
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'admin' } 
          : user
      ));
      
      toast({
        title: "Success",
        description: "User role updated to admin",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  return { makeUserAdmin };
}
