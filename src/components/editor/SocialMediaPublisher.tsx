import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, Sparkles, Youtube, Instagram, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLATFORMS = [
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: '📱',
    color: 'bg-black',
    status: 'coming-soon'
  },
  { 
    id: 'youtube', 
    name: 'YouTube Shorts', 
    icon: <Youtube className="w-4 h-4" />,
    color: 'bg-red-600',
    status: 'coming-soon'
  },
  { 
    id: 'instagram', 
    name: 'Instagram Reels', 
    icon: <Instagram className="w-4 h-4" />,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    status: 'coming-soon'
  },
];

interface SocialMediaPublisherProps {
  videoUrl?: string;
  duration?: number;
}

export default function SocialMediaPublisher({ videoUrl, duration }: SocialMediaPublisherProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [publishing, setPublishing] = useState(false);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateAIContent = async () => {
    toast.info("Génération de contenu IA...");
    
    // Simulated AI content generation
    setTimeout(() => {
      setTitle("🔥 Moment épique capturé en live !");
      setDescription("Ne ratez pas ce moment incroyable ! Abonnez-vous pour plus de contenus exclusifs 🎮");
      setHashtags("#gaming #viral #shorts #twitch #highlights");
      toast.success("Contenu IA généré !");
    }, 1500);
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Sélectionnez au moins une plateforme");
      return;
    }

    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    setPublishing(true);

    // Simulated publishing
    setTimeout(() => {
      setPublishing(false);
      
      const platformNames = selectedPlatforms
        .map(id => PLATFORMS.find(p => p.id === id)?.name)
        .join(', ');
      
      if (scheduledDate && scheduledTime) {
        toast.success(`Publication programmée sur ${platformNames} pour le ${scheduledDate} à ${scheduledTime} !`);
      } else {
        toast.success(`Publié avec succès sur ${platformNames} !`);
      }

      // Reset form
      setSelectedPlatforms([]);
      setTitle("");
      setDescription("");
      setHashtags("");
      setScheduledDate("");
      setScheduledTime("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-hover border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Publication Automatique
          </CardTitle>
          <CardDescription>
            Publiez votre clip sur TikTok, YouTube Shorts et Instagram Reels en un clic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-base mb-3 block">Plateformes de publication</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {typeof platform.icon === 'string' ? (
                        <span className="text-2xl">{platform.icon}</span>
                      ) : (
                        <div className={`p-2 rounded ${platform.color} text-white`}>
                          {platform.icon}
                        </div>
                      )}
                      <span className="font-semibold">{platform.name}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Bientôt disponible
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="schedule">Planification</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIContent}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer avec IA
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Donnez un titre accrocheur à votre clip..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre clip et engagez votre audience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#gaming #viral #shorts"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les hashtags par des espaces
                </p>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Meilleur moment suggéré par l'IA</h4>
                      <p className="text-sm text-muted-foreground">
                        Basé sur l'analyse de votre audience et des tendances actuelles, nous recommandons de publier le{' '}
                        <span className="font-semibold text-foreground">
                          Samedi à 18h00
                        </span>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 mt-2"
                        onClick={() => {
                          const saturday = new Date();
                          saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7));
                          setScheduledDate(saturday.toISOString().split('T')[0]);
                          setScheduledTime('18:00');
                          toast.success("Horaire optimal appliqué !");
                        }}
                      >
                        Appliquer ce créneau
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              onClick={handlePublish}
              disabled={publishing || selectedPlatforms.length === 0 || !title.trim()}
              className="flex-1"
              size="lg"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication en cours...
                </>
              ) : scheduledDate && scheduledTime ? (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programmer la publication
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publier maintenant
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🚀 Fonctionnalité Pro • Publication automatique sur plusieurs plateformes</p>
            <p>⚡ Les connexions API seront disponibles prochainement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
