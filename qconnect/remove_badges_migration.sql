-- 1. Drop the badges table
DROP TABLE IF EXISTS public.badge_progress CASCADE;

-- 2. Create the trigger function to award 2 points (quest_coins) for each activity log
CREATE OR REPLACE FUNCTION public.award_reading_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Increment quest_coins by 2 for the user who logged the activity
  UPDATE public.user_profiles
  SET quest_coins = COALESCE(quest_coins, 0) + 2
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 3. Create the trigger on user_activity
DROP TRIGGER IF EXISTS trigger_award_reading_points ON public.user_activity;
CREATE TRIGGER trigger_award_reading_points
AFTER INSERT ON public.user_activity
FOR EACH ROW
EXECUTE FUNCTION public.award_reading_points();
