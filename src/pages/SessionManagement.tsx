import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Activity,
  Users,
  Globe,
  Search,
  Filter,
  Calendar,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SessionManagement() {
  const { user, loading: authLoading } = useAuth(true);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);
  const [pageVisits, setPageVisits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "ended">("all");

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSessions();
      fetchPageVisits();
    }
  }, [isAdmin]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("site_sessions")
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .order("session_start", { ascending: false })
        .limit(100);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchPageVisits = async () => {
    try {
      const { data, error } = await supabase
        .from("page_visits")
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .order("visited_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setPageVisits(data || []);
    } catch (error) {
      console.error("Error fetching page visits:", error);
    }
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      !searchTerm ||
      session.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && !session.session_end) ||
      (activeFilter === "ended" && session.session_end);

    return matchesSearch && matchesFilter;
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au dashboard
            </Button>
            <h1 className="text-3xl font-bold">Gestion des Sessions</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchSessions();
              fetchPageVisits();
            }}
          >
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions actives</p>
                <p className="text-2xl font-bold">
                  {sessions.filter((s) => !s.session_end).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages vues</p>
                <p className="text-2xl font-bold">{pageVisits.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par IP ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Toutes
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                onClick={() => setActiveFilter("active")}
              >
                Actives
              </Button>
              <Button
                variant={activeFilter === "ended" ? "default" : "outline"}
                onClick={() => setActiveFilter("ended")}
              >
                Terminées
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="visits">Visites de pages</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card className="glass p-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {!session.session_end && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                          <p className="font-medium">
                            {session.profiles?.username || "Utilisateur anonyme"}
                          </p>
                          {!session.session_end && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            IP: {session.ip_address || "N/A"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Début: {formatDate(session.session_start)}
                          </p>
                          {session.session_end && (
                            <p className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Durée: {formatDuration(session.session_start, session.session_end)}
                            </p>
                          )}
                          {!session.session_end && (
                            <p className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              En cours: {formatDuration(session.session_start)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {session.page_views || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">pages vues</p>
                      </div>
                    </div>
                  ))}
                  {filteredSessions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Aucune session trouvée
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="visits">
            <Card className="glass p-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {pageVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{visit.page_path}</p>
                        <p className="text-sm text-muted-foreground">
                          {visit.profiles?.username || "Anonyme"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(visit.visited_at)}
                        </p>
                      </div>
                      {visit.duration_seconds && (
                        <div className="text-right">
                          <p className="font-semibold">
                            {Math.floor(visit.duration_seconds / 60)}m{" "}
                            {visit.duration_seconds % 60}s
                          </p>
                          <p className="text-xs text-muted-foreground">durée</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {pageVisits.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Aucune visite trouvée
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
