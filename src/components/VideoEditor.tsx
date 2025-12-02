import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save, Sparkles, Download, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Timeline } from "./editor/Timeline";
import { EffectsPanel } from "./editor/EffectsPanel";
import { TextOverlay } from "./editor/TextOverlay";
import { ExportPanel } from "./editor/ExportPanel";
import { ViralMomentDetector } from "./ViralMomentDetector";
import { SpeedControl } from "./editor/SpeedControl";
import { LayerManager } from "./editor/LayerManager";
import { TitleTemplates } from "./editor/TitleTemplates";
import { SchedulePanel } from "./editor/SchedulePanel";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { CollaborationPanel } from "./collaboration/CollaborationPanel";
import SubtitleGenerator from "./editor/SubtitleGenerator";
import SubtitleTranslator from "./editor/SubtitleTranslator";
import SocialMediaPublisher from "./editor/SocialMediaPublisher";
import { SecurityChecker } from "./security/SecurityChecker";
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
  const [activePanel, setActivePanel] = useState<"effects" | "text" | "export" | "viral" | "speed" | "layers" | "templates" | "schedule" | "analytics" | "collaboration" | "subtitles" | "translate" | "publish" | "security">("viral");
  
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
    }
  }, []);

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
      
      requestAnimationFrame(updateCanvas);
    };
    
    updateCanvas();
  }, [brightness, contrast, saturation, blur, selectedFilter, textOverlays, currentTime]);

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
    <div className="min-h-screen pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            {t("editor.back")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("editor.reset")}
            </Button>
            <Button variant="glass" className="gap-2">
              <Save className="w-4 h-4" />
              {t("editor.save")}
            </Button>
          </div>
        </div>

        {/* Video Preview */}
        <div className="glass p-6 rounded-3xl mb-6">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6">
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
          
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="hero"
              size="icon"
              onClick={togglePlayPause}
              className="rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1">
              <Timeline
                currentTime={currentTime}
                duration={duration}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onSeek={handleSeek}
                onTrimChange={(start, end) => {
                  setTrimStart(start);
                  setTrimEnd(end);
                }}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </div>
          </div>
        </div>

        {/* Editor Panels */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Effects Panel */}
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-3xl">
              {/* Panel Tabs */}
              <div className="flex gap-2 mb-6 p-1 glass rounded-2xl overflow-x-auto">
                <Button
                  variant={activePanel === "viral" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("viral")}
                  className="flex-1 gap-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("editor.viral")}
                </Button>
                <Button
                  variant={activePanel === "effects" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("effects")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  {t("editor.effects")}
                </Button>
                <Button
                  variant={activePanel === "text" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("text")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  {t("editor.text")}
                </Button>
                <Button
                  variant={activePanel === "speed" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("speed")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  Vitesse
                </Button>
                <Button
                  variant={activePanel === "layers" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("layers")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  Calques
                </Button>
                <Button
                  variant={activePanel === "templates" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("templates")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  Titres
                </Button>
                <Button
                  variant={activePanel === "schedule" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("schedule")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  📅
                </Button>
                <Button
                  variant={activePanel === "analytics" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("analytics")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  📊
                </Button>
                <Button
                  variant={activePanel === "collaboration" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("collaboration")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  👥
                </Button>
                <Button
                  variant={activePanel === "subtitles" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("subtitles")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  CC
                </Button>
                <Button
                  variant={activePanel === "translate" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("translate")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  🌐
                </Button>
                <Button
                  variant={activePanel === "publish" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("publish")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  📤
                </Button>
                <Button
                  variant={activePanel === "security" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("security")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  🛡️
                </Button>
                <Button
                  variant={activePanel === "export" ? "hero" : "ghost"}
                  onClick={() => setActivePanel("export")}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm"
                >
                  {t("editor.export")}
                </Button>
              </div>

              {/* Panel Content */}
              {activePanel === "viral" && (
                <ViralMomentDetector 
                  videoRef={videoRef}
                  onMomentSelect={handleMomentSelect}
                />
              )}
              
              {activePanel === "effects" && (
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
              )}
              
              {activePanel === "text" && (
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
              )}
              
              {activePanel === "speed" && (
                <SpeedControl
                  currentTime={currentTime}
                  duration={duration}
                  onSpeedChange={(start, end, speed) => {
                    console.log(`Speed change: ${start}-${end} at ${speed}x`);
                    toast.success(t("editor.appliedEffects"));
                  }}
                />
              )}
              
              {activePanel === "layers" && (
                <LayerManager
                  layers={textOverlays.map(overlay => ({
                    id: overlay.id,
                    type: "text" as const,
                    name: overlay.text,
                    visible: true,
                    opacity: 100,
                    zIndex: 1
                  }))}
                  onLayerUpdate={(layers) => {
                    console.log("Layers updated:", layers);
                  }}
                />
              )}
              
              {activePanel === "templates" && (
                <TitleTemplates
                  onApplyTemplate={(template, text) => {
                    addTextOverlay(text, template.animation);
                  }}
                />
              )}
              
              {activePanel === "schedule" && <SchedulePanel />}
              
              {activePanel === "analytics" && (
                <AnalyticsDashboard projectId="demo-project-id" />
              )}
              
              {activePanel === "collaboration" && (
                <CollaborationPanel projectId="demo-project-id" />
              )}
              
              {activePanel === "subtitles" && (
                <SubtitleGenerator 
                  onSubtitlesGenerated={(segments) => {
                    setGeneratedSubtitles(segments);
                    console.log("Subtitles generated:", segments);
                    toast.success(`${segments.length} segments générés !`);
                  }}
                />
              )}
              
              {activePanel === "translate" && (
                <SubtitleTranslator subtitles={generatedSubtitles} />
              )}
              
              {activePanel === "publish" && (
                <SocialMediaPublisher videoUrl={videoUrl} duration={duration} />
              )}
              
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
              
              {activePanel === "export" && (
                <ExportPanel
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4">{t("editor.quickActions")}</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t("editor.aiSuggestions")}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  {t("editor.exportHD")}
                </Button>
              </div>
            </div>
            
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-2">{t("editor.tips")}</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t("editor.tip1")}</li>
                <li>• {t("editor.tip2")}</li>
                <li>• {t("editor.tip3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
