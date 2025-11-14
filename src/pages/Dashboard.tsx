import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, Sparkles, Video, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bienvenue sur{" "}
              <span className="text-gradient">Clip'IA</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Téléchargez votre vidéo ou collez une URL pour commencer
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
                // Handle file drop
              }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 animate-glow">
                  <Upload className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-2">Télécharger un fichier</h3>
                <p className="text-muted-foreground mb-6">
                  Glissez-déposez votre vidéo ou cliquez pour parcourir
                </p>
                <Button variant="glass" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Parcourir les fichiers
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  MP4, MOV, AVI • Max 2GB
                </p>
              </div>
            </div>
            
            {/* URL Import */}
            <div className="glass-hover p-8 rounded-3xl">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-6 animate-glow">
                  <LinkIcon className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-2">Importer depuis une URL</h3>
                <p className="text-muted-foreground mb-6">
                  Collez un lien Twitch VOD ou YouTube
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="https://twitch.tv/videos/..."
                    className="w-full px-4 py-3 glass rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Button variant="hero" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyser avec l'IA
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Clips */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Clips récents</h2>
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-hover rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Clip sans titre #{i}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Il y a {i} jour{i > 1 ? 's' : ''}
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
