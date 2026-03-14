-- Add image_url column to journal_entries table
ALTER TABLE public.journal_entries ADD COLUMN image_url text;

-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('journal-images', 'journal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload journal images
CREATE POLICY "Anyone can upload journal images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'journal-images');

-- Allow anyone to view journal images
CREATE POLICY "Anyone can view journal images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'journal-images');

-- Allow anyone to delete journal images
CREATE POLICY "Anyone can delete journal images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'journal-images');

-- Add delete policy for journal entries
CREATE POLICY "Anyone can delete journal entries"
ON public.journal_entries
FOR DELETE
USING (true);