-- Add Quran.com OAuth token columns for cross-device syncing
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS qf_access_token text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS qf_refresh_token text;
