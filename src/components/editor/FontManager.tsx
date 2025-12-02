import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Type } from "lucide-react";

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

export const FontManager = ({ selectedFont, onFontChange }: FontManagerProps) => {

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

    </div>
  );
};
