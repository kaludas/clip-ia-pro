import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Package, MapPin, TrendingUp, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  name: string;
  category: string;
  confidence: number;
  affiliatePotential: string;
  suggestedLinks: string[];
}

interface Location {
  name: string;
  type: string;
  confidence: number;
}

interface Recognition {
  products: Product[];
  locations: Location[];
  monetizationTips: string[];
}

interface ProductRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const ProductRecognition = ({ videoRef }: ProductRecognitionProps) => {
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognition, setRecognition] = useState<Recognition | null>(null);

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

  const analyzeFrame = async () => {
    if (!videoRef.current) {
      toast.error(language === "fr" ? "Aucune vidéo chargée" : "No video loaded");
      return;
    }

    setIsAnalyzing(true);

    try {
      const frameData = await captureCurrentFrame();
      
      toast.info(language === "fr" ? "🔍 Analyse des produits..." : "🔍 Analyzing products...");

      const { data, error } = await supabase.functions.invoke('product-recognition', {
        body: { frameData, language }
      });

      if (error) throw error;

      setRecognition(data);
      
      const productCount = data.products?.length || 0;
      const locationCount = data.locations?.length || 0;
      
      toast.success(
        language === "fr"
          ? `✅ ${productCount} produits et ${locationCount} lieux détectés`
          : `✅ ${productCount} products and ${locationCount} locations detected`
      );
    } catch (error) {
      console.error('Recognition error:', error);
      toast.error(language === "fr" ? "Erreur d'analyse" : "Analysis error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPotentialColor = (potential: string) => {
    if (potential === "high") return "text-green-500";
    if (potential === "medium") return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {language === "fr" ? "Reconnaissance Produits & Lieux" : "Product & Location Recognition"}
          </CardTitle>
          <CardDescription>
            {language === "fr" 
              ? "Identifiez automatiquement les produits et lieux pour maximiser la monétisation" 
              : "Automatically identify products and locations to maximize monetization"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={analyzeFrame}
            disabled={isAnalyzing}
            variant="hero"
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "fr" ? "Analyse en cours..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {language === "fr" ? "Analyser la frame actuelle" : "Analyze Current Frame"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recognition && (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {/* Products */}
            {recognition.products && recognition.products.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {language === "fr" ? "Produits Détectés" : "Detected Products"} ({recognition.products.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recognition.products.map((product, idx) => (
                    <Card key={idx} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <Badge variant="outline">
                          {product.confidence}% {language === "fr" ? "confiance" : "confidence"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${getPotentialColor(product.affiliatePotential)}`} />
                        <span className={`text-sm font-medium ${getPotentialColor(product.affiliatePotential)}`}>
                          {language === "fr" ? "Potentiel affiliation:" : "Affiliate potential:"} {product.affiliatePotential}
                        </span>
                      </div>

                      {product.suggestedLinks && product.suggestedLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {product.suggestedLinks.map((platform, pIdx) => (
                            <Badge key={pIdx} variant="secondary" className="gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Locations */}
            {recognition.locations && recognition.locations.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {language === "fr" ? "Lieux Identifiés" : "Identified Locations"} ({recognition.locations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recognition.locations.map((location, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold">{location.name}</h4>
                          <p className="text-sm text-muted-foreground">{location.type}</p>
                        </div>
                        <Badge variant="outline">
                          {location.confidence}%
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Monetization Tips */}
            {recognition.monetizationTips && recognition.monetizationTips.length > 0 && (
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    {language === "fr" ? "💰 Conseils Monétisation" : "💰 Monetization Tips"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recognition.monetizationTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}

      {!recognition && !isAnalyzing && (
        <Card className="glass-hover border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Analysez une frame pour détecter les produits et opportunités de monétisation"
                : "Analyze a frame to detect products and monetization opportunities"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};