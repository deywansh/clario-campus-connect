-- Drop the existing role-restricted policy for chat creation
DROP POLICY IF EXISTS "Faculty and clubs can create chats" ON public.chats;

-- Create a new simple policy allowing any authenticated user to create chats
CREATE POLICY "Any authenticated user can create chats"
ON public.chats
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Drop the existing complex insert policy on chat_members
DROP POLICY IF EXISTS "Users can be added to chats" ON public.chat_members;

-- Create a simpler insert policy for chat_members
CREATE POLICY "Allow inserting chat members"
ON public.chat_members
FOR INSERT
WITH CHECK (true);