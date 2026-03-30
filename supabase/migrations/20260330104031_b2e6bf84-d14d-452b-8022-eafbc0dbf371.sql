
ALTER TABLE public.chat_members 
  ADD COLUMN is_important boolean NOT NULL DEFAULT false,
  ADD COLUMN is_muted boolean NOT NULL DEFAULT false,
  ADD COLUMN muted_until timestamp with time zone DEFAULT NULL,
  ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN last_read_at timestamp with time zone DEFAULT NULL;
