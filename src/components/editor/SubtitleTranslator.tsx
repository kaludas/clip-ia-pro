import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Languages, Loader2, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface SubtitleTranslatorProps {
  subtitles: Subtitle[];
  existingTranslations?: Record<string, Subtitle[]>;
  onTranslationsGenerated?: (translations: Record<string, Subtitle[]>) => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪' },
  { code: 'it', name: 'Italien', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹' },
  { code: 'ja', name: 'Japonais', flag: '🇯🇵' },
  { code: 'ko', name: 'Coréen', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'Anglais', flag: '🇬🇧' },
];

export default function SubtitleTranslator({ subtitles, existingTranslations = {}, onTranslationsGenerated }: SubtitleTranslatorProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Subtitle[]>>(existingTranslations);

  // Sync with existing translations from parent
  useEffect(() => {
    if (Object.keys(existingTranslations).length > 0 && Object.keys(translations).length === 0) {
      setTranslations(existingTranslations);
    }
  }, [existingTranslations]);

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  const handleTranslate = async () => {
    if (selectedLanguages.length === 0) {
      toast.error("Veuillez sélectionner au moins une langue");
      return;
    }

    if (!subtitles || subtitles.length === 0) {
      toast.error("Aucun sous-titre à traduire");
      return;
    }

    setTranslating(true);

    try {
      const { data, error } = await supabase.functions.invoke('translate-subtitles', {
        body: {
          subtitles,
          targetLanguages: selectedLanguages
        }
      });

      if (error) throw error;

      setTranslations(data.translations);
      if (onTranslationsGenerated) {
        onTranslationsGenerated(data.translations);
      }
      toast.success(`Sous-titres traduits en ${selectedLanguages.length} langue(s) !`);
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Erreur lors de la traduction");
    } finally {
      setTranslating(false);
    }
  };

  const exportSubtitles = (langCode: string) => {
    const subs = translations[langCode];
    if (!subs) return;

    // Export as SRT format
    const srtContent = subs.map((sub, index) => {
      const startTime = formatTime(sub.start);
      const endTime = formatTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    }).join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles_${langCode}.srt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Sous-titres ${langCode} exportés !`);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Traduction Multilingue IA
          </CardTitle>
          <CardDescription>
            Traduisez vos sous-titres dans plus de 10 langues pour maximiser votre portée internationale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Sélectionnez les langues cibles</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={lang.code}
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                  />
                  <Label
                    htmlFor={lang.code}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    {lang.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleTranslate}
            disabled={translating || selectedLanguages.length === 0 || !subtitles || subtitles.length === 0}
            className="w-full"
            size="lg"
          >
            {translating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduction en cours...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Traduire ({selectedLanguages.length} langue{selectedLanguages.length > 1 ? 's' : ''})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(translations).length > 0 && (
        <Card className="glass-hover">
          <CardHeader>
            <CardTitle>Traductions Disponibles</CardTitle>
            <CardDescription>
              Prévisualisez et exportez vos sous-titres traduits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(translations).map(([langCode, subs]) => {
                const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
                return (
                  <div key={langCode} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang?.flag}</span>
                        <div>
                          <h4 className="font-semibold">{lang?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {subs.length} segments traduits
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportSubtitles(langCode)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exporter SRT
                      </Button>
                    </div>
                    <ScrollArea className="h-32 rounded border p-2">
                      <div className="space-y-2 text-sm">
                        {subs.slice(0, 5).map((sub, idx) => (
                          <div key={idx} className="text-muted-foreground">
                            <span className="font-mono text-xs text-primary">
                              [{sub.start.toFixed(1)}s]
                            </span>{' '}
                            {sub.text}
                          </div>
                        ))}
                        {subs.length > 5 && (
                          <p className="text-xs text-muted-foreground italic">
                            ... et {subs.length - 5} segments supplémentaires
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
