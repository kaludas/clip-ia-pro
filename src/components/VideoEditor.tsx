import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save, Sparkles, Download, ChevronLeft, Volume2, Undo2, Redo2, History, Bookmark } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UnifiedTimeline } from "./editor/UnifiedTimeline";
import { EffectsPanel } from "./editor/EffectsPanel";
import { TextOverlay } from "./editor/TextOverlay";
import { ExportPanel } from "./editor/ExportPanel";
import { ViralMomentDetector } from "./ViralMomentDetector";
import { SpeedControl } from "./editor/SpeedControl";
import { LayerManager, Layer } from "./editor/LayerManager";
import { TitleTemplates } from "./editor/TitleTemplates";
import { SchedulePanel } from "./editor/SchedulePanel";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { CollaborationPanel } from "./collaboration/CollaborationPanel";
import SubtitleGenerator from "./editor/SubtitleGenerator";
import SubtitleTranslator from "./editor/SubtitleTranslator";
import SocialMediaPublisher from "./editor/SocialMediaPublisher";
import { SecurityChecker } from "./security/SecurityChecker";
import { ProductRecognition } from "./editor/ProductRecognition";
import { ContentSafety } from "./editor/ContentSafety";
import { ViralityScore } from "./editor/ViralityScore";
import { MusicLibrary } from "./editor/MusicLibrary";
import { AudioTimeline } from "./editor/AudioTimeline";
import { AudioNormalization } from "./editor/AudioNormalization";
import { EditorHistoryPanel } from "./editor/EditorHistoryPanel";
import { TimelineMarkers } from "./editor/TimelineMarkers";
import { useEditorHistory, EditorState } from "@/hooks/useEditorHistory";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VideoEditorProps {
  videoUrl?: string;
}

