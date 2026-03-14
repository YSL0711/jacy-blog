-- Create wishes table for yearbook entries
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT,
  photo_url TEXT,
  voice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Anyone can view wishes
CREATE POLICY "Anyone can view wishes"
ON public.wishes
FOR SELECT
USING (true);

-- Anyone can insert wishes
CREATE POLICY "Anyone can insert wishes"
ON public.wishes
FOR INSERT
WITH CHECK (true);

-- Create storage bucket for wish uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishes', 'wishes', true);

-- Storage policies for wishes bucket
CREATE POLICY "Anyone can view wish files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wishes');

CREATE POLICY "Anyone can upload wish files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'wishes');