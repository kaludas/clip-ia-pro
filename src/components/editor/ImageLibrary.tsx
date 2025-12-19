import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Download, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavedImage {
  id: string;
  image_url: string;
  prompt: string | null;
  style: string | null;
  image_type: string | null;
  created_at: string;
}

interface ImageLibraryProps {
  onSelectImage?: (imageUrl: string) => void;
  onClose?: () => void;
}

const ImageLibrary = ({ onSelectImage, onClose }: ImageLibraryProps) => {
  const { user } = useAuth();
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  const fetchImages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error("Erreur lors du chargement des images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('user_generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success("Image supprimée");
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string | null) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${prompt?.slice(0, 20) || 'generated'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case 'generated': return 'Générée';
      case 'edited': return 'Éditée';
      case 'video_thumbnail': return 'Vidéo';
      default: return 'Image';
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Connectez-vous pour accéder à votre bibliothèque</p>
        <Button variant="outline" onClick={onClose}>Fermer</Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/50 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Ma Bibliothèque ({images.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">Aucune image sauvegardée</p>
          <p className="text-sm text-muted-foreground/70">
            Générez des images avec l'IA et sauvegardez-les ici
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="group relative rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all"
              >
                <img 
                  src={image.image_url} 
                  alt={image.prompt || 'Image générée'}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => onSelectImage?.(image.image_url)}
                />
                
                {/* Type badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-xs">
                  {getTypeLabel(image.image_type)}
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {image.prompt && (
                    <p className="text-xs text-center line-clamp-2 mb-2">{image.prompt}</p>
                  )}
                  <div className="flex gap-2">
                    {onSelectImage && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => onSelectImage(image.image_url)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(image.image_url, image.prompt)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deletingId === image.id}
                    >
                      {deletingId === image.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};

export default ImageLibrary;
