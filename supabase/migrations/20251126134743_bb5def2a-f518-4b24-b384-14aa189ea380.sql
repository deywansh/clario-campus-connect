-- Add email, role, and ensure last_seen exists in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'student',
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Migrate existing roles from user_roles to profiles
UPDATE public.profiles p
SET role = ur.role
FROM public.user_roles ur
WHERE p.id = ur.user_id;

-- Update RLS policies to use profiles.role instead of user_roles

-- Drop old policies that use has_role function
DROP POLICY IF EXISTS "Faculty and clubs can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Faculty and clubs can create events" ON public.events;
DROP POLICY IF EXISTS "Club role users can create clubs" ON public.clubs;

-- Create new policies using profiles.role

-- Announcements policies
CREATE POLICY "Faculty and clubs can create announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('faculty', 'club')
  )
);

-- Events policies
CREATE POLICY "Faculty and clubs can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('faculty', 'club')
  )
);

-- Clubs policies
CREATE POLICY "Club role users can create clubs" 
ON public.clubs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'club'
  )
);

-- Chats policies - only faculty and clubs can create chats
DROP POLICY IF EXISTS "Any user can create a chat" ON public.chats;
CREATE POLICY "Faculty and clubs can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('faculty', 'club')
  )
);

-- Drop duplicate profile email policy if exists
DROP POLICY IF EXISTS "Users can view all profile emails" ON public.profiles;

-- Update handle_new_user function to set email and default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    'student'
  );
  
  RETURN NEW;
END;
$$;

-- Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);