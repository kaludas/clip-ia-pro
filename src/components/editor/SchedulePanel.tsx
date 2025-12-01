import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, TrendingUp, Instagram, Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ScheduledPost {
  id: string;
  platform: "tiktok" | "youtube" | "instagram";
  date: Date;
  time: string;
  title: string;
  status: "scheduled" | "published" | "failed";
}

export const SchedulePanel = () => {
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: "🎵", optimal: "18:00" },
    { id: "youtube", name: "YouTube", icon: Youtube, optimal: "14:00" },
    { id: "instagram", name: "Instagram", icon: Instagram, optimal: "19:00" }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSchedule = () => {
    if (!selectedDate || selectedPlatforms.length === 0) {
      toast.error(t("editor.selectDateAndPlatform"));
      return;
    }

    // Simuler la planification
    const newPosts = selectedPlatforms.map(platform => ({
      id: `${Date.now()}-${platform}`,
      platform: platform as "tiktok" | "youtube" | "instagram",
      date: selectedDate,
      time: selectedTime,
      title: "Nouveau clip viral",
      status: "scheduled" as const
    }));

    setScheduledPosts([...scheduledPosts, ...newPosts]);
    toast.success(t("editor.postScheduled"));
    setSelectedPlatforms([]);
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;
    if (typeof platform.icon === "string") return platform.icon;
    const Icon = platform.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">{t("editor.schedulePublication")}</h3>
        <p className="text-sm text-muted-foreground">{t("editor.scheduleDescription")}</p>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">{t("editor.selectPlatforms")}</label>
        <div className="grid grid-cols-1 gap-2">
          {platforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 glass hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {typeof platform.icon === "string" ? platform.icon : <platform.icon className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{platform.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {t("editor.optimalTime")}: {platform.optimal}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="default">✓</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold">{t("editor.selectDate")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CalendarIcon className="w-4 h-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: language === "fr" ? fr : undefined }) : t("editor.pickDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">{t("editor.selectTime")}</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Schedule Button */}
      <Button
        onClick={handleSchedule}
        disabled={!selectedDate || selectedPlatforms.length === 0}
        className="w-full gap-2"
        variant="hero"
      >
        <CalendarIcon className="w-4 h-4" />
        {t("editor.schedulePost")}
      </Button>

      {/* Scheduled Posts */}
      {scheduledPosts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t("editor.scheduledPosts")} ({scheduledPosts.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scheduledPosts.map((post) => (
              <div key={post.id} className="glass p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <span className="text-sm font-medium capitalize">{post.platform}</span>
                  </div>
                  <Badge variant="secondary">{post.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {format(post.date, "PP", { locale: language === "fr" ? fr : undefined })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="glass p-4 rounded-xl space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t("editor.proTip")}
        </h4>
        <p className="text-xs text-muted-foreground">
          {t("editor.scheduleTip")}
        </p>
      </div>
    </div>
  );
};
