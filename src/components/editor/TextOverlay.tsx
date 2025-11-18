import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TextOverlayProps {
  textOverlays: Array<{
    id: string;
    text: string;
    animation: string;
  }>;
  onAddText: (text: string, animation: string) => void;
  onUpdateText: (id: string, updates: any) => void;
  onDeleteText: (id: string) => void;
}

export const TextOverlay = ({
  textOverlays,
  onAddText,
  onDeleteText,
}: TextOverlayProps) => {
  const { t } = useLanguage();
  const [newText, setNewText] = useState("");
  const [selectedAnimation, setSelectedAnimation] = useState("fadeIn");

  const animations = [
    { id: "none", name: t("editor.animation.none") },
    { id: "fadeIn", name: t("editor.animation.fadeIn") },
    { id: "slideUp", name: t("editor.animation.slideUp") },
    { id: "bounce", name: t("editor.animation.bounce") },
  ];

  const handleAddText = () => {
    if (newText.trim()) {
      onAddText(newText, selectedAnimation);
      setNewText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Text */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">{t("editor.addText")}</h4>
        <Input
          placeholder={t("editor.textPlaceholder")}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddText()}
        />
        
        {/* Animation Selection */}
        <div className="grid grid-cols-2 gap-2">
          {animations.map((anim) => (
            <Button
              key={anim.id}
              variant={selectedAnimation === anim.id ? "hero" : "outline"}
              onClick={() => setSelectedAnimation(anim.id)}
              size="sm"
            >
              {anim.name}
            </Button>
          ))}
        </div>
        
        <Button onClick={handleAddText} className="w-full gap-2" variant="hero">
          <Plus className="w-4 h-4" />
          {t("editor.addTextButton")}
        </Button>
      </div>

      {/* Text Overlays List */}
      {textOverlays.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{t("editor.activeTexts")}</h4>
          <div className="space-y-2">
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className="flex items-center justify-between p-3 glass rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{overlay.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {animations.find(a => a.id === overlay.animation)?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteText(overlay.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
