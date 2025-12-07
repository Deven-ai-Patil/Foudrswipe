-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'swipe', -- 'swipe', 'match', 'message'
  related_user_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert notifications (via trigger)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to auto-create notification on swipe
CREATE OR REPLACE FUNCTION public.create_swipe_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  swiper_name TEXT;
BEGIN
  -- Get swiper's name
  SELECT name INTO swiper_name FROM profiles WHERE id = NEW.swiper_id;
  
  -- Create notification for the swiped user
  INSERT INTO notifications (user_id, title, message, type, related_user_id)
  VALUES (
    NEW.swiped_id,
    'Someone swiped right on you!',
    COALESCE(swiper_name, 'A founder') || ' is interested. Check your matches.',
    'swipe',
    NEW.swiper_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for swipe notifications
CREATE TRIGGER on_swipe_create_notification
AFTER INSERT ON public.swipes
FOR EACH ROW
EXECUTE FUNCTION public.create_swipe_notification();

-- Create function to auto-create notification on match
CREATE OR REPLACE FUNCTION public.create_match_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  founder1_name TEXT;
  founder2_name TEXT;
BEGIN
  -- Get names
  SELECT name INTO founder1_name FROM profiles WHERE id = NEW.founder1_id;
  SELECT name INTO founder2_name FROM profiles WHERE id = NEW.founder2_id;
  
  -- Notify founder1
  INSERT INTO notifications (user_id, title, message, type, related_user_id)
  VALUES (
    NEW.founder1_id,
    'It''s a Match!',
    'You matched with ' || COALESCE(founder2_name, 'a founder') || '. Start chatting now!',
    'match',
    NEW.founder2_id
  );
  
  -- Notify founder2
  INSERT INTO notifications (user_id, title, message, type, related_user_id)
  VALUES (
    NEW.founder2_id,
    'It''s a Match!',
    'You matched with ' || COALESCE(founder1_name, 'a founder') || '. Start chatting now!',
    'match',
    NEW.founder1_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for match notifications
CREATE TRIGGER on_match_create_notification
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.create_match_notification();