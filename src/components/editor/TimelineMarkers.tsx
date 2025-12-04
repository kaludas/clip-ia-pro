import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";

interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

interface TimelineMarkersProps {
  markers: Marker[];
  currentTime: number;
  duration: number;
  onAddMarker: (marker: Omit<Marker, "id">) => void;
  onRemoveMarker: (id: string) => void;
  onSeekToMarker: (time: number) => void;
}

const MARKER_COLORS = [
  { name: "Rouge", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Jaune", value: "#eab308" },
  { name: "Vert", value: "#22c55e" },
  { name: "Bleu", value: "#3b82f6" },
  { name: "Violet", value: "#a855f7" },
  { name: "Rose", value: "#ec4899" },
];

export const TimelineMarkers = ({
  markers,
  currentTime,
  duration,
  onAddMarker,
  onRemoveMarker,
  onSeekToMarker
}: TimelineMarkersProps) => {
  const [newMarkerLabel, setNewMarkerLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(MARKER_COLORS[0].value);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleAddMarker = () => {
    if (!newMarkerLabel.trim()) {
      toast.error("Veuillez saisir un nom pour le marqueur");
      return;
    }

    onAddMarker({
      time: currentTime,
      label: newMarkerLabel.trim(),
      color: selectedColor
    });

    setNewMarkerLabel("");
    toast.success("Marqueur ajouté");
  };

  return (
    <Card className="glass p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Marqueurs de timeline</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Nom du marqueur
          </label>
          <Input
            value={newMarkerLabel}
            onChange={(e) => setNewMarkerLabel(e.target.value)}
            placeholder="Ex: Début hook, Transition..."
            onKeyPress={(e) => e.key === "Enter" && handleAddMarker()}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Couleur
          </label>
          <div className="flex gap-2 flex-wrap">
            {MARKER_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color.value
                    ? "border-primary scale-110"
                    : "border-border/50 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleAddMarker}
          className="w-full gap-2"
          variant="hero"
        >
          <Plus className="w-4 h-4" />
          Ajouter au temps actuel ({formatTime(currentTime)})
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4" />
          <span>Marqueurs ({markers.length})</span>
        </div>

        <ScrollArea className="h-64">
          {markers.length > 0 ? (
            <div className="space-y-2">
              {markers
                .sort((a, b) => a.time - b.time)
                .map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => onSeekToMarker(marker.time)}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: marker.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {marker.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(marker.time)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMarker(marker.id);
                        toast.success("Marqueur supprimé");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              Aucun marqueur ajouté
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
        <p>💡 Utilisez les marqueurs pour annoter les moments clés de votre montage</p>
      </div>
    </Card>
  );
};
