-- Create recipes table for Christmas Kitchen
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sweet', 'savory', 'drinks', 'traditions')),
  ingredients TEXT NOT NULL,
  instructions TEXT,
  memory_story TEXT,
  image_url TEXT,
  submitted_by TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved recipes
CREATE POLICY "Anyone can view approved recipes"
ON public.recipes
FOR SELECT
USING (is_approved = true);

-- Anyone can submit recipes (pending approval)
CREATE POLICY "Anyone can submit recipes"
ON public.recipes
FOR INSERT
WITH CHECK (is_approved = false);

-- Create index for filtering
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_approved ON public.recipes(is_approved);