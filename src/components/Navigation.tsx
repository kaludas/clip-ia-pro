import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Globe, User, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/sessions" className="cursor-pointer">
                        Sessions
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="hidden md:inline-flex">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t("nav.start")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
