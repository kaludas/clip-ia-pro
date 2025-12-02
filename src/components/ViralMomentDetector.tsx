import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Sparkles, Play, Scissors, TrendingUp, Clock, Tag, Filter, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

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
  existingMoments?: ViralMoment[];
  onMomentsUpdate?: (moments: ViralMoment[]) => void;
}

export const ViralMomentDetector = ({ videoRef, onMomentSelect, existingMoments = [], onMomentsUpdate }: ViralMomentDetectorProps) => {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moments, setMoments] = useState<ViralMoment[]>(existingMoments);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Filters
  const [minScore, setMinScore] = useState(0);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(120);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Sync with existing moments from parent
  useEffect(() => {
    if (existingMoments.length > 0 && moments.length === 0) {
      setMoments(existingMoments);
    }
  }, [existingMoments]);

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
      
      // Notify parent component
      if (onMomentsUpdate) {
        onMomentsUpdate(data.moments);
      }
      
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
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/40";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    return "bg-orange-500/20 text-orange-400 border-orange-500/40";
  };

  // Get all unique tags from moments
  const allTags = Array.from(new Set(moments.flatMap(m => m.tags || [])));

  // Filter moments based on criteria
  const filteredMoments = moments.filter(moment => {
    const duration = moment.end - moment.start;
    const matchesScore = moment.score >= minScore;
    const matchesDuration = duration >= minDuration && duration <= maxDuration;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => moment.tags?.includes(tag));
    return matchesScore && matchesDuration && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setMinScore(0);
    setMinDuration(0);
    setMaxDuration(120);
    setSelectedTags([]);
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                {language === "fr" 
                  ? `${filteredMoments.length}/${moments.length} Moments Viraux` 
                  : `${filteredMoments.length}/${moments.length} Viral Moments`
                }
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {language === "fr" ? "Filtres" : "Filters"}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="glass p-6 space-y-6 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">
                    {language === "fr" ? "Filtres Avancés" : "Advanced Filters"}
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 text-xs"
                >
                  <X className="w-3 h-3" />
                  {language === "fr" ? "Réinitialiser" : "Reset"}
                </Button>
              </div>

              {/* Score Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    {language === "fr" ? "Score Minimum" : "Minimum Score"}
                  </Label>
                  <Badge variant="secondary" className="text-sm font-bold">
                    {minScore}/100
                  </Badge>
                </div>
                <Slider
                  value={[minScore]}
                  onValueChange={(val) => setMinScore(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Duration Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  {language === "fr" ? "Durée (secondes)" : "Duration (seconds)"}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{minDuration}s</span>
                    <span>{maxDuration}s</span>
                  </div>
                  <Slider
                    value={[minDuration, maxDuration]}
                    onValueChange={(val) => {
                      setMinDuration(val[0]);
                      setMaxDuration(val[1]);
                    }}
                    min={0}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    {language === "fr" ? "Tags" : "Tags"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="grid gap-4">
            {filteredMoments.map((moment, idx) => {
              const duration = Math.round(moment.end - moment.start);
              return (
                <Card key={idx} className="glass-hover p-6 space-y-4 border-primary/10 bg-card/50 backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30 font-semibold">
                          <Clock className="w-3 h-3" />
                          {formatTime(moment.start)} - {formatTime(moment.end)}
                        </Badge>
                        <Badge className={`gap-1 border font-bold ${getScoreColor(moment.score)}`}>
                          <TrendingUp className="w-3 h-3" />
                          {moment.score}/100
                        </Badge>
                        <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent-foreground">
                          ⏱️ {duration}s
                        </Badge>
                      </div>
                      <h4 className="font-bold text-xl mb-3 text-foreground leading-tight">{moment.hook}</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{moment.reason}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {moment.tags && moment.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/50">
                      <Tag className="w-4 h-4 text-primary" />
                      {moment.tags.map((tag, tagIdx) => (
                        <Badge key={tagIdx} variant="secondary" className="text-xs bg-secondary/80 text-secondary-foreground hover:bg-secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="hero"
                      className="flex-1 gap-2 font-semibold"
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
                      className="border-primary/30 hover:bg-primary/20"
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
              );
            })}
          </div>
        </div>
      )}

      {/* No Results After Filtering */}
      {!isAnalyzing && moments.length > 0 && filteredMoments.length === 0 && (
        <div className="text-center py-12 glass rounded-3xl border-primary/10">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            {language === "fr" ? "Aucun moment ne correspond aux filtres" : "No moments match the filters"}
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 gap-2">
            <X className="w-4 h-4" />
            {language === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && moments.length === 0 && (
        <div className="text-center py-12 glass rounded-3xl border-primary/10">
          <Sparkles className="w-12 h-12 text-primary/60 mx-auto mb-4" />
          <p className="text-foreground/80">
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
