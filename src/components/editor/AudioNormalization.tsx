import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Volume2, Sparkles, Activity, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface AudioAnalysis {
  currentLUFS: number;
  peakLevel: number;
  hasClipping: boolean;
  dynamicRange: number;
  recommendations: {
    gainAdjustment: number;
    compressionRatio: string;
    compressionThreshold: number;
    eqSuggestions: Array<{
      frequency: number;
      gain: number;
      type: string;
    }>;
    limitingCeiling: number;
  };
  warnings: string[];
  quality: "good" | "fair" | "poor";
}

interface AudioNormalizationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onApplyNormalization: (settings: AudioAnalysis) => void;
}

export const AudioNormalization = ({ videoRef, onApplyNormalization }: AudioNormalizationProps) => {
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [targetLUFS, setTargetLUFS] = useState(-14);

  const analyzeAudio = async () => {
    if (!videoRef.current) {
      toast.error(language === "fr" ? "Aucune vidéo chargée" : "No video loaded");
      return;
    }

    setIsAnalyzing(true);

    try {
      toast.info(language === "fr" ? "🎚️ Analyse audio..." : "🎚️ Analyzing audio...");

      // Simulate audio data extraction (in production, use Web Audio API)
      const audioData = "simulated_audio_data";

      const { data, error } = await supabase.functions.invoke('audio-normalization', {
        body: { audioData, targetLUFS }
      });

      if (error) throw error;

      setAnalysis(data);

      const qualityEmoji = data.quality === "good" ? "✅" : data.quality === "fair" ? "⚠️" : "❌";
      toast.success(
        language === "fr"
          ? `${qualityEmoji} Analyse terminée - Qualité: ${data.quality}`
          : `${qualityEmoji} Analysis complete - Quality: ${data.quality}`
      );
    } catch (error) {
      console.error('Audio analysis error:', error);
      toast.error(language === "fr" ? "Erreur d'analyse" : "Analysis error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyNormalization = () => {
    if (!analysis) return;
    
    onApplyNormalization(analysis);
    toast.success(
      language === "fr"
        ? "✨ Normalisation appliquée"
        : "✨ Normalization applied"
    );
  };

  const getQualityColor = (quality: string) => {
    if (quality === "good") return "text-green-500";
    if (quality === "fair") return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityIcon = (quality: string) => {
    if (quality === "good") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (quality === "fair") return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {language === "fr" ? "Normalisation Audio IA" : "AI Audio Normalization"}
          </CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Optimisez automatiquement vos niveaux audio pour les plateformes de streaming"
              : "Automatically optimize your audio levels for streaming platforms"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "fr" ? "Target LUFS" : "Target LUFS"}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="-23"
                max="-5"
                step="1"
                value={targetLUFS}
                onChange={(e) => setTargetLUFS(Number(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline" className="text-sm">
                {targetLUFS} LUFS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "fr"
                ? "Standard: -14 LUFS (Spotify, YouTube), -16 LUFS (Apple Music)"
                : "Standard: -14 LUFS (Spotify, YouTube), -16 LUFS (Apple Music)"
              }
            </p>
          </div>

          <Button
            onClick={analyzeAudio}
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
                {language === "fr" ? "Analyser l'audio" : "Analyze Audio"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Quality Overview */}
          <Card className="glass border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getQualityIcon(analysis.quality)}
                  <div>
                    <h4 className="font-bold">
                      {language === "fr" ? "Qualité Audio" : "Audio Quality"}
                    </h4>
                    <p className={`text-sm font-medium ${getQualityColor(analysis.quality)}`}>
                      {analysis.quality.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button variant="hero" onClick={applyNormalization}>
                  {language === "fr" ? "Appliquer" : "Apply"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">LUFS actuel</p>
                  <p className="text-lg font-bold">{analysis.currentLUFS} LUFS</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Niveau de pic</p>
                  <p className="text-lg font-bold">{analysis.peakLevel} dB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plage dynamique</p>
                  <p className="text-lg font-bold">{analysis.dynamicRange} dB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clipping</p>
                  <p className={`text-lg font-bold ${analysis.hasClipping ? 'text-red-500' : 'text-green-500'}`}>
                    {analysis.hasClipping ? "Oui ⚠️" : "Non ✓"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-base text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {language === "fr" ? "Recommandations" : "Recommendations"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Ajustement gain</p>
                  <p className="font-bold">{analysis.recommendations.gainAdjustment > 0 ? '+' : ''}{analysis.recommendations.gainAdjustment} dB</p>
                </div>
                <div className="glass p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Compression</p>
                  <p className="font-bold">{analysis.recommendations.compressionRatio}</p>
                </div>
                <div className="glass p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Seuil compression</p>
                  <p className="font-bold">{analysis.recommendations.compressionThreshold} dB</p>
                </div>
                <div className="glass p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Plafond limiting</p>
                  <p className="font-bold">{analysis.recommendations.limitingCeiling} dB</p>
                </div>
              </div>

              {analysis.recommendations.eqSuggestions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Égalisation suggérée</h5>
                  <div className="space-y-2">
                    {analysis.recommendations.eqSuggestions.map((eq, idx) => (
                      <div key={idx} className="glass p-2 rounded flex items-center justify-between text-xs">
                        <span>{eq.frequency} Hz - {eq.type}</span>
                        <Badge variant={eq.gain > 0 ? "default" : "secondary"}>
                          {eq.gain > 0 ? '+' : ''}{eq.gain} dB
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warnings */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1 mt-2">
                  {analysis.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <Card className="glass-hover border-dashed">
          <CardContent className="py-12 text-center">
            <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Analysez l'audio pour obtenir des recommandations de normalisation professionnelles"
                : "Analyze audio to get professional normalization recommendations"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};