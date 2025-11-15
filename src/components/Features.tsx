import { Sparkles, Languages, Crop, Subtitles, Target, Zap, Calendar, Music, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Sparkles,
      title: t("features.ai.title"),
      description: t("features.ai.desc"),
      color: "from-primary to-accent"
    },
    {
      icon: Target,
      title: t("features.keywords.title"),
      description: t("features.keywords.desc"),
      color: "from-accent to-primary",
      premium: true
    },
    {
      icon: Crop,
      title: t("features.crop.title"),
      description: t("features.crop.desc"),
      color: "from-primary to-accent"
    },
    {
      icon: Subtitles,
      title: t("features.subtitles.title"),
      description: t("features.subtitles.desc"),
      color: "from-accent to-primary"
    },
    {
      icon: Languages,
      title: t("features.translate.title"),
      description: t("features.translate.desc"),
      color: "from-primary to-accent",
      premium: true
    },
    {
      icon: Zap,
      title: t("features.export.title"),
      description: t("features.export.desc"),
      color: "from-accent to-primary",
      premium: true
    },
    {
      icon: Calendar,
      title: t("features.autopublish.title"),
      description: t("features.autopublish.desc"),
      color: "from-primary to-accent",
      premium: true
    },
    {
      icon: Music,
      title: t("features.music.title"),
      description: t("features.music.desc"),
      color: "from-accent to-primary",
      premium: true
    },
    {
      icon: Palette,
      title: t("features.editor.title"),
      description: t("features.editor.desc"),
      color: "from-primary to-accent",
      premium: true
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden" id="fonctionnalites">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t("features.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t("features.title1")}{" "}
            <span className="text-gradient">{t("features.title2")}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features.description")}
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
                    {t("features.premium")}
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
