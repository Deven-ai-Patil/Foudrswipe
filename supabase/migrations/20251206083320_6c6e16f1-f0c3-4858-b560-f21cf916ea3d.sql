-- Create function to notify when someone swipes right
CREATE OR REPLACE FUNCTION public.notify_new_swipe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get environment variables
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-swipe-notification';
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'swiper_id', NEW.swiper_id::text,
      'swiped_id', NEW.swiped_id::text
    )
  );

  RETURN NEW;
END;
$function$;

-- Create trigger on swipes table
CREATE TRIGGER on_new_swipe
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_swipe();