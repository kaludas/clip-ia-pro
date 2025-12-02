import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Subtitles, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface SubtitleGeneratorProps {
  videoUrl?: string;
  existingTranscription?: {
    text: string;
    segments: Segment[];
  } | null;
  onSubtitlesGenerated?: (segments: Segment[]) => void;
}

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
}

const SubtitleGenerator = ({ videoUrl, existingTranscription, onSubtitlesGenerated }: SubtitleGeneratorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<{
    text: string;
    segments: Segment[];
  } | null>(existingTranscription || null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  const AVAILABLE_LANGUAGES = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
  ];

  // Sync with existing transcription from parent
  useEffect(() => {
    if (existingTranscription && !transcription) {
      setTranscription(existingTranscription);
    }
  }, [existingTranscription]);

  const handleGenerateFromVideo = async () => {
    if (!videoUrl) {
      toast.error("Aucune vidéo chargée");
      return;
    }

    setIsProcessing(true);
    toast.info("Transcription de la vidéo en cours...");

    try {
      // Fetch video and extract audio only
      console.log('Fetching video from:', videoUrl);
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Video blob size:', videoBlob.size, 'type:', videoBlob.type);
      
      if (videoBlob.size === 0) {
        throw new Error("La vidéo est vide");
      }

      // Check file size limit (50MB for video to Gemini)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (videoBlob.size > MAX_SIZE) {
        toast.error("La vidéo est trop volumineuse (max 50MB). Veuillez utiliser une vidéo plus courte.");
        setIsProcessing(false);
        return;
      }

      // Convert video blob to base64
      console.log('Converting video to base64...');
      const base64Video = await blobToBase64(videoBlob);
      console.log('Base64 video data length:', base64Video.length);

      // Determine video format from blob type
      const format = videoBlob.type.split('/')[1] || 'mp4';
      console.log('Sending transcription request with format:', format);

      // Call the edge function with video directly
      const { data, error } = await supabase.functions.invoke('audio-transcription', {
        body: { 
          video: base64Video,
          language: selectedLanguage,
          format,
          mimeType: videoBlob.type
        }
      });

      if (error) {
        console.error('Transcription error:', error);
        throw error;
      }

      console.log('Transcription result:', data);

      setTranscription({
        text: data.text,
        segments: data.segments || []
      });

      if (onSubtitlesGenerated) {
        onSubtitlesGenerated(data.segments || []);
      }

      toast.success("Sous-titres générés avec succès !");

    } catch (error) {
      console.error('Error generating subtitles:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la génération des sous-titres";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez MP3, WAV, M4A, MP4 ou WebM.");
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Maximum 100MB.");
      return;
    }

    setIsProcessing(true);
    toast.info("Transcription en cours...");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const format = file.type.split('/')[1];

        // Call the edge function
        const { data, error } = await supabase.functions.invoke('audio-transcription', {
          body: { 
            audio: base64Audio,
            language: selectedLanguage,
            format
          }
        });

        if (error) {
          console.error('Transcription error:', error);
          throw error;
        }

        console.log('Transcription result:', data);

        setTranscription({
          text: data.text,
          segments: data.segments || []
        });

        if (onSubtitlesGenerated) {
          onSubtitlesGenerated(data.segments || []);
        }

        toast.success("Sous-titres générés avec succès !");
      };

      reader.onerror = () => {
        throw new Error("Erreur lors de la lecture du fichier");
      };

    } catch (error) {
      console.error('Error generating subtitles:', error);
      toast.error("Erreur lors de la génération des sous-titres");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Card className="glass border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-primary" />
          Générateur de Sous-titres IA
        </CardTitle>
        <CardDescription>
          Transcription automatique avec synchronisation temporelle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Langue source de la vidéo
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isProcessing}
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {videoUrl && (
          <Button
            onClick={handleGenerateFromVideo}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            <Subtitles className="w-5 h-5 mr-2" />
            Générer les sous-titres de la vidéo
          </Button>
        )}
        
        {videoUrl && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="audio-upload" className="cursor-pointer">
            <div className="glass-hover p-8 rounded-xl border-2 border-dashed border-border hover:border-primary transition-all text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {videoUrl ? "Importer un fichier audio/vidéo séparé" : "Cliquez pour importer un fichier audio/vidéo"}
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, M4A, MP4, WebM (max 100MB)
              </p>
            </div>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 p-4 glass rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Analyse en cours avec Gemini AI...
            </span>
          </div>
        )}

        {transcription && (
          <div className="space-y-4">
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Transcription complète</h4>
              <p className="text-sm text-muted-foreground">{transcription.text}</p>
            </div>

            {transcription.segments.length > 0 && (
              <div className="glass p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-sm">
                  Segments synchronisés ({transcription.segments.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transcription.segments.map((segment, index) => (
                    <div key={index} className="glass-hover p-3 rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-mono">
                          {formatTime(segment.start)} → {formatTime(segment.end)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => {
                setTranscription(null);
              }}
              variant="outline"
              className="w-full"
            >
              Nouvelle transcription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubtitleGenerator;
