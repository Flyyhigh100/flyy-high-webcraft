
import { supabase } from "@/integrations/supabase/client";

export async function setupDatabaseFunctions() {
  // Check if the payments table exists using raw SQL query instead of from() method
  const { data: paymentsExists, error } = await supabase
    .rpc('table_exists', { table_name: 'payments', schema_name: 'public' })
    .single();
  
  if (error) {
    console.error("Error checking if payments table exists:", error);
    return;
  }
  
  if (!paymentsExists) {
    console.log('Payments table does not exist, creating mock data functions...');
    
    try {
      // Create function to get completed payments
      await supabase.rpc('create_get_completed_payments_function');
      
      // Create function to get upcoming payments
      await supabase.rpc('create_get_upcoming_payments_function');
      
      console.log('Mock data functions created successfully');
    } catch (err) {
      console.error("Error creating mock data functions:", err);
    }
  }
}
