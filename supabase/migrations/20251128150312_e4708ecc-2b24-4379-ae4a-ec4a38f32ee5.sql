-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send match notification
CREATE OR REPLACE FUNCTION public.notify_new_match()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get environment variables
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-match-notification';
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'match_id', NEW.id::text,
      'founder1_id', NEW.founder1_id::text,
      'founder2_id', NEW.founder2_id::text
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send message notification
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get environment variables
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-message-notification';
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'message_id', NEW.id::text,
      'sender_id', NEW.sender_id::text,
      'receiver_id', NEW.receiver_id::text,
      'content', NEW.content
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new matches
DROP TRIGGER IF EXISTS on_match_created ON public.matches;
CREATE TRIGGER on_match_created
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_match();

-- Trigger for new messages
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();