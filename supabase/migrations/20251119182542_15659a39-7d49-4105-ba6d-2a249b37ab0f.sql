-- Create swipes table to track right swipes
CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Enable RLS
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Users can view their own swipes
CREATE POLICY "Users can view their own swipes" 
ON public.swipes 
FOR SELECT 
USING (auth.uid() = swiper_id);

-- Users can create their own swipes
CREATE POLICY "Users can create their own swipes" 
ON public.swipes 
FOR INSERT 
WITH CHECK (auth.uid() = swiper_id);

-- Create index for faster matching queries
CREATE INDEX idx_swipes_swiped_id ON public.swipes(swiped_id);
CREATE INDEX idx_swipes_swiper_id ON public.swipes(swiper_id);