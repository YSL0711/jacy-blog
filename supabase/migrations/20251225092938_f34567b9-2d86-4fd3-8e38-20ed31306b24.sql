-- Create ornaments table for the Christmas tree
CREATE TABLE public.ornaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  nickname TEXT NOT NULL,
  passcode_hash TEXT NOT NULL,
  note TEXT,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ornaments ENABLE ROW LEVEL SECURITY;

-- Anyone can view ornaments (but not the note content directly)
CREATE POLICY "Anyone can view ornaments"
ON public.ornaments
FOR SELECT
USING (true);

-- Anyone can insert ornaments (anonymous feature)
CREATE POLICY "Anyone can insert ornaments"
ON public.ornaments
FOR INSERT
WITH CHECK (true);

-- Anyone can update ornaments (passcode verified in application)
CREATE POLICY "Anyone can update ornaments"
ON public.ornaments
FOR UPDATE
USING (true);

-- Anyone can delete ornaments (passcode verified in application)
CREATE POLICY "Anyone can delete ornaments"
ON public.ornaments
FOR DELETE
USING (true);

-- Create index for position queries
CREATE INDEX idx_ornaments_position ON public.ornaments(position_x, position_y);