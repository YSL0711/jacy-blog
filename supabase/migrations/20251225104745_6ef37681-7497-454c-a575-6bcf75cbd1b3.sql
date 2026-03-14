-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create journal_entries table for JACY Journal
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL DEFAULT '✨',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Traditions',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public reading and password-gated writing (handled in frontend)
CREATE POLICY "Anyone can view journal entries" 
ON public.journal_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert journal entries" 
ON public.journal_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (true);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();