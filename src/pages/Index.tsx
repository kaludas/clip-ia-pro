import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import InteractiveDemo from "@/components/InteractiveDemo";
import AllFeaturesList from "@/components/AllFeaturesList";
import Pricing from "@/components/Pricing";
import ChatBot from "@/components/ChatBot";
import AIGallery from "@/components/AIGallery";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <AIGallery />
      <InteractiveDemo />
      <AllFeaturesList />
      <Pricing />
      <ChatBot />
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2024 monshort.com. {t("footer.rights")}</p>
            <p className="text-sm">{t("footer.powered")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
