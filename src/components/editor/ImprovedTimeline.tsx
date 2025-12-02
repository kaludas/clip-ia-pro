import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ImprovedTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  trimStart: number;
  trimEnd: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onSkip: (seconds: number) => void;
}

export const ImprovedTimeline = ({
  currentTime,
  duration,
  isPlaying,
  volume,
  trimStart,
  trimEnd,
  onSeek,
  onPlayPause,
  onVolumeChange,
  onTrimChange,
  onSkip
}: ImprovedTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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

      {/* Timeline with Trim Handles */}
      <div className="space-y-2">
        <div
          ref={timelineRef}
          className="relative h-12 bg-muted/30 rounded-lg overflow-hidden cursor-pointer group"
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
            className="absolute inset-y-0 w-2 bg-primary cursor-ew-resize hover:bg-primary/80 group-hover:opacity-100 opacity-70 transition-opacity"
            style={{ left: `${trimStartPercentage}%` }}
            onMouseDown={(e) => handleTrimDrag(e, 'start')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-6 bg-white rounded-full" />
            </div>
          </div>

          {/* Trim End Handle */}
          <div
            className="absolute inset-y-0 w-2 bg-primary cursor-ew-resize hover:bg-primary/80 group-hover:opacity-100 opacity-70 transition-opacity"
            style={{ left: `${trimEndPercentage}%`, transform: 'translateX(-100%)' }}
            onMouseDown={(e) => handleTrimDrag(e, 'end')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-6 bg-white rounded-full" />
            </div>
          </div>

          {/* Current Time Indicator */}
          <div
            className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
            style={{ left: `${progressPercentage}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>

          {/* Time markers */}
          <div className="absolute inset-0 flex items-end pb-1 px-2 pointer-events-none">
            {Array.from({ length: 11 }).map((_, i) => {
              const time = (duration / 10) * i;
              const left = (i / 10) * 100;
              return (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground"
                  style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                >
                  {formatTime(time)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trim Info */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Début: {formatTime(trimStart)}</span>
          <span>Durée: {formatTime(trimEnd - trimStart)}</span>
          <span>Fin: {formatTime(trimEnd)}</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Espace</kbd> Play/Pause •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">←</kbd>
        <kbd className="px-1.5 py-0.5 bg-muted rounded">→</kbd> Reculer/Avancer 5s
      </div>
    </Card>
  );
};
