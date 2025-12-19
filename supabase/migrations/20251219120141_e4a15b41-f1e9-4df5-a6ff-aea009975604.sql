-- Create table for user generated images library
CREATE TABLE public.user_generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  image_type TEXT DEFAULT 'generated', -- 'generated', 'edited', 'video_thumbnail'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own images"
ON public.user_generated_images
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
ON public.user_generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.user_generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_generated_images_user_id ON public.user_generated_images(user_id);
CREATE INDEX idx_user_generated_images_created_at ON public.user_generated_images(created_at DESC);