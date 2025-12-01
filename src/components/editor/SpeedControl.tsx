import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FastForward, Rewind, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SpeedControlProps {
  currentTime: number;
  duration: number;
  onSpeedChange: (startTime: number, endTime: number, speed: number) => void;
}

export const SpeedControl = ({ currentTime, duration, onSpeedChange }: SpeedControlProps) => {
  const { t } = useLanguage();
  const [speed, setSpeed] = useState([100]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [segments, setSegments] = useState<Array<{ start: number; end: number; speed: number }>>([]);

  const handleSetStart = () => {
    setStartTime(currentTime);
  };

  const handleSetEnd = () => {
    setEndTime(currentTime);
  };

  const handleApplySpeed = () => {
    if (endTime > startTime) {
      const newSegment = { start: startTime, end: endTime, speed: speed[0] };
      setSegments([...segments, newSegment]);
      onSpeedChange(startTime, endTime, speed[0] / 100);
    }
  };

  const getSpeedLabel = (speedValue: number) => {
    if (speedValue < 50) return "Slow Motion";
    if (speedValue < 100) return "Ralenti";
    if (speedValue === 100) return "Normal";
    if (speedValue <= 200) return "Accéléré";
    return "Hyper-lapse";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t("editor.speedControl")}</h3>
        
        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("editor.speed")}</span>
            <Badge variant="secondary">{speed[0]}% - {getSpeedLabel(speed[0])}</Badge>
          </div>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={25}
            max={400}
            step={25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.25x</span>
            <span>1x</span>
            <span>4x</span>
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("editor.startTime")}</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetStart}
              className="w-full gap-2"
            >
              <Play className="w-3 h-3" />
              {startTime.toFixed(1)}s
            </Button>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("editor.endTime")}</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetEnd}
              className="w-full gap-2"
            >
              <Play className="w-3 h-3" />
              {endTime.toFixed(1)}s
            </Button>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={handleApplySpeed}
          disabled={endTime <= startTime}
          className="w-full gap-2"
          variant="hero"
        >
          {speed[0] < 100 ? <Rewind className="w-4 h-4" /> : <FastForward className="w-4 h-4" />}
          {t("editor.applySpeed")}
        </Button>
      </div>

      {/* Applied Segments */}
      {segments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">{t("editor.appliedEffects")}</h4>
          <div className="space-y-1">
            {segments.map((segment, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 glass rounded-lg text-xs"
              >
                <span>{segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s</span>
                <Badge variant="secondary" className="text-xs">
                  {segment.speed}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
