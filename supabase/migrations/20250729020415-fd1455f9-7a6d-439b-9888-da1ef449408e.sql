-- Fix the search path security issue for track_user_signin function
CREATE OR REPLACE FUNCTION public.track_user_signin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the user's last sign-in
  INSERT INTO public.user_sessions (user_id, last_sign_in)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_sign_in = NOW(),
    created_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';