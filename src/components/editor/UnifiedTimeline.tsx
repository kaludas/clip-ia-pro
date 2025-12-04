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
  startTime: number;
  duration: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  animation: string;
  startTime: number;
  endTime: number;
}

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface VideoSegment {
  id: string;
  startTime: number;
  duration: number;
}

interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

const SNAP_THRESHOLD = 0.5; // seconds - magnetic snapping distance

interface UnifiedTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  trimStart: number;
  trimEnd: number;
  audioTracks: AudioTrack[];
  layers: Layer[];
  textOverlays: TextOverlay[];
  subtitles: Subtitle[];
  translatedSubtitles?: Record<string, Subtitle[]>;
  videoSegments?: VideoSegment[];
  markers?: Marker[];
  
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onSkip: (seconds: number) => void;
  onAudioVolumeChange: (id: string, volume: number) => void;
  onAudioRemove: (id: string) => void;
  onAudioTimeChange: (id: string, startTime: number, duration: number) => void;
  onLayerToggle: (id: string) => void;
  onLayerRemove: (id: string) => void;
  onLayerTimeChange: (id: string, startTime: number, duration: number) => void;
  onTextOverlayRemove: (id: string) => void;
  onTextOverlayTimeChange: (id: string, startTime: number, endTime: number) => void;
  onVideoSplit: (time: number) => void;
  onVideoSegmentRemove: (id: string) => void;
  onVideoSegmentTimeChange: (id: string, startTime: number, duration: number) => void;
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
  textOverlays,
  subtitles,
  translatedSubtitles = {},
  videoSegments = [],
  markers = [],
  onSeek,
  onPlayPause,
  onVolumeChange,
  onTrimChange,
  onSkip,
  onAudioVolumeChange,
  onAudioRemove,
  onAudioTimeChange,
  onLayerToggle,
  onLayerRemove,
  onLayerTimeChange,
  onTextOverlayRemove,
  onTextOverlayTimeChange,
  onVideoSplit,
  onVideoSegmentRemove,
  onVideoSegmentTimeChange
}: UnifiedTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isTrimming, setIsTrimming] = useState<'start' | 'end' | null>(null);
  const [isDragging, setIsDragging] = useState<{ type: 'audio' | 'layer' | 'audio-edge' | 'layer-edge' | 'text' | 'text-edge' | 'segment' | 'segment-edge', id: string, edge?: 'start' | 'end' } | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(1); // 1 = normal, 2 = 2x zoom, etc.

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Magnetic snapping helper
  const applySnapping = (targetTime: number): number => {
    const snapPoints: number[] = [
      trimStart,
      trimEnd,
      ...audioTracks.map(t => t.startTime),
      ...audioTracks.map(t => t.startTime + t.duration),
      ...layers.map(l => l.startTime),
      ...layers.map(l => l.startTime + l.duration),
      ...textOverlays.map(t => t.startTime),
      ...textOverlays.map(t => t.endTime),
      ...subtitles.map(s => s.start),
      ...subtitles.map(s => s.end),
      ...videoSegments.map(s => s.startTime),
      ...videoSegments.map(s => s.startTime + s.duration),
    ];

    for (const snapPoint of snapPoints) {
      if (Math.abs(targetTime - snapPoint) < SNAP_THRESHOLD) {
        return snapPoint;
      }
    }

    return targetTime;
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
    if (!isTrimming && !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      if (isTrimming) {
        if (isTrimming === 'start') {
          onTrimChange(Math.min(newTime, trimEnd - 0.5), trimEnd);
        } else {
          onTrimChange(trimStart, Math.max(newTime, trimStart + 0.5));
        }
      } else if (isDragging) {
        if (isDragging.type === 'audio') {
          const track = audioTracks.find(t => t.id === isDragging.id);
          if (track) {
            const snappedTime = applySnapping(newTime);
            const clampedTime = Math.max(0, Math.min(duration - track.duration, snappedTime));
            onAudioTimeChange(isDragging.id, clampedTime, track.duration);
          }
        } else if (isDragging.type === 'layer') {
          const layer = layers.find(l => l.id === isDragging.id);
          if (layer) {
            const snappedTime = applySnapping(newTime);
            const clampedTime = Math.max(0, Math.min(duration - layer.duration, snappedTime));
            onLayerTimeChange(isDragging.id, clampedTime, layer.duration);
          }
        } else if (isDragging.type === 'segment') {
          const segment = videoSegments.find(s => s.id === isDragging.id);
          if (segment) {
            const snappedTime = applySnapping(newTime);
            const clampedTime = Math.max(0, Math.min(duration - segment.duration, snappedTime));
            onVideoSegmentTimeChange(isDragging.id, clampedTime, segment.duration);
          }
        } else if (isDragging.type === 'text') {
          const text = textOverlays.find(t => t.id === isDragging.id);
          if (text) {
            const textDuration = text.endTime - text.startTime;
            const snappedTime = applySnapping(newTime);
            const clampedTime = Math.max(0, Math.min(duration - textDuration, snappedTime));
            onTextOverlayTimeChange(isDragging.id, clampedTime, clampedTime + textDuration);
          }
        } else if (isDragging.type === 'audio-edge') {
          const track = audioTracks.find(t => t.id === isDragging.id);
          if (track) {
            if (isDragging.edge === 'start') {
              const maxStart = track.startTime + track.duration - 0.5;
              const newStart = Math.max(0, Math.min(maxStart, newTime));
              const newDuration = track.duration + (track.startTime - newStart);
              onAudioTimeChange(isDragging.id, newStart, newDuration);
            } else {
              const minDuration = 0.5;
              const newDuration = Math.max(minDuration, newTime - track.startTime);
              onAudioTimeChange(isDragging.id, track.startTime, newDuration);
            }
          }
        } else if (isDragging.type === 'layer-edge') {
          const layer = layers.find(l => l.id === isDragging.id);
          if (layer) {
            if (isDragging.edge === 'start') {
              const maxStart = layer.startTime + layer.duration - 0.5;
              const snappedTime = applySnapping(newTime);
              const newStart = Math.max(0, Math.min(maxStart, snappedTime));
              const newDuration = layer.duration + (layer.startTime - newStart);
              onLayerTimeChange(isDragging.id, newStart, newDuration);
            } else {
              const minDuration = 0.5;
              const snappedTime = applySnapping(newTime);
              const newDuration = Math.max(minDuration, snappedTime - layer.startTime);
              onLayerTimeChange(isDragging.id, layer.startTime, newDuration);
            }
          }
        } else if (isDragging.type === 'text-edge') {
          const text = textOverlays.find(t => t.id === isDragging.id);
          if (text) {
            if (isDragging.edge === 'start') {
              const maxStart = text.endTime - 0.5;
              const snappedTime = applySnapping(newTime);
              const newStart = Math.max(0, Math.min(maxStart, snappedTime));
              onTextOverlayTimeChange(isDragging.id, newStart, text.endTime);
            } else {
              const minEnd = text.startTime + 0.5;
              const snappedTime = applySnapping(newTime);
              const newEnd = Math.max(minEnd, snappedTime);
              onTextOverlayTimeChange(isDragging.id, text.startTime, newEnd);
            }
          }
        } else if (isDragging.type === 'segment-edge') {
          const segment = videoSegments.find(s => s.id === isDragging.id);
          if (segment) {
            if (isDragging.edge === 'start') {
              const maxStart = segment.startTime + segment.duration - 0.5;
              const snappedTime = applySnapping(newTime);
              const newStart = Math.max(0, Math.min(maxStart, snappedTime));
              const newDuration = segment.duration + (segment.startTime - newStart);
              onVideoSegmentTimeChange(isDragging.id, newStart, newDuration);
            } else {
              const minDuration = 0.5;
              const snappedTime = applySnapping(newTime);
              const newDuration = Math.max(minDuration, snappedTime - segment.startTime);
              onVideoSegmentTimeChange(isDragging.id, segment.startTime, newDuration);
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsTrimming(null);
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTrimming, isDragging, duration, trimStart, trimEnd, audioTracks, layers, textOverlays, videoSegments, onTrimChange, onAudioTimeChange, onLayerTimeChange, onTextOverlayTimeChange, onVideoSegmentTimeChange]);

  // Keyboard shortcut for split
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onVideoSplit(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, onVideoSplit]);

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

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 font-semibold"
          onClick={() => onVideoSplit(currentTime)}
          title="Couper la vidéo (S)"
        >
          ✂️ Split
        </Button>

        <div className="text-sm font-mono tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1" />

        {/* Timeline Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))}
            title="Dézoomer (Ctrl+-)"
          >
            −
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(timelineZoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setTimelineZoom(Math.min(4, timelineZoom + 0.25))}
            title="Zoomer (Ctrl++)"
          >
            +
          </Button>
        </div>

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
            {videoSegments.length > 0 && (
              <span className="text-[10px] text-accent">
                {videoSegments.length} segments
              </span>
            )}
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

            {/* Timeline Markers */}
            {markers.map((marker) => {
              const markerPercentage = duration > 0 ? (marker.time / duration) * 100 : 0;
              
              return (
                <div
                  key={marker.id}
                  className="absolute inset-y-0 w-0.5 cursor-pointer group/marker z-10"
                  style={{
                    left: `${markerPercentage}%`,
                    backgroundColor: marker.color
                  }}
                  title={`${marker.label} (${formatTime(marker.time)})`}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                    <div className="px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-lg whitespace-nowrap border border-border">
                      {marker.label}
                    </div>
                  </div>
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: marker.color }}
                  />
                </div>
              );
            })}

            {/* Video Segments (if split) */}
            {videoSegments.map((segment, index) => {
              const segStartPercentage = duration > 0 ? (segment.startTime / duration) * 100 : 0;
              const segWidthPercentage = duration > 0 ? (segment.duration / duration) * 100 : 0;
              
              return (
                <div
                  key={segment.id}
                  className="absolute inset-y-0 bg-accent/40 border-l-2 border-r-2 border-accent rounded cursor-move group/segment hover:bg-accent/50 transition-all"
                  style={{
                    left: `${segStartPercentage}%`,
                    width: `${segWidthPercentage}%`
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const isNearStart = mouseX < 10;
                    const isNearEnd = mouseX > rect.width - 10;
                    
                    if (isNearStart) {
                      setIsDragging({ type: 'segment-edge', id: segment.id, edge: 'start' });
                    } else if (isNearEnd) {
                      setIsDragging({ type: 'segment-edge', id: segment.id, edge: 'end' });
                    } else {
                      setIsDragging({ type: 'segment', id: segment.id });
                    }
                  }}
                >
                  {/* Start edge handle */}
                  <div className="absolute left-0 inset-y-0 w-2 bg-accent cursor-ew-resize opacity-0 group-hover/segment:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent-foreground pointer-events-none">
                    Seg {index + 1}
                  </div>
                  
                  {/* End edge handle */}
                  <div className="absolute right-0 inset-y-0 w-2 bg-accent cursor-ew-resize opacity-0 group-hover/segment:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                  </div>
                  
                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive/90 hover:bg-destructive opacity-0 group-hover/segment:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoSegmentRemove(segment.id);
                    }}
                  >
                    <X className="w-2.5 h-2.5 text-destructive-foreground" />
                  </Button>
                </div>
              );
            })}

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
                       className="absolute inset-y-0 bg-emerald-500/30 border-l-2 border-r-2 border-emerald-500 rounded flex items-center justify-center cursor-move group/audio hover:bg-emerald-500/40 transition-colors"
                       style={{
                         left: `${trackStartPercentage}%`,
                         width: `${trackWidthPercentage}%`
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         const rect = e.currentTarget.getBoundingClientRect();
                         const mouseX = e.clientX - rect.left;
                         const isNearStart = mouseX < 10;
                         const isNearEnd = mouseX > rect.width - 10;
                         
                         if (isNearStart) {
                           setIsDragging({ type: 'audio-edge', id: track.id, edge: 'start' });
                         } else if (isNearEnd) {
                           setIsDragging({ type: 'audio-edge', id: track.id, edge: 'end' });
                         } else {
                           setIsDragging({ type: 'audio', id: track.id });
                         }
                       }}
                     >
                       {/* Start edge handle */}
                       <div className="absolute left-0 inset-y-0 w-2 bg-emerald-600 cursor-ew-resize opacity-0 group-hover/audio:opacity-100 transition-opacity hover:bg-emerald-500">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                       </div>
                       
                       <div className="text-[10px] font-medium text-emerald-300 truncate px-2 pointer-events-none">
                         {track.name}
                       </div>
                       
                       {/* Simulated waveform */}
                       <div className="absolute inset-0 flex items-center gap-[2px] px-1 opacity-50 pointer-events-none">
                         {Array.from({ length: 40 }).map((_, i) => (
                           <div
                             key={i}
                             className="flex-1 bg-emerald-400 rounded-full"
                             style={{ height: `${20 + Math.random() * 60}%` }}
                           />
                         ))}
                       </div>
                       
                       {/* End edge handle */}
                       <div className="absolute right-0 inset-y-0 w-2 bg-emerald-600 cursor-ew-resize opacity-0 group-hover/audio:opacity-100 transition-opacity hover:bg-emerald-500">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
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
            {layers.map((layer) => {
              const layerStartPercentage = duration > 0 ? (layer.startTime / duration) * 100 : 0;
              const layerWidthPercentage = duration > 0 ? (layer.duration / duration) * 100 : 100;
              
              return (
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
                    {/* Layer visual representation */}
                    <div
                      className={`absolute inset-y-0 ${
                        layer.visible ? "bg-purple-500/30 border-2 border-purple-500" : "bg-muted/50 border-2 border-muted"
                      } rounded flex items-center justify-center cursor-move group/layer hover:bg-purple-500/40 transition-colors`}
                      style={{
                        left: `${layerStartPercentage}%`,
                        width: `${layerWidthPercentage}%`
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const isNearStart = mouseX < 10;
                        const isNearEnd = mouseX > rect.width - 10;
                        
                        if (isNearStart) {
                          setIsDragging({ type: 'layer-edge', id: layer.id, edge: 'start' });
                        } else if (isNearEnd) {
                          setIsDragging({ type: 'layer-edge', id: layer.id, edge: 'end' });
                        } else {
                          setIsDragging({ type: 'layer', id: layer.id });
                        }
                      }}
                    >
                      {/* Start edge handle */}
                      <div className={`absolute left-0 inset-y-0 w-2 ${
                        layer.visible ? "bg-purple-600" : "bg-muted"
                      } cursor-ew-resize opacity-0 group-hover/layer:opacity-100 transition-opacity hover:bg-purple-500`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                      </div>
                      
                      {/* Layer thumbnail and name */}
                      <div className="flex items-center gap-2 px-2 pointer-events-none">
                        {layer.url && (layer.type === 'image' || layer.type === 'overlay') && (
                          <img 
                            src={layer.url} 
                            alt={layer.name}
                            className="h-8 w-8 object-cover rounded border border-purple-400 shrink-0"
                          />
                        )}
                        <div className={`text-[10px] font-medium ${
                          layer.visible ? "text-purple-300" : "text-muted-foreground"
                        } truncate`}>
                          {layer.name}
                        </div>
                      </div>
                      
                      {/* End edge handle */}
                      <div className={`absolute right-0 inset-y-0 w-2 ${
                        layer.visible ? "bg-purple-600" : "bg-muted"
                      } cursor-ew-resize opacity-0 group-hover/layer:opacity-100 transition-opacity hover:bg-purple-500`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Text Overlays Tracks */}
        {textOverlays.length > 0 && (
          <div className="space-y-2">
            {textOverlays.map((text) => {
              const textStartPercentage = duration > 0 ? (text.startTime / duration) * 100 : 0;
              const textDuration = text.endTime - text.startTime;
              const textWidthPercentage = duration > 0 ? (textDuration / duration) * 100 : 0;
              
              return (
                <div key={text.id}>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      💬 {text.text.substring(0, 30)}{text.text.length > 30 ? '...' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">{text.animation}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onTextOverlayRemove(text.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-cyan-500/30 border-2 border-cyan-500 rounded flex items-center justify-center cursor-move group/text hover:bg-cyan-500/40 transition-colors"
                      style={{
                        left: `${textStartPercentage}%`,
                        width: `${textWidthPercentage}%`
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const isNearStart = mouseX < 10;
                        const isNearEnd = mouseX > rect.width - 10;
                        
                        if (isNearStart) {
                          setIsDragging({ type: 'text-edge', id: text.id, edge: 'start' });
                        } else if (isNearEnd) {
                          setIsDragging({ type: 'text-edge', id: text.id, edge: 'end' });
                        } else {
                          setIsDragging({ type: 'text', id: text.id });
                        }
                      }}
                    >
                      <div className="absolute left-0 inset-y-0 w-2 bg-cyan-600 cursor-ew-resize opacity-0 group-hover/text:opacity-100 transition-opacity hover:bg-cyan-500">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                      </div>
                      
                      <div className="text-[10px] font-medium text-cyan-300 truncate px-2 pointer-events-none">
                        {text.text}
                      </div>
                      
                      <div className="absolute right-0 inset-y-0 w-2 bg-cyan-600 cursor-ew-resize opacity-0 group-hover/text:opacity-100 transition-opacity hover:bg-cyan-500">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-background rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subtitles Track (Read-only visualization) */}
        {subtitles.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <span className="font-medium">📝 Sous-titres originaux</span>
              <span className="text-[10px]">{subtitles.length} segments</span>
            </div>
            <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
              {subtitles.map((subtitle, index) => {
                const subStartPercentage = duration > 0 ? (subtitle.start / duration) * 100 : 0;
                const subDuration = subtitle.end - subtitle.start;
                const subWidthPercentage = duration > 0 ? (subDuration / duration) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-y-0 bg-yellow-500/30 border border-yellow-500/50 rounded-sm"
                    style={{
                      left: `${subStartPercentage}%`,
                      width: `${subWidthPercentage}%`
                    }}
                    title={subtitle.text}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Translated Subtitles Tracks */}
        {Object.keys(translatedSubtitles).length > 0 && (
          <div className="space-y-2">
            {Object.entries(translatedSubtitles).map(([langCode, subs]) => {
              const LANGUAGE_NAMES: Record<string, { name: string; flag: string }> = {
                fr: { name: 'Français', flag: '🇫🇷' },
                es: { name: 'Espagnol', flag: '🇪🇸' },
                de: { name: 'Allemand', flag: '🇩🇪' },
                it: { name: 'Italien', flag: '🇮🇹' },
                pt: { name: 'Portugais', flag: '🇵🇹' },
                ja: { name: 'Japonais', flag: '🇯🇵' },
                ko: { name: 'Coréen', flag: '🇰🇷' },
                zh: { name: 'Chinois', flag: '🇨🇳' },
                ar: { name: 'Arabe', flag: '🇸🇦' },
                ru: { name: 'Russe', flag: '🇷🇺' },
                hi: { name: 'Hindi', flag: '🇮🇳' },
                en: { name: 'Anglais', flag: '🇬🇧' },
              };
              
              const lang = LANGUAGE_NAMES[langCode] || { name: langCode, flag: '🌐' };
              
              return (
                <div key={langCode}>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                    <span className="font-medium">{lang.flag} Sous-titres {lang.name}</span>
                    <span className="text-[10px]">{subs.length} segments</span>
                  </div>
                  <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
                    {subs.map((subtitle, index) => {
                      const subStartPercentage = duration > 0 ? (subtitle.start / duration) * 100 : 0;
                      const subDuration = subtitle.end - subtitle.start;
                      const subWidthPercentage = duration > 0 ? (subDuration / duration) * 100 : 0;
                      
                      return (
                        <div
                          key={index}
                          className="absolute inset-y-0 bg-blue-500/30 border border-blue-500/50 rounded-sm"
                          style={{
                            left: `${subStartPercentage}%`,
                            width: `${subWidthPercentage}%`
                          }}
                          title={subtitle.text}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Espace</kbd> Play/Pause •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">←</kbd>
        <kbd className="px-1.5 py-0.5 bg-muted rounded">→</kbd> ±5s •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">S</kbd> Split •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+I</kbd> Point d'entrée •{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+O</kbd> Point de sortie
      </div>
    </Card>
  );
};