import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, User, Mail, Calendar, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth(true);
  const { role, isAdmin } = useUserRole();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPurchases();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user?.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username, avatar_url: avatarUrl })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au dashboard
        </Button>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="glass p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">Mon Profil</h1>
                  {isAdmin && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      <Shield className="w-3 h-3" />
                      Admin
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Membre depuis {user?.created_at ? formatDate(user.created_at) : ""}
                </p>
              </div>

              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </Card>

          {/* Edit Profile */}
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="avatar">URL de l'avatar</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>

              <Button onClick={handleUpdateProfile} className="w-full">
                Sauvegarder les modifications
              </Button>
            </div>
          </Card>

          {/* Purchase History */}
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique des achats ({purchases.length})
            </h2>

            {purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{purchase.plan_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(purchase.purchased_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {purchase.amount} {purchase.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucun achat pour le moment
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
