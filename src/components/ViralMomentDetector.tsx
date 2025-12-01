import { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles, Play, Scissors, TrendingUp, Clock, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface ViralMoment {
  start: number;
  end: number;
  reason: string;
  hook: string;
  score: number;
  tags: string[];
}

interface ViralMomentDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onMomentSelect: (start: number, end: number) => void;
}

export const ViralMomentDetector = ({ videoRef, onMomentSelect }: ViralMomentDetectorProps) => {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moments, setMoments] = useState<ViralMoment[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const captureFrames = async (video: HTMLVideoElement): Promise<string[]> => {
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return frames;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const duration = video.duration;
    const frameCount = 10;
    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      const time = i * interval;
      video.currentTime = time;
      
      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.7);
      frames.push(frameData);
      
      setAnalysisProgress(((i + 1) / frameCount) * 50);
    }

    return frames;
  };

  const analyzeVideo = async () => {
    if (!videoRef.current) {
      toast.error(t("editor.noVideo"));
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      toast.info(language === "fr" ? "🎬 Capture des frames..." : "🎬 Capturing frames...");
      
      const frames = await captureFrames(videoRef.current);
      const duration = videoRef.current.duration;

      setAnalysisProgress(60);
      toast.info(language === "fr" ? "🤖 Analyse IA en cours..." : "🤖 AI analysis in progress...");

      const { data, error } = await supabase.functions.invoke('detect-viral-moments', {
        body: { frames, duration, language }
      });

      if (error) throw error;

      setAnalysisProgress(100);
      setMoments(data.moments);
      
      toast.success(
        language === "fr" 
          ? `✨ ${data.moments.length} moments viraux détectés !` 
          : `✨ ${data.moments.length} viral moments detected!`
      );
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(language === "fr" ? "Erreur lors de l'analyse" : "Analysis error");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className="space-y-6">
      {/* Analyze Button */}
      <div className="text-center">
        <Button
          onClick={analyzeVideo}
          disabled={isAnalyzing}
          className="gap-2 px-8 py-6 text-lg"
          variant="hero"
        >
          <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing 
            ? (language === "fr" ? "Analyse en cours..." : "Analyzing...") 
            : (language === "fr" ? "🎯 Détecter les Moments Viraux" : "🎯 Detect Viral Moments")
          }
        </Button>
        
        {isAnalyzing && (
          <div className="mt-4 max-w-md mx-auto space-y-2">
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {language === "fr" 
                ? `Analyse en cours... ${Math.round(analysisProgress)}%` 
                : `Analyzing... ${Math.round(analysisProgress)}%`
              }
            </p>
          </div>
        )}
      </div>

      {/* Detected Moments */}
      {moments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">
              {language === "fr" 
                ? `${moments.length} Moments Viraux Détectés` 
                : `${moments.length} Viral Moments Detected`
              }
            </h3>
          </div>

          <div className="grid gap-4">
            {moments.map((moment, idx) => (
              <Card key={idx} className="glass-hover p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(moment.start)} - {formatTime(moment.end)}
                      </Badge>
                      <Badge className={`gap-1 ${getScoreColor(moment.score)}`}>
                        <TrendingUp className="w-3 h-3" />
                        {moment.score}/100
                      </Badge>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{moment.hook}</h4>
                    <p className="text-sm text-muted-foreground">{moment.reason}</p>
                  </div>
                </div>

                {/* Tags */}
                {moment.tags && moment.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {moment.tags.map((tag, tagIdx) => (
                      <Badge key={tagIdx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="hero"
                    className="flex-1 gap-2"
                    onClick={() => {
                      onMomentSelect(moment.start, moment.end);
                      toast.success(
                        language === "fr" 
                          ? "✂️ Moment sélectionné pour l'édition" 
                          : "✂️ Moment selected for editing"
                      );
                    }}
                  >
                    <Scissors className="w-4 h-4" />
                    {language === "fr" ? "Créer ce Short" : "Create this Short"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = moment.start;
                      }
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && moments.length === 0 && (
        <div className="text-center py-12 glass rounded-3xl">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "fr" 
              ? "Lancez l'analyse pour détecter automatiquement les moments viraux de votre vidéo" 
              : "Start the analysis to automatically detect viral moments in your video"
            }
          </p>
        </div>
      )}
    </div>
  );
};
