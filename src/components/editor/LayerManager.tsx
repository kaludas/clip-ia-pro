import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Layers, MoveUp, MoveDown, Trash2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Layer {
  id: string;
  type: "text" | "image" | "overlay";
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
}

interface LayerManagerProps {
  layers?: Layer[];
  onLayerUpdate?: (layers: Layer[]) => void;
}

export const LayerManager = ({ layers: initialLayers = [], onLayerUpdate }: LayerManagerProps) => {
  const { t } = useLanguage();
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const handleMoveUp = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index > 0) {
      const newLayers = [...layers];
      [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
      newLayers[index - 1].zIndex = index;
      newLayers[index].zIndex = index - 1;
      setLayers(newLayers);
      onLayerUpdate?.(newLayers);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      newLayers[index].zIndex = index + 1;
      newLayers[index + 1].zIndex = index;
      setLayers(newLayers);
      onLayerUpdate?.(newLayers);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    setLayers(newLayers);
    onLayerUpdate?.(newLayers);
  };

  const handleDelete = (id: string) => {
    const newLayers = layers.filter(layer => layer.id !== id);
    setLayers(newLayers);
    onLayerUpdate?.(newLayers);
    if (selectedLayer === id) setSelectedLayer(null);
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, opacity } : layer
    );
    setLayers(newLayers);
    onLayerUpdate?.(newLayers);
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4" />
        <h3 className="text-sm font-semibold">{t("editor.layers")}</h3>
        <Badge variant="secondary" className="ml-auto">
          {layers.length}
        </Badge>
      </div>

      {/* Layers List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t("editor.noLayers")}
          </div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`glass p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                selectedLayer === layer.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedLayer(layer.id)}
            >
              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(layer.id);
                }}
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {layer.type}
                  </Badge>
                  <span className="text-sm truncate">{layer.name}</span>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(layer.id);
                  }}
                  disabled={index === 0}
                >
                  <MoveUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(layer.id);
                  }}
                  disabled={index === layers.length - 1}
                >
                  <MoveDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(layer.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Opacity Control for Selected Layer */}
      {selectedLayerData && (
        <div className="space-y-2 p-3 glass rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("editor.opacity")}</span>
            <Badge variant="secondary">{selectedLayerData.opacity}%</Badge>
          </div>
          <Slider
            value={[selectedLayerData.opacity]}
            onValueChange={([value]) => handleOpacityChange(selectedLayerData.id, value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
