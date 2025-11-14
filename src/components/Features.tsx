import { Sparkles, Languages, Crop, Subtitles, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Détection IA d'événements",
    description: "L'IA analyse l'audio et détecte automatiquement les moments forts : rires, cris, pics d'émotion et changements de sujet.",
    color: "from-primary to-accent"
  },
  {
    icon: Target,
    title: "Ciblage par mots-clés",
    description: "Définissez vos mots-clés spécifiques et l'IA ne découpe que les moments où ils sont prononcés. Parfait pour le contenu thématique.",
    color: "from-accent to-primary",
    premium: true
  },
  {
    icon: Crop,
    title: "Recadrage intelligent 9:16",
    description: "Formatage automatique vertical avec suivi des locuteurs. Vos clips sont prêts pour TikTok et Shorts immédiatement.",
    color: "from-primary to-accent"
  },
  {
    icon: Subtitles,
    title: "Sous-titres dynamiques",
    description: "Génération automatique de sous-titres français avec animations et surlignage du mot actuel. Styles premium disponibles.",
    color: "from-accent to-primary"
  },
  {
    icon: Languages,
    title: "Traduction multilingue",
    description: "Traduisez vos clips dans plusieurs langues avec génération automatique des sous-titres traduits. Élargissez votre audience.",
    color: "from-primary to-accent",
    premium: true
  },
  {
    icon: Zap,
    title: "Export professionnel",
    description: "Exportation HD et 4K, fichiers SRT séparés, suppression du filigrane. Qualité broadcast pour vos clips.",
    color: "from-accent to-primary",
    premium: true
  }
];

const Features = () => {
  return (
    <section className="py-32 relative overflow-hidden" id="fonctionnalites">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Fonctionnalités IA</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Tout ce dont vous avez besoin pour{" "}
            <span className="text-gradient">créer du contenu viral</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants alimentés par l'IA pour transformer vos longues vidéos 
            en contenus courts et engageants en quelques clics.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-hover p-8 rounded-2xl relative overflow-hidden group"
              >
                {feature.premium && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-semibold">
                    Premium
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
