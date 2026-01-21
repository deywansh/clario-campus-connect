-- Create user_subscriptions table for interest selection
CREATE TABLE public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    source_id uuid NOT NULL,
    source_type text NOT NULL CHECK (source_type IN ('faculty', 'club')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, source_id, source_type)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON public.user_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;