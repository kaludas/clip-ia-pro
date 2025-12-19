import { useState } from "react";
import { Sparkles, Wand2, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const AIGallery = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'generated' | 'edited' | 'animated'>('generated');

  // Example gallery items showcasing AI capabilities
  const galleryItems = {
    generated: [
      {
        id: 1,
        prompt: "Paysage futuriste cyberpunk avec néons",
        style: "Cyberpunk",
        image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop"
      },
      {
        id: 2,
        prompt: "Portrait artistique style Renaissance",
        style: "Artistique",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop"
      },
      {
        id: 3,
        prompt: "Nature minimaliste zen japonais",
        style: "Minimaliste",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
      },
      {
        id: 4,
        prompt: "Abstrait géométrique coloré",
        style: "Abstrait",
        image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&h=400&fit=crop"
      }
    ],
    edited: [
      {
        id: 1,
        prompt: "Ajout d'effet néon sur portrait",
        style: "Néon",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
        before: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&sat=-100"
      },
      {
        id: 2,
        prompt: "Transformation en style cartoon",
        style: "Cartoon",
        image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop"
      },
      {
        id: 3,
        prompt: "Changement d'ambiance en coucher de soleil",
        style: "Coucher de soleil",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
      }
    ],
    animated: [
      {
        id: 1,
        prompt: "Animation zoom cinématique",
        style: "Zoom",
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
        animation: "zoom"
      },
      {
        id: 2,
        prompt: "Effet Ken Burns panoramique",
        style: "Ken Burns",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop",
        animation: "kenBurns"
      },
      {
        id: 3,
        prompt: "Animation de pulsation subtile",
        style: "Pulse",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
        animation: "pulse"
      }
    ]
  };

  const categories = [
    { id: 'generated' as const, label: 'Génération IA', icon: Sparkles },
    { id: 'edited' as const, label: 'Édition IA', icon: Wand2 },
    { id: 'animated' as const, label: 'Animation IA', icon: Video }
  ];

  const getAnimationClass = (animation?: string) => {
    switch (animation) {
      case 'zoom':
        return 'hover:scale-110 transition-transform duration-[3000ms]';
      case 'kenBurns':
        return 'hover:scale-110 hover:translate-x-2 transition-all duration-[3000ms]';
      case 'pulse':
        return 'hover:animate-pulse';
      default:
        return '';
    }
  };

  return (
    <section className="py-20 relative overflow-hidden" id="galerie-ia">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Galerie IA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Découvrez la puissance de{" "}
            <span className="text-gradient">l'IA créative</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des exemples concrets de ce que vous pouvez créer avec nos outils d'intelligence artificielle
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.id)}
              className="gap-2"
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems[activeCategory].map((item) => (
            <div 
              key={item.id}
              className="group relative rounded-2xl overflow-hidden glass-hover border border-border/50"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.prompt}
                  className={`w-full h-full object-cover ${getAnimationClass((item as any).animation)}`}
                />
              </div>
              
              {/* Style badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                {item.style}
              </div>

              {/* Animation indicator */}
              {(item as any).animation && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs">
                  <Video className="w-3 h-3" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                {activeCategory === 'animated' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Survolez pour voir l'animation
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Prêt à créer vos propres images avec l'IA ?
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a href="/dashboard">
              <Sparkles className="w-5 h-5" />
              Essayer gratuitement
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AIGallery;
