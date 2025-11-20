import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { 
  Copy, 
  Check, 
  Loader2, 
  Wand2, 
  Download, 
  Globe,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Image,
  Maximize2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ExportPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  trimStart: number;
  trimEnd: number;
}

export const ExportPanel = ({
  videoRef,
  canvasRef,
  trimStart,
  trimEnd,
}: ExportPanelProps) => {
  const { t, language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(language);
  const [suggestions, setSuggestions] = useState<{
    title: string;
    hashtags: string[];
    description: string;
  } | null>(null);
  
  // Virality Score state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viralityScore, setViralityScore] = useState<{
    score: number;
    category: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  } | null>(null);

  // Thumbnail state
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnail, setThumbnail] = useState<{
    image: string;
    catchphrase: string;
  } | null>(null);

  // Format conversion state
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["9:16"]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateViralSuggestions = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      const frameData = canvas.toDataURL("image/jpeg");
      const duration = trimEnd - trimStart;

      const { data, error } = await supabase.functions.invoke('viral-suggestions', {
        body: { frameData, duration, language: targetLanguage }
      });

      if (error) throw error;

      setSuggestions(data);
      toast.success(t('editor.suggestionsGenerated'));
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(t('editor.errorGenerating'));
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeViralityScore = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    try {
      const canvas = canvasRef.current;
      const frameData = canvas.toDataURL("image/jpeg");
      const duration = trimEnd - trimStart;

      const { data, error } = await supabase.functions.invoke('virality-score', {
        body: { frameData, duration, language: targetLanguage }
      });

      if (error) throw error;

      setViralityScore(data);
      toast.success(t('editor.viralityAnalyzed'));
    } catch (error) {
      console.error('Error analyzing virality:', error);
      toast.error(t('editor.viralityError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateThumbnail = async () => {
    if (!videoRef.current || !canvasRef.current || !suggestions?.title) {
      toast.error("Générez d'abord les suggestions virales");
      return;
    }

    setIsGeneratingThumbnail(true);
    try {
      const canvas = canvasRef.current;
      const frameData = canvas.toDataURL("image/jpeg");

      const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
        body: { 
          frameData, 
          title: suggestions.title,
          language: targetLanguage 
        }
      });

      if (error) throw error;

      setThumbnail({
        image: data.thumbnail,
        catchphrase: data.catchphrase
      });
      toast.success(t('editor.thumbnailGenerated'));
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast.error(t('editor.thumbnailError'));
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t('editor.copied'));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExport = (quality: "hd" | "4k") => {
    const formatsText = selectedFormats.join(", ");
    console.log(`Exporting video in ${quality} quality with formats: ${formatsText}`);
    toast.success(`${t('editor.exportStarted')} - Formats: ${formatsText}`);
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('editor.targetLanguage')}
          </label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Español</SelectItem>
              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              <SelectItem value="it">🇮🇹 Italiano</SelectItem>
              <SelectItem value="pt">🇵🇹 Português</SelectItem>
              <SelectItem value="ja">🇯🇵 日本語</SelectItem>
              <SelectItem value="ko">🇰🇷 한국어</SelectItem>
              <SelectItem value="zh">🇨🇳 中文</SelectItem>
              <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              <SelectItem value="ru">🇷🇺 Русский</SelectItem>
              <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateViralSuggestions}
          disabled={isGenerating}
          className="w-full"
          variant="hero"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('editor.generating')}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              {t('editor.generateSuggestions')}
            </>
          )}
        </Button>

        {suggestions && (
          <div className="space-y-3 animate-in fade-in duration-500">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('editor.suggestedTitle')}</label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(suggestions.title, 'title')}
                >
                  {copiedField === 'title' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">{suggestions.title}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('editor.suggestedHashtags')}</label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(suggestions.hashtags.join(' '), 'hashtags')}
                >
                  {copiedField === 'hashtags' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {suggestions.hashtags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('editor.suggestedDescription')}</label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(suggestions.description, 'description')}
                >
                  {copiedField === 'description' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">{suggestions.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virality Score Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('editor.viralityScore')}
          </h3>
          <Button
            onClick={analyzeViralityScore}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('editor.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('editor.analyzeVirality')}
              </>
            )}
          </Button>
        </div>

        {viralityScore && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">
                {viralityScore.score}/100
              </div>
              <Badge variant={
                viralityScore.category === 'high' ? 'default' : 
                viralityScore.category === 'medium' ? 'secondary' : 
                'outline'
              }>
                {viralityScore.category.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                {t('editor.strengths')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {viralityScore.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                {t('editor.weaknesses')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {viralityScore.weaknesses.map((weakness, i) => (
                  <li key={i}>{weakness}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                <Lightbulb className="w-4 h-4" />
                {t('editor.scoreSuggestions')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {viralityScore.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Thumbnail Generator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="w-5 h-5" />
            {t('editor.dynamicThumbnail')}
          </h3>
          <Button
            onClick={generateThumbnail}
            disabled={isGeneratingThumbnail || !suggestions}
            variant="outline"
            size="sm"
          >
            {isGeneratingThumbnail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('editor.generating')}
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                {t('editor.generateThumbnail')}
              </>
            )}
          </Button>
        </div>

        {thumbnail && (
          <div className="space-y-3">
            <div className="relative aspect-[9/16] max-w-[200px] mx-auto rounded-lg overflow-hidden border-2 border-primary">
              <img 
                src={thumbnail.image} 
                alt="Generated thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold text-center">{thumbnail.catchphrase}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const link = document.createElement('a');
                link.href = thumbnail.image;
                link.download = 'thumbnail.png';
                link.click();
                toast.success(t('editor.thumbnailDownloaded'));
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('editor.downloadThumbnail')}
            </Button>
          </div>
        )}
      </div>

      {/* Auto Format Conversion */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Maximize2 className="w-5 h-5" />
          {t('editor.formatConversion')}
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { format: "9:16", label: "Vertical (Stories)", icon: "📱" },
            { format: "1:1", label: "Carré (Feed)", icon: "⬜" },
            { format: "16:9", label: "Horizontal (YT)", icon: "🖥️" }
          ].map(({ format, label, icon }) => (
            <button
              key={format}
              onClick={() => {
                if (selectedFormats.includes(format)) {
                  setSelectedFormats(selectedFormats.filter(f => f !== format));
                } else {
                  setSelectedFormats([...selectedFormats, format]);
                }
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormats.includes(format)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-sm">{format}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {t('editor.formatHint')}
        </p>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('editor.exportOptions')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("hd")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {t('editor.exportHD')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("4k")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {t('editor.export4K')}
          </Button>
        </div>
      </div>
    </div>
  );
};
