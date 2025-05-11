
import { supabase } from "@/integrations/supabase/client";

export async function setupDatabaseFunctions() {
  // Check if the payments table exists
  const { data: paymentsExists } = await supabase
    .from('information_schema.tables')
    .select()
    .eq('table_name', 'payments')
    .eq('table_schema', 'public')
    .single();
  
  if (!paymentsExists) {
    console.log('Payments table does not exist, creating mock data functions...');
    
    // Create function to get completed payments
    await supabase.rpc('create_get_completed_payments_function');
    
    // Create function to get upcoming payments
    await supabase.rpc('create_get_upcoming_payments_function');
    
    console.log('Mock data functions created successfully');
  }
}
