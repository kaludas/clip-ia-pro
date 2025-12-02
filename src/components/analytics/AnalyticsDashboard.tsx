import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Eye, Heart, MessageCircle, Share2, 
  Clock, Target, BarChart3, AlertCircle 
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

interface AnalyticsProps {
  projectId?: string;
}

export const AnalyticsDashboard = ({ projectId }: AnalyticsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simulation de données analytics
  const performanceData = [
    { date: 'Lun', vues: 1200, engagement: 85, retention: 75 },
    { date: 'Mar', vues: 1900, engagement: 90, retention: 80 },
    { date: 'Mer', vues: 1500, engagement: 78, retention: 72 },
    { date: 'Jeu', vues: 2800, engagement: 95, retention: 88 },
    { date: 'Ven', vues: 3900, engagement: 98, retention: 92 },
    { date: 'Sam', vues: 4200, engagement: 96, retention: 90 },
    { date: 'Dim', vues: 3100, engagement: 88, retention: 82 }
  ];

  const platformData = [
    { name: 'TikTok', value: 45, color: '#00F0FF' },
    { name: 'YouTube', value: 30, color: '#FF0000' },
    { name: 'Instagram', value: 25, color: '#E4405F' }
  ];

  const retentionData = [
    { second: '0s', viewers: 100 },
    { second: '5s', viewers: 85 },
    { second: '10s', viewers: 75 },
    { second: '15s', viewers: 68 },
    { second: '20s', viewers: 60 },
    { second: '25s', viewers: 55 },
    { second: '30s', viewers: 52 }
  ];

  const bestTimeToPost = [
    { hour: '9h', score: 60 },
    { hour: '12h', score: 75 },
    { hour: '14h', score: 85 },
    { hour: '18h', score: 98 },
    { hour: '20h', score: 95 },
    { hour: '22h', score: 70 }
  ];

  const stats = [
    { 
      icon: Eye, 
      label: 'Vues totales', 
      value: '18.7K', 
      change: '+23%',
      color: 'text-primary'
    },
    { 
      icon: Heart, 
      label: 'Likes', 
      value: '2.4K', 
      change: '+18%',
      color: 'text-accent'
    },
    { 
      icon: MessageCircle, 
      label: 'Commentaires', 
      value: '387', 
      change: '+31%',
      color: 'text-primary'
    },
    { 
      icon: Share2, 
      label: 'Partages', 
      value: '156', 
      change: '+42%',
      color: 'text-accent'
    }
  ];

  const insights = [
    {
      type: 'success',
      title: 'Hook performant',
      description: 'Les 5 premières secondes ont un taux de rétention de 85% (+12% vs moyenne)',
      action: 'Réutiliser ce style de hook'
    },
    {
      type: 'warning',
      title: 'Chute à 15 secondes',
      description: 'Perte de 20% des spectateurs. Segment peut-être trop lent.',
      action: 'Ajouter un effet ou couper ce passage'
    },
    {
      type: 'info',
      title: 'Meilleur horaire',
      description: 'Vos clips publiés à 18h ont 35% plus d\'engagement',
      action: 'Planifier les prochains clips à 18h'
    },
    {
      type: 'success',
      title: 'Hashtags efficaces',
      description: '#viral et #trending ont généré 40% des vues',
      action: 'Continuer à utiliser ces hashtags'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-hover p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm font-semibold text-primary">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="retention">Rétention</TabsTrigger>
          <TabsTrigger value="platforms">Plateformes</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-hover p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance sur 7 jours
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vues" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-hover p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Meilleurs horaires de publication
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bestTimeToPost}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 glass p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Recommandation IA:</strong> Publiez entre 18h et 20h pour maximiser l'engagement (+35%)
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card className="glass-hover p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Courbe de rétention
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="second" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="viewers" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-hover p-6">
            <h3 className="text-lg font-bold mb-4">Points critiques détectés</h3>
            <div className="space-y-3">
              <div className="glass p-4 rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">0-5s: Excellent hook</span>
                </div>
                <p className="text-sm text-muted-foreground">85% de rétention (+12% vs moyenne)</p>
              </div>
              <div className="glass p-4 rounded-lg border-l-4 border-destructive">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="font-semibold">15-20s: Chute importante</span>
                </div>
                <p className="text-sm text-muted-foreground">Perte de 20% des spectateurs - segment peut-être trop lent</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-hover p-6">
              <h3 className="text-lg font-bold mb-4">Répartition par plateforme</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="glass-hover p-6">
              <h3 className="text-lg font-bold mb-4">Performance par plateforme</h3>
              <div className="space-y-4">
                {platformData.map((platform, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{platform.name}</span>
                      <span className="text-sm text-muted-foreground">{platform.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${platform.value}%`, 
                          backgroundColor: platform.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight, index) => {
              const bgColors = {
                success: 'bg-primary/10 border-primary',
                warning: 'bg-destructive/10 border-destructive',
                info: 'bg-accent/10 border-accent'
              };
              return (
                <Card key={index} className={`glass-hover p-6 border-l-4 ${bgColors[insight.type as keyof typeof bgColors]}`}>
                  <h4 className="font-bold mb-2">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="glass px-3 py-2 rounded-lg inline-block">
                    <span className="text-xs font-semibold">💡 {insight.action}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
