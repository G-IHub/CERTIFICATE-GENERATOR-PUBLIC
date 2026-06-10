import { useEffect, useRef } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface SessionTrackerProps {
  organizationId: string;
  accessToken: string | null;
  enabled?: boolean;
}

export default function SessionTracker({
  organizationId,
  accessToken,
  enabled = true,
}: SessionTrackerProps) {
  const sessionStart = useRef<number>(Date.now());
  const lastSyncTime = useRef<number>(Date.now());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !organizationId || !accessToken) {
      return;
    }

    // Reset session start time
    sessionStart.current = Date.now();
    lastSyncTime.current = Date.now();

    console.log("⏱️ Session tracker started for org:", organizationId);

    // Sync session time every 2 minutes
    const syncInterval = setInterval(() => {
      syncSessionTime();
    }, 120000); // 2 minutes

    intervalRef.current = syncInterval as unknown as number;

    // Sync on visibility change (when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        syncSessionTime();
      } else {
        // Reset last sync time when tab becomes visible again
        lastSyncTime.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Sync before unload
    const handleBeforeUnload = () => {
      syncSessionTime(true); // Synchronous for unload
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Final sync when component unmounts
      syncSessionTime();
    };
  }, [organizationId, accessToken, enabled]);

  const syncSessionTime = async (isBeforeUnload = false) => {
    if (!accessToken || !organizationId) return;

    const now = Date.now();
    const sessionDuration = Math.floor((now - lastSyncTime.current) / 1000); // Convert to seconds

    // Only sync if there's meaningful time (at least 10 seconds)
    if (sessionDuration < 10) {
      return;
    }

    lastSyncTime.current = now;

    try {
      const url = `${API_BASE_URL}/track-session`;
      const body = JSON.stringify({
        organizationId,
        sessionDuration,
      });

      if (isBeforeUnload) {
        // Use sendBeacon for synchronous unload events
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        // Use fetch for regular syncs
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body,
        });
      }

      console.log(
        `Session time synced: ${sessionDuration}s for org ${organizationId}`,
      );
    } catch (error) {
      console.error("Failed to sync session time:", error);
    }
  };

  // This component doesn't render anything
  return null;
}