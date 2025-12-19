-- Create function to add new users with hashed passwords
CREATE OR REPLACE FUNCTION public.add_app_user(p_username text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO public.app_users (username, password_hash)
  VALUES (p_username, crypt(p_password, gen_salt('bf')))
  RETURNING id INTO v_user_id;
  RETURN v_user_id;
END;
$$;

-- Allow deleting users from app_users
CREATE POLICY "Allow delete users"
ON public.app_users
FOR DELETE
USING (true);