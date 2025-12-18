import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, Sparkles, Video, Clock, LogOut, Wand2, Pencil, Play, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { VideoEditor } from "@/components/VideoEditor";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user, loading, signOut } = useAuth(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  // If video is selected, show editor
  if (selectedVideo) {
    return <VideoEditor videoUrl={selectedVideo} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("dashboard.welcome")}{" "}
                <span className="text-gradient">monshort.com</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
          
          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* File Upload */}
            <div
              className={`glass-hover p-8 rounded-3xl border-2 border-dashed transition-all ${
                isDragging ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                if (files[0]) {
                  const url = URL.createObjectURL(files[0]);
                  setSelectedVideo(url);
                }
              }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 animate-glow">
                  <Upload className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("dashboard.upload.title")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("dashboard.upload.desc")}
                </p>
                <Button 
                  variant="glass" 
                  className="gap-2"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "video/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setSelectedVideo(url);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {t("dashboard.upload.button")}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  {t("dashboard.upload.format")}
                </p>
              </div>
            </div>
            
            {/* URL Import */}
            <div className="glass-hover p-8 rounded-3xl">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-6 animate-glow">
                  <LinkIcon className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("dashboard.url.title")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("dashboard.url.desc")}
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t("dashboard.url.placeholder")}
                    className="w-full px-4 py-3 glass rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Button variant="hero" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t("dashboard.url.button")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Creative Tools Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Outils IA Créatifs
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Image Generation */}
              <Card className="glass-hover border-border/50 overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
                  <div className="relative z-10 bg-primary/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Wand2 className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    Génération d'images IA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Créez des visuels uniques pour vos shorts à partir de descriptions textuelles. 6 styles artistiques disponibles.
                  </p>
                </CardContent>
              </Card>

              {/* Image Editing */}
              <Card className="glass-hover border-border/50 overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
                  <div className="relative z-10 bg-accent/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Pencil className="w-10 h-10 text-accent" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-accent" />
                    Édition d'images IA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Modifiez vos images avec des instructions en langage naturel. Changez les couleurs, le style, l'ambiance.
                  </p>
                </CardContent>
              </Card>

              {/* Image to Video */}
              <Card className="glass-hover border-border/50 overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
                <div className="aspect-video bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
                  <div className="relative z-10 bg-green-500/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-500" />
                    Image → Vidéo animée
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Transformez vos images statiques en vidéos animées avec des effets de zoom, panoramique et Ken Burns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Recent Clips */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t("dashboard.recent")}</h2>
              <Button variant="ghost" size="sm">
                {t("dashboard.viewAll")}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-hover rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{t("dashboard.untitled")} #{i}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {language === "en" ? "" : t("dashboard.ago")} {i} {i > 1 ? t("dashboard.days") : t("dashboard.day")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
