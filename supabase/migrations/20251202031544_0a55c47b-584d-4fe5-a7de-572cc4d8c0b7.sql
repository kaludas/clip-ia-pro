-- Create storage bucket for user overlays and filters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'overlays',
  'overlays',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
);

-- Create RLS policies for overlays bucket
CREATE POLICY "Users can view all overlays"
ON storage.objects FOR SELECT
USING (bucket_id = 'overlays');

CREATE POLICY "Authenticated users can upload overlays"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'overlays' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own overlays"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'overlays' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own overlays"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'overlays' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track user overlays metadata
CREATE TABLE IF NOT EXISTS public.user_overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  thumbnail_url TEXT,
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_overlays
ALTER TABLE public.user_overlays ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_overlays
CREATE POLICY "Users can view their own overlays"
ON public.user_overlays FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own overlays"
ON public.user_overlays FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own overlays"
ON public.user_overlays FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own overlays"
ON public.user_overlays FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_overlays_updated_at
BEFORE UPDATE ON public.user_overlays
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();