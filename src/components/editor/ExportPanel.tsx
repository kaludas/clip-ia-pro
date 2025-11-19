import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Copy, Check, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateViralSuggestions = async () => {
    setIsGenerating(true);
    try {
      // Get a frame from the video for context
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) {
        toast.error(t("editor.errorNoVideo"));
        return;
      }

      // Capture current frame as base64
      const frameData = canvas.toDataURL("image/jpeg", 0.8);
      
      // Call edge function for AI suggestions
      const { data, error } = await supabase.functions.invoke("viral-suggestions", {
        body: {
          frameData,
          duration: trimEnd - trimStart,
          language: targetLanguage,
        },
      });

      if (error) throw error;

      setSuggestions(data);
      toast.success(t("editor.suggestionsGenerated"));
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error(t("editor.errorGenerating"));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("editor.copied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExport = async (quality: "hd" | "4k") => {
    toast.info(t("editor.exportStarted"));
    // Export logic would go here
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">{t("editor.aiSuggestionsTitle")}</h4>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t("editor.targetLanguage")}
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
          className="w-full gap-2"
          variant="hero"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t("editor.generating") : t("editor.generateSuggestions")}
        </Button>
      </div>

      {/* Generated Suggestions */}
      {suggestions && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("editor.suggestedTitle")}</label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(suggestions.title, "title")}
              >
                {copiedField === "title" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 glass rounded-xl">
              <p className="text-sm">{suggestions.title}</p>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("editor.suggestedHashtags")}</label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(suggestions.hashtags.join(" "), "hashtags")}
              >
                {copiedField === "hashtags" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 glass rounded-xl">
              <div className="flex flex-wrap gap-2">
                {suggestions.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("editor.suggestedDescription")}</label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(suggestions.description, "description")}
              >
                {copiedField === "description" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 glass rounded-xl">
              <p className="text-sm text-muted-foreground">{suggestions.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="text-sm font-semibold">{t("editor.exportOptions")}</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("hd")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            HD 1080p
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("4k")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            4K UHD
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t("editor.exportNote")}
        </p>
      </div>
    </div>
  );
};
