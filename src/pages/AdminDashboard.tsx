import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth(true);
  const { role, loading: roleLoading, isAdmin } = useUserRole();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalPageViews: 0,
    totalRevenue: 0,
    activeSessions: 0
  });

  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [sessionsData, setSessionsData] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [role, roleLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      document.title = "Administration MonShort - Analytics & revenus";
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users (from profiles)
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total sessions
      const { count: sessionsCount } = await supabase
        .from("site_sessions")
        .select("*", { count: "exact", head: true });

      // Fetch active sessions (last 30 minutes)
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { count: activeSessionsCount } = await supabase
        .from("site_sessions")
        .select("*", { count: "exact", head: true })
        .gte("session_start", thirtyMinsAgo)
        .is("session_end", null);

      // Fetch total page views
      const { count: pageViewsCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true });

      // Fetch total revenue
      const { data: purchasesData } = await supabase
        .from("purchases")
        .select("amount");

      const totalRevenue = purchasesData?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalSessions: sessionsCount || 0,
        totalPageViews: pageViewsCount || 0,
        totalRevenue,
        activeSessions: activeSessionsCount || 0
      });

      // Fetch recent purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select(`
          *,
          profiles (username)
        `)
        .order("purchased_at", { ascending: false })
        .limit(10);

      setRecentPurchases(purchases || []);

      // Fetch top pages
      const { data: pagesData } = await supabase
        .from("page_visits")
        .select("page_path")
        .order("visited_at", { ascending: false })
        .limit(1000);

      const pageCounts = (pagesData || []).reduce((acc: any, visit: any) => {
        acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
        return acc;
      }, {});

      const topPagesArray = Object.entries(pageCounts)
        .map(([path, count]) => ({ path, visits: count }))
        .sort((a: any, b: any) => b.visits - a.visits)
        .slice(0, 5);

      setTopPages(topPagesArray);

      // Fetch revenue data for last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: recentPurchases } = await supabase
        .from("purchases")
        .select("amount, purchased_at")
        .gte("purchased_at", sevenDaysAgo.toISOString())
        .order("purchased_at", { ascending: true });

      const revenueByDay = (recentPurchases || []).reduce((acc: any, p: any) => {
        const day = new Date(p.purchased_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short"
        });
        acc[day] = (acc[day] || 0) + Number(p.amount);
        return acc;
      }, {});

      setRevenueData(
        Object.entries(revenueByDay).map(([day, revenue]) => ({
          day,
          revenue
        }))
      );

      // Fetch sessions data for last 7 days
      const { data: recentSessions } = await supabase
        .from("site_sessions")
        .select("session_start")
        .gte("session_start", sevenDaysAgo.toISOString())
        .order("session_start", { ascending: true });

      const sessionsByDay = (recentSessions || []).reduce((acc: any, s: any) => {
        const day = new Date(s.session_start).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short"
        });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      setSessionsData(
        Object.entries(sessionsByDay).map(([day, sessions]) => ({
          day,
          sessions
        }))
      );

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
    <main className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
          </div>
          <Button variant="outline" onClick={fetchDashboardData}>
            Actualiser
          </Button>
        </header>

        <section
          aria-label="Résumé de l'activité"
          className="grid gap-4 lg:grid-cols-[2fr,1.4fr] mb-8"
        >
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-2">Vue globale de ton SaaS</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Suis en temps réel la croissance de MonShort : nombre d'utilisateurs,
              sessions actives, trafic et revenus générés par tes abonnements.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Utilisateurs</strong> = comptes créés (table <code>profiles</code>).
              </li>
              <li>
                <strong>Sessions</strong> = connexions à l'app (table <code>site_sessions</code>).
              </li>
              <li>
                <strong>Pages vues</strong> = navigation dans l'interface (table <code>page_visits</code>).
              </li>
              <li>
                <strong>Revenus</strong> = achats d'abonnements (table <code>purchases</code>).
              </li>
            </ul>
          </Card>

          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-2">Actions rapides</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Depuis ce tableau de bord, tu peux vérifier la santé du business, identifier
              les pages les plus performantes et suivre les plans achetés.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Monitoring</p>
                <p className="font-medium">Pointe un pic de trafic ou de revenu.</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Produit</p>
                <p className="font-medium">Repère les pages clés visitées.</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Support</p>
                <p className="font-medium">Enquête en cas de baisse soudaine.</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Growth</p>
                <p className="font-medium">Mesure l'impact de campagnes.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Stats Overview */}
        <section
          aria-label="Statistiques globales"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions actives</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MousePointer className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages vues</p>
                <p className="text-2xl font-bold">{stats.totalPageViews}</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Charts and Tables */}
        <section aria-label="Données détaillées">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="purchases">Achats</TabsTrigger>
              <TabsTrigger value="pages">Pages populaires</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenus (7 derniers jours)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Sessions (7 derniers jours)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sessionsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="purchases">
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Achats récents</h3>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentPurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{purchase.plan_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {purchase.profiles?.username || "Utilisateur inconnu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(purchase.purchased_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {Number(purchase.amount).toFixed(2)} {purchase.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {purchase.payment_method || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="pages">
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Pages les plus visitées</h3>
                <div className="space-y-3">
                  {topPages.map((page: any, index) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{page.path}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold">{page.visits} vues</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
