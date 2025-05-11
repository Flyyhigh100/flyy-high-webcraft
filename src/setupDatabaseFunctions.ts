
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/admin";

export async function setupDatabaseFunctions() {
  // Check if the payments table exists using properly typed RPC call
  try {
    const { data: paymentsExists, error } = await supabase
      .rpc<boolean>('table_exists', { table_name: 'payments', schema_name: 'public' });
    
    if (error) {
      console.error("Error checking if payments table exists:", error);
      return;
    }
    
    if (!paymentsExists) {
      console.log('Payments table does not exist, creating mock data functions...');
      
      try {
        // Create function to get completed payments
        await supabase.rpc('create_get_completed_payments_function', {});
        
        // Create function to get upcoming payments
        await supabase.rpc('create_get_upcoming_payments_function', {});
        
        console.log('Mock data functions created successfully');
      } catch (err) {
        console.error("Error creating mock data functions:", err);
      }
    }
  } catch (err) {
    console.error("Error in setupDatabaseFunctions:", err);
  }
}
