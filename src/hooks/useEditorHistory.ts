import { useState, useCallback, useRef } from "react";

export interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  selectedFilter: string;
  trimStart: number;
  trimEnd: number;
  textOverlays: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    animation: string;
    startTime: number;
    endTime: number;
  }>;
  layers: Array<any>;
  speedSegments: Array<{
    start: number;
    end: number;
    speed: number;
  }>;
  audioTracks: Array<{
    id: string;
    name: string;
    url: string;
    volume: number;
    startTime: number;
    duration: number;
  }>;
  videoSegments: Array<{
    id: string;
    startTime: number;
    duration: number;
  }>;
  markers: Array<{
    id: string;
    time: number;
    label: string;
    color: string;
  }>;
}

interface HistoryEntry {
  state: EditorState;
  timestamp: number;
  action: string;
}

const MAX_HISTORY = 50;

export function useEditorHistory(initialState: EditorState) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      state: initialState,
      timestamp: Date.now(),
      action: "initial"
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const saveState = useCallback((newState: EditorState, action: string) => {
    if (isUndoRedoRef.current) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({
        state: newState,
        timestamp: Date.now(),
        action
      });

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
      return history[currentIndex - 1].state;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
      return history[currentIndex + 1].state;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getHistoryInfo = useCallback(() => {
    return {
      current: currentIndex + 1,
      total: history.length,
      canUndo,
      canRedo,
      recentActions: history.slice(Math.max(0, currentIndex - 4), currentIndex + 1).map(h => h.action)
    };
  }, [currentIndex, history, canUndo, canRedo]);

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo,
    currentState: history[currentIndex]?.state || initialState
  };
}
