import { Hono } from "hono";
import * as kv from "./kv_store";

const app = new Hono();

// Key prefixes
const PAGEVIEW_PREFIX = "analytics:pageview:";
const INDEX_PREFIX = "analytics:index:";
const SESSION_PREFIX = "analytics:session:";

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Parse user agent for device type
const parseDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

// Parse user agent for browser
const parseBrowser = (userAgent: string): string => {
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  return "Other";
};

// Get date string (YYYY-MM-DD)
const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

// Track analytics event (pageview or engagement)
app.post("/track", async (c) => {
  try {
    const body = await c.req.json();
    const {
      blog_id,
      blog_title,
      session_id,
      referrer,
      user_agent,
      page_url,
      event_type,
      reading_time,
      scroll_depth,
    } = body;

    if (!blog_id || !session_id || !event_type) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const now = new Date().toISOString();
    const dateString = getDateString();

    if (event_type === "pageview") {
      // Create pageview record
      const pageviewId = generateId();
      const deviceType = user_agent ? parseDeviceType(user_agent) : "unknown";
      const browser = user_agent ? parseBrowser(user_agent) : "unknown";

      // Determine referrer type
      let referrerType = "direct";
      if (referrer && referrer !== "direct") {
        try {
          const referrerUrl = new URL(referrer);
          const currentUrl = new URL(page_url || "");

          if (referrerUrl.hostname === currentUrl.hostname) {
            referrerType = "internal";
          } else if (referrerUrl.hostname.includes("google")) {
            referrerType = "search";
          } else if (
            [
              "facebook.com",
              "twitter.com",
              "linkedin.com",
              "instagram.com",
            ].some((domain) => referrerUrl.hostname.includes(domain))
          ) {
            referrerType = "social";
          } else {
            referrerType = "referral";
          }
        } catch (e) {
          referrerType = "direct";
        }
      }

      const pageview = {
        id: pageviewId,
        blog_id,
        blog_title: blog_title || "",
        session_id,
        timestamp: now,
        date: dateString,
        referrer: referrer || "direct",
        referrer_type: referrerType,
        user_agent: user_agent || "",
        device_type: deviceType,
        browser,
        page_url: page_url || "",
        reading_time: null,
        scroll_depth: null,
      };

      // Save pageview
      await kv.set(`${PAGEVIEW_PREFIX}${pageviewId}`, pageview);

      // Update blog index
      const indexKey = `${INDEX_PREFIX}${blog_id}`;
      const index = (await kv.get(indexKey)) || [];
      index.push(pageviewId);
      await kv.set(indexKey, index);

      // Track session (for unique visitor count)
      const sessionKey = `${SESSION_PREFIX}${session_id}:${blog_id}:${dateString}`;
      await kv.set(sessionKey, { timestamp: now, blog_id });

      return c.json({ success: true, pageview_id: pageviewId });
    } else if (event_type === "engagement") {
      // Find most recent pageview for this session and blog
      const indexKey = `${INDEX_PREFIX}${blog_id}`;
      const index = (await kv.get(indexKey)) || [];

      // Get recent pageviews (last 100)
      const recentPageviewIds = index.slice(-100);
      const pageviewKeys = recentPageviewIds.map(
        (id: string) => `${PAGEVIEW_PREFIX}${id}`,
      );
      const pageviews = await kv.mget(pageviewKeys);

      // Find the most recent pageview for this session
      let targetPageview = null;
      for (let i = pageviews.length - 1; i >= 0; i--) {
        if (pageviews[i] && pageviews[i].session_id === session_id) {
          targetPageview = pageviews[i];
          break;
        }
      }

      if (
        targetPageview &&
        (!targetPageview.reading_time || targetPageview.reading_time === null)
      ) {
        // Update with reading time and scroll depth
        targetPageview.reading_time = reading_time || 0;
        targetPageview.scroll_depth = scroll_depth || 0;
        await kv.set(`${PAGEVIEW_PREFIX}${targetPageview.id}`, targetPageview);
      }

      return c.json({ success: true });
    }

    return c.json({ error: "Invalid event type" }, 400);
  } catch (error: any) {
    console.error("Error tracking analytics:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get analytics for specific blog post
app.get("/blog/:id", async (c) => {
  try {
    const blogId = c.req.param("id");
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");

    // Get all pageviews for this blog
    const indexKey = `${INDEX_PREFIX}${blogId}`;
    const index = (await kv.get(indexKey)) || [];

    if (index.length === 0) {
      return c.json({
        blog_id: blogId,
        blog_title: "",
        total_views: 0,
        unique_visitors: 0,
        avg_reading_time: 0,
        avg_scroll_depth: 0,
        top_referrers: [],
        device_breakdown: { mobile: 0, desktop: 0, tablet: 0 },
        views_by_date: [],
      });
    }

    const pageviewKeys = index.map((id: string) => `${PAGEVIEW_PREFIX}${id}`);
    const allPageviews = await kv.mget(pageviewKeys);

    // Filter by date range if provided
    let pageviews = allPageviews.filter((pv: any) => pv !== null);

    if (startDate || endDate) {
      pageviews = pageviews.filter((pv: any) => {
        const pvDate = pv.date;
        if (startDate && pvDate < startDate) return false;
        if (endDate && pvDate > endDate) return false;
        return true;
      });
    }

    // Calculate metrics
    const totalViews = pageviews.length;
    const uniqueSessions = new Set(pageviews.map((pv: any) => pv.session_id))
      .size;

    // Reading time and scroll depth (only from pageviews that have engagement data)
    const engagedPageviews = pageviews.filter(
      (pv: any) => pv.reading_time !== null && pv.reading_time > 0,
    );
    const avgReadingTime =
      engagedPageviews.length > 0
        ? engagedPageviews.reduce(
            (sum: number, pv: any) => sum + pv.reading_time,
            0,
          ) / engagedPageviews.length
        : 0;
    const avgScrollDepth =
      engagedPageviews.length > 0
        ? engagedPageviews.reduce(
            (sum: number, pv: any) => sum + (pv.scroll_depth || 0),
            0,
          ) / engagedPageviews.length
        : 0;

    // Top referrers
    const referrerCounts = pageviews.reduce((acc: any, pv: any) => {
      const ref = pv.referrer || "direct";
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown = pageviews.reduce(
      (acc: any, pv: any) => {
        const device = pv.device_type || "desktop";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      { mobile: 0, desktop: 0, tablet: 0 },
    );

    // Views by date
    const viewsByDate = pageviews.reduce((acc: any, pv: any) => {
      const date = pv.date;
      if (!acc[date]) {
        acc[date] = { views: 0, sessions: new Set() };
      }
      acc[date].views++;
      acc[date].sessions.add(pv.session_id);
      return acc;
    }, {});

    const viewsByDateArray = Object.entries(viewsByDate)
      .map(([date, data]: [string, any]) => ({
        date,
        views: data.views,
        unique: data.sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return c.json({
      blog_id: blogId,
      blog_title: pageviews[0]?.blog_title || "",
      total_views: totalViews,
      unique_visitors: uniqueSessions,
      avg_reading_time: Math.round(avgReadingTime),
      avg_scroll_depth: Math.round(avgScrollDepth),
      top_referrers: topReferrers,
      device_breakdown: deviceBreakdown,
      views_by_date: viewsByDateArray,
    });
  } catch (error: any) {
    console.error("Error fetching blog analytics:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get overview analytics for all blogs
app.get("/overview", async (c) => {
  try {
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");

    // Get all blog indices using prefix search
    const indexData = await kv.getByPrefix(INDEX_PREFIX);

    if (indexData.length === 0) {
      return c.json({
        total_views: 0,
        unique_visitors: 0,
        total_posts_viewed: 0,
        avg_reading_time: 0,
        top_posts: [],
        views_by_date: [],
      });
    }

    // Get all pageviews across all blogs
    let allPageviews: any[] = [];
    const blogStats: any = {};

    for (const index of indexData) {
      if (!index || !Array.isArray(index)) continue;

      // Extract blog_id from the first pageview in this index
      if (index.length > 0) {
        const pageviewKeys = index.map(
          (id: string) => `${PAGEVIEW_PREFIX}${id}`,
        );
        const pageviews = await kv.mget(pageviewKeys);
        const validPageviews = pageviews.filter((pv: any) => pv !== null);

        // Filter by date range
        let filteredPageviews = validPageviews;
        if (startDate || endDate) {
          filteredPageviews = validPageviews.filter((pv: any) => {
            const pvDate = pv.date;
            if (startDate && pvDate < startDate) return false;
            if (endDate && pvDate > endDate) return false;
            return true;
          });
        }

        allPageviews = allPageviews.concat(filteredPageviews);

        // Track per-blog stats
        if (filteredPageviews.length > 0) {
          const blogId = filteredPageviews[0].blog_id;
          blogStats[blogId] = {
            blog_id: blogId,
            blog_title: filteredPageviews[0].blog_title || blogId,
            views: filteredPageviews.length,
            unique_visitors: new Set(
              filteredPageviews.map((pv: any) => pv.session_id),
            ).size,
          };
        }
      }
    }

    // Calculate overall metrics
    const totalViews = allPageviews.length;
    const uniqueVisitors = new Set(allPageviews.map((pv: any) => pv.session_id))
      .size;
    const totalPostsViewed = Object.keys(blogStats).length;

    // Average reading time
    const engagedPageviews = allPageviews.filter(
      (pv: any) => pv.reading_time !== null && pv.reading_time > 0,
    );
    const avgReadingTime =
      engagedPageviews.length > 0
        ? Math.round(
            engagedPageviews.reduce(
              (sum: number, pv: any) => sum + pv.reading_time,
              0,
            ) / engagedPageviews.length,
          )
        : 0;

    // Top posts
    const topPosts = Object.values(blogStats)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10);

    // Views by date (aggregated across all blogs)
    const viewsByDate = allPageviews.reduce((acc: any, pv: any) => {
      const date = pv.date;
      if (!acc[date]) {
        acc[date] = { views: 0, sessions: new Set() };
      }
      acc[date].views++;
      acc[date].sessions.add(pv.session_id);
      return acc;
    }, {});

    const viewsByDateArray = Object.entries(viewsByDate)
      .map(([date, data]: [string, any]) => ({
        date,
        views: data.views,
        unique: data.sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return c.json({
      total_views: totalViews,
      unique_visitors: uniqueVisitors,
      total_posts_viewed: totalPostsViewed,
      avg_reading_time: avgReadingTime,
      top_posts: topPosts,
      views_by_date: viewsByDateArray,
    });
  } catch (error: any) {
    console.error("Error fetching overview analytics:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get real-time active readers (viewed in last 5 minutes)
app.get("/realtime", async (c) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Get all blog indices using prefix search
    const indexData = await kv.getByPrefix(INDEX_PREFIX);

    let activeReaders = 0;
    const byBlog: any[] = [];

    for (const index of indexData) {
      if (!index || !Array.isArray(index)) continue;

      if (index.length > 0) {
        // Get recent pageviews (last 50)
        const recentIds = index.slice(-50);
        const pageviewKeys = recentIds.map(
          (id: string) => `${PAGEVIEW_PREFIX}${id}`,
        );
        const pageviews = await kv.mget(pageviewKeys);

        // Count active sessions (viewed in last 5 minutes)
        const activeSessions = new Set();
        let blogTitle = "";
        let blogId = "";

        for (const pv of pageviews) {
          if (pv && pv.timestamp >= fiveMinutesAgo) {
            activeSessions.add(pv.session_id);
            if (!blogTitle) {
              blogTitle = pv.blog_title || pv.blog_id;
              blogId = pv.blog_id;
            }
          }
        }

        if (activeSessions.size > 0) {
          byBlog.push({
            blog_id: blogId,
            blog_title: blogTitle,
            count: activeSessions.size,
          });
          activeReaders += activeSessions.size;
        }
      }
    }

    return c.json({
      active_readers: activeReaders,
      by_blog: byBlog.sort((a, b) => b.count - a.count),
    });
  } catch (error: any) {
    console.error("Error fetching realtime analytics:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
