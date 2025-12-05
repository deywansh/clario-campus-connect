-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view chats they are members of" ON public.chats;

-- Create a new SELECT policy that allows both creators and members to view chats
CREATE POLICY "Users can view chats they created or are members of"
ON public.chats
FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM chat_members 
    WHERE chat_members.chat_id = chats.id 
    AND chat_members.user_id = auth.uid()
  )
);