
-- Allow users to update their own chat_members rows (for is_important, is_muted, is_archived, last_read_at)
CREATE POLICY "Users can update their own membership"
ON public.chat_members
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
