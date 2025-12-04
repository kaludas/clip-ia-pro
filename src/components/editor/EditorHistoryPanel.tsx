import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Undo2, Redo2, History, Clock } from "lucide-react";

interface EditorHistoryPanelProps {
  historyInfo: {
    current: number;
    total: number;
    canUndo: boolean;
    canRedo: boolean;
    recentActions: string[];
  };
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorHistoryPanel = ({
  historyInfo,
  onUndo,
  onRedo
}: EditorHistoryPanelProps) => {
  return (
    <Card className="glass p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Historique</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {historyInfo.current} / {historyInfo.total}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!historyInfo.canUndo}
          className="flex-1 gap-2"
        >
          <Undo2 className="w-4 h-4" />
          Annuler
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!historyInfo.canRedo}
          className="flex-1 gap-2"
        >
          <Redo2 className="w-4 h-4" />
          Rétablir
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Actions récentes</span>
        </div>
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {historyInfo.recentActions.length > 0 ? (
              historyInfo.recentActions.map((action, index) => (
                <div
                  key={index}
                  className={`text-sm px-3 py-2 rounded ${
                    index === historyInfo.recentActions.length - 1
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {action}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Aucune action enregistrée
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
        <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> Annuler</p>
        <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+Y</kbd> Rétablir</p>
      </div>
    </Card>
  );
};
