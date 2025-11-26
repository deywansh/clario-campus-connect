-- Add last_seen to profiles for online status tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create club_moderators table
CREATE TABLE IF NOT EXISTS public.club_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_moderators ENABLE ROW LEVEL SECURITY;

-- Policies for club_moderators
CREATE POLICY "Club moderators are viewable by everyone"
  ON public.club_moderators FOR SELECT
  USING (true);

CREATE POLICY "Club owners can add moderators"
  ON public.club_moderators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = club_moderators.club_id
      AND clubs.user_id = auth.uid()
    )
  );

CREATE POLICY "Club owners can remove moderators"
  ON public.club_moderators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = club_moderators.club_id
      AND clubs.user_id = auth.uid()
    )
  );

-- Add pinned field to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Add is_locked field to chats
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Add admin_only field to chats (only admins can send messages)
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false;

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat images
CREATE POLICY "Chat images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

CREATE POLICY "Chat members can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own chat images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'chat-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add image_url field to messages for image attachments
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Function to update last_seen
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = now()
  WHERE id = auth.uid();
END;
$$;

-- Update messages policy to respect admin_only chats
DROP POLICY IF EXISTS "Chat members can send messages" ON public.messages;
CREATE POLICY "Chat members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
    AND (
      NOT EXISTS (
        SELECT 1 FROM chats
        WHERE chats.id = messages.chat_id
        AND chats.admin_only = true
      )
      OR EXISTS (
        SELECT 1 FROM chats
        WHERE chats.id = messages.chat_id
        AND chats.created_by = auth.uid()
      )
    )
  );