import { useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroVideo from "@/assets/hero-video-ai.jpg";

const InteractiveDemo = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSubtitles = [
    { time: 0, text: "Transformez vos longues vidéos" },
    { time: 1500, text: "En clips courts viraux" },
    { time: 3000, text: "En quelques secondes!" },
  ];

  const [currentSubtitle, setCurrentSubtitle] = useState(0);

  const handlePlayDemo = () => {
    setIsPlaying(true);
    setCurrentSubtitle(0);

    demoSubtitles.forEach((sub, idx) => {
      setTimeout(() => {
        setCurrentSubtitle(idx);
      }, sub.time);
    });

    setTimeout(() => {
      setIsPlaying(false);
      setCurrentSubtitle(0);
    }, 4500);
  };

  return (
    <section className="py-16 relative overflow-hidden" id="demo">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t("demo.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t("demo.title1")}{" "}
            <span className="text-gradient">{t("demo.title2")}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("demo.description")}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Demo container */}
          <div className="relative aspect-[9/16] max-w-sm mx-auto glass rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl">
            {/* Video placeholder */}
            <img
              src={heroVideo}
              alt="Demo"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isPlaying ? "scale-110" : "scale-100"
              }`}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

            {/* Animated subtitle */}
            {isPlaying && (
              <div className="absolute bottom-24 left-4 right-4 animate-fade-in">
                <div className="glass-hover rounded-2xl px-6 py-3 text-center border border-primary/30 shadow-lg">
                  <p className="font-bold text-lg text-gradient">
                    {demoSubtitles[currentSubtitle]?.text}
                  </p>
                </div>
              </div>
            )}

            {/* Play button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handlePlayDemo}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent hover:scale-110 transition-transform shadow-2xl"
                >
                  <Play className="w-10 h-10 fill-current" />
                </Button>
              </div>
            )}

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full animate-float"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    boxShadow: "0 0 10px hsl(var(--primary))",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: "🎯", label: t("demo.feature1") },
              { icon: "✂️", label: t("demo.feature2") },
              { icon: "📱", label: t("demo.feature3") },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="glass-hover px-6 py-3 rounded-full flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="font-semibold">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
