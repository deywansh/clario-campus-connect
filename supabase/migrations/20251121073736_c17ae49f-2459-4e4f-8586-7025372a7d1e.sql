-- Fix infinite recursion in chat_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of chats they belong to" ON public.chat_members;
DROP POLICY IF EXISTS "Chat creators can add members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can leave chats or creators can remove members" ON public.chat_members;

-- Recreate policies without recursion
CREATE POLICY "Users can view members of chats they belong to"
ON public.chat_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Chat creators can add members"
ON public.chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_members.chat_id
    AND chats.created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave chats or creators can remove members"
ON public.chat_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_members.chat_id
    AND chats.created_by = auth.uid()
  )
);