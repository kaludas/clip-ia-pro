import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, EyeOff, Trash2, GripVertical, Upload, 
  Image as ImageIcon, Video, Loader2, Plus 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Layer {
  id: string;
  type: "text" | "image" | "video" | "overlay";
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  url?: string;
  position?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

interface LayerManagerProps {
  layers: Layer[];
  onLayerUpdate: (layers: Layer[]) => void;
}

export const LayerManager = ({ layers, onLayerUpdate }: LayerManagerProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [userOverlays, setUserOverlays] = useState<any[]>([]);
  const [loadingOverlays, setLoadingOverlays] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOverlays();
    }
  }, [user]);

  const fetchUserOverlays = async () => {
    try {
      const { data, error } = await supabase
        .from('user_overlays')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserOverlays(data || []);
    } catch (error) {
      console.error('Error fetching overlays:', error);
    } finally {
      setLoadingOverlays(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez PNG, JPEG, GIF, WEBP, MP4 ou WEBM");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('overlays')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('overlays')
        .getPublicUrl(fileName);

      // Save metadata
      const { error: dbError } = await supabase
        .from('user_overlays')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: fileName,
          file_type: file.type,
          thumbnail_url: publicUrl
        });

      if (dbError) throw dbError;

      toast.success("Filtre uploadé avec succès !");
      fetchUserOverlays();

      // Add to layers
      const newLayer: Layer = {
        id: `overlay-${Date.now()}`,
        type: file.type.startsWith('video') ? 'video' : 'overlay',
        name: file.name,
        visible: true,
        opacity: 100,
        zIndex: layers.length + 1,
        url: publicUrl,
        position: { x: 50, y: 50 },
        scale: 1,
        rotation: 0
      };

      onLayerUpdate([...layers, newLayer]);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const addOverlayToLayers = (overlay: any) => {
    const newLayer: Layer = {
      id: `overlay-${Date.now()}`,
      type: overlay.file_type.startsWith('video') ? 'video' : 'overlay',
      name: overlay.name,
      visible: true,
      opacity: 100,
      zIndex: layers.length + 1,
      url: overlay.thumbnail_url,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0
    };

    onLayerUpdate([...layers, newLayer]);
    toast.success(`${overlay.name} ajouté !`);
  };

  const toggleVisibility = (id: string) => {
    onLayerUpdate(
      layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const updateOpacity = (id: string, opacity: number) => {
    onLayerUpdate(
      layers.map((layer) =>
        layer.id === id ? { ...layer, opacity } : layer
      )
    );
  };

  const deleteLayer = (id: string) => {
    onLayerUpdate(layers.filter((layer) => layer.id !== id));
    toast.success("Calque supprimé");
  };

  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === layers.length - 1)
    )
      return;

    const newLayers = [...layers];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newLayers[index], newLayers[targetIndex]] = [
      newLayers[targetIndex],
      newLayers[index],
    ];

    onLayerUpdate(
      newLayers.map((layer, idx) => ({ ...layer, zIndex: idx + 1 }))
    );
  };

  const deleteOverlay = async (overlayId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('overlays')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_overlays')
        .delete()
        .eq('id', overlayId);

      if (dbError) throw dbError;

      toast.success("Filtre supprimé");
      fetchUserOverlays();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Calques & Filtres</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('overlay-upload')?.click()}
          disabled={uploading || !user}
          className="gap-2"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Upload...</>
          ) : (
            <><Upload className="w-4 h-4" /> Importer</>
          )}
        </Button>
        <input
          id="overlay-upload"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* User Overlays Library */}
      {userOverlays.length > 0 && (
        <Card className="p-3">
          <Label className="text-sm font-semibold mb-2 block">Mes Filtres</Label>
          <ScrollArea className="h-32">
            <div className="grid grid-cols-3 gap-2">
              {userOverlays.map((overlay) => (
                <div 
                  key={overlay.id}
                  className="relative group cursor-pointer border rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <div 
                    className="aspect-square bg-muted flex items-center justify-center"
                    onClick={() => addOverlayToLayers(overlay)}
                  >
                    {overlay.file_type.startsWith('video') ? (
                      <Video className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        addOverlayToLayers(overlay);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOverlay(overlay.id, overlay.file_path);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs truncate p-1 text-center">{overlay.name}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Active Layers */}
      <ScrollArea className="h-80">
        <div className="space-y-2">
          {layers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucun calque actif</p>
              <p className="text-xs mt-1">Importez un filtre pour commencer</p>
            </div>
          ) : (
            layers.map((layer) => (
              <Card key={layer.id} className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <span className="flex-1 font-medium text-sm truncate">
                    {layer.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleVisibility(layer.id)}
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteLayer(layer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-16">Opacité</Label>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={(value) => updateOpacity(layer.id, value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {layer.opacity}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => moveLayer(layer.id, "up")}
                    disabled={layers[0].id === layer.id}
                  >
                    ↑ Avant
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => moveLayer(layer.id, "down")}
                    disabled={layers[layers.length - 1].id === layer.id}
                  >
                    ↓ Arrière
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {!user && (
        <div className="text-xs text-center text-muted-foreground p-4 border rounded-lg">
          Connectez-vous pour importer vos propres filtres
        </div>
      )}
    </div>
  );
};
