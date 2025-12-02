import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, AlertTriangle, CheckCircle2, XCircle, 
  Music, FileWarning, Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecurityCheckerProps {
  audioTitle?: string;
  audioArtist?: string;
  audioUrl?: string;
  transcript?: string;
  platform?: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  existingResults?: SecurityCheckResults | null;
  onCheckComplete?: (results: SecurityCheckResults) => void;
}

interface SecurityCheckResults {
  copyrightCheck: {
    is_safe: boolean;
    risk_level: string;
    recommendation: string;
    alternatives?: string[];
  };
  contentModeration: {
    is_safe: boolean;
    risk_level: string;
    violations: any[];
    recommendations: string[];
  };
}

export const SecurityChecker = ({ 
  audioTitle, 
  audioArtist, 
  audioUrl,
  transcript,
  platform = 'tiktok',
  existingResults,
  onCheckComplete 
}: SecurityCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<SecurityCheckResults | null>(existingResults || null);

  // Sync with existing results
  useEffect(() => {
    if (existingResults && !results) {
      setResults(existingResults);
    }
  }, [existingResults]);

  const checkCopyright = async () => {
    if (!audioTitle && !audioArtist && !audioUrl) {
      return { 
        is_safe: true, 
        risk_level: 'safe', 
        recommendation: 'Aucune musique détectée' 
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('copyright-checker', {
        body: { 
          audioTitle: audioTitle || 'Unknown',
          audioArtist: audioArtist || 'Unknown',
          audioUrl: audioUrl 
        }
      });

      if (error) throw error;
      return data.assessment;
    } catch (error) {
      console.error('Copyright check error:', error);
      return { 
        is_safe: false, 
        risk_level: 'unknown', 
        recommendation: 'Impossible de vérifier les droits d\'auteur' 
      };
    }
  };

  const checkContent = async () => {
    if (!transcript) {
      return {
        is_safe: true,
        risk_level: 'safe',
        violations: [],
        recommendations: []
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: { 
          transcript,
          platform 
        }
      });

      if (error) throw error;
      return data.moderation;
    } catch (error) {
      console.error('Content moderation error:', error);
      return {
        is_safe: false,
        risk_level: 'unknown',
        violations: [],
        recommendations: ['Impossible de modérer le contenu']
      };
    }
  };

  const runSecurityChecks = async () => {
    setIsChecking(true);
    try {
      const [copyrightCheck, contentModeration] = await Promise.all([
        checkCopyright(),
        checkContent()
      ]);

      const checkResults = { copyrightCheck, contentModeration };
      setResults(checkResults);

      if (onCheckComplete) {
        onCheckComplete(checkResults);
      }

      if (!copyrightCheck.is_safe || !contentModeration.is_safe) {
        toast.warning("Des problèmes de sécurité ont été détectés");
      } else {
        toast.success("Aucun problème de sécurité détecté");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification de sécurité");
    } finally {
      setIsChecking(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-primary';
      case 'low': return 'text-yellow-500';
      case 'medium': return 'text-orange-500';
      case 'high': return 'text-red-500';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <FileWarning className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold">Vérification de Sécurité</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Vérifiez les droits d'auteur et la conformité du contenu avant publication
        </p>

        <Button 
          onClick={runSecurityChecks}
          disabled={isChecking}
          className="w-full gap-2"
          variant="hero"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Lancer la vérification
            </>
          )}
        </Button>
      </Card>

      {results && (
        <div className="space-y-4">
          {/* Copyright Results */}
          <Card className={`glass-hover p-6 border-l-4 ${
            results.copyrightCheck.is_safe ? 'border-primary' : 'border-destructive'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <Music className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold mb-2">Vérification Copyright Audio</h4>
                <div className="flex items-center gap-2 mb-3">
                  {getRiskIcon(results.copyrightCheck.risk_level)}
                  <Badge className={getRiskColor(results.copyrightCheck.risk_level)}>
                    {results.copyrightCheck.risk_level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {results.copyrightCheck.recommendation}
                </p>
                {results.copyrightCheck.alternatives && results.copyrightCheck.alternatives.length > 0 && (
                  <div className="glass p-3 rounded-lg mt-2">
                    <p className="text-xs font-semibold mb-1">Alternatives suggérées:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {results.copyrightCheck.alternatives.map((alt, i) => (
                        <li key={i}>• {alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Content Moderation Results */}
          <Card className={`glass-hover p-6 border-l-4 ${
            results.contentModeration.is_safe ? 'border-primary' : 'border-destructive'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <FileWarning className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold mb-2">Modération du Contenu</h4>
                <div className="flex items-center gap-2 mb-3">
                  {getRiskIcon(results.contentModeration.risk_level)}
                  <Badge className={getRiskColor(results.contentModeration.risk_level)}>
                    {results.contentModeration.risk_level.toUpperCase()}
                  </Badge>
                </div>

                {results.contentModeration.violations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-semibold">Violations détectées:</p>
                    {results.contentModeration.violations.map((violation, i) => (
                      <div key={i} className="glass p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive" className="text-xs">
                            {violation.severity}
                          </Badge>
                          <span className="text-xs font-semibold">{violation.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {violation.description}
                        </p>
                        <p className="text-xs text-primary">
                          💡 {violation.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {results.contentModeration.recommendations.length > 0 && (
                  <div className="glass p-3 rounded-lg">
                    <p className="text-xs font-semibold mb-1">Recommandations:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {results.contentModeration.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
