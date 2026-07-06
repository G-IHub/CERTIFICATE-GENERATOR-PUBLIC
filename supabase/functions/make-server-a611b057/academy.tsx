import { Hono } from "npm:hono@4";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Helper to authenticate user from JWT in Bearer Authorization header
const getAuthenticatedUser = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.split(" ")[1];

  // Admin Bypass support
  if (token.startsWith("admin-bypass-")) {
    try {
      const payload = token.replace("admin-bypass-", "");
      const decoded = atob(payload);
      const [email] = decoded.split(":");
      return {
        user: {
          id: `admin-${btoa(email).substring(0, 10)}`,
          email,
          isBypassAdmin: true
        },
        error: null
      };
    } catch {
      return { user: null, error: "Failed to parse bypass token" };
    }
  }

  // Verify token using Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || ""
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: error?.message || "Unauthorized" };
  }

  return { user, error: null };
};

// GET /progress - Get user's progress and stats
app.get("/progress", async (c) => {
  try {
    const { user, error } = await getAuthenticatedUser(c.req.header("Authorization"));
    if (error || !user) {
      return c.json({ error: error || "Unauthorized" }, 401);
    }

    const userId = user.id;
    
    // Fetch gamification stats
    let gamification = await kv.get(`academy:gamification:${userId}`);
    if (!gamification) {
      // Initialize if new
      gamification = {
        userId,
        points: 0,
        streak: 0,
        lastActiveDate: null,
        unlockedBadges: []
      };
      await kv.set(`academy:gamification:${userId}`, gamification);
    }

    // Fetch all course progress keys for this user
    const prefix = `academy:progress:${userId}:`;
    const progressKeys = await kv.getKeysByPrefix(prefix);
    const progressMap: Record<string, any> = {};

    for (const key of progressKeys) {
      const courseId = key.substring(prefix.length);
      const data = await kv.get(key);
      if (data) {
        progressMap[courseId] = data;
      }
    }

    return c.json({
      email: user.email,
      gamification,
      progress: progressMap
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// POST /progress/:courseId/submit - Record completed lesson/exercise & award points
app.post("/progress/:courseId/submit", async (c) => {
  try {
    const { user, error } = await getAuthenticatedUser(c.req.header("Authorization"));
    if (error || !user) {
      return c.json({ error: error || "Unauthorized" }, 401);
    }

    const userId = user.id;
    const courseId = c.req.param("courseId");
    const { lessonId, exerciseId, pointsAwarded } = await c.req.json();

    if (!lessonId) {
      return c.json({ error: "Lesson ID is required" }, 400);
    }

    // 1. Update Course Progress
    const progressKey = `academy:progress:${userId}:${courseId}`;
    let progress = await kv.get(progressKey);
    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        completedExercises: []
      };
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    if (exerciseId && !progress.completedExercises.includes(exerciseId)) {
      progress.completedExercises.push(exerciseId);
    }
    await kv.set(progressKey, progress);

    // 2. Update Gamification Stats
    const gamificationKey = `academy:gamification:${userId}`;
    let gamification = await kv.get(gamificationKey);
    if (!gamification) {
      gamification = {
        userId,
        points: 0,
        streak: 0,
        lastActiveDate: null,
        unlockedBadges: []
      };
    }

    // Adjust points
    if (pointsAwarded) {
      gamification.points += pointsAwarded;
      
      // Auto-unlock point milestones
      if (gamification.points >= 100 && !gamification.unlockedBadges.includes("points_100")) {
        gamification.unlockedBadges.push("points_100");
      }
    }

    // Adjust streaks (checking date changes)
    const todayStr = new Date().toISOString().split("T")[0];
    if (gamification.lastActiveDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (gamification.lastActiveDate === yesterdayStr) {
        gamification.streak += 1;
      } else {
        gamification.streak = 1; // reset streak if gap exists
      }
      gamification.lastActiveDate = todayStr;
      
      // Auto-unlock streak milestone
      if (gamification.streak >= 3 && !gamification.unlockedBadges.includes("streak_3")) {
        gamification.unlockedBadges.push("streak_3");
      }
    }

    // Unlock first quiz badge if exercise completed
    if (exerciseId && !gamification.unlockedBadges.includes("first_quiz")) {
      gamification.unlockedBadges.push("first_quiz");
    }

    await kv.set(gamificationKey, gamification);

    return c.json({
      success: true,
      gamification,
      progress
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// GET /leaderboard - Fetch overall points rankings
app.get("/leaderboard", async (c) => {
  try {
    const list = await kv.getByPrefix("academy:gamification:");
    
    // Sort descending by points
    const sorted = list
      .map((item: any) => ({
        userId: item.userId,
        points: item.points || 0,
        streak: item.streak || 0,
        // In production, we'd look up the user's email/profile based on userId,
        // but since we are a key-value store we can fall back to mock username resolution or keep email stored
        name: item.name || "Anonymous Developer"
      }))
      .sort((a: any, b: any) => b.points - a.points);

    return c.json({ leaderboard: sorted.slice(0, 10) });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export default app;