export const VideoEditor = ({ videoUrl }: VideoEditorProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(100);
  const [activePanel, setActivePanel] = useState<"effects" | "text" | "export" | "viral" | "speed" | "layers" | "templates" | "schedule" | "analytics" | "collaboration" | "subtitles" | "translate" | "publish" | "security" | "products" | "safety" | "virality" | "music" | "audio" | "normalize" | "history" | "markers">("viral");
  
  // Markers state
  const [markers, setMarkers] = useState<Array<{
    id: string;
    time: number;
    label: string;
    color: string;
  }>>([]);
  
  // Subtitles state
  const [generatedSubtitles, setGeneratedSubtitles] = useState<Array<{
    start: number;
    end: number;
    text: string;
  }>>([]);
  
  // Translated subtitles state (multiple languages)
  const [translatedSubtitles, setTranslatedSubtitles] = useState<Record<string, Array<{
    start: number;
    end: number;
    text: string;
  }>>>({});
  
  // Viral moments state
  const [viralMoments, setViralMoments] = useState<Array<{
    start: number;
    end: number;
    reason: string;
    hook: string;
    score: number;
    tags: string[];
  }>>([]);
  
  // Transcription state (persist subtitle generation)
  const [transcriptionData, setTranscriptionData] = useState<{
    text: string;
    segments: Array<{ start: number; end: number; text: string; }>;
  } | null>(null);

  // AI features persistence
  const [viralityAnalysis, setViralityAnalysis] = useState<any>(null);
  const [productRecognition, setProductRecognition] = useState<any>(null);
  const [contentSafety, setContentSafety] = useState<any>(null);
  const [securityCheck, setSecurityCheck] = useState<any>(null);
  
  // Effects state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  
  // Text overlays
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    animation: string;
    startTime: number;
    endTime: number;
  }>>([]);

  // Layers state
  const [layers, setLayers] = useState<Layer[]>([]);
  const [layerImages, setLayerImages] = useState<Record<string, HTMLImageElement>>({});
  
  // Speed segments state
  const [speedSegments, setSpeedSegments] = useState<Array<{
    start: number;
    end: number;
    speed: number;
  }>>([]);

  // Audio tracks state
  const [audioTracks, setAudioTracks] = useState<Array<{
    id: string;
    name: string;
    url: string;
    volume: number;
    startTime: number;
    duration: number;
  }>>([]);

  // Video segments state (for split functionality)
  const [videoSegments, setVideoSegments] = useState<Array<{
    id: string;
    startTime: number;
    duration: number;
  }>>([]);

  // Initialize editor history
  const initialState: EditorState = {
    brightness,
    contrast,
    saturation,
    blur,
    selectedFilter,
    trimStart,
    trimEnd,
    textOverlays,
    layers,
    speedSegments,
    audioTracks,
    videoSegments,
    markers
  };

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo
  } = useEditorHistory(initialState);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration || 0;
      setDuration(dur);
      setTrimEnd(dur);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // Met à jour le volume sans recréer le lecteur
      video.volume = volume / 100;
    }

    // Raccourcis clavier (type CapCut)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          if (!videoRef.current) return;

          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
              trimStart,
              videoRef.current.currentTime - 5
            );
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              trimEnd,
              videoRef.current.currentTime + 5
            );
          }
          break;
        }
        case "KeyI": {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const time = videoRef.current?.currentTime ?? trimStart;
            setTrimStart(time);
            toast.success("Point d'entrée défini");
          }
          break;
        }
        case "KeyO": {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const time = videoRef.current?.currentTime ?? trimEnd;
            setTrimEnd(time);
            toast.success("Point de sortie défini");
          }
          break;
        }
        case "KeyZ": {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        }
        case "KeyY": {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRedo();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [trimStart, trimEnd, volume, t]);

  // Preload layer images
  useEffect(() => {
    layers.forEach(layer => {
      if (layer.url && layer.type !== 'text' && !layerImages[layer.id]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLayerImages(prev => ({ ...prev, [layer.id]: img }));
        };
        img.src = layer.url;
      }
    });
  }, [layers]);

  // Applique les filtres sur le canvas avec une boucle requestAnimationFrame contrôlée
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderFrame = () => {
      if (!video || !canvas) return;

      // Dimensionne le canvas en fonction de la vidéo
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const time = video.currentTime || 0;

      // Effets de base
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

      // Filtres prédéfinis
      if (selectedFilter !== "none") {
        switch (selectedFilter) {
          case "vintage":
            ctx.filter += " sepia(0.5) hue-rotate(-10deg)";
            break;
          case "cool":
            ctx.filter += " hue-rotate(180deg) saturate(150%)";
            break;
          case "warm":
            ctx.filter += " hue-rotate(-20deg) saturate(120%)";
            break;
          case "dramatic":
            ctx.filter += " contrast(150%) saturate(80%)";
            break;
        }
      }

      // Image vidéo de base
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Calques overlays (images/overlays)
      layers
        .filter(layer => layer.visible && time >= layer.startTime && time < layer.startTime + layer.duration)
        .sort((a, b) => a.zIndex - b.zIndex)
        .forEach(layer => {
          if (layer.url && layerImages[layer.id]) {
            ctx.filter = "none";
            ctx.globalAlpha = layer.opacity / 100;

            const img = layerImages[layer.id];
            const position = layer.position || { x: 50, y: 50 };
            const scale = layer.scale || 1;

            const x = (position.x / 100) * canvas.width;
            const y = (position.y / 100) * canvas.height;

            const imgWidth = img.width * scale;
            const imgHeight = img.height * scale;

            ctx.save();
            ctx.translate(x, y);
            if (layer.rotation) {
              ctx.rotate((layer.rotation * Math.PI) / 180);
            }
            ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            ctx.restore();

            ctx.globalAlpha = 1;
          }
        });

      // Textes
      textOverlays.forEach(overlay => {
        if (time >= overlay.startTime && time <= overlay.endTime) {
          ctx.filter = "none";
          ctx.font = `bold ${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = "center";

          let x = overlay.x;
          let y = overlay.y;
          let alpha = 1;

          const progress = (time - overlay.startTime) / (overlay.endTime - overlay.startTime);

          if (overlay.animation === "fadeIn") {
            alpha = Math.min(progress * 3, 1);
          } else if (overlay.animation === "slideUp") {
            y = overlay.y + (1 - Math.min(progress * 2, 1)) * 100;
          } else if (overlay.animation === "bounce") {
            const bounce = Math.sin(progress * Math.PI * 2) * 20;
            y = overlay.y + bounce;
          }

          ctx.globalAlpha = alpha;
          ctx.fillText(overlay.text, x, y);
          ctx.globalAlpha = 1;
        }
      });

      // Sous-titres
      const currentSubtitle = generatedSubtitles.find(
        seg => time >= seg.start && time <= seg.end
      );

      if (currentSubtitle) {
        ctx.filter = "none";
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        const x = canvas.width / 2;
        const y = canvas.height - 50;

        ctx.strokeText(currentSubtitle.text, x, y);
        ctx.fillText(currentSubtitle.text, x, y);
      }

      // Tant que la vidéo lit, on continue la boucle d'animation
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    // Premier rendu (par exemple en pause ou après un seek)
    renderFrame();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [brightness, contrast, saturation, blur, selectedFilter, textOverlays, layers, generatedSubtitles, layerImages, isPlaying]);
  
  // Apply speed control based on current time
  useEffect(() => {
    if (!videoRef.current) return;
    
    const activeSegment = speedSegments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
    
    if (activeSegment) {
      videoRef.current.playbackRate = activeSegment.speed / 100;
    } else {
      videoRef.current.playbackRate = 1;
    }
  }, [currentTime, speedSegments]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      applyState(previousState);
      toast.success("Annulé");
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      applyState(nextState);
      toast.success("Rétabli");
    }
  };

  const applyState = (state: EditorState) => {
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setBlur(state.blur);
    setSelectedFilter(state.selectedFilter);
    setTrimStart(state.trimStart);
    setTrimEnd(state.trimEnd);
    setTextOverlays(state.textOverlays);
    setLayers(state.layers);
    setSpeedSegments(state.speedSegments);
    setAudioTracks(state.audioTracks);
    setVideoSegments(state.videoSegments);
    setMarkers(state.markers);
  };

  const saveCurrentState = (action: string) => {
    const currentState: EditorState = {
      brightness,
      contrast,
      saturation,
      blur,
      selectedFilter,
      trimStart,
      trimEnd,
      textOverlays,
      layers,
      speedSegments,
      audioTracks,
      videoSegments,
      markers
    };
    saveState(currentState, action);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSelectedFilter("none");
    setTextOverlays([]);
    saveCurrentState("reset");
    toast.success(t("editor.reset"));
  };

  const addTextOverlay = (text: string, animation: string = "none") => {
    const newOverlay = {
      id: Date.now().toString(),
      text,
      x: canvasRef.current?.width ? canvasRef.current.width / 2 : 400,
      y: canvasRef.current?.height ? canvasRef.current.height / 2 : 300,
      fontSize: 48,
      color: "#FFFFFF",
      animation,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
    };
    setTextOverlays([...textOverlays, newOverlay]);
    saveCurrentState("add_text");
    toast.success(t("editor.textAdded"));
  };

  const handleMomentSelect = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
    if (videoRef.current) {
      videoRef.current.currentTime = start;
    }
    setActivePanel("effects");
  };

  return (
    <div className="min-h-screen pt-20 pb-4 bg-background">
      {/* Header */}
      <div className="px-6 pb-4 border-b border-border/50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            {t("editor.back")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("editor.reset")}
            </Button>
            <Button variant="default" className="gap-2 bg-primary text-primary-foreground">
              <Save className="w-4 h-4" />
              {t("editor.save")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Categories */}
        <div className="w-24 border-r border-border/50 bg-muted/30 flex flex-col items-center py-4 gap-2 overflow-y-auto">
          <Button
            variant={activePanel === "viral" ? "default" : "ghost"}
            onClick={() => setActivePanel("viral")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="IA Virale"
          >
            <Sparkles className="w-5 h-5" />
            <span>IA</span>
          </Button>
          <Button
            variant={activePanel === "layers" ? "default" : "ghost"}
            onClick={() => setActivePanel("layers")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Médias"
          >
            <span className="text-lg">🎬</span>
            <span>Médias</span>
          </Button>
          <Button
            variant={activePanel === "text" ? "default" : "ghost"}
            onClick={() => setActivePanel("text")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Texte"
          >
            <span className="text-lg">📝</span>
            <span>Texte</span>
          </Button>
          <Button
            variant={activePanel === "effects" ? "default" : "ghost"}
            onClick={() => setActivePanel("effects")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Effets"
          >
            <span className="text-lg">✨</span>
            <span>Effets</span>
          </Button>
          <Button
            variant={activePanel === "music" ? "default" : "ghost"}
            onClick={() => setActivePanel("music")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Audio"
          >
            <Volume2 className="w-5 h-5" />
            <span>Audio</span>
          </Button>
          <Button
            variant={activePanel === "subtitles" ? "default" : "ghost"}
            onClick={() => setActivePanel("subtitles")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Sous-titres"
          >
            <span className="text-lg">CC</span>
            <span>CC</span>
          </Button>
          <Button
            variant={activePanel === "publish" ? "default" : "ghost"}
            onClick={() => setActivePanel("publish")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Publication"
          >
            <span className="text-lg">📤</span>
            <span>Publier</span>
          </Button>
          <Button
            variant={activePanel === "export" ? "default" : "ghost"}
            onClick={() => setActivePanel("export")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Export"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </Button>
          <Button
            variant={activePanel === "history" ? "default" : "ghost"}
            onClick={() => setActivePanel("history")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Historique"
          >
            <History className="w-5 h-5" />
            <span>Histo</span>
          </Button>
          <Button
            variant={activePanel === "markers" ? "default" : "ghost"}
            onClick={() => setActivePanel("markers")}
            className="w-16 h-16 flex-col gap-1 text-xs"
            title="Marqueurs"
          >
            <Bookmark className="w-5 h-5" />
            <span>Mark</span>
          </Button>
        </div>

        {/* Center - Video Preview & Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-6 bg-black/20">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src={videoUrl || "/placeholder-video.mp4"}
                className="absolute inset-0 w-full h-full object-contain opacity-0"
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-border/50 bg-muted/20">
            <UnifiedTimeline
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              volume={volume}
              trimStart={trimStart}
              trimEnd={trimEnd}
              audioTracks={audioTracks}
              layers={layers}
              onSeek={handleSeek}
              onPlayPause={togglePlayPause}
              onVolumeChange={(vol) => {
                setVolume(vol);
                if (videoRef.current) {
                  videoRef.current.volume = vol / 100;
                }
              }}
              onTrimChange={(start, end) => {
                setTrimStart(start);
                setTrimEnd(end);
                saveCurrentState("trim");
              }}
              onSkip={(seconds) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(
                    trimStart,
                    Math.min(trimEnd, videoRef.current.currentTime + seconds)
                  );
                }
              }}
              onAudioVolumeChange={(id, vol) => {
                setAudioTracks(audioTracks.map(track =>
                  track.id === id ? { ...track, volume: vol } : track
                ));
                saveCurrentState("audio_volume");
              }}
              onAudioRemove={(id) => {
                setAudioTracks(audioTracks.filter(track => track.id !== id));
                saveCurrentState("remove_audio");
                toast.success("Piste audio supprimée");
              }}
              onAudioTimeChange={(id, startTime, duration) => {
                setAudioTracks(audioTracks.map(track =>
                  track.id === id ? { ...track, startTime, duration } : track
                ));
                saveCurrentState("audio_position");
              }}
              onLayerToggle={(id) => {
                setLayers(layers.map(layer =>
                  layer.id === id ? { ...layer, visible: !layer.visible } : layer
                ));
                saveCurrentState("layer_toggle");
              }}
              onLayerRemove={(id) => {
                setLayers(layers.filter(layer => layer.id !== id));
                saveCurrentState("remove_layer");
                toast.success("Calque supprimé");
              }}
              onLayerTimeChange={(id, startTime, duration) => {
                setLayers(layers.map(layer =>
                  layer.id === id ? { ...layer, startTime, duration } : layer
                ));
                saveCurrentState("layer_position");
              }}
              onVideoSplit={(time) => {
                if (videoSegments.length === 0) {
                  const seg1 = {
                    id: `seg-${Date.now()}-1`,
                    startTime: trimStart,
                    duration: time - trimStart
                  };
                  const seg2 = {
                    id: `seg-${Date.now()}-2`,
                    startTime: time,
                    duration: trimEnd - time
                  };
                  setVideoSegments([seg1, seg2]);
                  saveCurrentState("split_video");
                  toast.success("✂️ Vidéo coupée en 2 segments");
                } else {
                  const segmentIndex = videoSegments.findIndex(
                    seg => time >= seg.startTime && time <= seg.startTime + seg.duration
                  );
                  
                  if (segmentIndex !== -1) {
                    const segment = videoSegments[segmentIndex];
                    const newSegments = [...videoSegments];
                    
                    const seg1 = {
                      id: `seg-${Date.now()}-1`,
                      startTime: segment.startTime,
                      duration: time - segment.startTime
                    };
                    const seg2 = {
                      id: `seg-${Date.now()}-2`,
                      startTime: time,
                      duration: (segment.startTime + segment.duration) - time
                    };
                    
                    newSegments.splice(segmentIndex, 1, seg1, seg2);
                    setVideoSegments(newSegments);
                    saveCurrentState("split_segment");
                    toast.success(`✂️ Segment ${segmentIndex + 1} coupé`);
                  } else {
                    toast.error("Position de coupe invalide");
                  }
                }
              }}
              onVideoSegmentRemove={(id) => {
                setVideoSegments(videoSegments.filter(seg => seg.id !== id));
                saveCurrentState("remove_segment");
                toast.success("🗑️ Segment supprimé");
              }}
              onVideoSegmentTimeChange={(id, startTime, duration) => {
                setVideoSegments(videoSegments.map(seg =>
                  seg.id === id ? { ...seg, startTime, duration } : seg
                ));
                saveCurrentState("segment_position");
              }}
              videoSegments={videoSegments}
              textOverlays={textOverlays}
              subtitles={generatedSubtitles}
              translatedSubtitles={translatedSubtitles}
              onTextOverlayRemove={(id) => {
                setTextOverlays(textOverlays.filter(text => text.id !== id));
                saveCurrentState("remove_text");
                toast.success("Texte supprimé");
              }}
              onTextOverlayTimeChange={(id, startTime, endTime) => {
                setTextOverlays(textOverlays.map(text =>
                  text.id === id ? { ...text, startTime, endTime } : text
                ));
                saveCurrentState("text_position");
              }}
              markers={markers}
            />
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="w-[420px] border-l border-border/50 bg-muted/20 overflow-y-auto">
          <div className="p-4">
            {/* IA Virale */}
            {activePanel === "viral" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">🎯 IA Virale</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePanel("viral")}
                  >
                    <Sparkles className="w-4 h-4" />
                    Moments viraux
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePanel("virality")}
                  >
                    🎯 Score viralité
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePanel("products")}
                  >
                    📦 Produits
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePanel("safety")}
                  >
                    🛡️ Modération
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePanel("security")}
                  >
                    ©️ Copyright
                  </Button>
                </div>
                <div className="mt-6">
              <ViralMomentDetector 
                videoRef={videoRef}
                onMomentSelect={handleMomentSelect}
                existingMoments={viralMoments}
                onMomentsUpdate={setViralMoments}
                translatedSubtitles={translatedSubtitles}
              />
                </div>
              </div>
            )}

            {activePanel === "virality" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("viral")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <ViralityScore 
                  videoRef={videoRef}
                  existingAnalysis={viralityAnalysis}
                  onAnalysisComplete={setViralityAnalysis}
                />
              </div>
            )}
            
            {activePanel === "products" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("viral")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <ProductRecognition 
                  videoRef={videoRef}
                  existingRecognition={productRecognition}
                  onRecognitionComplete={setProductRecognition}
                />
              </div>
            )}
            
            {activePanel === "safety" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("viral")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <ContentSafety 
                  videoRef={videoRef}
                  existingModeration={contentSafety}
                  onModerationComplete={setContentSafety}
                />
              </div>
            )}
            
            {activePanel === "security" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("viral")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <SecurityChecker
                  audioTitle="Extrait de stream"
                  audioArtist="Streamer"
                  audioUrl={videoUrl || ""}
                  transcript={generatedSubtitles.map(s => s.text).join(' ')}
                  platform="tiktok"
                  existingResults={securityCheck}
                  onCheckComplete={setSecurityCheck}
                />
              </div>
            )}

            {/* Médias */}
            {activePanel === "layers" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">🎬 Médias & Calques</h3>
                <LayerManager
                  layers={layers}
                  onLayerUpdate={setLayers}
                  videoDuration={duration}
                />
              </div>
            )}

            {/* Texte */}
            {activePanel === "text" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">📝 Texte & Titres</h3>
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    Texte personnalisé
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("templates")}
                  >
                    Modèles de titres
                  </Button>
                </div>
                <TextOverlay
                  textOverlays={textOverlays}
                  onAddText={addTextOverlay}
                  onUpdateText={(id, updates) => {
                    setTextOverlays(textOverlays.map(overlay => 
                      overlay.id === id ? { ...overlay, ...updates } : overlay
                    ));
                  }}
                  onDeleteText={(id) => {
                    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
                  }}
                />
              </div>
            )}

            {activePanel === "templates" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("text")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <TitleTemplates
                  onApplyTemplate={(template, text) => {
                    addTextOverlay(text, template.animation);
                  }}
                />
              </div>
            )}

            {/* Effets */}
            {activePanel === "effects" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">✨ Effets & Vitesse</h3>
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    Filtres visuels
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("speed")}
                  >
                    Contrôle vitesse
                  </Button>
                </div>
                <EffectsPanel
                  brightness={brightness}
                  contrast={contrast}
                  saturation={saturation}
                  blur={blur}
                  selectedFilter={selectedFilter}
                  onBrightnessChange={setBrightness}
                  onContrastChange={setContrast}
                  onSaturationChange={setSaturation}
                  onBlurChange={setBlur}
                  onFilterChange={setSelectedFilter}
                />
              </div>
            )}

            {activePanel === "speed" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("effects")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <SpeedControl
                  currentTime={currentTime}
                  duration={duration}
                  onSpeedChange={(start, end, speed) => {
                    setSpeedSegments([...speedSegments, { start, end, speed }]);
                    toast.success(`Vitesse ${speed}% appliquée de ${start.toFixed(1)}s à ${end.toFixed(1)}s`);
                  }}
                />
              </div>
            )}

            {/* Audio */}
            {activePanel === "music" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">🎵 Audio & Musique</h3>
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    Bibliothèque musicale
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("audio")}
                  >
                    🎚️ Timeline audio
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("normalize")}
                  >
                    🎛️ Normalisation IA
                  </Button>
                </div>
                <MusicLibrary
                  onTrackSelect={(track) => {
                    setAudioTracks([...audioTracks, {
                      id: track.id,
                      name: track.title,
                      url: track.file_path,
                      volume: 80,
                      startTime: 0,
                      duration: track.duration
                    }]);
                  }}
                />
              </div>
            )}

            {activePanel === "audio" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("music")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <AudioTimeline
                  tracks={audioTracks}
                  currentTime={currentTime}
                  totalDuration={duration}
                  onVolumeChange={(trackId, volume) => {
                    setAudioTracks(audioTracks.map(track =>
                      track.id === trackId ? { ...track, volume } : track
                    ));
                  }}
                  onTrackRemove={(trackId) => {
                    setAudioTracks(audioTracks.filter(track => track.id !== trackId));
                  }}
                />
              </div>
            )}

            {activePanel === "normalize" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("music")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <AudioNormalization
                  videoRef={videoRef}
                  onApplyNormalization={(settings) => {
                    console.log("Applying normalization:", settings);
                    toast.success("Paramètres de normalisation appliqués");
                  }}
                />
              </div>
            )}

            {/* Sous-titres */}
            {activePanel === "subtitles" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">CC Sous-titres</h3>
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    Générer sous-titres
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("translate")}
                  >
                    🌐 Traduire
                  </Button>
                </div>
                <SubtitleGenerator 
                  videoUrl={videoUrl}
                  existingTranscription={transcriptionData}
                  onSubtitlesGenerated={(segments) => {
                    setGeneratedSubtitles(segments);
                    setTranscriptionData({
                      text: segments.map(s => s.text).join(' '),
                      segments
                    });
                    console.log("Subtitles generated:", segments);
                    toast.success(`${segments.length} segments générés !`);
                  }}
                />
              </div>
            )}

            {activePanel === "translate" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("subtitles")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <SubtitleTranslator 
                  subtitles={generatedSubtitles}
                  existingTranslations={translatedSubtitles}
                  onTranslationsGenerated={(translations) => {
                    setTranslatedSubtitles(translations);
                    console.log("Translations generated:", translations);
                    toast.success("Traductions générées avec succès !");
                  }}
                />
              </div>
            )}

            {/* Publication */}
            {activePanel === "publish" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">📤 Publication</h3>
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    Réseaux sociaux
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("schedule")}
                  >
                    📅 Planifier
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("analytics")}
                  >
                    📊 Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActivePanel("collaboration")}
                  >
                    👥 Collaboration
                  </Button>
                </div>
                <SocialMediaPublisher videoUrl={videoUrl} duration={duration} />
              </div>
            )}

            {activePanel === "schedule" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("publish")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <SchedulePanel />
              </div>
            )}
            
            {activePanel === "analytics" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("publish")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <AnalyticsDashboard projectId="demo-project-id" />
              </div>
            )}
            
            {activePanel === "collaboration" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setActivePanel("publish")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <CollaborationPanel projectId="demo-project-id" />
              </div>
            )}

            {/* Export */}
            {activePanel === "export" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm mb-4">💾 Export</h3>
                <ExportPanel
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                />
              </div>
            )}

            {/* History */}
            {activePanel === "history" && (
              <div className="space-y-4">
                <EditorHistoryPanel
                  historyInfo={getHistoryInfo()}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              </div>
            )}

            {/* Markers */}
            {activePanel === "markers" && (
              <div className="space-y-4">
                <TimelineMarkers
                  markers={markers}
                  currentTime={currentTime}
                  duration={duration}
                  onAddMarker={(marker) => {
                    const newMarker = {
                      ...marker,
                      id: `marker-${Date.now()}`
                    };
                    setMarkers([...markers, newMarker]);
                    saveCurrentState("add_marker");
                  }}
                  onRemoveMarker={(id) => {
                    setMarkers(markers.filter(m => m.id !== id));
                    saveCurrentState("remove_marker");
                  }}
                  onSeekToMarker={(time) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
