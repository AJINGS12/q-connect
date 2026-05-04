-- 1. Clean up old leaderboard
DROP FUNCTION IF EXISTS public.get_global_leaderboard();

-- 2. Drop existing Halaqah tables to recreate them with the new role column
DROP TABLE IF EXISTS public.halaqah_members CASCADE;
DROP TABLE IF EXISTS public.halaqah_groups CASCADE;

-- 3. Rename leaderboard_name to display_name (if it exists) or add it
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='user_profiles' and column_name='leaderboard_name')
  THEN
      ALTER TABLE "public"."user_profiles" RENAME COLUMN "leaderboard_name" TO "display_name";
  ELSE
      ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "display_name" text;
  END IF;
END $$;

-- 4. Create halaqah_groups table
CREATE TABLE IF NOT EXISTS public.halaqah_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code text UNIQUE NOT NULL,
  name text NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rules text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create halaqah_members table (NOW WITH ROLE)
CREATE TABLE IF NOT EXISTS public.halaqah_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.halaqah_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status_signal text DEFAULT 'ready', -- 'completed', 'behind', 'ready'
  role text DEFAULT 'member', -- 'admin', 'member'
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, user_id)
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.halaqah_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halaqah_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Groups

-- Anyone authenticated can view groups (to join them via code)
CREATE POLICY "Authenticated users can view groups" 
ON public.halaqah_groups FOR SELECT 
USING (auth.role() = 'authenticated');

-- Authenticated users can create groups
CREATE POLICY "Users can create groups" 
ON public.halaqah_groups FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

-- Admins can update the group
CREATE POLICY "Admins can update group" 
ON public.halaqah_groups FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.halaqah_members 
    WHERE group_id = halaqah_groups.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete the group
CREATE POLICY "Admins can delete group" 
ON public.halaqah_groups FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.halaqah_members 
    WHERE group_id = halaqah_groups.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- 8. RLS Policies for Members

-- Anyone authenticated can view members (to see group dashboards)
CREATE POLICY "Users can view members" 
ON public.halaqah_members FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can join groups (insert themselves as member)
CREATE POLICY "Users can join groups" 
ON public.halaqah_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own status signal
CREATE POLICY "Users can update their own status" 
ON public.halaqah_members FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update other members (to promote/demote)
CREATE POLICY "Admins can promote members" 
ON public.halaqah_members FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.halaqah_members admins 
    WHERE admins.group_id = halaqah_members.group_id AND admins.user_id = auth.uid() AND admins.role = 'admin'
  )
);

-- Users can leave groups
CREATE POLICY "Users can leave groups" 
ON public.halaqah_members FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can remove other users
CREATE POLICY "Admins can remove members" 
ON public.halaqah_members FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.halaqah_members admins 
    WHERE admins.group_id = halaqah_members.group_id AND admins.user_id = auth.uid() AND admins.role = 'admin'
  )
);