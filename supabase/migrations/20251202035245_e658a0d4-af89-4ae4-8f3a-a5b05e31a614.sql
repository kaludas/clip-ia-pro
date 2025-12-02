-- Create music library bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-library', 'music-library', true)
ON CONFLICT (id) DO NOTHING;

-- Create music tracks table
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  mood TEXT NOT NULL,
  duration INTEGER NOT NULL,
  bpm INTEGER,
  file_path TEXT NOT NULL,
  waveform_data JSONB,
  is_copyright_free BOOLEAN DEFAULT true,
  license_type TEXT DEFAULT 'CC0',
  preview_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Public read access for music library
CREATE POLICY "Music tracks are viewable by everyone"
ON public.music_tracks
FOR SELECT
USING (true);

-- Admin insert policy (for seeding)
CREATE POLICY "Admins can insert music tracks"
ON public.music_tracks
FOR INSERT
WITH CHECK (true);

-- Create indexes for search
CREATE INDEX IF NOT EXISTS idx_music_tracks_genre ON public.music_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_music_tracks_mood ON public.music_tracks(mood);
CREATE INDEX IF NOT EXISTS idx_music_tracks_duration ON public.music_tracks(duration);
CREATE INDEX IF NOT EXISTS idx_music_tracks_bpm ON public.music_tracks(bpm);

-- Updated at trigger
CREATE TRIGGER update_music_tracks_updated_at
BEFORE UPDATE ON public.music_tracks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample copyright-free music tracks
INSERT INTO public.music_tracks (title, artist, genre, mood, duration, bpm, file_path, license_type, is_copyright_free) VALUES
('Epic Motivational', 'AudioLab', 'Electronic', 'Energetic', 180, 128, 'samples/epic-motivational.mp3', 'CC0', true),
('Chill Lofi Beat', 'LofiHub', 'Lofi', 'Relaxed', 150, 85, 'samples/chill-lofi.mp3', 'CC0', true),
('Gaming Hype', 'GameBeats', 'Electronic', 'Intense', 120, 140, 'samples/gaming-hype.mp3', 'CC0', true),
('Ambient Dream', 'SoundScape', 'Ambient', 'Calm', 240, 65, 'samples/ambient-dream.mp3', 'CC0', true),
('Uplifting Pop', 'PopWorks', 'Pop', 'Happy', 165, 115, 'samples/uplifting-pop.mp3', 'CC0', true),
('Dark Cinematic', 'CineTracks', 'Cinematic', 'Dark', 200, 95, 'samples/dark-cinematic.mp3', 'CC0', true),
('Funky Groove', 'GrooveLab', 'Funk', 'Groovy', 135, 110, 'samples/funky-groove.mp3', 'CC0', true),
('Inspiring Acoustic', 'AcousticVibes', 'Acoustic', 'Inspiring', 190, 90, 'samples/inspiring-acoustic.mp3', 'CC0', true),
('Tech House Energy', 'EDMFactory', 'House', 'Energetic', 210, 125, 'samples/tech-house.mp3', 'CC0', true),
('Corporate Success', 'BizBeats', 'Corporate', 'Professional', 145, 120, 'samples/corporate-success.mp3', 'CC0', true)
ON CONFLICT DO NOTHING;