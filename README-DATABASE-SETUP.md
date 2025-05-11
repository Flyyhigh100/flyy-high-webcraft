# Database Setup for Production

This guide explains how to properly set up your Supabase database for the admin dashboard and other features to work correctly in production.

## Step 1: Access Supabase SQL Editor

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to the "SQL Editor" in the left sidebar
4. Click "New Query"

## Step 2: Execute the Production Setup Script

Copy and paste the ENTIRE content of the `supabase/migrations/production_setup.sql` file into the SQL Editor, then click "Run".

The script will:

1. Create all required tables:
   - `profiles` - Stores user roles and profile information
   - `payments` - Tracks payment history
   - `websites` - Manages user websites

2. Set up security policies for proper data access control

3. Set your admin account (it looks for the email 'flyyhigh824@gmail.com' by default)

## Step 3: Sample Data (Optional)

If you want to see sample data in your admin dashboard, you can uncomment and run the sample data section at the bottom of the script.

## Step 4: Verify Setup Success

After running the script, check that:

1. The tables were created correctly by going to "Table Editor" in Supabase
2. Your user has admin privileges by logging into the application and checking for the Admin Dashboard button

## Troubleshooting

If you encounter any errors during setup:

1. Check the error message in the SQL Editor
2. Make sure no tables with the same names already exist
3. If tables exist but have different structures, you might need to drop them first

## Important Notes

- This script also creates a `websites` table for future functionality
- All tables have proper Row Level Security policies to protect data
- The script automatically sets up triggers to create profiles for new users

Remember to log out and log back into the application after running this script for changes to take effect.

## Security Warning

Keep your database credentials secure and never share your admin access. 