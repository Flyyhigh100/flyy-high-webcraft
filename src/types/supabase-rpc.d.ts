
// Add TypeScript declarations for our custom RPC functions
import { Database } from '@/integrations/supabase/types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Extend the generated Supabase types with our custom functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient<Schema extends any = Database> {
    rpc<T = any>(
      fn: 'table_exists', 
      params: { table_name_param: string; schema_name_param?: string }
    ): Promise<PostgrestSingleResponse<boolean>>;
    
    rpc(
      fn: 'create_profiles_if_not_exists', 
      params: {}
    ): Promise<PostgrestSingleResponse<null>>;
    
    rpc<T = any>(
      fn: 'create_get_completed_payments_function', 
      params?: {}
    ): Promise<PostgrestSingleResponse<null>>;
    
    rpc<T = any>(
      fn: 'create_get_upcoming_payments_function', 
      params?: {}
    ): Promise<PostgrestSingleResponse<null>>;
    
    rpc<T = any>(
      fn: 'get_completed_payments', 
      params?: {}
    ): Promise<PostgrestSingleResponse<T[]>>;
    
    rpc<T = any>(
      fn: 'get_upcoming_payments', 
      params?: {}
    ): Promise<PostgrestSingleResponse<T[]>>;
  }
}
