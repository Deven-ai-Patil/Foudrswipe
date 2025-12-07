-- Drop old triggers first
DROP TRIGGER IF EXISTS on_new_swipe ON public.swipes;
DROP TRIGGER IF EXISTS on_new_match ON public.matches;
DROP TRIGGER IF EXISTS on_new_message ON public.messages;

-- Now drop the old functions with CASCADE
DROP FUNCTION IF EXISTS public.notify_new_swipe() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_match() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_message() CASCADE;