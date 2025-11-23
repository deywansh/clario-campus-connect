-- Add missing fields for enhanced features

-- Add poster_url to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Add image_url to announcements table
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add student management fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 1 AND year <= 4);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section TEXT;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('event-posters', 'event-posters', true),
  ('announcement-images', 'announcement-images', true),
  ('club-logos', 'club-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for event posters
CREATE POLICY "Event posters are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

CREATE POLICY "Faculty and clubs can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-posters' AND 
  (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'club'::app_role))
);

CREATE POLICY "Users can update their own event posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own event posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for announcement images
CREATE POLICY "Announcement images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-images');

CREATE POLICY "Faculty and clubs can upload announcement images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcement-images' AND 
  (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'club'::app_role))
);

CREATE POLICY "Users can update their own announcement images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'announcement-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own announcement images"
ON storage.objects FOR DELETE
USING (bucket_id = 'announcement-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for club logos
CREATE POLICY "Club logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-logos');

CREATE POLICY "Clubs can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'club-logos' AND 
  has_role(auth.uid(), 'club'::app_role)
);

CREATE POLICY "Clubs can update their own logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'club-logos' AND has_role(auth.uid(), 'club'::app_role));

CREATE POLICY "Clubs can delete their own logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'club-logos' AND has_role(auth.uid(), 'club'::app_role));