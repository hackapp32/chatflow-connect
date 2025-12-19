-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create app_users table for pre-defined users
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check credentials (for login)
CREATE POLICY "Allow login check" ON public.app_users
FOR SELECT USING (true);

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.app_users
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash);
  RETURN v_user_id;
END;
$$;

-- Insert a test user (password: admin123)
INSERT INTO public.app_users (username, password_hash)
VALUES ('techboy', crypt('admin123', gen_salt('bf')));