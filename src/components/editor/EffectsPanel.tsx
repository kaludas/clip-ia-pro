import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface EffectsPanelProps {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  selectedFilter: string;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onFilterChange: (filter: string) => void;
}

export const EffectsPanel = ({
  brightness,
  contrast,
  saturation,
  blur,
  selectedFilter,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onBlurChange,
  onFilterChange,
}: EffectsPanelProps) => {
  const { t } = useLanguage();

  const filters = [
    { id: "none", name: t("editor.filter.none") },
    { id: "vintage", name: t("editor.filter.vintage") },
    { id: "cool", name: t("editor.filter.cool") },
    { id: "warm", name: t("editor.filter.warm") },
    { id: "dramatic", name: t("editor.filter.dramatic") },
  ];

  return (
    <div className="space-y-6">
      {/* Preset Filters */}
      <div>
        <h4 className="text-sm font-semibold mb-3">{t("editor.presetFilters")}</h4>
        <div className="grid grid-cols-3 gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "hero" : "outline"}
              onClick={() => onFilterChange(filter.id)}
              className="w-full"
            >
              {filter.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">{t("editor.adjustments")}</h4>
        
        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label>{t("editor.brightness")}</label>
            <span className="text-muted-foreground">{brightness}%</span>
          </div>
          <Slider
            value={[brightness]}
            onValueChange={([value]) => onBrightnessChange(value)}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label>{t("editor.contrast")}</label>
            <span className="text-muted-foreground">{contrast}%</span>
          </div>
          <Slider
            value={[contrast]}
            onValueChange={([value]) => onContrastChange(value)}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label>{t("editor.saturation")}</label>
            <span className="text-muted-foreground">{saturation}%</span>
          </div>
          <Slider
            value={[saturation]}
            onValueChange={([value]) => onSaturationChange(value)}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Blur */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label>{t("editor.blur")}</label>
            <span className="text-muted-foreground">{blur}px</span>
          </div>
          <Slider
            value={[blur]}
            onValueChange={([value]) => onBlurChange(value)}
            min={0}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
