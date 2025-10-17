-- Security Fix Part 1: Update RLS policies to remove dependency on profiles.role column

-- Step 1: Ensure all users with profiles.role = 'admin' have corresponding entries in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Drop and recreate policies that depend on profiles.role column

-- Email templates policies
DROP POLICY IF EXISTS "Admin only access to email templates" ON public.email_templates;
CREATE POLICY "Admin only access to email templates" 
  ON public.email_templates
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Support tickets policies
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
CREATE POLICY "Admins can update all tickets" 
  ON public.support_tickets
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own tickets, admins can view all" ON public.support_tickets;
CREATE POLICY "Users can view own tickets, admins can view all" 
  ON public.support_tickets
  FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = support_tickets.site_id 
      AND websites.user_id = auth.uid()
    )
  );

-- Payment reminders policies
DROP POLICY IF EXISTS "Admins can create payment reminders" ON public.payment_reminders;
CREATE POLICY "Admins can create payment reminders" 
  ON public.payment_reminders
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all payment reminders" ON public.payment_reminders;
CREATE POLICY "Admins can view all payment reminders" 
  ON public.payment_reminders
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 3: Log the policy migration
INSERT INTO public.security_logs (
  event_type,
  success,
  details
) VALUES (
  'rls_policies_migrated_from_profiles_role',
  true,
  jsonb_build_object(
    'action', 'updated_rls_policies_to_use_is_admin_function',
    'timestamp', now(),
    'tables_updated', jsonb_build_array('email_templates', 'support_tickets', 'payment_reminders')
  )
);

-- Step 4: Now drop the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Step 5: Update the handle_new_user trigger to not set role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, user_id)
  VALUES (NEW.id, NEW.id)
  ON CONFLICT (id) DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;
  
  -- Insert default user role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 6: Log the final migration
INSERT INTO public.security_logs (
  event_type,
  success,
  details
) VALUES (
  'profiles_role_column_removed',
  true,
  jsonb_build_object(
    'action', 'removed_role_column_from_profiles',
    'timestamp', now(),
    'description', 'All admin roles migrated to user_roles table, RLS policies updated, and legacy role column removed'
  )
);