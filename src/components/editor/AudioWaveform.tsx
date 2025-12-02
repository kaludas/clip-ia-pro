import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  videoUrl: string;
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  height?: number;
}

export const AudioWaveform = ({
  videoUrl,
  duration,
  currentTime,
  trimStart,
  trimEnd,
  height = 60
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);

  // Update canvas width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Extract audio waveform from video
  useEffect(() => {
    if (!videoUrl) return;

    const extractWaveform = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(videoUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get raw PCM data from the first channel
        const rawData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of bars to display
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData: number[] = [];
        
        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j] || 0);
          }
          filteredData.push(sum / blockSize);
        }
        
        // Normalize the data
        const maxValue = Math.max(...filteredData);
        const normalizedData = maxValue > 0 ? filteredData.map(d => d / maxValue) : filteredData;
        
        setWaveformData(normalizedData);
        audioContext.close();
      } catch (error) {
        console.error('Error extracting waveform:', error);
        // Generate placeholder waveform on error
        const placeholderData = Array.from({ length: 200 }, () => Math.random() * 0.5 + 0.2);
        setWaveformData(placeholderData);
      } finally {
        setIsLoading(false);
      }
    };

    extractWaveform();
  }, [videoUrl]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, height);

    const barWidth = canvasWidth / waveformData.length;
    const trimStartPercent = duration > 0 ? trimStart / duration : 0;
    const trimEndPercent = duration > 0 ? trimEnd / duration : 1;
    const currentPercent = duration > 0 ? currentTime / duration : 0;

    // Draw each bar
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height - 8);
      const y = (height - barHeight) / 2;
      const percent = index / waveformData.length;
      
      // Determine color based on position
      let color: string;
      if (percent < trimStartPercent || percent > trimEndPercent) {
        // Outside trim region
        color = 'rgba(128, 128, 128, 0.3)';
      } else if (percent < currentPercent) {
        // Played portion
        color = 'hsl(var(--primary))';
      } else {
        // Upcoming portion
        color = 'hsl(var(--primary) / 0.4)';
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw playhead
    const playheadX = currentPercent * canvasWidth;
    ctx.fillStyle = 'hsl(var(--accent))';
    ctx.fillRect(playheadX - 1, 0, 2, height);

  }, [waveformData, canvasWidth, height, currentTime, duration, trimStart, trimEnd]);

  if (isLoading) {
    return (
      <div 
        ref={containerRef}
        className="w-full bg-muted/30 rounded flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-xs text-muted-foreground animate-pulse">
          Analyse audio...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        className="rounded cursor-pointer"
      />
    </div>
  );
};
