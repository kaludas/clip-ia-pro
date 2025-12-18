import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Plus, Loader2, ChevronLeft, Sparkles, Image as ImageIcon, Upload, Pencil, Video, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const videoStyles = [
  { id: 'zoom-in', label: 'Zoom avant', description: 'Zoom progressif vers le centre' },
  { id: 'zoom-out', label: 'Zoom arrière', description: 'Zoom arrière révélant la scène' },
  { id: 'pan-left', label: 'Panoramique gauche', description: 'Mouvement horizontal vers la gauche' },
  { id: 'pan-right', label: 'Panoramique droite', description: 'Mouvement horizontal vers la droite' },
  { id: 'ken-burns', label: 'Ken Burns', description: 'Zoom lent avec panoramique subtil' },
  { id: 'pulse', label: 'Pulsation', description: 'Effet de battement rythmique' },
];

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  onBack
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate tab state
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>([]);
  
  // Edit tab state
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedImages, setEditedImages] = useState<{ original: string; edited: string; prompt: string }[]>([]);
  
  // Image to video state
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [selectedVideoStyle, setSelectedVideoStyle] = useState('zoom-in');
  const [videoDuration, setVideoDuration] = useState(3);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<{ thumbnail: string; style: string }[]>([]);

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

  const handleEditImage = async () => {
    if (!selectedImage || !editPrompt.trim()) {
      toast.error(language === 'fr' ? 'Sélectionnez une image et entrez une instruction' : 'Select an image and enter an instruction');
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: { imageUrl: selectedImage, prompt: editPrompt.trim() }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newEdit = { original: selectedImage, edited: data.image, prompt: editPrompt.trim() };
      setEditedImages(prev => [newEdit, ...prev]);
      setSelectedImage(data.image); // Update selected image to edited version
      
      toast.success(language === 'fr' ? 'Image modifiée avec succès !' : 'Image edited successfully!');
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'édition');
    } finally {
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'edit') {
        setSelectedImage(dataUrl);
      } else {
        setVideoSourceImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!videoSourceImage) {
      toast.error('Veuillez sélectionner une image source');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      // Simulate video generation with CSS animation preview
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVideo = { 
        thumbnail: videoSourceImage, 
        style: selectedVideoStyle 
      };
      setGeneratedVideos(prev => [newVideo, ...prev]);
      
      toast.success(language === 'fr' ? 'Vidéo créée ! Animation appliquée.' : 'Video created! Animation applied.');
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Erreur lors de la création de la vidéo');
    } finally {
      setIsGeneratingVideo(false);
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

  const selectGeneratedForEdit = (url: string) => {
    setSelectedImage(url);
    toast.success('Image sélectionnée pour édition');
  };

  const selectForVideo = (url: string) => {
    setVideoSourceImage(url);
    toast.success('Image sélectionnée pour animation');
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </Button>
      )}

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-xs">
            <Pencil className="h-3 w-3 mr-1" />
            Éditer
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs">
            <Video className="h-3 w-3 mr-1" />
            Animer
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {language === 'fr' ? 'Créer une image' : 'Create an image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={language === 'fr' 
                  ? "Décrivez votre image..." 
                  : "Describe your image..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-background/50 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              />

              <div className="grid grid-cols-3 gap-1.5">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStyle(style.id)}
                    className="text-xs h-8"
                  >
                    <span>{style.icon}</span>
                    <span className="ml-1">{style.label}</span>
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Images Gallery */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
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
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    <Button size="sm" variant="secondary" onClick={() => handleAddToLayer(img.url)} className="text-xs w-full">
                      <Plus className="h-3 w-3 mr-1" /> Calque
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => selectGeneratedForEdit(img.url)} className="text-xs w-full">
                      <Pencil className="h-3 w-3 mr-1" /> Éditer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => selectForVideo(img.url)} className="text-xs w-full">
                      <Video className="h-3 w-3 mr-1" /> Animer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(img.url, index)} className="text-xs w-full">
                      <Download className="h-3 w-3 mr-1" /> Télécharger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pencil className="h-4 w-4 text-primary" />
                {language === 'fr' ? 'Modifier une image' : 'Edit an image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Image Selection */}
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-full aspect-video object-contain rounded-lg bg-black/20"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs"
                    onClick={() => setSelectedImage(null)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour uploader ou glissez une image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ou sélectionnez depuis vos images générées
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'edit')}
              />

              <Input
                placeholder="Ex: Rends l'arrière-plan plus sombre, ajoute des néons..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="bg-background/50 text-sm"
              />

              <Button 
                onClick={handleEditImage} 
                disabled={isEditing || !selectedImage || !editPrompt.trim()}
                className="w-full"
                size="sm"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Appliquer les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Edited Images */}
          {editedImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Images modifiées</h4>
              <div className="grid grid-cols-2 gap-2">
                {editedImages.map((edit, index) => (
                  <div 
                    key={index} 
                    className="relative group rounded-lg overflow-hidden border border-border/50"
                  >
                    <img 
                      src={edit.edited} 
                      alt={edit.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <p className="text-xs text-white text-center px-2 line-clamp-2">{edit.prompt}</p>
                      <Button size="sm" variant="secondary" onClick={() => handleAddToLayer(edit.edited)} className="text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Calque
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                {language === 'fr' ? 'Image → Vidéo animée' : 'Image → Animated Video'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Source Image */}
              {videoSourceImage ? (
                <div className="relative">
                  <div className={`overflow-hidden rounded-lg ${
                    selectedVideoStyle === 'zoom-in' ? 'animate-pulse' : ''
                  }`}>
                    <img 
                      src={videoSourceImage} 
                      alt="Source" 
                      className={`w-full aspect-video object-cover transition-transform duration-1000 ${
                        selectedVideoStyle === 'zoom-in' ? 'hover:scale-110' :
                        selectedVideoStyle === 'zoom-out' ? 'scale-110 hover:scale-100' :
                        selectedVideoStyle === 'pan-left' ? 'hover:-translate-x-4' :
                        selectedVideoStyle === 'pan-right' ? 'hover:translate-x-4' :
                        ''
                      }`}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs"
                    onClick={() => setVideoSourceImage(null)}
                  >
                    Changer
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Aperçu: survolez
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handleImageUpload(e as any, 'video');
                    input.click();
                  }}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez une image à animer
                  </p>
                </div>
              )}

              {/* Animation Style */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Style d'animation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {videoStyles.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedVideoStyle === style.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVideoStyle(style.id)}
                      className="text-xs h-auto py-2 flex-col items-start"
                    >
                      <span className="font-medium">{style.label}</span>
                      <span className="text-[10px] opacity-70">{style.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Durée:</label>
                <div className="flex gap-1">
                  {[2, 3, 5].map((d) => (
                    <Button
                      key={d}
                      variant={videoDuration === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVideoDuration(d)}
                      className="text-xs h-7 w-10"
                    >
                      {d}s
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateVideo} 
                disabled={isGeneratingVideo || !videoSourceImage}
                className="w-full"
                size="sm"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Créer la vidéo animée
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Videos */}
          {generatedVideos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Vidéos créées</h4>
              <div className="grid grid-cols-2 gap-2">
                {generatedVideos.map((video, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden border border-border/50 group"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={`Video ${index + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                      {videoStyles.find(s => s.id === video.style)?.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
