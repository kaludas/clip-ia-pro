import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.features": "Fonctionnalités",
    "nav.pricing": "Tarifs",
    "nav.dashboard": "Dashboard",
    "nav.start": "Commencer",
    
    // Hero
    "hero.badge": "IA de dernière génération",
    "hero.title1": "Transformez vos",
    "hero.title2": "vidéos longues",
    "hero.title3": "en clips viraux",
    "hero.description": "L'IA qui analyse vos VOD Twitch et podcasts YouTube pour créer automatiquement des clips courts optimisés pour TikTok et Shorts.",
    "hero.cta.start": "Commencer gratuitement",
    "hero.cta.demo": "Voir la démo",
    "hero.stats.clips": "Clips générés",
    "hero.stats.creators": "Créateurs actifs",
    "hero.badge.live": "IA en action",
    
    // Features
    "features.badge": "Fonctionnalités IA",
    "features.title1": "Tout ce dont vous avez besoin pour",
    "features.title2": "créer du contenu viral",
    "features.description": "Des outils puissants alimentés par l'IA pour transformer vos longues vidéos en contenus courts et engageants en quelques clics.",
    "features.premium": "Premium",
    "features.ai.title": "Détection IA d'événements",
    "features.ai.desc": "L'IA analyse l'audio et détecte automatiquement les moments forts : rires, cris, pics d'émotion et changements de sujet.",
    "features.keywords.title": "Ciblage par mots-clés",
    "features.keywords.desc": "Définissez vos mots-clés spécifiques et l'IA ne découpe que les moments où ils sont prononcés. Parfait pour le contenu thématique.",
    "features.crop.title": "Recadrage intelligent 9:16",
    "features.crop.desc": "Formatage automatique vertical avec suivi des locuteurs. Vos clips sont prêts pour TikTok et Shorts immédiatement.",
    "features.subtitles.title": "Sous-titres dynamiques",
    "features.subtitles.desc": "Génération automatique de sous-titres français avec animations et surlignage du mot actuel. Styles premium disponibles.",
    "features.translate.title": "Traduction multilingue",
    "features.translate.desc": "Traduisez vos clips dans plusieurs langues avec génération automatique des sous-titres traduits. Élargissez votre audience.",
    "features.export.title": "Export professionnel",
    "features.export.desc": "Exportation HD et 4K, fichiers SRT séparés, suppression du filigrane. Qualité broadcast pour vos clips.",
    "features.autopublish.title": "Publication et Planification Automatique",
    "features.autopublish.desc": "Connectez vos comptes. L'IA publie automatiquement vos clips sur TikTok, Shorts et Reels à l'heure optimale, avec les meilleurs titres et hashtags générés.",
    
    // Pricing
    "pricing.badge": "Tarifs transparents",
    "pricing.title": "Choisissez votre",
    "pricing.title2": "plan",
    "pricing.description": "Commencez gratuitement et évoluez selon vos besoins. Aucun engagement, annulez à tout moment.",
    "pricing.popular": "Plus populaire",
    "pricing.free.name": "Gratuit",
    "pricing.free.desc": "Parfait pour découvrir l'IA",
    "pricing.free.f1": "5 clips par mois",
    "pricing.free.f2": "Détection IA d'événements",
    "pricing.free.f3": "Format vertical 9:16",
    "pricing.free.f4": "Sous-titres dynamiques",
    "pricing.free.f5": "Export HD avec filigrane",
    "pricing.free.f6": "Communauté Discord",
    "pricing.free.cta": "Commencer gratuitement",
    "pricing.pro.name": "Pro",
    "pricing.pro.desc": "Pour les créateurs sérieux",
    "pricing.pro.f1": "Clips illimités",
    "pricing.pro.f2": "Ciblage par mots-clés",
    "pricing.pro.f3": "Traduction multilingue",
    "pricing.pro.f4": "Styles de sous-titres avancés",
    "pricing.pro.f5": "Export 4K sans filigrane",
    "pricing.pro.f6": "Publication automatique TikTok/Shorts/Reels",
    "pricing.pro.f7": "Logo/Branding personnalisé",
    "pricing.pro.f8": "Support prioritaire",
    "pricing.pro.cta": "Essayer Pro",
    "pricing.agency.name": "Agence",
    "pricing.agency.desc": "Pour les équipes et agences",
    "pricing.agency.f1": "Tout de Pro +",
    "pricing.agency.f2": "Publication Automatique Multi-Comptes",
    "pricing.agency.f3": "5 comptes utilisateurs",
    "pricing.agency.f4": "Recadrage multi-sources",
    "pricing.agency.f5": "API privée",
    "pricing.agency.f6": "Formation personnalisée",
    "pricing.agency.f7": "Gestionnaire de compte dédié",
    "pricing.agency.cta": "Contacter les ventes",
    
    // Footer
    "footer.rights": "Tous droits réservés.",
    "footer.powered": "Propulsé par l'IA de dernière génération",
    
    // Dashboard
    "dashboard.welcome": "Bienvenue sur",
    "dashboard.subtitle": "Téléchargez votre vidéo ou collez une URL pour commencer",
    "dashboard.upload.title": "Télécharger un fichier",
    "dashboard.upload.desc": "Glissez-déposez votre vidéo ou cliquez pour parcourir",
    "dashboard.upload.button": "Parcourir les fichiers",
    "dashboard.upload.format": "MP4, MOV, AVI • Max 2GB",
    "dashboard.url.title": "Importer depuis une URL",
    "dashboard.url.desc": "Collez un lien Twitch VOD ou YouTube",
    "dashboard.url.placeholder": "https://twitch.tv/videos/...",
    "dashboard.url.button": "Analyser avec l'IA",
    "dashboard.recent": "Clips récents",
    "dashboard.viewAll": "Voir tout",
    "dashboard.untitled": "Clip sans titre",
    "dashboard.ago": "Il y a",
    "dashboard.day": "jour",
    "dashboard.days": "jours",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.dashboard": "Dashboard",
    "nav.start": "Get Started",
    
    // Hero
    "hero.badge": "Next-gen AI",
    "hero.title1": "Transform your",
    "hero.title2": "long videos",
    "hero.title3": "into viral clips",
    "hero.description": "The AI that analyzes your Twitch VODs and YouTube podcasts to automatically create short clips optimized for TikTok and Shorts.",
    "hero.cta.start": "Start for free",
    "hero.cta.demo": "Watch demo",
    "hero.stats.clips": "Clips generated",
    "hero.stats.creators": "Active creators",
    "hero.badge.live": "AI in action",
    
    // Features
    "features.badge": "AI Features",
    "features.title1": "Everything you need to",
    "features.title2": "create viral content",
    "features.description": "Powerful AI-driven tools to transform your long videos into short, engaging content in just a few clicks.",
    "features.premium": "Premium",
    "features.ai.title": "AI Event Detection",
    "features.ai.desc": "AI analyzes audio and automatically detects highlights: laughter, screams, emotion peaks and topic changes.",
    "features.keywords.title": "Keyword Targeting",
    "features.keywords.desc": "Define your specific keywords and AI will only cut moments where they're mentioned. Perfect for thematic content.",
    "features.crop.title": "Smart 9:16 Cropping",
    "features.crop.desc": "Automatic vertical formatting with speaker tracking. Your clips are ready for TikTok and Shorts immediately.",
    "features.subtitles.title": "Dynamic Subtitles",
    "features.subtitles.desc": "Automatic French subtitle generation with animations and current word highlighting. Premium styles available.",
    "features.translate.title": "Multilingual Translation",
    "features.translate.desc": "Translate your clips into multiple languages with automatic translated subtitle generation. Expand your audience.",
    "features.export.title": "Professional Export",
    "features.export.desc": "HD and 4K export, separate SRT files, watermark removal. Broadcast quality for your clips.",
    "features.autopublish.title": "Auto-Publishing & Scheduling",
    "features.autopublish.desc": "Connect your accounts. The AI automatically publishes your clips to TikTok, Shorts, and Reels at the optimal time, including the best AI-generated titles and hashtags.",
    
    // Pricing
    "pricing.badge": "Transparent pricing",
    "pricing.title": "Choose your",
    "pricing.title2": "plan",
    "pricing.description": "Start for free and scale as you grow. No commitment, cancel anytime.",
    "pricing.popular": "Most popular",
    "pricing.free.name": "Free",
    "pricing.free.desc": "Perfect to discover AI",
    "pricing.free.f1": "5 clips per month",
    "pricing.free.f2": "AI event detection",
    "pricing.free.f3": "9:16 vertical format",
    "pricing.free.f4": "Dynamic subtitles",
    "pricing.free.f5": "HD export with watermark",
    "pricing.free.f6": "Discord community",
    "pricing.free.cta": "Start for free",
    "pricing.pro.name": "Pro",
    "pricing.pro.desc": "For serious creators",
    "pricing.pro.f1": "Unlimited clips",
    "pricing.pro.f2": "Keyword targeting",
    "pricing.pro.f3": "Multilingual translation",
    "pricing.pro.f4": "Advanced subtitle styles",
    "pricing.pro.f5": "4K export without watermark",
    "pricing.pro.f6": "Auto-publish to TikTok/Shorts/Reels",
    "pricing.pro.f7": "Custom logo/branding",
    "pricing.pro.f8": "Priority support",
    "pricing.pro.cta": "Try Pro",
    "pricing.agency.name": "Agency",
    "pricing.agency.desc": "For teams and agencies",
    "pricing.agency.f1": "Everything in Pro +",
    "pricing.agency.f2": "Advanced Multi-Account Auto-Publishing",
    "pricing.agency.f3": "5 user accounts",
    "pricing.agency.f4": "Multi-source cropping",
    "pricing.agency.f5": "Private API",
    "pricing.agency.f6": "Custom training",
    "pricing.agency.f7": "Dedicated account manager",
    "pricing.agency.cta": "Contact sales",
    
    // Footer
    "footer.rights": "All rights reserved.",
    "footer.powered": "Powered by next-gen AI",
    
    // Dashboard
    "dashboard.welcome": "Welcome to",
    "dashboard.subtitle": "Upload your video or paste a URL to get started",
    "dashboard.upload.title": "Upload a file",
    "dashboard.upload.desc": "Drag and drop your video or click to browse",
    "dashboard.upload.button": "Browse files",
    "dashboard.upload.format": "MP4, MOV, AVI • Max 2GB",
    "dashboard.url.title": "Import from URL",
    "dashboard.url.desc": "Paste a Twitch VOD or YouTube link",
    "dashboard.url.placeholder": "https://twitch.tv/videos/...",
    "dashboard.url.button": "Analyze with AI",
    "dashboard.recent": "Recent clips",
    "dashboard.viewAll": "View all",
    "dashboard.untitled": "Untitled clip",
    "dashboard.ago": "",
    "dashboard.day": "day ago",
    "dashboard.days": "days ago",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
