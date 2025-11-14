import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow">
            <Video className="w-6 h-6 text-background" />
          </div>
          <span className="text-xl font-bold text-gradient">monshort.com</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#accueil" className="text-foreground/80 hover:text-foreground transition-colors">
            {t("nav.home")}
          </a>
          <a href="#fonctionnalites" className="text-foreground/80 hover:text-foreground transition-colors">
            {t("nav.features")}
          </a>
          <a href="#tarifs" className="text-foreground/80 hover:text-foreground transition-colors">
            {t("nav.pricing")}
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleLanguage}
            className="relative"
          >
            <Globe className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 text-xs font-bold bg-primary text-background rounded-full w-5 h-5 flex items-center justify-center">
              {language.toUpperCase()}
            </span>
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost" className="hidden md:inline-flex">
              {t("nav.dashboard")}
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="hero" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {t("nav.start")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
