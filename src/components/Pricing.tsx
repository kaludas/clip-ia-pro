import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();
  
  const plans = [
    {
      name: t("pricing.free.name"),
      price: "0€",
      description: t("pricing.free.desc"),
      features: [
        t("pricing.free.f1"),
        t("pricing.free.f2"),
        t("pricing.free.f3"),
        t("pricing.free.f4"),
        t("pricing.free.f5"),
        t("pricing.free.f6")
      ],
      cta: t("pricing.free.cta"),
      variant: "glass" as const
    },
    {
      name: t("pricing.pro.name"),
      price: "29€",
      period: "/mois",
      description: t("pricing.pro.desc"),
      features: [
        t("pricing.pro.f1"),
        t("pricing.pro.f2"),
        t("pricing.pro.f3"),
        t("pricing.pro.f4"),
        t("pricing.pro.f5"),
        t("pricing.pro.f6"),
        t("pricing.pro.f7"),
        t("pricing.pro.f8")
      ],
      cta: t("pricing.pro.cta"),
      variant: "hero" as const,
      popular: true
    },
    {
      name: t("pricing.agency.name"),
      price: "99€",
      period: "/mois",
      description: t("pricing.agency.desc"),
      features: [
        t("pricing.agency.f1"),
        t("pricing.agency.f2"),
        t("pricing.agency.f3"),
        t("pricing.agency.f4"),
        t("pricing.agency.f5"),
        t("pricing.agency.f6"),
        t("pricing.agency.f7")
      ],
      cta: t("pricing.agency.cta"),
      variant: "glass" as const
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden" id="tarifs">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t("pricing.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t("pricing.title")}{" "}
            <span className="text-gradient">{t("pricing.title2")}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.description")}
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
                  {t("pricing.popular")}
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
