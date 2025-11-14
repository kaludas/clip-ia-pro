import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Pricing />
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2024 Clip'IA. Tous droits réservés.</p>
            <p className="text-sm">Propulsé par l'IA de dernière génération</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
