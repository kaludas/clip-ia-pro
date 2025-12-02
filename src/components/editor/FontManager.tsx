import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Type, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FontManagerProps {
  selectedFont: string;
  onFontChange: (fontFamily: string) => void;
}

const DEFAULT_FONTS = [
  { family: 'Arial', name: 'Arial (Classique)' },
  { family: 'Bebas Neue', name: 'Bebas Neue (Impact)' },
  { family: 'Bangers', name: 'Bangers (Comic)' },
  { family: 'Anton', name: 'Anton (Gras)' },
  { family: 'Lobster', name: 'Lobster (Script)' },
  { family: 'Righteous', name: 'Righteous (Moderne)' },
  { family: 'Russo One', name: 'Russo One (Bold)' },
  { family: 'Permanent Marker', name: 'Permanent Marker (Dessin)' },
  { family: 'Pacifico', name: 'Pacifico (Cursive)' },
  { family: 'Cinzel', name: 'Cinzel (Élégant)' },
  { family: 'Orbitron', name: 'Orbitron (Futuriste)' },
  { family: 'Creepster', name: 'Creepster (Horror)' },
  { family: 'Dancing Script', name: 'Dancing Script (Manuscrit)' },
  { family: 'Caveat', name: 'Caveat (Naturel)' },
  { family: 'Shadows Into Light', name: 'Shadows Into Light (Fun)' },
  { family: 'Montserrat', name: 'Montserrat (Propre)' },
  { family: 'Playfair Display', name: 'Playfair Display (Luxe)' },
];

interface CustomFont {
  id: string;
  name: string;
  file_path: string;
  font_family: string;
}

export const FontManager = ({ selectedFont, onFontChange }: FontManagerProps) => {
  const { user } = useAuth();
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCustomFonts();
    }
  }, [user]);

  const fetchCustomFonts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_fonts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomFonts(data || []);
    } catch (error) {
      console.error('Error fetching fonts:', error);
    }
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate font file
    const validTypes = ['font/ttf', 'font/otf', 'application/x-font-ttf', 'application/x-font-otf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (!['ttf', 'otf'].includes(fileExtension || '')) {
      toast.error("Format non supporté. Utilisez .ttf ou .otf");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La police doit faire moins de 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('user-fonts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-fonts')
        .getPublicUrl(fileName);

      // Create unique font family name
      const fontFamily = `CustomFont-${Date.now()}`;
      const fontName = file.name.replace(/\.(ttf|otf)$/i, '');

      // Load font in browser
      const fontFace = new FontFace(fontFamily, `url(${urlData.publicUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_fonts')
        .insert({
          user_id: user.id,
          name: fontName,
          file_path: fileName,
          font_family: fontFamily,
        });

      if (dbError) throw dbError;

      toast.success(`Police "${fontName}" ajoutée !`);
      fetchCustomFonts();
    } catch (error: any) {
      console.error('Font upload error:', error);
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const deleteFont = async (font: CustomFont) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-fonts')
        .remove([font.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_fonts')
        .delete()
        .eq('id', font.id);

      if (dbError) throw dbError;

      toast.success("Police supprimée");
      setCustomFonts(customFonts.filter(f => f.id !== font.id));
      
      if (selectedFont === font.font_family) {
        onFontChange('Arial');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base mb-3 block flex items-center gap-2">
          <Type className="w-4 h-4" />
          Polices par défaut
        </Label>
        <ScrollArea className="h-64 rounded-lg border p-2">
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_FONTS.map((font) => (
              <Button
                key={font.family}
                variant={selectedFont === font.family ? "hero" : "outline"}
                onClick={() => onFontChange(font.family)}
                className="justify-start"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {user && (
        <Card className="glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="w-4 h-4" />
              Polices Personnalisées
            </CardTitle>
            <CardDescription>
              Uploadez vos propres polices .ttf ou .otf (max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept=".ttf,.otf"
                onChange={handleFontUpload}
                className="hidden"
                id="font-upload"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('font-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Upload en cours..." : "Ajouter une police"}
              </Button>
            </div>

            {customFonts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Mes polices ({customFonts.length})</Label>
                <div className="space-y-2">
                  {customFonts.map((font) => (
                    <div
                      key={font.id}
                      className="flex items-center justify-between p-2 glass rounded-lg"
                    >
                      <Button
                        variant={selectedFont === font.font_family ? "hero" : "ghost"}
                        onClick={() => onFontChange(font.font_family)}
                        className="flex-1 justify-start"
                        style={{ fontFamily: font.font_family }}
                      >
                        {font.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFont(font)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="glass-hover border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Connectez-vous pour uploader vos propres polices
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
