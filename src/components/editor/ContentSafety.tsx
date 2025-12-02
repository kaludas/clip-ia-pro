import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  TrendingDown,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Violation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp?: number;
  description: string;
  suggestion: string;
}

interface Moderation {
  is_safe: boolean;
  risk_level: "safe" | "low" | "medium" | "high" | "critical";
  violations: Violation[];
  platform_specific: string[];
  monetization_impact: boolean;
  recommendations: string[];
  confidence: number;
}

interface ContentSafetyProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const ContentSafety = ({ videoRef }: ContentSafetyProps) => {
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moderation, setModeration] = useState<Moderation | null>(null);
  const [platform, setPlatform] = useState<"tiktok" | "youtube" | "instagram" | "twitter">("tiktok");

  const captureFrames = async (): Promise<string[]> => {
    const video = videoRef.current;
    if (!video) throw new Error("No video");

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No canvas context");

    const frames: string[] = [];
    const frameCount = 3;
    const interval = video.duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = i * interval;
      await new Promise(resolve => { video.onseeked = resolve; });
      ctx.drawImage(video, 0, 0);
      frames.push(canvas.toDataURL('image/jpeg', 0.7));
    }

    return frames;
  };

  const analyzeContent = async () => {
    if (!videoRef.current) {
      toast.error(language === "fr" ? "Aucune vidéo chargée" : "No video loaded");
      return;
    }

    setIsAnalyzing(true);

    try {
      toast.info(language === "fr" ? "🛡️ Analyse de sécurité..." : "🛡️ Safety analysis...");

      const videoFrames = await captureFrames();
      const transcript = ""; // TODO: Integrate with subtitle generator

      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: { transcript, videoFrames, platform }
      });

      if (error) throw error;

      setModeration(data.moderation);
      
      if (data.moderation.is_safe) {
        toast.success(language === "fr" ? "✅ Contenu sûr" : "✅ Content safe");
      } else {
        toast.warning(
          language === "fr" 
            ? `⚠️ ${data.moderation.violations.length} problèmes détectés` 
            : `⚠️ ${data.moderation.violations.length} issues detected`
        );
      }
    } catch (error) {
      console.error('Moderation error:', error);
      toast.error(language === "fr" ? "Erreur d'analyse" : "Analysis error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return "text-green-500";
      case "low": return "text-blue-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "safe": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "low": return <Info className="w-5 h-5 text-blue-500" />;
      case "medium": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "high": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "critical": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    if (severity === "critical" || severity === "high") return "destructive";
    if (severity === "medium") return "default";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {language === "fr" ? "Sécurité & Conformité" : "Safety & Compliance"}
          </CardTitle>
          <CardDescription>
            {language === "fr" 
              ? "Vérifiez la conformité de votre contenu avec les guidelines des plateformes" 
              : "Check your content compliance with platform guidelines"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "fr" ? "Plateforme cible" : "Target platform"}
            </label>
            <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube Shorts</SelectItem>
                <SelectItem value="instagram">Instagram Reels</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={analyzeContent}
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
                <Shield className="w-4 h-4" />
                {language === "fr" ? "Analyser le contenu" : "Analyze Content"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {moderation && (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {/* Risk Level */}
            <Alert className={moderation.is_safe ? "border-green-500/50" : "border-red-500/50"}>
              <div className="flex items-center gap-3">
                {getRiskIcon(moderation.risk_level)}
                <div className="flex-1">
                  <h4 className="font-bold">
                    {language === "fr" ? "Niveau de risque:" : "Risk level:"}{" "}
                    <span className={getRiskColor(moderation.risk_level)}>
                      {moderation.risk_level.toUpperCase()}
                    </span>
                  </h4>
                  <AlertDescription>
                    {language === "fr" ? "Confiance:" : "Confidence:"} {moderation.confidence}%
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Monetization Impact */}
            {moderation.monetization_impact && (
              <Alert variant="destructive">
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  {language === "fr" 
                    ? "⚠️ Ce contenu peut affecter la monétisation" 
                    : "⚠️ This content may affect monetization"
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Violations */}
            {moderation.violations.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === "fr" ? "Problèmes Détectés" : "Detected Issues"} ({moderation.violations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moderation.violations.map((violation, idx) => (
                    <Card key={idx} className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant={getSeverityVariant(violation.severity)}>
                          {violation.severity}
                        </Badge>
                        <div className="flex-1">
                          <h5 className="font-bold">{violation.type}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {violation.description}
                          </p>
                          <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                            <p className="text-sm">
                              <strong>{language === "fr" ? "💡 Solution:" : "💡 Solution:"}</strong> {violation.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Platform Specific */}
            {moderation.platform_specific && moderation.platform_specific.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === "fr" ? `Spécifique ${platform}` : `${platform} Specific`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {moderation.platform_specific.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {moderation.recommendations.length > 0 && (
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base text-primary">
                    {language === "fr" ? "✅ Recommandations" : "✅ Recommendations"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {moderation.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}

      {!moderation && !isAnalyzing && (
        <Card className="glass-hover border-dashed">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Analysez votre contenu pour vérifier sa conformité"
                : "Analyze your content to check compliance"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};