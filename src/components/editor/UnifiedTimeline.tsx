import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  startTime: number;
  duration: number;
}

interface Layer {
  id: string;
  name: string;
  type: "text" | "image" | "video" | "overlay";
  url?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  position?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

interface UnifiedTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  trimStart: number;
  trimEnd: number;
  audioTracks: AudioTrack[];
  layers: Layer[];
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onSkip: (seconds: number) => void;
  onAudioVolumeChange: (id: string, volume: number) => void;
  onAudioRemove: (id: string) => void;
  onLayerToggle: (id: string) => void;
  onLayerRemove: (id: string) => void;
}

export const UnifiedTimeline = ({
  currentTime,
  duration,
  isPlaying,
  volume,
  trimStart,
  trimEnd,
  audioTracks,
  layers,
  onSeek,
  onPlayPause,
  onVolumeChange,
  onTrimChange,
  onSkip,
  onAudioVolumeChange,
  onAudioRemove,
  onLayerToggle,
  onLayerRemove
}: UnifiedTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isTrimming, setIsTrimming] = useState<'start' | 'end' | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isTrimming) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    onSeek(Math.max(trimStart, Math.min(trimEnd, newTime)));
  };

  const handleTrimDrag = (e: React.MouseEvent<HTMLDivElement>, type: 'start' | 'end') => {
    e.stopPropagation();
    setIsTrimming(type);
  };

  useEffect(() => {
    if (!isTrimming) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      if (isTrimming === 'start') {
        onTrimChange(Math.min(newTime, trimEnd - 0.5), trimEnd);
      } else {
        onTrimChange(trimStart, Math.max(newTime, trimStart + 0.5));
      }
    };

    const handleMouseUp = () => {
      setIsTrimming(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTrimming, duration, trimStart, trimEnd, onTrimChange]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPercentage = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimEndPercentage = duration > 0 ? (trimEnd / duration) * 100 : 100;

  return (
    <Card className="glass p-4 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSkip(-5)}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="hero"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSkip(5)}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <div className="text-sm font-mono tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1" />

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            max={100}
            step={1}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground w-8">
            {volume}%
          </span>
        </div>
      </div>

      {/* Timeline Container with Multi-Track Layout */}
      <div className="space-y-2">
        {/* Main Video Track with Trim Handles */}
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
            <span className="font-medium">🎬 Vidéo principale</span>
            <span className="text-[10px]">
              Début: {formatTime(trimStart)} • Durée: {formatTime(trimEnd - trimStart)} • Fin: {formatTime(trimEnd)}
            </span>
          </div>
          <div
            ref={timelineRef}
            className="relative h-16 bg-muted/30 rounded-lg overflow-hidden cursor-pointer group"
            onClick={handleTimelineClick}
          >
            {/* Inactive regions (outside trim) */}
            <div
              className="absolute inset-y-0 left-0 bg-muted/50"
              style={{ width: `${trimStartPercentage}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-muted/50"
              style={{ width: `${100 - trimEndPercentage}%` }}
            />

            {/* Active region (inside trim) */}
            <div
              className="absolute inset-y-0 bg-primary/20"
              style={{
                left: `${trimStartPercentage}%`,
                width: `${trimEndPercentage - trimStartPercentage}%`
              }}
            />

            {/* Progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/40 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Trim Start Handle */}
            <div
              className="absolute inset-y-0 w-2 bg-primary cursor-ew-resize hover:bg-primary/80 group-hover:opacity-100 opacity-70 transition-opacity z-10"
              style={{ left: `${trimStartPercentage}%` }}
              onMouseDown={(e) => handleTrimDrag(e, 'start')}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-1 h-8 bg-background rounded-full" />
              </div>
            </div>

            {/* Trim End Handle */}
            <div
              className="absolute inset-y-0 w-2 bg-primary cursor-ew-resize hover:bg-primary/80 group-hover:opacity-100 opacity-70 transition-opacity z-10"
              style={{ left: `${trimEndPercentage}%`, transform: 'translateX(-100%)' }}
              onMouseDown={(e) => handleTrimDrag(e, 'end')}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-1 h-8 bg-background rounded-full" />
              </div>
            </div>

            {/* Current Time Indicator (Global for all tracks) */}
            <div
              className="absolute -inset-y-full w-0.5 bg-accent shadow-glow pointer-events-none z-20"
              style={{ left: `${progressPercentage}%`, height: `${100 + (audioTracks.length + layers.length) * 60 + (audioTracks.length + layers.length) * 8}px` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full shadow-lg" />
            </div>

            {/* Time markers */}
            <div className="absolute inset-0 flex items-end pb-1 px-2 pointer-events-none">
              {Array.from({ length: 11 }).map((_, i) => {
                const time = (duration / 10) * i;
                const left = (i / 10) * 100;
                return (
                  <div
                    key={i}
                    className="absolute text-[10px] text-muted-foreground font-mono"
                    style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                  >
                    {formatTime(time)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audio Tracks */}
        {audioTracks.length > 0 && (
          <div className="space-y-2">
            {audioTracks.map((track) => {
              const trackStartPercentage = duration > 0 ? (track.startTime / duration) * 100 : 0;
              const trackWidthPercentage = duration > 0 ? (track.duration / duration) * 100 : 0;
              
              return (
                <div key={track.id}>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      🎵 {track.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        <Slider
                          value={[track.volume]}
                          onValueChange={(value) => onAudioVolumeChange(track.id, value[0])}
                          max={100}
                          step={1}
                          className="w-16"
                        />
                        <span className="text-[10px] w-6">{track.volume}%</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onAudioRemove(track.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
                    {/* Audio track visual representation */}
                    <div
                      className="absolute inset-y-0 bg-emerald-500/30 border-l-2 border-r-2 border-emerald-500 rounded flex items-center justify-center"
                      style={{
                        left: `${trackStartPercentage}%`,
                        width: `${trackWidthPercentage}%`
                      }}
                    >
                      <div className="text-[10px] font-medium text-emerald-300 truncate px-2">
                        {track.name}
                      </div>
                      {/* Simulated waveform */}
                      <div className="absolute inset-0 flex items-center gap-[2px] px-1 opacity-50">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-emerald-400 rounded-full"
                            style={{ height: `${20 + Math.random() * 60}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Layer Tracks (Filters, Overlays, Images) */}
        {layers.length > 0 && (
          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.id}>
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    {layer.type === "image" ? "🖼️" : layer.type === "video" ? "🎞️" : layer.type === "text" ? "📝" : "✨"} {layer.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => onLayerToggle(layer.id)}
                    >
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => onLayerRemove(layer.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
                  {/* Layer visual representation - spans full timeline */}
                  <div
                    className={`absolute inset-0 ${
                      layer.visible ? "bg-purple-500/30 border-2 border-purple-500" : "bg-muted/50 border-2 border-muted"
                    } rounded flex items-center justify-center`}
                  >
                    <div className={`text-[10px] font-medium ${
                      layer.visible ? "text-purple-300" : "text-muted-foreground"
                    } truncate px-2`}>
                      {layer.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Espace</kbd> Play/Pause •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">←</kbd>
        <kbd className="px-1.5 py-0.5 bg-muted rounded">→</kbd> ±5s •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+I</kbd> Point d'entrée •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+O</kbd> Point de sortie
      </div>
    </Card>
  );
};