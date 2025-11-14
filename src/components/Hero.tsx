import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-video-ai.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">IA de dernière génération</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transformez vos{" "}
              <span className="text-gradient">vidéos longues</span>{" "}
              en clips viraux
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              L'IA qui analyse vos VOD Twitch et podcasts YouTube pour créer automatiquement 
              des clips courts optimisés pour TikTok et Shorts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="glass" size="lg" className="gap-2 w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Voir la démo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground">Clips générés</div>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div>
                <div className="text-3xl font-bold text-gradient">500+</div>
                <div className="text-sm text-muted-foreground">Créateurs actifs</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-hover rounded-3xl overflow-hidden animate-glow">
              <img 
                src={heroImage} 
                alt="Interface Clip'IA" 
                className="w-full h-auto"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 glass px-4 py-2 rounded-xl animate-float">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">IA en action</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
