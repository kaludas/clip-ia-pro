import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Sparkles } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow">
            <Video className="w-6 h-6 text-background" />
          </div>
          <span className="text-xl font-bold text-gradient">Clip'IA</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Accueil
          </Link>
          <Link to="/features" className="text-foreground/80 hover:text-foreground transition-colors">
            Fonctionnalités
          </Link>
          <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Tarifs
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" className="hidden md:inline-flex">
              Dashboard
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="hero" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Commencer
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
