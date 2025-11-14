import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    description: "Parfait pour découvrir l'IA",
    features: [
      "5 clips par mois",
      "Détection IA d'événements",
      "Format vertical 9:16",
      "Sous-titres dynamiques",
      "Export HD avec filigrane",
      "Communauté Discord"
    ],
    cta: "Commencer gratuitement",
    variant: "glass" as const
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les créateurs sérieux",
    features: [
      "Clips illimités",
      "Ciblage par mots-clés",
      "Traduction multilingue",
      "Styles de sous-titres avancés",
      "Export 4K sans filigrane",
      "Logo/Branding personnalisé",
      "Support prioritaire"
    ],
    cta: "Essayer Pro",
    variant: "hero" as const,
    popular: true
  },
  {
    name: "Agence",
    price: "99€",
    period: "/mois",
    description: "Pour les équipes et agences",
    features: [
      "Tout de Pro +",
      "5 comptes utilisateurs",
      "Recadrage multi-sources",
      "API privée",
      "Formation personnalisée",
      "Gestionnaire de compte dédié"
    ],
    cta: "Contacter les ventes",
    variant: "glass" as const
  }
];

const Pricing = () => {
  return (
    <section className="py-32 relative overflow-hidden" id="tarifs">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Tarifs transparents</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Choisissez votre{" "}
            <span className="text-gradient">plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon vos besoins. 
            Aucun engagement, annulez à tout moment.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-hover p-8 rounded-3xl ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-sm font-semibold">
                  Plus populaire
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/dashboard" className="block">
                <Button variant={plan.variant} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
