import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save, Sparkles, Download, ChevronLeft, Volume2 } from "lucide-react";
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
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(100);
  const [activePanel, setActivePanel] = useState<"effects" | "text" | "export" | "viral" | "speed" | "layers" | "templates" | "schedule" | "analytics" | "collaboration" | "subtitles" | "translate" | "publish" | "security" | "products" | "safety" | "virality" | "music" | "audio" | "normalize">("viral");
  
  // Subtitles state
  const [generatedSubtitles, setGeneratedSubtitles] = useState<Array<{
    start: number;
    end: number;
    text: string;
  }>>([]);
  
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        const dur = videoRef.current?.duration || 0;
        setDuration(dur);
        setTrimEnd(dur);
      });
      
      videoRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      });

      // Set initial volume
      videoRef.current.volume = volume / 100;
    }

    // Keyboard shortcuts (like CapCut)
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
              trimStart,
              videoRef.current.currentTime - 5
            );
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              trimEnd,
              videoRef.current.currentTime + 5
            );
          }
          break;
        case 'KeyI':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setTrimStart(currentTime);
            toast.success("Point d'entrée défini");
          }
          break;
        case 'KeyO':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setTrimEnd(currentTime);
            toast.success("Point de sortie défini");
          }
          break;
        case 'KeyZ':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleReset();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentTime, trimStart, trimEnd, volume]);

  // Apply filters to canvas
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    const updateCanvas = () => {
      if (video.paused && !video.ended) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      
      // Apply preset filters
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
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Draw layer overlays (filters/images uploaded by user)
      layers
        .filter(layer => layer.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .forEach(layer => {
          if (layer.url) {
            ctx.filter = "none";
            ctx.globalAlpha = layer.opacity / 100;
            // Note: For full implementation, we'd need to preload images
            // This is a placeholder showing where layers would be rendered
            ctx.globalAlpha = 1;
          }
        });
      
      // Draw text overlays
      textOverlays.forEach(overlay => {
        if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
          ctx.filter = "none";
          ctx.font = `bold ${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = "center";
          
          // Apply animation
          let x = overlay.x;
          let y = overlay.y;
          let alpha = 1;
          
          const progress = (currentTime - overlay.startTime) / (overlay.endTime - overlay.startTime);
          
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
      
      // Draw subtitles if available
      const currentSubtitle = generatedSubtitles.find(
        seg => currentTime >= seg.start && currentTime <= seg.end
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
        
        // Draw text with stroke (outline)
        ctx.strokeText(currentSubtitle.text, x, y);
        ctx.fillText(currentSubtitle.text, x, y);
      }
      
      requestAnimationFrame(updateCanvas);
    };
    
    updateCanvas();
  }, [brightness, contrast, saturation, blur, selectedFilter, textOverlays, currentTime, layers, generatedSubtitles]);
  
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

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSelectedFilter("none");
    setTextOverlays([]);
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
              }}
              onAudioRemove={(id) => {
                setAudioTracks(audioTracks.filter(track => track.id !== id));
                toast.success("Piste audio supprimée");
              }}
              onAudioTimeChange={(id, startTime, duration) => {
                setAudioTracks(audioTracks.map(track =>
                  track.id === id ? { ...track, startTime, duration } : track
                ));
              }}
              onLayerToggle={(id) => {
                setLayers(layers.map(layer =>
                  layer.id === id ? { ...layer, visible: !layer.visible } : layer
                ));
              }}
              onLayerRemove={(id) => {
                setLayers(layers.filter(layer => layer.id !== id));
                toast.success("Calque supprimé");
              }}
              onLayerTimeChange={(id, startTime, duration) => {
                setLayers(layers.map(layer =>
                  layer.id === id ? { ...layer, startTime, duration } : layer
                ));
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
                    toast.success(`✂️ Segment ${segmentIndex + 1} coupé`);
                  } else {
                    toast.error("Position de coupe invalide");
                  }
                }
              }}
              onVideoSegmentRemove={(id) => {
                setVideoSegments(videoSegments.filter(seg => seg.id !== id));
                toast.success("🗑️ Segment supprimé");
              }}
              onVideoSegmentTimeChange={(id, startTime, duration) => {
                setVideoSegments(videoSegments.map(seg =>
                  seg.id === id ? { ...seg, startTime, duration } : seg
                ));
              }}
              videoSegments={videoSegments}
              textOverlays={textOverlays}
              subtitles={generatedSubtitles}
              onTextOverlayRemove={(id) => {
                setTextOverlays(textOverlays.filter(text => text.id !== id));
                toast.success("Texte supprimé");
              }}
              onTextOverlayTimeChange={(id, startTime, endTime) => {
                setTextOverlays(textOverlays.map(text =>
                  text.id === id ? { ...text, startTime, endTime } : text
                ));
              }}
            />
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="w-80 border-l border-border/50 bg-muted/20 overflow-y-auto">
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
                  />
                </div>
              </div>
            )}

            {activePanel === "virality" && <ViralityScore videoRef={videoRef} />}
            {activePanel === "products" && <ProductRecognition videoRef={videoRef} />}
            {activePanel === "safety" && <ContentSafety videoRef={videoRef} />}
            {activePanel === "security" && (
              <SecurityChecker
                audioTitle="Extrait de stream"
                audioArtist="Streamer"
                audioUrl={videoUrl || ""}
                transcript={generatedSubtitles.map(s => s.text).join(' ')}
                platform="tiktok"
                onCheckComplete={(results) => {
                  console.log("Security check results:", results);
                }}
              />
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
              <TitleTemplates
                onApplyTemplate={(template, text) => {
                  addTextOverlay(text, template.animation);
                }}
              />
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
              <SpeedControl
                currentTime={currentTime}
                duration={duration}
                onSpeedChange={(start, end, speed) => {
                  setSpeedSegments([...speedSegments, { start, end, speed }]);
                  toast.success(`Vitesse ${speed}% appliquée de ${start.toFixed(1)}s à ${end.toFixed(1)}s`);
                }}
              />
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
            )}

            {activePanel === "normalize" && (
              <AudioNormalization
                videoRef={videoRef}
                onApplyNormalization={(settings) => {
                  console.log("Applying normalization:", settings);
                  toast.success("Paramètres de normalisation appliqués");
                }}
              />
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
                  onSubtitlesGenerated={(segments) => {
                    setGeneratedSubtitles(segments);
                    console.log("Subtitles generated:", segments);
                    toast.success(`${segments.length} segments générés !`);
                  }}
                />
              </div>
            )}

            {activePanel === "translate" && (
              <SubtitleTranslator subtitles={generatedSubtitles} />
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

            {activePanel === "schedule" && <SchedulePanel />}
            {activePanel === "analytics" && (
              <AnalyticsDashboard projectId="demo-project-id" />
            )}
            {activePanel === "collaboration" && (
              <CollaborationPanel projectId="demo-project-id" />
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
          </div>
        </div>
      </div>
    </div>
  );
};
