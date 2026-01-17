-- Add is_temp_password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_temp_password boolean DEFAULT false;