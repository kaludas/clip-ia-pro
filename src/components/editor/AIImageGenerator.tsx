import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Plus, Loader2, ChevronLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  onBack?: () => void;
}

const styles = [
  { id: 'realistic', label: 'Réaliste', icon: '📷' },
  { id: 'cinematic', label: 'Cinématique', icon: '🎬' },
  { id: 'anime', label: 'Anime', icon: '🎌' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'minimal', label: 'Minimal', icon: '⬜' },
  { id: 'vintage', label: 'Vintage', icon: '📼' },
];

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  onBack
}) => {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(language === 'fr' ? 'Veuillez entrer une description' : 'Please enter a description');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim(), style: selectedStyle }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newImage = { url: data.image, prompt: prompt.trim() };
      setGeneratedImages(prev => [newImage, ...prev]);
      
      toast.success(language === 'fr' ? 'Image générée avec succès !' : 'Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLayer = (imageUrl: string) => {
    if (onImageGenerated) {
      onImageGenerated(imageUrl);
      toast.success(language === 'fr' ? 'Image ajoutée comme calque' : 'Image added as layer');
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `monshort-ai-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'fr' ? 'Image téléchargée' : 'Image downloaded');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </Button>
      )}

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === 'fr' ? 'Générateur d\'images IA' : 'AI Image Generator'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'fr' ? 'Description de l\'image' : 'Image description'}
            </label>
            <Input
              placeholder={language === 'fr' 
                ? "Ex: Un streamer gaming avec des néons bleus..." 
                : "Ex: A gaming streamer with blue neon lights..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-background/50"
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'fr' ? 'Style' : 'Style'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {styles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStyle(style.id)}
                  className="flex items-center gap-1 text-xs"
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === 'fr' ? 'Génération en cours...' : 'Generating...'}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Générer l\'image' : 'Generate Image'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              {language === 'fr' ? 'Images générées' : 'Generated Images'}
              <span className="text-sm font-normal text-muted-foreground">
                ({generatedImages.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {generatedImages.map((img, index) => (
                <div 
                  key={index} 
                  className="relative group rounded-lg overflow-hidden border border-border/50 bg-background/30"
                >
                  <img 
                    src={img.url} 
                    alt={img.prompt}
                    className="w-full aspect-[9/16] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <p className="text-xs text-white text-center line-clamp-2 mb-2">
                      {img.prompt}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddToLayer(img.url)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {language === 'fr' ? 'Calque' : 'Layer'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(img.url, index)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {language === 'fr' 
              ? 'Décrivez l\'image que vous souhaitez créer' 
              : 'Describe the image you want to create'}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {language === 'fr' 
              ? 'L\'IA génèrera une image optimisée pour vos shorts' 
              : 'AI will generate an image optimized for your shorts'}
          </p>
        </div>
      )}
    </div>
  );
};
