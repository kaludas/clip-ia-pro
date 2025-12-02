import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Languages, Crop, Subtitles, Target, Zap, Calendar, Music, Palette,
  Gauge, Layers, Play, Type, Clock, TrendingUp, Instagram, Youtube, 
  Brain, Mic, ShoppingBag, BarChart3, Users, Lock, Shield, FileCheck,
  Share2, Save, GitCompare, AlertTriangle, FileAudio, ChevronLeft, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ParticleEffect = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

const AllFeaturesList = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      title: "🎬 Éditeur Vidéo (Core)",
      color: "hsl(195 100% 55%)",
      gradient: "from-primary to-accent",
      features: [
        { icon: Sparkles, name: "Détection IA des moments viraux", plan: "Gratuit" },
        { icon: Crop, name: "Recadrage automatique 9:16", plan: "Gratuit" },
        { icon: Subtitles, name: "Sous-titres automatiques avec style", plan: "Gratuit" },
        { icon: Languages, name: "Traduction multilingue IA", plan: "Premium" },
        { icon: Target, name: "Suggestions mots-clés viraux", plan: "Premium" },
        { icon: Zap, name: "Export optimisé plateformes", plan: "Premium" }
      ]
    },
    {
      title: "🎨 Outils Visuels Avancés",
      color: "hsl(190 95% 45%)",
      gradient: "from-accent to-primary",
      features: [
        { icon: Gauge, name: "Contrôle de vitesse (Slow-motion/Accéléré)", plan: "Pro" },
        { icon: Layers, name: "Gestion des calques (Layers)", plan: "Pro" },
        { icon: Type, name: "Modèles de titrage animé", plan: "Pro" },
        { icon: Palette, name: "Filtres et effets visuels", plan: "Premium" },
        { icon: Play, name: "Overlays et masques", plan: "Pro" }
      ]
    },
    {
      title: "🎵 Audio et Musique",
      color: "hsl(195 100% 55%)",
      gradient: "from-primary to-accent",
      features: [
        { icon: Music, name: "Bibliothèque musicale libre de droits", plan: "Premium" },
        { icon: FileAudio, name: "Normalisation et mixage audio IA", plan: "Pro" },
        { icon: Mic, name: "Profil vocal et ton de voix IA", plan: "Pro" },
        { icon: Clock, name: "Édition audio timeline avec waveform", plan: "Pro" },
        { icon: Shield, name: "Vérificateur droit d'auteur audio", plan: "Premium" }
      ]
    },
    {
      title: "🤖 Intelligence Artificielle",
      color: "hsl(190 95% 45%)",
      gradient: "from-accent to-primary",
      features: [
        { icon: Brain, name: "Reconnaissance produits/lieux", plan: "Pro" },
        { icon: Target, name: "Suggestions d'affiliation", plan: "Pro" },
        { icon: AlertTriangle, name: "Alerte contenu sensible", plan: "Pro" },
        { icon: TrendingUp, name: "Analyse viralité en temps réel", plan: "Agence" },
        { icon: GitCompare, name: "Analyse comparative IA", plan: "Agence" }
      ]
    },
    {
      title: "📅 Publication et Planification",
      color: "hsl(195 100% 55%)",
      gradient: "from-primary to-accent",
      features: [
        { icon: Calendar, name: "Planification multi-plateformes", plan: "Premium" },
        { icon: Instagram, name: "Publication automatique Instagram", plan: "Premium" },
        { icon: Youtube, name: "Publication automatique YouTube", plan: "Premium" },
        { icon: TrendingUp, name: "Optimisation horaires IA", plan: "Pro" },
        { icon: Clock, name: "Calendrier de contenu avancé", plan: "Pro" }
      ]
    },
    {
      title: "📊 Analytics et Performance",
      color: "hsl(190 95% 45%)",
      gradient: "from-accent to-primary",
      features: [
        { icon: BarChart3, name: "Suivi post-publication (vues, engagement)", plan: "Pro" },
        { icon: TrendingUp, name: "Analyse taux de rétention", plan: "Agence" },
        { icon: Brain, name: "Détection moments de chute", plan: "Agence" },
        { icon: Target, name: "Best time to post adaptatif", plan: "Pro" },
        { icon: GitCompare, name: "Comparaison avec top performers", plan: "Agence" }
      ]
    },
    {
      title: "👥 Collaboration et Partage",
      color: "hsl(195 100% 55%)",
      gradient: "from-primary to-accent",
      features: [
        { icon: Users, name: "Espace de travail collaboratif", plan: "Agence" },
        { icon: Share2, name: "Partage de lien d'édition", plan: "Gratuit" },
        { icon: Save, name: "Modèles personnalisés réutilisables", plan: "Pro" },
        { icon: FileCheck, name: "Commentaires horodatés", plan: "Agence" }
      ]
    },
    {
      title: "🛡️ Sécurité et Conformité",
      color: "hsl(190 95% 45%)",
      gradient: "from-accent to-primary",
      features: [
        { icon: Shield, name: "Vérification DMCA/Copyright", plan: "Premium" },
        { icon: Lock, name: "Détection contenu inapproprié", plan: "Pro" },
        { icon: AlertTriangle, name: "Suggestions de conformité YouTube/TikTok", plan: "Pro" }
      ]
    }
  ];

  const planColors: Record<string, string> = {
    "Gratuit": "bg-muted text-muted-foreground",
    "Premium": "bg-primary/20 text-primary",
    "Pro": "bg-accent/20 text-accent",
    "Agence": "bg-gradient-to-r from-primary to-accent text-primary-foreground"
  };

  const scrollToCategory = (index: number) => {
    setActiveCategory(index);
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.scrollWidth / categories.length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / categories.length;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setActiveCategory(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [categories.length]);

  return (
    <section className="py-16 relative overflow-hidden" id="toutes-fonctionnalites">
      {/* Particle Effects Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleEffect color="hsl(195 100% 55% / 0.4)" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-glow">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Catalogue Complet</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Toutes les{" "}
            <span className="text-gradient">Fonctionnalités</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une liste exhaustive de toutes les capacités de MonShort
          </p>
        </div>

        {/* Category Navigation Menu */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex gap-2 justify-center min-w-max px-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={activeCategory === index ? "default" : "outline"}
                size="sm"
                onClick={() => scrollToCategory(index)}
                className={`whitespace-nowrap transition-all ${
                  activeCategory === index 
                    ? 'shadow-lg shadow-primary/50 scale-105' 
                    : 'glass hover:scale-105'
                }`}
              >
                {category.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollToCategory(Math.max(0, activeCategory - 1))}
            disabled={activeCategory === 0}
            className="glass-hover"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center">
            <span className="text-sm text-muted-foreground">
              {activeCategory + 1} / {categories.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollToCategory(Math.min(categories.length - 1, activeCategory + 1))}
            disabled={activeCategory === categories.length - 1}
            className="glass-hover"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Slider Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-6 pb-4" style={{ width: `${categories.length * 100}%` }}>
            {categories.map((category, categoryIndex) => (
              <Card
                key={categoryIndex}
                className="flex-shrink-0 snap-center glass-hover border-2 relative overflow-hidden"
                style={{ width: `calc(100% / ${categories.length} - 1.5rem)` }}
              >
                {/* Particle Effects for each card */}
                <ParticleEffect color={category.color} />
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className={`h-1 w-12 rounded-full bg-gradient-to-r ${category.gradient}`}
                      style={{ boxShadow: `0 0 20px ${category.color}` }}
                    />
                    <h3 className="text-2xl md:text-3xl font-bold">{category.title}</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {category.features.map((feature, featureIndex) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={featureIndex}
                          className="glass p-4 rounded-xl flex items-start gap-4 group hover:border-primary/50 transition-all hover:scale-105"
                          style={{
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <div 
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform animate-glow`}
                            style={{ boxShadow: `0 0 15px ${category.color}` }}
                          >
                            <Icon className="w-5 h-5 text-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-2 leading-tight">
                              {feature.name}
                            </h4>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[feature.plan]}`}>
                              {feature.plan}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 justify-center mt-8">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCategory(index)}
              className={`h-2 rounded-full transition-all ${
                activeCategory === index 
                  ? 'w-8 bg-primary shadow-lg shadow-primary/50' 
                  : 'w-2 bg-muted hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-16 text-center glass-hover p-8 rounded-3xl animate-glow">
          <p className="text-xl text-muted-foreground mb-4">
            <span className="text-3xl font-bold text-gradient">50+</span> fonctionnalités
          </p>
          <p className="text-muted-foreground">
            Pour transformer vos longues vidéos en clips courts viraux
          </p>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default AllFeaturesList;
