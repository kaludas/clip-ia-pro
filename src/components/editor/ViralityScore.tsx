import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Sparkles, ThumbsUp, ThumbsDown, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface ViralityAnalysis {
  score: number;
  category: "high" | "medium" | "low";
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface ViralityScoreProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  existingAnalysis?: ViralityAnalysis | null;
  onAnalysisComplete?: (analysis: ViralityAnalysis) => void;
}

export const ViralityScore = ({ videoRef, existingAnalysis, onAnalysisComplete }: ViralityScoreProps) => {
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ViralityAnalysis | null>(existingAnalysis || null);

  // Sync with existing analysis
  useEffect(() => {
    if (existingAnalysis && !analysis) {
      setAnalysis(existingAnalysis);
    }
  }, [existingAnalysis]);

  const captureCurrentFrame = async (): Promise<string> => {
    const video = videoRef.current;
    if (!video) throw new Error("No video");

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No canvas context");

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const analyzeVirality = async () => {
    if (!videoRef.current) {
      toast.error(language === "fr" ? "Aucune vidéo chargée" : "No video loaded");
      return;
    }

    setIsAnalyzing(true);

    try {
      const frameData = await captureCurrentFrame();
      const duration = videoRef.current.duration;
      
      toast.info(language === "fr" ? "🎯 Analyse du potentiel viral..." : "🎯 Analyzing viral potential...");

      const { data, error } = await supabase.functions.invoke('virality-score', {
        body: { frameData, duration, language }
      });

      if (error) throw error;

      setAnalysis(data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
      
      const emoji = data.score >= 70 ? "🔥" : data.score >= 50 ? "👍" : "💡";
      toast.success(
        language === "fr"
          ? `${emoji} Score viral: ${data.score}/100`
          : `${emoji} Viral score: ${data.score}/100`
      );
    } catch (error) {
      console.error('Virality analysis error:', error);
      toast.error(language === "fr" ? "Erreur d'analyse" : "Analysis error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-500";
    if (score >= 50) return "from-yellow-500 to-orange-500";
    return "from-orange-500 to-red-500";
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      high: "bg-green-500/20 text-green-500",
      medium: "bg-yellow-500/20 text-yellow-500",
      low: "bg-orange-500/20 text-orange-500"
    };
    return colors[category as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {language === "fr" ? "Score de Viralité IA" : "AI Virality Score"}
          </CardTitle>
          <CardDescription>
            {language === "fr" 
              ? "Évaluez le potentiel viral de votre contenu en temps réel" 
              : "Evaluate your content's viral potential in real-time"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={analyzeVirality}
            disabled={isAnalyzing}
            variant="hero"
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "fr" ? "Analyse..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {language === "fr" ? "Calculer le score viral" : "Calculate Viral Score"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Score Display */}
          <Card className={`glass border-2 bg-gradient-to-br ${getScoreGradient(analysis.score)} border-transparent`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className={`text-7xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </div>
                  <div className="text-2xl text-white/80">/100</div>
                </div>
                
                <Badge className={`${getCategoryBadge(analysis.category)} text-lg px-4 py-1`}>
                  {language === "fr" 
                    ? analysis.category === "high" ? "Haut" : analysis.category === "medium" ? "Moyen" : "Faible"
                    : analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)
                  }
                </Badge>

                <Progress value={analysis.score} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card className="glass border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-500">
                  <ThumbsUp className="w-4 h-4" />
                  {language === "fr" ? "Points Forts" : "Strengths"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses && analysis.weaknesses.length > 0 && (
            <Card className="glass border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-orange-500">
                  <ThumbsDown className="w-4 h-4" />
                  {language === "fr" ? "Points à Améliorer" : "Weaknesses"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 mt-0.5">⚠</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  {language === "fr" ? "💡 Suggestions d'Amélioration" : "💡 Improvement Suggestions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <Card className="glass-hover border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Calculez le potentiel viral de votre clip"
                : "Calculate your clip's viral potential"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};