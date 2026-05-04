-- 1. Add Opt-In and Leaderboard Name columns to user_profiles
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS is_global_reader BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS leaderboard_name TEXT;

-- 2. Create the fast RPC aggregation function to get top readers
CREATE OR REPLACE FUNCTION public.get_global_leaderboard()
RETURNS TABLE (
  user_id UUID,
  leaderboard_name TEXT,
  total_verses BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    p.id as user_id, 
    p.leaderboard_name,
    COUNT(a.id) as total_verses
  FROM public.user_profiles p
  JOIN public.user_activity a ON p.id = a.user_id
  WHERE p.is_global_reader = true
  GROUP BY p.id, p.leaderboard_name
  ORDER BY total_verses DESC
  LIMIT 100;
$$;
