import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface TimelineProps {
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

export const Timeline = ({
  currentTime,
  duration,
  trimStart,
  trimEnd,
  onSeek,
  onTrimChange,
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isDraggingTrimStart, setIsDraggingTrimStart] = useState(false);
  const [isDraggingTrimEnd, setIsDraggingTrimEnd] = useState(false);

  const getTimeFromPosition = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  const handleMouseDown = (e: React.MouseEvent, type: "playhead" | "trimStart" | "trimEnd") => {
    e.preventDefault();
    if (type === "playhead") setIsDraggingPlayhead(true);
    if (type === "trimStart") setIsDraggingTrimStart(true);
    if (type === "trimEnd") setIsDraggingTrimEnd(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      
      if (isDraggingPlayhead) {
        onSeek(Math.max(trimStart, Math.min(trimEnd, time)));
      } else if (isDraggingTrimStart) {
        onTrimChange(Math.max(0, Math.min(time, trimEnd - 0.1)), trimEnd);
      } else if (isDraggingTrimEnd) {
        onTrimChange(trimStart, Math.min(duration, Math.max(time, trimStart + 0.1)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setIsDraggingTrimStart(false);
      setIsDraggingTrimEnd(false);
    };

    if (isDraggingPlayhead || isDraggingTrimStart || isDraggingTrimEnd) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, isDraggingTrimStart, isDraggingTrimEnd, trimStart, trimEnd, duration, onSeek, onTrimChange]);

  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPosition = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimEndPosition = duration > 0 ? (trimEnd / duration) * 100 : 100;

  return (
    <div className="space-y-2">
      <div
        ref={timelineRef}
        className="relative h-12 glass rounded-xl cursor-pointer overflow-hidden"
        onClick={(e) => {
          const time = getTimeFromPosition(e.clientX);
          onSeek(Math.max(trimStart, Math.min(trimEnd, time)));
        }}
      >
        {/* Timeline track */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
        
        {/* Trim region highlight */}
        <div
          className="absolute top-0 bottom-0 bg-primary/30 border-l-2 border-r-2 border-primary"
          style={{
            left: `${trimStartPosition}%`,
            width: `${trimEndPosition - trimStartPosition}%`,
          }}
        />
        
        {/* Trim start handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-primary hover:bg-primary/80 cursor-ew-resize z-10 transition-colors"
          style={{ left: `${trimStartPosition}%` }}
          onMouseDown={(e) => handleMouseDown(e, "trimStart")}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-background" />
        </div>
        
        {/* Trim end handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-primary hover:bg-primary/80 cursor-ew-resize z-10 transition-colors"
          style={{ left: `${trimEndPosition}%`, transform: "translateX(-100%)" }}
          onMouseDown={(e) => handleMouseDown(e, "trimEnd")}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-background" />
        </div>
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-glow z-20 cursor-ew-resize"
          style={{ left: `${playheadPosition}%` }}
          onMouseDown={(e) => handleMouseDown(e, "playhead")}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-lg" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-lg" />
        </div>
        
        {/* Time markers */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-xs text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => {
            const time = (duration / 4) * i;
            return (
              <span key={i} className="text-[10px]">
                {Math.floor(time)}s
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
