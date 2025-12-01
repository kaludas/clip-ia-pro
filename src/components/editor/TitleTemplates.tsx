import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Type } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface TitleTemplate {
  id: string;
  name: string;
  style: string;
  animation: string;
  fontSize: number;
  color: string;
  preview: string;
}

const templates: TitleTemplate[] = [
  {
    id: "neon",
    name: "Néon",
    style: "neon",
    animation: "pulse",
    fontSize: 64,
    color: "#FF00FF",
    preview: "text-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF"
  },
  {
    id: "modern",
    name: "Moderne",
    style: "modern",
    animation: "slideUp",
    fontSize: 56,
    color: "#FFFFFF",
    preview: "font-weight: 900; letter-spacing: -0.05em"
  },
  {
    id: "minimal",
    name: "Minimaliste",
    style: "minimal",
    animation: "fadeIn",
    fontSize: 48,
    color: "#000000",
    preview: "font-weight: 300; letter-spacing: 0.1em"
  },
  {
    id: "gaming",
    name: "Gaming",
    style: "gaming",
    animation: "bounce",
    fontSize: 72,
    color: "#00FF00",
    preview: "font-family: monospace; text-shadow: 2px 2px 0px #000000"
  },
  {
    id: "elegant",
    name: "Élégant",
    style: "elegant",
    animation: "fadeIn",
    fontSize: 52,
    color: "#FFD700",
    preview: "font-family: serif; font-style: italic"
  },
  {
    id: "bold",
    name: "Bold",
    style: "bold",
    animation: "slideUp",
    fontSize: 68,
    color: "#FF0000",
    preview: "font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em"
  }
];

interface TitleTemplatesProps {
  onApplyTemplate: (template: TitleTemplate, text: string) => void;
}

export const TitleTemplates = ({ onApplyTemplate }: TitleTemplatesProps) => {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [titleText, setTitleText] = useState("");

  const handleApply = () => {
    if (!selectedTemplate || !titleText.trim()) {
      toast.error(t("editor.selectTemplateAndText"));
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      onApplyTemplate(template, titleText);
      toast.success(t("editor.templateApplied"));
      setTitleText("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4" />
        <h3 className="text-sm font-semibold">{t("editor.titleTemplates")}</h3>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">{t("editor.titleText")}</label>
        <Input
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder={t("editor.enterTitle")}
          className="w-full"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              selectedTemplate === template.id
                ? "border-primary bg-primary/10"
                : "border-border/50 glass"
            }`}
          >
            {/* Template Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{template.name}</span>
                {selectedTemplate === template.id && (
                  <Sparkles className="w-3 h-3 text-primary" />
                )}
              </div>
              <div 
                className="text-xl font-bold"
                style={{ 
                  color: template.color,
                  fontSize: `${template.fontSize / 3}px`
                }}
              >
                Aa
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {template.animation}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.fontSize}px
                </Badge>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Apply Button */}
      <Button
        onClick={handleApply}
        disabled={!selectedTemplate || !titleText.trim()}
        className="w-full gap-2"
        variant="hero"
      >
        <Sparkles className="w-4 h-4" />
        {t("editor.applyTemplate")}
      </Button>

      {/* Template Details */}
      {selectedTemplate && (
        <div className="p-3 glass rounded-lg space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            {t("editor.templateDetails")}
          </h4>
          {(() => {
            const template = templates.find(t => t.id === selectedTemplate);
            return template ? (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("editor.animation")}</span>
                  <span>{template.animation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("editor.fontSize")}</span>
                  <span>{template.fontSize}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("editor.color")}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.color }}
                    />
                    <span>{template.color}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
