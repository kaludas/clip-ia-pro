import { 
  Sparkles, Languages, Crop, Subtitles, Target, Zap, Calendar, Music, Palette,
  Gauge, Layers, Play, Type, Clock, TrendingUp, Instagram, Youtube, 
  Brain, Mic, ShoppingBag, BarChart3, Users, Lock, Shield, FileCheck,
  Share2, Save, GitCompare, AlertTriangle, FileAudio
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AllFeaturesList = () => {
  const { t } = useLanguage();

  const categories = [
    {
      title: "🎬 Éditeur Vidéo (Core)",
      color: "from-primary to-accent",
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
      color: "from-accent to-primary",
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
      color: "from-primary to-accent",
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
      color: "from-accent to-primary",
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
      color: "from-primary to-accent",
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
      color: "from-accent to-primary",
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
      color: "from-primary to-accent",
      features: [
        { icon: Users, name: "Espace de travail collaboratif", plan: "Agence" },
        { icon: Share2, name: "Partage de lien d'édition", plan: "Gratuit" },
        { icon: Save, name: "Modèles personnalisés réutilisables", plan: "Pro" },
        { icon: FileCheck, name: "Commentaires horodatés", plan: "Agence" }
      ]
    },
    {
      title: "🛡️ Sécurité et Conformité",
      color: "from-accent to-primary",
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

  return (
    <section className="py-16 relative overflow-hidden" id="toutes-fonctionnalites">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Catalogue Complet</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Toutes les{" "}
            <span className="text-gradient">Fonctionnalités</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une liste exhaustive de toutes les capacités de MonShort, organisées par catégorie
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="glass-hover p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${category.color}`} />
                <h3 className="text-2xl md:text-3xl font-bold">{category.title}</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.features.map((feature, featureIndex) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={featureIndex}
                      className="glass p-4 rounded-xl flex items-start gap-4 group hover:border-primary/50 transition-all"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
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
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-16 text-center glass-hover p-8 rounded-3xl">
          <p className="text-xl text-muted-foreground mb-4">
            <span className="text-3xl font-bold text-gradient">50+</span> fonctionnalités
          </p>
          <p className="text-muted-foreground">
            Pour transformer vos longues vidéos en clips courts viraux
          </p>
        </div>
      </div>
    </section>
  );
};

export default AllFeaturesList;
