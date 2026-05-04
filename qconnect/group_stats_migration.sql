-- 1. Create a function to get the last reading time for all members of a specific group
-- This joins the halaqah_members table with user_activity to find the max timestamp_start
CREATE OR REPLACE FUNCTION public.get_group_last_read(p_group_id uuid)
RETURNS TABLE (
    user_id uuid,
    last_read timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        hm.user_id, 
        MAX(ua.timestamp_start) as last_read
    FROM public.halaqah_members hm
    LEFT JOIN public.user_activity ua ON hm.user_id = ua.user_id
    WHERE hm.group_id = p_group_id
    GROUP BY hm.user_id;
$$;
