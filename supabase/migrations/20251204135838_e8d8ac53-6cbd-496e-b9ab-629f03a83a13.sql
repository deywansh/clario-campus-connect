-- Drop all existing policies on chat_members
DROP POLICY IF EXISTS "Chat creators can add members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can leave chats or creators can remove members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can view members of chats they belong to" ON public.chat_members;

-- Create non-recursive SELECT policy using a security definer function
CREATE OR REPLACE FUNCTION public.is_chat_member(_user_id uuid, _chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_members
    WHERE user_id = _user_id AND chat_id = _chat_id
  )
$$;

-- 1. Select policy - users can view chat members of chats they belong to
CREATE POLICY "Users can view chat members"
ON public.chat_members
FOR SELECT
USING (public.is_chat_member(auth.uid(), chat_id));

-- 2. Insert policy - allow chat creator to add members or user to add themselves
CREATE POLICY "Users can be added to chats"
ON public.chat_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR auth.uid() = (SELECT created_by FROM public.chats c WHERE c.id = chat_id)
);

-- 3. Delete policy - user can leave or chat creator can remove members
CREATE POLICY "Chat creator can remove members"
ON public.chat_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR auth.uid() = (SELECT created_by FROM public.chats c WHERE c.id = chat_id)
);

-- 4. Update policy - only chat creator can update memberships
CREATE POLICY "Chat creator can update members"
ON public.chat_members
FOR UPDATE
USING (
  auth.uid() = (SELECT created_by FROM public.chats c WHERE c.id = chat_id)
);