-- ===============================
-- PART 1: SUPPORT TICKETS TABLE SETUP
-- ===============================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- PART 2: UPDATE PAYMENTS TABLE
-- ===============================

-- Add site_id column to payments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'site_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN site_id UUID REFERENCES websites(id) ON DELETE SET NULL;
  END IF;
  
  -- Add method column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'method'
  ) THEN
    ALTER TABLE payments ADD COLUMN method TEXT;
  END IF;
  
  -- Rename plan to plan_type if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'plan'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE payments RENAME COLUMN plan TO plan_type;
  END IF;
END $$;

-- ===============================
-- PART 3: SECURITY POLICIES FOR SUPPORT TICKETS
-- ===============================

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own tickets (if they own the website)
CREATE POLICY "Users can view tickets for their websites" 
  ON support_tickets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM websites 
      WHERE websites.id = support_tickets.site_id 
      AND websites.user_id = auth.uid()
    )
  );

-- Allow users to create tickets for their websites
CREATE POLICY "Users can create tickets for their websites" 
  ON support_tickets FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites 
      WHERE websites.id = support_tickets.site_id 
      AND websites.user_id = auth.uid()
    )
  );

-- Allow admins to view all tickets
CREATE POLICY "Admins can view all tickets" 
  ON support_tickets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all tickets
CREATE POLICY "Admins can update all tickets" 
  ON support_tickets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  ); 