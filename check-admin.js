const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Get Supabase URL and Key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesTable() {
  try {
    // Check if the profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('_metadata')
      .select('*');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    console.log('Available tables:', tables);
    
    // Check if your user exists in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'flyyhigh824@gmail.com')
      .single();
    
    if (profileError) {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    console.log('Your profile in Supabase:', profile);
    console.log('Admin status:', profile?.role === 'admin' ? 'You ARE an admin' : 'You are NOT an admin');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkProfilesTable(); 