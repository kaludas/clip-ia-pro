import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Music, Search, Play, Pause, Download, Filter, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number;
  bpm: number;
  file_path: string;
  license_type: string;
  is_copyright_free: boolean;
}

interface MusicLibraryProps {
  onTrackSelect: (track: MusicTrack) => void;
}

export const MusicLibrary = ({ onTrackSelect }: MusicLibraryProps) => {
  const { language } = useLanguage();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 300]);
  const [bpmRange, setBpmRange] = useState<[number, number]>([0, 200]);

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tracks, searchQuery, selectedGenre, selectedMood, durationRange, bpmRange]);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*')
        .eq('is_copyright_free', true)
        .order('title');

      if (error) throw error;

      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching music tracks:', error);
      toast.error(language === "fr" ? "Erreur de chargement" : "Loading error");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tracks];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query)
      );
    }

    // Genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter(track => track.genre === selectedGenre);
    }

    // Mood
    if (selectedMood !== "all") {
      filtered = filtered.filter(track => track.mood === selectedMood);
    }

    // Duration
    filtered = filtered.filter(track =>
      track.duration >= durationRange[0] && track.duration <= durationRange[1]
    );

    // BPM
    filtered = filtered.filter(track =>
      track.bpm >= bpmRange[0] && track.bpm <= bpmRange[1]
    );

    setFilteredTracks(filtered);
  };

  const playPreview = (track: MusicTrack) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
      return;
    }

    // Simulate preview (in production, use actual file URL from storage)
    const audio = new Audio();
    audio.volume = 0.5;
    
    audio.onended = () => {
      setPlayingTrackId(null);
      setCurrentAudio(null);
    };

    setPlayingTrackId(track.id);
    setCurrentAudio(audio);
    
    toast.info(language === "fr" ? "🎵 Lecture..." : "🎵 Playing...");
  };

  const handleSelectTrack = (track: MusicTrack) => {
    onTrackSelect(track);
    toast.success(
      language === "fr"
        ? `✅ "${track.title}" ajouté à la timeline`
        : `✅ "${track.title}" added to timeline`
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const genres = Array.from(new Set(tracks.map(t => t.genre)));
  const moods = Array.from(new Set(tracks.map(t => t.mood)));

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            {language === "fr" ? "Bibliothèque Musicale" : "Music Library"}
          </CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Musiques libres de droits pour vos créations"
              : "Copyright-free music for your creations"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === "fr" ? "Rechercher..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder={language === "fr" ? "Genre" : "Genre"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "fr" ? "Tous" : "All"}</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger>
                <SelectValue placeholder={language === "fr" ? "Ambiance" : "Mood"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "fr" ? "Toutes" : "All"}</SelectItem>
                {moods.map(mood => (
                  <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {language === "fr" ? "Durée" : "Duration"}
              </span>
              <span className="font-medium">
                {formatDuration(durationRange[0])} - {formatDuration(durationRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={300}
              step={15}
              value={durationRange}
              onValueChange={(val) => setDurationRange(val as [number, number])}
              className="w-full"
            />
          </div>

          {/* BPM Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-4 h-4" />
                BPM
              </span>
              <span className="font-medium">
                {bpmRange[0]} - {bpmRange[1]}
              </span>
            </div>
            <Slider
              min={0}
              max={200}
              step={5}
              value={bpmRange}
              onValueChange={(val) => setBpmRange(val as [number, number])}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            {filteredTracks.length} {language === "fr" ? "résultats" : "results"}
          </div>
        </CardContent>
      </Card>

      {/* Track List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {isLoading ? (
            <Card className="glass p-6 text-center">
              <Music className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Chargement..." : "Loading..."}
              </p>
            </Card>
          ) : filteredTracks.length === 0 ? (
            <Card className="glass p-6 text-center">
              <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Aucun résultat" : "No results"}
              </p>
            </Card>
          ) : (
            filteredTracks.map((track) => (
              <Card key={track.id} className="glass-hover p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{track.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {track.license_type}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {track.genre}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {track.mood}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(track.duration)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {track.bpm} BPM
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playPreview(track)}
                    className="flex-1 gap-2"
                  >
                    {playingTrackId === track.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        {language === "fr" ? "Pause" : "Pause"}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {language === "fr" ? "Écouter" : "Play"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleSelectTrack(track)}
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {language === "fr" ? "Utiliser" : "Use"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};