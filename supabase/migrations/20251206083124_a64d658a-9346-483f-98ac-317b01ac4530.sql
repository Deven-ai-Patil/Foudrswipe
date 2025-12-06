-- Create trigger to send match notifications when a new match is created
CREATE TRIGGER on_new_match
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_match();