import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const SESSION_ID_KEY = "monshort_site_session_id";
const SESSION_PAGE_VIEWS_KEY = "monshort_site_session_page_views";

/**
 * Hook de tracking analytique côté client.
 * - Crée une entrée de session lors de la première visite
 * - Enregistre chaque changement de route dans page_visits
 */
export function useAnalyticsTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const navigationStartRef = useRef<number | null>(null);
  const hasInitializedSessionRef = useRef(false);

  // Initialisation de la session
  useEffect(() => {
    if (hasInitializedSessionRef.current) return;
    if (typeof window === "undefined") return;

    const initSession = async () => {
      try {
        const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);
        if (existingSessionId) {
          hasInitializedSessionRef.current = true;
          return;
        }

        const { data, error } = await supabase
          .from("site_sessions")
          .insert({
            user_id: user?.id ?? null,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null
          })
          .select("id")
          .single();

        if (error) {
          console.error("Error creating analytics session:", error);
          return;
        }

        sessionStorage.setItem(SESSION_ID_KEY, data.id);
        sessionStorage.setItem(SESSION_PAGE_VIEWS_KEY, "0");
        hasInitializedSessionRef.current = true;
      } catch (err) {
        console.error("Error initializing analytics session:", err);
      }
    };

    void initSession();
  }, [user?.id]);

  // Tracking des pages vues
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackVisit = async () => {
      try {
        const now = Date.now();
        const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
        const previousNavStart = navigationStartRef.current;
        const durationSeconds = previousNavStart
          ? Math.round((now - previousNavStart) / 1000)
          : null;

        const fullPath = location.pathname + location.search;

        await supabase.from("page_visits").insert({
          page_path: fullPath,
          referrer: document.referrer || null,
          session_id: sessionId,
          user_id: user?.id ?? null,
          duration_seconds: durationSeconds
        });

        if (sessionId) {
          const previousViews = Number(sessionStorage.getItem(SESSION_PAGE_VIEWS_KEY) || "0") + 1;
          sessionStorage.setItem(SESSION_PAGE_VIEWS_KEY, String(previousViews));

          await supabase
            .from("site_sessions")
            .update({
              page_views: previousViews,
              session_end: new Date().toISOString(),
              user_id: user?.id ?? null
            })
            .eq("id", sessionId);
        }

        navigationStartRef.current = now;
      } catch (error) {
        console.error("Error tracking page visit:", error);
      }
    };

    void trackVisit();
  }, [location.pathname, location.search, user?.id]);
}
