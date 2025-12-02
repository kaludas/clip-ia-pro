import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  startTime: number;
  duration: number;
}

interface AudioTimelineProps {
  tracks: AudioTrack[];
  currentTime: number;
  totalDuration: number;
  onVolumeChange: (trackId: string, volume: number) => void;
  onTrackRemove: (trackId: string) => void;
}

export const AudioTimeline = ({
  tracks,
  currentTime,
  totalDuration,
  onVolumeChange,
  onTrackRemove
}: AudioTimelineProps) => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  useEffect(() => {
    drawWaveform();
  }, [tracks, currentTime, totalDuration]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw time grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const secondsPerPixel = totalDuration / width;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Draw tracks
    tracks.forEach((track, index) => {
      const trackHeight = height / Math.max(tracks.length, 1);
      const y = index * trackHeight;
      const x = (track.startTime / totalDuration) * width;
      const trackWidth = (track.duration / totalDuration) * width;

      // Track background
      const isHovered = hoveredTrack === track.id;
      ctx.fillStyle = isHovered ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(x, y + 5, trackWidth, trackHeight - 10);

      // Draw waveform simulation
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const wavePoints = 100;
      for (let i = 0; i < wavePoints; i++) {
        const wx = x + (i / wavePoints) * trackWidth;
        const amplitude = (Math.random() * 0.5 + 0.5) * (trackHeight - 20) / 2;
        const wy = y + trackHeight / 2 + amplitude * Math.sin(i * 0.5) * (track.volume / 100);
        if (i === 0) {
          ctx.moveTo(wx, wy);
        } else {
          ctx.lineTo(wx, wy);
        }
      }
      ctx.stroke();

      // Track label
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.fillText(track.name, x + 5, y + 15);
    });

    // Draw playhead
    const playheadX = (currentTime / totalDuration) * width;
    ctx.strokeStyle = 'rgba(255, 59, 48, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {language === "fr" ? "Timeline Audio" : "Audio Timeline"}
          </CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Visualisez et mixez vos pistes audio"
              : "Visualize and mix your audio tracks"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Waveform Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={Math.max(200, tracks.length * 60)}
              className="w-full rounded-lg glass"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const clickTime = (x / rect.width) * totalDuration;
                
                // Find hovered track
                const trackIndex = Math.floor((e.clientY - rect.top) / (rect.height / tracks.length));
                const track = tracks[trackIndex];
                if (track && clickTime >= track.startTime && clickTime <= track.startTime + track.duration) {
                  setHoveredTrack(track.id);
                } else {
                  setHoveredTrack(null);
                }
              }}
              onMouseLeave={() => setHoveredTrack(null)}
            />
            
            {/* Time indicator */}
            <div className="absolute bottom-2 right-2 text-xs font-mono glass px-2 py-1 rounded">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          {/* Track Controls */}
          {tracks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                {language === "fr" ? "Contrôles des pistes" : "Track Controls"}
              </h4>
              {tracks.map((track) => (
                <Card key={track.id} className="glass p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{track.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTrackRemove(track.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {track.volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-primary" />
                    )}
                    <Slider
                      value={[track.volume]}
                      max={100}
                      step={1}
                      onValueChange={([value]) => onVolumeChange(track.id, value)}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {track.volume}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tracks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === "fr"
                  ? "Ajoutez des pistes audio depuis la bibliothèque"
                  : "Add audio tracks from the library"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};