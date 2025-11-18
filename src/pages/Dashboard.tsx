import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, Sparkles, Video, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { VideoEditor } from "@/components/VideoEditor";

const Dashboard = () => {
  const { t, language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // If video is selected, show editor
  if (selectedVideo) {
    return <VideoEditor videoUrl={selectedVideo} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("dashboard.welcome")}{" "}
              <span className="text-gradient">monshort.com</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
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
