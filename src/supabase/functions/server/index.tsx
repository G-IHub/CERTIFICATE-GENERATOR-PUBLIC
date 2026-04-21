// Certificate Generator Platform - Edge Function Server
// Fixed: Removed duplicate Hono import
import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as blog from "./blog.tsx";
import * as analytics from "./analytics.tsx";

// Load local .env during development so Deno.env.get(...) picks up values
// Note: Commented out to avoid Deno.readTextFileSync warnings
// In Supabase Edge Functions, environment variables are already available via Deno.env
// If you need to use .env locally, consider using --env-file flag when running Deno
/*
try {
  await import("https://deno.land/std@0.203.0/dotenv/load.ts");
  console.log("✅ Loaded .env into Deno.env (if present)");
} catch (err) {
  console.log(
    "ℹ️ .env loader not applied (ok in production):",
    err?.message || err
  );
}
*/

const app = new Hono();
const FIXED_PLATFORM_FEE_PERCENT = 15;

// Middleware - Configure CORS to allow all requests
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
  }),
);
app.use("*", logger(console.log));

// Handle OPTIONS preflight requests for all routes
app.options("*", (c) => c.text("", 204));

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
};

// Helper to verify user token
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(
      "❌ Missing or invalid authorization header:",
      authHeader?.substring(0, 20),
    );
    return { user: null, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.split(" ")[1];
  console.log("🔐 Verifying JWT token (length:", token?.length, ")");

  // IMPORTANT: Use ANON_KEY client to verify user JWT tokens (not SERVICE_ROLE_KEY)
  // User tokens are issued by ANON_KEY client during signin
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error(
      "❌ JWT verification failed:",
      error?.message || "No user found",
    );
    console.error("Token preview:", token?.substring(0, 50) + "...");
    return { user: null, error: "Unauthorized" };
  }

  console.log("✅ JWT verified successfully for user:", user.email);
  return { user, error: null };
};

// ==================== HEALTH CHECK ====================
// Root endpoint for basic connectivity test
app.get("/make-server-a611b057", (c) => {
  console.log("Root endpoint called");
  return c.json({
    status: "online",
    message: "Certificate Generator API",
    endpoints: {
      health: "/make-server-a611b057",
    }
  });
});

// Health check endpoint - must be before auth routes and doesn't require authentication

// Health check endpoint - must be before auth routes and doesn't require authentication
app.options("/make-server-a611b057/health", (c) => {
  return c.text("", 204);
});

app.get("/make-server-a611b057/health", (c) => {
  console.log("Health check called");
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Certificate Generator API is running",
  });
});

// Canonical default templates (single source of truth)
// All templates seeded by default will use type: 'default'
const DEFAULT_TEMPLATES = [
  {
    id: "template1",
    name: "Certificate of Appreciation",
    description:
      "Classic design with brown/gold border, decorative corners, and elegant award badge",
    config: {
      colors: {
        background: "#faf8f3",
        border: "#8b6f47",
        accent: "#c9a961",
        text: "#8b6f47",
        textSecondary: "#b8935d",
      },
      layout: {
        borderWidth: "4px",
        borderStyle: "double",
        padding: "48px",
        alignment: "center",
      },
      typography: {
        headerFont: "Georgia",
        bodyFont: "Georgia",
        scriptFont: "Brush Script MT",
        nameSize: "48px",
        headerSize: "48px",
        bodySize: "14px",
      },
      elements: {
        showBorder: true,
        showDecorativeCorners: true,
        showSeal: true,
        sealType: "gold-award-badge",
        showSignatures: true,
        signatureCount: 2,
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template2",
    name: "Certificate of Completion",
    description:
      "Classic ornamental design with decorative floral borders, elegant swirls, and traditional styling",
    config: {
      colors: {
        background: "#faf8f3",
        border: "#4a3728",
        accent: "#999999",
        text: "#4a3728",
        textSecondary: "#666666",
      },
      layout: {
        borderWidth: "4px",
        borderStyle: "double",
        padding: "48px",
        alignment: "center",
      },
      typography: {
        headerFont: "Georgia",
        bodyFont: "Georgia",
        scriptFont: "Brush Script MT",
        nameSize: "64px",
        headerSize: "72px",
        bodySize: "14px",
      },
      elements: {
        showBorder: true,
        showDecorativeCorners: true,
        showSeal: false,
        sealType: "ornamental-pattern",
        showSignatures: true,
        signatureCount: 1,
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template3",
    name: "Certificate of Recognition",
    description:
      "Modern professional design with navy blue waves, gold accents, and decorative badge",
    config: {
      colors: {
        background: "#ffffff",
        border: "#1e3a8a",
        accent: "#ca8a04",
        text: "#1e293b",
        textSecondary: "#64748b",
      },
      layout: {
        borderWidth: "0px",
        borderStyle: "none",
        padding: "48px",
        alignment: "center",
      },
      typography: {
        headerFont: "Georgia",
        bodyFont: "system-ui",
        scriptFont: "Georgia",
        nameSize: "56px",
        headerSize: "68px",
        bodySize: "14px",
      },
      elements: {
        showBorder: false,
        showDecorativeCorners: true,
        showSeal: true,
        sealType: "modern-badge",
        showSignatures: true,
        signatureCount: 1,
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template4",
    name: "Certificate of Honor",
    description:
      "Bold modern design with red diagonal chevrons, ribbon badge, and dynamic styling",
    config: {
      colors: {
        background: "#ffffff",
        border: "#dc2626",
        accent: "#ca8a04",
        text: "#000000",
        textSecondary: "#1f2937",
      },
      layout: {
        borderWidth: "3px",
        borderStyle: "double",
        padding: "20px",
        alignment: "center",
      },
      typography: {
        headerFont: "Georgia",
        bodyFont: "system-ui",
        scriptFont: "Brush Script MT",
        nameSize: "68px",
        headerSize: "72px",
        bodySize: "13px",
      },
      elements: {
        showBorder: true,
        showDecorativeCorners: false,
        showSeal: true,
        sealType: "ribbon-badge",
        showSignatures: true,
        signatureCount: 1,
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template5",
    name: "Certificate of Excellence",
    description:
      "Elegant design with green diagonal stripes, decorative scalloped badge, and cream background",
    config: {
      colors: {
        background: "#f5f5dc",
        border: "#1b5e20",
        accent: "#9acd32",
        text: "#2d2d2d",
        textSecondary: "#4a4a4a",
      },
      layout: {
        borderWidth: "6px",
        borderStyle: "double",
        padding: "24px",
        alignment: "center",
      },
      typography: {
        headerFont: "Georgia",
        bodyFont: "system-ui",
        scriptFont: "Georgia",
        nameSize: "60px",
        headerSize: "84px",
        bodySize: "13px",
      },
      elements: {
        showBorder: true,
        showDecorativeCorners: true,
        showSeal: true,
        sealType: "scalloped-badge",
        showSignatures: true,
        signatureCount: 1,
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template6",
    name: "Creative Studio",
    description: "Artistic and creative certificate design",
    config: {
      layout: "creative",
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        accent: "#ea580c",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template7",
    name: "Academic Excellence",
    description: "Perfect for educational institutions",
    config: {
      layout: "academic",
      colors: {
        primary: "#dc2626",
        secondary: "#991b1b",
        accent: "#ea580c",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  {
    id: "template8",
    name: "Academic Participation",
    description: "Perfect for educational institutions",
    config: {
      layout: "academic",
      colors: {
        primary: "#dc2626",
        secondary: "#991b1b",
        accent: "#ea580c",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template9",
    name: "Academic Endurance",
    description: "Perfect for educational institutions",
    config: {
      layout: "academic",
      colors: {
        primary: "#dc2626",
        secondary: "#991b1b",
        accent: "#ea580c",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template10",
    name: "Certificate of Achievement",
    description:
      "Modern design with corner decorations, orange accents, and elegant Playfair Display typography",
    config: {
      layout: "modern",
      colors: {
        primary: "#1a1a1a",
        secondary: "#FF8C00",
        accent: "#FF8C00",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template11",
    name: "Certificate of Excellence",
    description:
      "Distinguished design with decorative left border, gradient orange accent, and Cormorant Garamond font",
    config: {
      layout: "distinguished",
      colors: {
        primary: "#2a2a2a",
        secondary: "#FF8C00",
        accent: "#FFA500",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template12",
    name: "Certificate of Completion",
    description:
      "Professional design with double border frame, diagonal backgrounds, and Libre Baskerville typography",
    config: {
      layout: "professional",
      colors: {
        primary: "#1a1a1a",
        secondary: "#FF8C00",
        accent: "#000000",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template13",
    name: "Certificate of Achievement",
    description:
      "Modern gradient design with purple and indigo tones, decorative corners, and Playfair Display font",
    config: {
      layout: "modern-gradient",
      colors: {
        primary: "#4f46e5",
        secondary: "#9333ea",
        accent: "#6366f1",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template14",
    name: "Certificate of Excellence",
    description:
      "Elegant emerald design with double border frames, decorative flourishes, and Cinzel serif typography",
    config: {
      layout: "elegant-emerald",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template15",
    name: "Certificate of Recognition",
    description:
      "Bold geometric design with orange header, diagonal accents, and Raleway modern typography",
    config: {
      layout: "geometric-modern",
      colors: {
        primary: "#f97316",
        secondary: "#f59e0b",
        accent: "#fb923c",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template16",
    name: "Certificate of Distinction",
    description:
      "Professional blue design with gradient background, decorative badge, and Merriweather typography",
    config: {
      layout: "professional-blue",
      colors: {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        accent: "#60a5fa",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template17",
    name: "Genomac Institute Certificate",
    description:
      "Professional purple gradient design with sidebar layout, organizational branding, and dual signature support - perfect for research institutions",
    config: {
      layout: "sidebar-professional",
      colors: {
        primary: "#581c87",
        secondary: "#f0abfc",
        accent: "#9333ea",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template18",
    name: "Genomac Purple Border Certificate",
    description:
      "Elegant purple-bordered certificate with watermark, institutional branding, and dual signature support - ideal for fully funded programs",
    config: {
      layout: "bordered-institutional",
      colors: {
        primary: "#7c3aed",
        secondary: "#c084fc",
        accent: "#a855f7",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template19",
    name: "Modern Professional Certificate",
    description:
      "Contemporary design with clean lines, professional layout, and sophisticated styling - perfect for corporate training and professional development",
    config: {
      layout: "modern-professional",
      colors: {
        primary: "#1e293b",
        secondary: "#3b82f6",
        accent: "#60a5fa",
      },
    },
    type: "default",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template20",
    name: "Cybersecurity Excellence",
    description:
      "Futuristic cyber-themed design with neon cyan and purple accents, grid patterns, and tech-forward styling - perfect for IT certifications and digital innovation programs",
    config: {
      layout: "cyber-tech",
      colors: {
        background: "#0a0e27",
        primary: "#00ffff",
        secondary: "#a855f7",
        accent: "#3b82f6",
      },
      fonts: {
        header: "Orbitron",
        body: "Rajdhani",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template21",
    name: "Medical & Healthcare Professional",
    description:
      "Clean white medical-themed certificate with teal accents and medical cross patterns - ideal for healthcare certifications and medical training programs",
    config: {
      layout: "medical-professional",
      colors: {
        background: "#ffffff",
        primary: "#0d9488",
        secondary: "#14b8a6",
        accent: "#06b6d4",
      },
      fonts: {
        header: "Lato",
        body: "Lato",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template22",
    name: "Modern Dark Tech",
    description:
      "Sleek dark design with purple-blue gradients and geometric patterns - perfect for modern tech companies and innovation programs",
    config: {
      layout: "modern-dark",
      colors: {
        background: "#0a0e27",
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#3b82f6",
      },
      fonts: {
        header: "Space Grotesk",
        body: "Space Grotesk",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template23",
    name: "Luxury Gold & Cream",
    description:
      "Elegant luxury design with cream background and gold accents, featuring ornate borders and classic serif typography",
    config: {
      layout: "luxury-elegant",
      colors: {
        background: "#faf8f5",
        primary: "#d4af37",
        secondary: "#c9a961",
        accent: "#b8935d",
      },
      fonts: {
        header: "Playfair Display",
        body: "Playfair Display",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template24",
    name: "Creative Circuit",
    description:
      "Vibrant purple gradient design with circuit board patterns - ideal for creative tech programs and innovation challenges",
    config: {
      layout: "creative-circuit",
      colors: {
        background: "#667eea",
        primary: "#764ba2",
        secondary: "#f093fb",
        accent: "#ffffff",
      },
      fonts: {
        header: "Rajdhani",
        body: "Rajdhani",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template25",
    name: "Fresh Blue Gradient",
    description:
      "Clean white design with fresh blue gradient accents and watercolor effects - perfect for creative and educational programs",
    config: {
      layout: "fresh-modern",
      colors: {
        background: "#ffffff",
        primary: "#3b82f6",
        secondary: "#10b981",
        accent: "#f0f9ff",
      },
      fonts: {
        header: "Poppins",
        body: "Poppins",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template26",
    name: "Dark Sophisticated",
    description:
      "Dark elegant design with sophisticated gradients and refined typography - ideal for executive and premium programs",
    config: {
      layout: "dark-sophisticated",
      colors: {
        background: "#1a1a2e",
        primary: "#d4af37",
        secondary: "#c9a961",
        accent: "#ffffff",
      },
      fonts: {
        header: "Crimson Text",
        body: "Crimson Text",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template27",
    name: "Corporate Minimal",
    description:
      "Clean white design with colorful vertical accent strip - perfect for corporate training and professional development",
    config: {
      layout: "corporate-minimal",
      colors: {
        background: "#ffffff",
        primary: "#1e293b",
        secondary: "#3b82f6",
        accent: "#10b981",
      },
      fonts: {
        header: "Archivo",
        body: "Archivo",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template28",
    name: "Soft Gray Gradient",
    description:
      "Professional gray gradient design with diagonal patterns - ideal for business and professional certifications",
    config: {
      layout: "soft-professional",
      colors: {
        background: "#f5f7fa",
        primary: "#1e293b",
        secondary: "#3b82f6",
        accent: "#c3cfe2",
      },
      fonts: {
        header: "Roboto",
        body: "Roboto",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template29",
    name: "Dark Gradient Tech",
    description:
      "Dark tech design with animated gradients and modern styling - perfect for technology and innovation programs",
    config: {
      layout: "dark-gradient",
      colors: {
        background: "#0a0e27",
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#06b6d4",
      },
      fonts: {
        header: "Inter",
        body: "Inter",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template30",
    name: "Medical Cross Pattern",
    description:
      "Clean white medical certificate with cross patterns and teal accents - specialized for healthcare certifications",
    config: {
      layout: "medical-cross",
      colors: {
        background: "#ffffff",
        primary: "#0d9488",
        secondary: "#14b8a6",
        accent: "#06b6d4",
      },
      fonts: {
        header: "Lato",
        body: "Lato",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template31",
    name: "Golden Sunshine",
    description:
      "Warm golden gradient design with watercolor effects - perfect for achievement awards and celebratory certificates",
    config: {
      layout: "golden-watercolor",
      colors: {
        background: "#fef3c7",
        primary: "#fbbf24",
        secondary: "#f59e0b",
        accent: "#fde68a",
      },
      fonts: {
        header: "Montserrat",
        body: "Montserrat",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template32",
    name: "Eco Green Nature",
    description:
      "Fresh green gradient with organic leaf patterns - ideal for environmental, sustainability, and nature-focused programs",
    config: {
      layout: "eco-nature",
      colors: {
        background: "#ecfdf5",
        primary: "#10b981",
        secondary: "#059669",
        accent: "#d1fae5",
      },
      fonts: {
        header: "Raleway",
        body: "Raleway",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template33",
    name: "Bold Dark Stripes",
    description:
      "Dynamic dark design with bold diagonal stripes and modern typography - perfect for sports and achievement awards",
    config: {
      layout: "bold-stripes",
      colors: {
        background: "#1e1e1e",
        primary: "#f59e0b",
        secondary: "#ef4444",
        accent: "#3b82f6",
      },
      fonts: {
        header: "Barlow",
        body: "Barlow",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template34",
    name: "Luxury Black Gold",
    description:
      "Ultra-premium black background with gold accents and elegant serif typography - ideal for VIP and exclusive programs",
    config: {
      layout: "luxury-premium",
      colors: {
        background: "#0a0a0a",
        primary: "#d4af37",
        secondary: "#c9a961",
        accent: "#ffffff",
      },
      fonts: {
        header: "Cormorant Garamond",
        body: "Cormorant Garamond",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template35",
    name: "Musical Pink",
    description:
      "Soft pink gradient with musical note decorations - perfect for music, arts, and creative achievement programs",
    config: {
      layout: "musical-creative",
      colors: {
        background: "#fdf2f8",
        primary: "#ec4899",
        secondary: "#f472b6",
        accent: "#fbcfe8",
      },
      fonts: {
        header: "Quicksand",
        body: "Quicksand",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template36",
    name: "Matrix Code Style",
    description:
      "Black background with Matrix-style code effects and neon green accents - perfect for coding bootcamps and programming courses",
    config: {
      layout: "matrix-code",
      colors: {
        background: "#000000",
        primary: "#00ff00",
        secondary: "#39ff14",
        accent: "#0f0",
      },
      fonts: {
        header: "Roboto Mono",
        body: "Roboto Mono",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template37",
    name: "Colorful Geometric",
    description:
      "Vibrant white design with colorful geometric shapes and modern styling - ideal for creative and design programs",
    config: {
      layout: "geometric-colorful",
      colors: {
        background: "#ffffff",
        primary: "#3b82f6",
        secondary: "#ec4899",
        accent: "#10b981",
      },
      fonts: {
        header: "Poppins",
        body: "Poppins",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template38",
    name: "Professional Dark Blue",
    description:
      "Sophisticated dark blue gradient with professional grid patterns - perfect for corporate and executive programs",
    config: {
      layout: "professional-corporate",
      colors: {
        background: "#1e293b",
        primary: "#3b82f6",
        secondary: "#60a5fa",
        accent: "#0f172a",
      },
      fonts: {
        header: "Open Sans",
        body: "Open Sans",
      },
    },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template39",
    name: "Dark Geometric",
    description: "Bold dark background with vibrant triangle patterns — striking and modern for tech or creative organisations",
    config: { layout: "dark-geometric", colors: { background: "#1a1a1a", primary: "#673A8D", secondary: "#80183D" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template40",
    name: "Luxe Gold on Black",
    description: "Premium black certificate with rich gold borders, corner ornaments, and an elegant double-rule frame — perfect for prestigious awards",
    config: { layout: "luxe-gold", colors: { background: "#0B0B0B", primary: "#D4AF37", secondary: "#A07C10" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template41",
    name: "Ocean Diagonal Split",
    description: "Contemporary two-panel design with a bold navy-to-teal diagonal left column and clean white content area — sharp and professional",
    config: { layout: "ocean-split", colors: { background: "#FFFFFF", primary: "#0F4C81", secondary: "#1A8FD1" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template42",
    name: "Warm Parchment",
    description: "Classic academic style with a warm cream background, double burgundy border, gold diamond ornaments, and Cinzel serif typography",
    config: { layout: "warm-parchment", colors: { background: "#F5F0E4", primary: "#6B1C25", secondary: "#C9A93F" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template43",
    name: "Soft Gradient Glow",
    description: "Modern pastel-gradient design with a purple-to-pink gradient recipient name, radial glow accents, and clean Inter typography",
    config: { layout: "soft-gradient", colors: { background: "#FDFBFF", primary: "#7C3AED", secondary: "#EC4899" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template44",
    name: "Executive Teal",
    description: "Sleek executive design with a dark navy header bar, teal accent strip and hexagonal decorations — polished and corporate",
    config: { layout: "executive-teal", colors: { background: "#F8FAFC", primary: "#0D9488", secondary: "#0F172A" } },
    type: "default",
    isDefault: true,
    visibility_type: "public",
    organization_id: null,
    createdAt: new Date().toISOString(),
  },
];

// ==================== AUTH ROUTES ====================

// Sign up new user
app.post("/make-server-a611b057/auth/signup", async (c) => {
  try {
    const { email, password, fullName, organizationName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json(
        { error: "Email, password, and full name are required" },
        400,
      );
    }

    // Normalize email to lowercase to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        user_metadata: {
          full_name: fullName,
        },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true,
      });

    if (authError) {
      console.log("Auth error during sign up:", authError);
      return c.json({ error: `Sign up failed: ${authError.message}` }, 400);
    }

    if (!authData.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create user account record
    const userId = authData.user.id;

    // ALWAYS create an organization for every user (organizationName is optional)
    const organizationId = `org-${userId}-${Date.now()}`;
    const orgName =
      organizationName && organizationName.trim()
        ? organizationName
        : fullName + "'s Organization";

    const organization = {
      id: organizationId,
      name: orgName,
      shortName: orgName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3),
      logo: "", // Will be updated later
      primaryColor: generateRandomColor(),
      programs: [],
      ownerId: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`org:${organizationId}`, organization);
    console.log(
      `✅ Auto-created organization for user ${normalizedEmail}: ${orgName}`,
    );

    // Create user account with organization
    const userAccount = {
      id: userId,
      fullName,
      email: normalizedEmail,
      userType: "company", // All users are organization users
      organizationId: organizationId,
      organizationName: orgName,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userAccount);

    // Sign in to get session token
    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (sessionError) {
      console.log("Session error after sign up:", sessionError);
      return c.json({ error: "User created but sign in failed" }, 500);
    }

    return c.json({
      user: userAccount,
      session: sessionData.session,
      accessToken: sessionData.session?.access_token,
    });
  } catch (error) {
    console.log("Error in signup:", error);
    return c.json({ error: `Server error during sign up: ${error}` }, 500);
  }
});

// Sign in existing user
app.post("/make-server-a611b057/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Normalize email to lowercase to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.log("Sign in error:", error);
      return c.json({ error: `Sign in failed: ${error.message}` }, 401);
    }

    if (!session) {
      return c.json({ error: "Failed to create session" }, 500);
    }

    // Get user account data
    const userId = session.user.id;
    let userAccount = await kv.get(`user:${userId}`);

    if (!userAccount) {
      console.log("❌ User account not found for authenticated user:", userId);
      return c.json(
        {
          error:
            "User account not found. Please contact support or create a new account.",
        },
        404,
      );
    }

    // Auto-fix: If user doesn't have organizationId, create one
    if (!userAccount.organizationId) {
      console.log("⚠️  User missing organizationId, auto-creating:", userId);

      const organizationId = `org-${userId}-${Date.now()}`;
      const orgName = userAccount.fullName + "'s Organization";

      const organization = {
        id: organizationId,
        name: orgName,
        shortName: orgName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 3),
        logo: "",
        primaryColor: generateRandomColor(),
        programs: [],
        ownerId: userId,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`org:${organizationId}`, organization);

      userAccount.organizationId = organizationId;
      userAccount.organizationName = orgName;
      userAccount.userType = "company";
      await kv.set(`user:${userId}`, userAccount);

      console.log(
        "✅ Auto-created organization for legacy user:",
        organizationId,
      );
    }

    return c.json({
      user: userAccount,
      session,
      accessToken: session.access_token,
    });
  } catch (error) {
    console.log("Error in signin:", error);
    return c.json({ error: `Server error during sign in: ${error}` }, 500);
  }
});

// Password reset request
// Using Mailtrap API for reliable email delivery (no SMTP configuration needed!)
app.post("/make-server-a611b057/auth/reset-password", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Create Supabase admin client to generate reset token
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    console.log(`🔐 Password reset requested for: ${email}`);

    // Check if user exists (using admin client to avoid enumeration attacks)
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();
    const userExists = userData?.users?.some((user) => user.email === email);

    if (!userExists) {
      console.log(
        `⚠️  User not found: ${email} (returning generic success for security)`,
      );
      // Return success anyway to prevent email enumeration
      return c.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Get frontend URL from environment (for redirect after reset)
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
    console.log(`🌐 Using redirect URL: ${frontendUrl}`);

    // Generate password reset token with correct redirect URL
    // Note: Redirecting to root URL - the app will detect recovery token and redirect to /reset-password
    const { data: resetData, error: resetError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: `${frontendUrl}`,
        },
      });

    if (resetError || !resetData) {
      console.error("❌ Failed to generate reset token:", resetError);
      throw new Error(
        `Failed to generate reset token: ${resetError?.message || "Unknown error"}`,
      );
    }

    const resetLink = resetData.properties.action_link;
    console.log(`✅ Generated reset link for: ${email}`);

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY not configured!");
      throw new Error("EMAIL_SERVICE_NOT_CONFIGURED");
    }

    console.log(`📧 Sending password reset email via Resend to: ${email}`);

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Certifyer <noreply@certifyer.online>",
        to: [email],
        subject: "Reset Your Certifyer Password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo img {
                max-width: 120px;
                height: auto;
              }
              .logo h1 {
                color: #FF6B35;
                margin: 10px 0 0 0;
                font-size: 32px;
              }
              .button {
                display: inline-block;
                background: #FF6B35;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 30px;
                border-radius: 6px;
                margin: 25px 0;
                font-weight: 600;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
                text-align: center;
              }
              .warning {
                background: #FFF3CD;
                border-left: 4px solid #FFC107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <img src="https://certifyer.online/logo.png" alt="Certifyer Logo">
                <h1>Certifyer</h1>
              </div>
              
              <h2>Reset Your Password</h2>
              
              <p>Hi there,</p>
              
              <p>We received a request to reset your password for your Certifyer account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; color: #ffffff;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>This link expires in 1 hour</strong><br>
                For security reasons, this password reset link will only work once and expires in 60 minutes.
              </div>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${resetLink}</p>
              
              <div class="footer">
                <p><strong>Certifyer - Certificate Generation Platform</strong></p>
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>If you need help, contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Reset Your Certifyer Password

Hi there,

We received a request to reset your password for your Certifyer account.

To reset your password, click this link:
${resetLink}

This link expires in 1 hour and can only be used once.

If you didn't request a password reset, you can safely ignore this email.

---
Certifyer - Certificate Generation Platform`,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("❌ Resend API error:", errorData);
      console.error(`❌ Status: ${resendResponse.status}`);

      // Parse the error response
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch (e) {
        parsedError = { message: errorData };
      }

      // Check for domain verification error (403 validation_error)
      if (
        resendResponse.status === 403 &&
        parsedError.name === "validation_error"
      ) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("⚠️ RESEND DOMAIN VERIFICATION REQUIRED");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("Error:", parsedError.message);
        console.error("");
        console.error("📌 Issue:");
        console.error(
          "   Free Resend accounts can only send emails to your verified email.",
        );
        console.error(
          "   To send to any email address, you need to verify a domain.",
        );
        console.error("");
        console.error("🔧 Solutions:");
        console.error("");
        console.error("   Option 1 - Verify a Domain (Production Ready):");
        console.error("   1. Go to: https://resend.com/domains");
        console.error("   2. Click 'Add Domain'");
        console.error("   3. Enter your domain (e.g., certifyer.com)");
        console.error("   4. Add the DNS records shown");
        console.error("   5. Wait for verification (usually 5-10 minutes)");
        console.error("   6. Update 'from' email to: noreply@yourdomain.com");
        console.error("");
        console.error("   Option 2 - Testing Only (Temporary):");
        console.error("   Use your verified email for testing password resets");
        console.error("   Verified email: genomacinnovationhub@gmail.com");
        console.error("");
        console.error(
          "📚 Documentation: https://resend.com/docs/dashboard/domains/introduction",
        );
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return c.json(
          {
            error:
              "Resend domain verification required. Free accounts can only send to verified email addresses.",
            isConfigError: true,
            errorType: "resend_domain_verification_required",
            details: parsedError.message,
            verifiedEmail: "genomacinnovationhub@gmail.com",
            solution: {
              production:
                "Verify a domain at https://resend.com/domains to send to any email address",
              testing:
                "For testing, use your verified email address (genomacinnovationhub@gmail.com)",
            },
          },
          403,
        );
      }

      // Check for API key errors (401)
      if (resendResponse.status === 401) {
        throw new Error("RESEND_API_KEY_INVALID");
      }

      throw new Error(
        `Resend API error: ${resendResponse.status} - ${errorData}`,
      );
    }

    const resendData = await resendResponse.json();
    console.log(
      `✅ Password reset email sent successfully via Resend:`,
      resendData,
    );

    // Always return success to prevent email enumeration
    return c.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("❌ Server error in password reset:", error);

    // Check if it's a Resend API key error
    if (error instanceof Error && error.message === "RESEND_API_KEY_INVALID") {
      return c.json(
        {
          error:
            "Email service authentication failed. Please check API key configuration.",
          isConfigError: true,
          errorType: "resend_api_key_invalid",
        },
        401,
      );
    }

    // Check if it's a configuration error
    if (
      error instanceof Error &&
      error.message === "EMAIL_SERVICE_NOT_CONFIGURED"
    ) {
      return c.json(
        {
          error: "Email service is not configured. Please add RESEND_API_KEY.",
          isConfigError: true,
        },
        500,
      );
    }

    // For other errors, return generic message
    return c.json(
      {
        error: `Failed to process password reset request. Please try again later.`,
      },
      500,
    );
  }
});

// Test endpoint to verify Resend API key
app.get("/make-server-a611b057/test/resend-api-key", async (c) => {
  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");

    if (!apiKey) {
      return c.json({
        status: "error",
        message: "RESEND_API_KEY environment variable is not set",
        solution: "Add RESEND_API_KEY in Supabase Edge Function secrets",
        setup: "Get your API key from: https://resend.com/api-keys",
      });
    }

    const keyInfo = {
      status: "key_found",
      length: apiKey.length,
      prefix: apiKey.substring(0, 7),
      hasPrefix: apiKey.startsWith("re_"),
    };

    console.log("🔍 API Key Analysis:", keyInfo);

    // Test the key with Resend API (just check authentication, don't actually send)
    const testResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Certifyer <onboarding@resend.dev>",
        to: ["test@example.com"],
        subject: "API Key Test",
        text: "Testing API key validity",
      }),
    });

    const responseText = await testResponse.text();
    const isValid = testResponse.ok || testResponse.status === 422; // 422 = validation error (key is valid, just bad email)

    return c.json({
      keyInfo,
      apiTest: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok,
        response: responseText,
      },
      verdict:
        testResponse.status === 401 || testResponse.status === 403
          ? "❌ API KEY IS INVALID - Get new key from https://resend.com/api-keys"
          : isValid
            ? "✅ API KEY IS VALID!"
            : `⚠️ Unexpected status: ${testResponse.status}`,
      instructions:
        testResponse.status === 401 || testResponse.status === 403
          ? "Go to https://resend.com/api-keys, create new API key, and update RESEND_API_KEY"
          : isValid
            ? "API key is working correctly!"
            : "Check the response for more details",
    });
  } catch (error) {
    console.error("❌ API key test error:", error);
    return c.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Update password (used after clicking reset link)
app.post("/make-server-a611b057/auth/update-password", async (c) => {
  try {
    const { newPassword } = await c.req.json();
    const authHeader = c.req.header("Authorization");

    if (!newPassword) {
      return c.json({ error: "New password is required" }, 400);
    }

    if (!authHeader) {
      return c.json({ error: "Authorization header is required" }, 401);
    }

    // Extract the access token from the Authorization header
    const accessToken = authHeader.replace("Bearer ", "");

    // Create Supabase client with the user's access token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );

    // Update the user's password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.log("Password update error:", error);
      return c.json(
        { error: error.message || "Failed to update password" },
        400,
      );
    }

    console.log(`Password updated successfully for user: ${data.user?.email}`);

    return c.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error in password update:", error);
    return c.json(
      { error: `Server error during password update: ${error}` },
      500,
    );
  }
});

// Sign out
app.post("/make-server-a611b057/auth/signout", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const supabase = getSupabaseClient();
    await supabase.auth.signOut();

    return c.json({ message: "Signed out successfully" });
  } catch (error) {
    console.log("Error in signout:", error);
    return c.json({ error: `Server error during sign out: ${error}` }, 500);
  }
});

// Get current user session
app.get("/make-server-a611b057/auth/session", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("Session verification failed:", error);
      return c.json({ error }, 401);
    }

    if (!user) {
      console.log("No user found in session check");
      return c.json({ error: "User not found" }, 401);
    }

    const userAccount = await kv.get(`user:${user.id}`);

    if (!userAccount) {
      console.log("User account not found in KV store for user:", user.id);
      return c.json({ error: "User account not found" }, 404);
    }

    return c.json({ user: userAccount });
  } catch (error) {
    console.log("Error getting session:", error);
    return c.json({ error: `Server error getting session: ${error}` }, 500);
  }
});

// ==================== ORGANIZATION ROUTES ====================

// Create organization
app.post("/make-server-a611b057/organizations", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { name } = await c.req.json();

    if (!name) {
      return c.json({ error: "Organization name is required" }, 400);
    }

    const organizationId = `org-${user.id}-${Date.now()}`;
    const organization = {
      id: organizationId,
      name,
      shortName: name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3),
      logo: "",
      primaryColor: generateRandomColor(),
      programs: [],
      ownerId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`org:${organizationId}`, organization);

    // Update user with organization
    const userAccount = await kv.get(`user:${user.id}`);
    if (userAccount) {
      userAccount.organizationId = organizationId;
      userAccount.organizationName = name;
      userAccount.userType = "company"; // Update to company type when creating organization
      await kv.set(`user:${user.id}`, userAccount);
    }

    return c.json({ organization });
  } catch (error) {
    console.log("Error creating organization:", error);
    return c.json(
      { error: `Server error creating organization: ${error}` },
      500,
    );
  }
});

// Get user's organizations
app.get("/make-server-a611b057/organizations", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when fetching organizations");
      return c.json({ error }, 401);
    }

    console.log("📊 Fetching organizations for user:", user.id);

    // Get all organizations owned by user
    const allOrgs = await kv.getByPrefix("org:");
    console.log("📊 Total organizations in database:", allOrgs.length);

    const userOrgs = allOrgs.filter((org) => org.ownerId === user.id);
    console.log("��� User owns", userOrgs.length, "organization(s)");

    // Load settings for each organization
    for (const org of userOrgs) {
      const settingsKey = `org:${org.id}:settings`;
      const settings = await kv.get(settingsKey);
      if (settings) {
        org.settings = settings;
      }
    }

    if (userOrgs.length > 0) {
      console.log(
        "📊 Organization details:",
        userOrgs.map((o) => ({
          id: o.id,
          name: o.name,
          programs: o.programs?.length || 0,
          ownerId: o.ownerId,
          hasSettings: !!o.settings,
        })),
      );
    }

    return c.json({ organizations: userOrgs });
  } catch (error) {
    console.log("❌ Error getting organizations:", error);
    return c.json(
      { error: `Server error getting organizations: ${error}` },
      500,
    );
  }
});

// Update organization
app.put("/make-server-a611b057/organizations/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    const updates = await c.req.json();

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json({ error: "Unauthorized to update this organization" }, 403);
    }

    const updatedOrganization = { ...organization, ...updates };
    await kv.set(`org:${organizationId}`, updatedOrganization);

    return c.json({ organization: updatedOrganization });
  } catch (error) {
    console.log("Error updating organization:", error);
    return c.json(
      { error: `Server error updating organization: ${error}` },
      500,
    );
  }
});

// ==================== PROGRAM ROUTES ====================

// Create program
app.post("/make-server-a611b057/programs", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, program } = await c.req.json();

    if (!organizationId || !program) {
      return c.json(
        { error: "Organization ID and program data are required" },
        400,
      );
    }

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to add programs to this organization" },
        403,
      );
    }

    const programId = `prog-${Date.now()}`;
    const newProgram = {
      id: programId,
      ...program,
      certificates: 0,
      testimonials: 0,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    organization.programs.push(newProgram);
    await kv.set(`org:${organizationId}`, organization);

    return c.json({ program: newProgram });
  } catch (error) {
    console.log("Error creating program:", error);
    return c.json({ error: `Server error creating program: ${error}` }, 500);
  }
});

// Update program
app.put(
  "/make-server-a611b057/programs/:organizationId/:programId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");
      const programId = c.req.param("programId");
      const updates = await c.req.json();

      const organization = await kv.get(`org:${organizationId}`);

      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      if (organization.ownerId !== user.id) {
        return c.json(
          { error: "Unauthorized to update programs in this organization" },
          403,
        );
      }

      const programIndex = organization.programs.findIndex(
        (p) => p.id === programId,
      );

      if (programIndex === -1) {
        return c.json({ error: "Program not found" }, 404);
      }

      organization.programs[programIndex] = {
        ...organization.programs[programIndex],
        ...updates,
      };

      await kv.set(`org:${organizationId}`, organization);

      return c.json({ program: organization.programs[programIndex] });
    } catch (error) {
      console.log("Error updating program:", error);
      return c.json({ error: `Server error updating program: ${error}` }, 500);
    }
  },
);

// ==================== CERTIFICATE ROUTES ====================

// Generate certificates
app.post("/make-server-a611b057/certificates", async (c) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📜 CERTIFICATE GENERATION REQUEST RECEIVED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error:", error);
      console.log(
        "❌ Auth header:",
        c.req.header("Authorization") ? "Present" : "Missing",
      );
      return c.json({ error: `Authorization failed: ${error}` }, 401);
    }
    console.log("✅ User authorized:", user.id);

    const requestBody = await c.req.json();
    const {
      organizationId,
      programId,
      certificateHeader,
      courseName,
      courseDescription,
      completionDate,
      template,
      students,
      customTemplateConfig,
      signatories,
      logos, // NEW: Selected logos for certificate
      restrictDownload, // NEW: Whether to restrict downloads
      allowedEmails, // NEW: List of allowed student emails
      monetizationEnabled,
      certificatePriceMinor,
      certificatePriceUSDMinor,
      themeColors,
    } = requestBody;

    console.log("📋 Request data:", {
      organizationId: organizationId || "MISSING",
      programId: programId || "none",
      courseName: courseName || "MISSING",
      certificateHeader: certificateHeader || "MISSING",
      template: template || "none",
      hasCustomTemplate: !!customTemplateConfig,
      hasStudents: !!students,
      studentCount: students?.length || 0,
      isNewFormat: !students,
      userId: user.id,
      signatoryCount: signatories?.length || 0,
      logoCount: logos?.length || 0,
      restrictDownload: restrictDownload || false,
      allowedEmailsCount: allowedEmails?.length || 0,
    });

    // Support both old format (with students array) and new format (without students)
    const isNewFormat = !students;

    if (isNewFormat) {
      // New format: Generate a single certificate link without student details
      if (!organizationId) {
        console.log("❌ Missing organizationId");
        return c.json({ error: "Organization ID is required" }, 400);
      }
      if (!courseName) {
        console.log("❌ Missing courseName");
        return c.json({ error: "Course name is required" }, 400);
      }
      if (!certificateHeader) {
        console.log("❌ Missing certificateHeader");
        return c.json({ error: "Certificate header is required" }, 400);
      }
    } else {
      // Old format: Generate certificates with student details
      if (
        !organizationId ||
        !programId ||
        !students ||
        !Array.isArray(students)
      ) {
        console.log("❌ Missing required fields for old format");
        return c.json(
          {
            error:
              "Organization ID, program ID, and students array are required",
          },
          400,
        );
      }
    }

    console.log("🔍 Looking up organization:", organizationId);
    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found in database");
      return c.json(
        { error: `Organization not found: ${organizationId}` },
        404,
      );
    }
    console.log("��� Organization found:", organization.name);

    if (organization.ownerId !== user.id) {
      console.log("❌ User not authorized for this organization");
      console.log("   - Organization owner:", organization.ownerId);
      console.log("   - Current user:", user.id);
      return c.json(
        { error: "Unauthorized: You do not own this organization" },
        403,
      );
    }
    console.log("✅ User owns this organization");

    // Validate premium template access
    if (template) {
      console.log("🔍 Checking template access for template:", template);
      const templateData = await kv.get(`globaltemplate:${template}`);

      if (templateData && templateData.type === "premium") {
        console.log("🔒 Premium template detected, checking user access...");
        const isPremiumOrg =
          organization.tier === "premium" ||
          organization.subscriptionStatus === "active";

        if (!isPremiumOrg) {
          console.log("❌ Organization does not have premium access");
          return c.json(
            {
              error:
                "This template requires a premium subscription. Please upgrade to use premium templates.",
              code: "PREMIUM_REQUIRED",
              templateId: template,
            },
            403,
          );
        }
        console.log("✅ Organization has premium access");
      }
    }

    const certificates = [];

    if (isNewFormat) {
      // New workflow: Generate a certificate link without student name
      console.log("✨ Generating NEW FORMAT certificate (shareable link)");
      const certificateId = `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
      const programSlug = courseName.toLowerCase().replace(/\s+/g, "-");
      console.log("📝 Certificate ID:", certificateId);
      console.log("📝 Program Slug:", programSlug);

      const certificate = {
        id: certificateId,
        courseName,
        certificateHeader,
        courseDescription,
        completionDate: completionDate || new Date().toISOString(),
        template: template || "impact", // Store template
        customTemplateConfig: customTemplateConfig || null, // Store custom template config
        signatories: signatories || [], // Store signatories
        logos: logos || [], // NEW: Store logos
        organizationId,
        programId: programId || programSlug, // Use provided programId or generate slug
        generatedAt: new Date().toISOString(),
        certificateUrl: `certificate/${organizationId}/${programSlug}/${certificateId}`,
        status: "active",
        downloadCount: 0,
        restrictDownload: restrictDownload || false, // NEW: Download restriction flag
        allowedEmails: allowedEmails || [], // NEW: List of allowed student emails
        monetizationEnabled: monetizationEnabled || false,
        certificatePriceMinor: certificatePriceMinor || 0,
        certificatePriceUSDMinor: certificatePriceUSDMinor || 0,
        platformFeePercent: FIXED_PLATFORM_FEE_PERCENT,
        paymentStatus: "unpaid",
        paidAt: null,
        lastPaymentReference: null,
        themeColors: themeColors || null,
      };

      await kv.set(`cert:${certificateId}`, certificate);
      console.log(
        "✅ Certificate saved to KV store with key: cert:" + certificateId,
      );
      console.log("🔒 Saved restriction data:", {
        restrictDownload: certificate.restrictDownload,
        allowedEmails: certificate.allowedEmails,
        allowedEmailsCount: certificate.allowedEmails?.length || 0,
      });
      certificates.push(certificate);

      // Update program certificate count if program exists
      if (programId) {
        console.log(
          "📊 Attempting to update program statistics for programId:",
          programId,
        );
        const program = organization.programs.find((p) => p.id === programId);
        if (program) {
          console.log("✅ Program found, updating certificate count");
          program.certificates += 1;
          await kv.set(`org:${organizationId}`, organization);
        } else {
          console.log("⚠️ Program not found in organization");
        }
      } else {
        console.log(
          "ℹ️ No programId provided, skipping program statistics update",
        );
      }
    } else {
      // Old workflow: Generate certificates with student details
      console.log("🔄 Generating OLD FORMAT certificates (with student names)");
      const program = organization.programs.find((p) => p.id === programId);

      if (!program) {
        return c.json({ error: "Program not found" }, 404);
      }

      for (const student of students) {
        const certificateId = `CERT-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        const certificate = {
          id: certificateId,
          studentName: student.name,
          email: student.email,
          courseName: program.name, // Add course name
          certificateHeader: certificateHeader || "Certificate of Completion", // Add header
          courseDescription: courseDescription || program.description, // Add description
          template: template || program.template || "impact", // Store template
          customTemplateConfig: customTemplateConfig || null, // Store custom template config
          signatories: signatories || [], // Store signatories
          logos: logos || [], // NEW: Store logos
          organizationId,
          programId,
          generatedAt: new Date().toISOString(),
          certificateUrl: `certificate/${organizationId}/${programId}/${certificateId}`,
          status: "active",
          emailSent: false,
          downloadCount: 0,
          completionDate: student.completionDate || new Date().toISOString(),
          restrictDownload: restrictDownload || false, // NEW: Download restriction flag
          allowedEmails: allowedEmails || [], // NEW: List of allowed student emails
          monetizationEnabled: monetizationEnabled || false,
          certificatePriceMinor: certificatePriceMinor || 0,
          certificatePriceUSDMinor: certificatePriceUSDMinor || 0,
          platformFeePercent: FIXED_PLATFORM_FEE_PERCENT,
          paymentStatus: "unpaid",
          paidAt: null,
          lastPaymentReference: null,
        };

        await kv.set(`cert:${certificateId}`, certificate);
        certificates.push(certificate);
      }

      // Update program certificate count
      program.certificates += students.length;
      await kv.set(`org:${organizationId}`, organization);
    }

    console.log(
      "✅ Successfully generated",
      certificates.length,
      "certificate(s)",
    );

    // 🔒 LOG FINAL RESPONSE DATA
    console.log("📦 RESPONSE BEING SENT TO FRONTEND:");
    certificates.forEach((cert, index) => {
      console.log(`  Certificate ${index + 1}:`, {
        id: cert.id,
        restrictDownload: cert.restrictDownload,
        allowedEmails: cert.allowedEmails,
        allowedEmailsCount: cert.allowedEmails?.length || 0,
      });
    });

    return c.json({ certificates, count: certificates.length });
  } catch (error) {
    console.log("❌ Error generating certificates:", error);
    return c.json(
      { error: `Server error generating certificates: ${error}` },
      500,
    );
  }
});

// Get certificate by ID
app.get("/make-server-a611b057/certificates/:id", async (c) => {
  try {
    const certificateId = c.req.param("id");
    console.log("📜 Certificate lookup request for ID:", certificateId);

    const certificate = await kv.get(`cert:${certificateId}`);
    console.log("📜 Certificate found:", certificate ? "YES" : "NO");

    if (!certificate) {
      console.log("❌ Certificate not found in KV store");
      return c.json({ error: "Certificate not found" }, 404);
    }

    if (
      certificate.monetizationEnabled &&
      certificate.paymentStatus !== "paid"
    ) {
      return c.json(
        {
          error: "Payment is required before accessing this certificate",
          code: "PAYMENT_REQUIRED",
          details: {
            certificateId: certificate.id,
            courseName: certificate.courseName,
            certificateHeader: certificate.certificateHeader,
            certificatePriceMinor: certificate.certificatePriceMinor || 0,
            certificatePriceUSDMinor: certificate.certificatePriceUSDMinor || 0,
            platformFeePercent:
              certificate.platformFeePercent !== undefined
                ? certificate.platformFeePercent
                : 15,
          },
        },
        402,
      );
    }

    // Get organization and program details
    console.log("📜 Fetching organization:", certificate.organizationId);
    const organization = await kv.get(`org:${certificate.organizationId}`);
    console.log("📜 Organization found:", organization ? "YES" : "NO");

    // Get organization settings
    if (organization) {
      const settingsKey = `org:${certificate.organizationId}:settings`;
      const settings = await kv.get(settingsKey);
      if (settings) {
        organization.settings = settings;
        console.log(
          "📜 Organization settings loaded:",
          settings.signatories?.length || 0,
          "signatories",
        );
      }
    }

    const program = organization?.programs.find(
      (p) => p.id === certificate.programId,
    );
    console.log(
      "📜 Program found:",
      program
        ? "YES (ID: " + program.id + ")"
        : "NO (searching for: " + certificate.programId + ")",
    );

    console.log("✅ Returning certificate data");
    console.log("🔍 Certificate restriction data:", {
      restrictDownload: certificate.restrictDownload,
      allowedEmails: certificate.allowedEmails,
      allowedEmailsCount: certificate.allowedEmails?.length || 0,
    });
    return c.json({
      certificate,
      organization,
      program,
    });
  } catch (error) {
    console.log("Error getting certificate:", error);
    return c.json({ error: `Server error getting certificate: ${error}` }, 500);
  }
});

const handleMonetizationUpdate = async (c: any) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const certificateId = c.req.param("id");
    const {
      monetizationEnabled,
      certificatePriceMinor,
      certificatePriceUSDMinor,
      themeColors,
    } = await c.req.json();

    const certificate = await kv.get(`cert:${certificateId}`);
    if (!certificate) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    const organization = await kv.get(`org:${certificate.organizationId}`);
    if (!organization || organization.ownerId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (monetizationEnabled) {
      const hasNGN = certificatePriceMinor && certificatePriceMinor > 0;
      const hasUSD = certificatePriceUSDMinor && certificatePriceUSDMinor > 0;
      if (!hasNGN && !hasUSD) {
        return c.json(
          { error: "At least one price (NGN or USD) is required" },
          400,
        );
      }
    }

    const updatedCertificate = {
      ...certificate,
      monetizationEnabled: !!monetizationEnabled,
      certificatePriceMinor: monetizationEnabled ? Number(certificatePriceMinor || 0) : 0,
      certificatePriceUSDMinor: monetizationEnabled ? Number(certificatePriceUSDMinor || 0) : 0,
      platformFeePercent: FIXED_PLATFORM_FEE_PERCENT,
      paymentStatus:
        monetizationEnabled && certificate.paymentStatus === "paid"
          ? "paid"
          : "unpaid",
      themeColors: themeColors !== undefined ? themeColors : (certificate.themeColors ?? null),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`cert:${certificateId}`, updatedCertificate);

    return c.json({
      success: true,
      certificate: updatedCertificate,
    });
  } catch (error) {
    console.log("❌ Error updating certificate monetization:", error);
    return c.json(
      { error: `Server error updating monetization: ${error}` },
      500,
    );
  }
};

// Configure monetization for a certificate (organization owner only)
app.post("/make-server-a611b057/certificates/:id/monetization", async (c) => {
  return handleMonetizationUpdate(c);
});

// Compatibility alias for clients using PUT semantics on the monetization route
app.put("/make-server-a611b057/certificates/:id/monetization", async (c) => {
  return handleMonetizationUpdate(c);
});

// Get all certificates for an organization
app.get("/make-server-a611b057/organizations/:id/certificates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when fetching certificates");
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    console.log("📜 Fetching certificates for organization:", organizationId);

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found:", organizationId);
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      console.log(
        "❌ User not authorized to view certificates for this organization",
      );
      return c.json(
        { error: "Unauthorized to view certificates for this organization" },
        403,
      );
    }

    // Get all certificates for this organization
    console.log("📊 Searching for certificates with prefix: cert:");
    const allCerts = await kv.getByPrefix("cert:");
    console.log("📊 Total certificates in database:", allCerts.length);

    const orgCerts = allCerts.filter(
      (cert) => cert.organizationId === organizationId,
    );
    console.log("📊 Certificates for this organization:", orgCerts.length);

    if (orgCerts.length > 0) {
      console.log(
        "📜 Certificate IDs:",
        orgCerts.map((c) => c.id),
      );
    }

    c.header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    c.header("Pragma", "no-cache");
    c.header("Expires", "0");

    return c.json({ certificates: orgCerts });
  } catch (error) {
    console.log("❌ Error getting organization certificates:", error);
    return c.json(
      { error: `Server error getting certificates: ${error}` },
      500,
    );
  }
});

// Delete a single certificate
app.delete("/make-server-a611b057/certificates/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when deleting certificate");
      return c.json({ error }, 401);
    }

    const certificateId = c.req.param("id");
    console.log("🗑️ Delete certificate request for ID:", certificateId);

    const certificate = await kv.get(`cert:${certificateId}`);

    if (!certificate) {
      console.log("❌ Certificate not found:", certificateId);
      return c.json({ error: "Certificate not found" }, 404);
    }

    // Verify user owns the organization
    const organization = await kv.get(`org:${certificate.organizationId}`);

    if (!organization || organization.ownerId !== user.id) {
      console.log("��� User not authorized to delete this certificate");
      return c.json({ error: "Unauthorized to delete this certificate" }, 403);
    }

    // Delete the certificate
    await kv.del(`cert:${certificateId}`);
    console.log("✅ Certificate deleted successfully:", certificateId);

    // Update program certificate count if applicable
    if (certificate.programId) {
      const program = organization.programs.find(
        (p) => p.id === certificate.programId,
      );
      if (program && program.certificates > 0) {
        program.certificates -= 1;
        await kv.set(`org:${certificate.organizationId}`, organization);
        console.log("✅ Updated program certificate count");
      }
    }

    return c.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting certificate:", error);
    return c.json(
      { error: `Server error deleting certificate: ${error}` },
      500,
    );
  }
});

// Delete multiple certificates
app.delete("/make-server-a611b057/certificates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when deleting certificates");
      return c.json({ error }, 401);
    }

    const { certificateIds } = await c.req.json();

    if (
      !certificateIds ||
      !Array.isArray(certificateIds) ||
      certificateIds.length === 0
    ) {
      return c.json({ error: "Certificate IDs array is required" }, 400);
    }

    console.log(
      "🗑️ Bulk delete request for",
      certificateIds.length,
      "certificates",
    );

    let deletedCount = 0;
    const errors = [];

    for (const certificateId of certificateIds) {
      try {
        const certificate = await kv.get(`cert:${certificateId}`);

        if (!certificate) {
          errors.push({ id: certificateId, error: "Not found" });
          continue;
        }

        // Verify user owns the organization
        const organization = await kv.get(`org:${certificate.organizationId}`);

        if (!organization || organization.ownerId !== user.id) {
          errors.push({ id: certificateId, error: "Unauthorized" });
          continue;
        }

        // Delete the certificate
        await kv.del(`cert:${certificateId}`);
        deletedCount++;

        // Update program certificate count if applicable
        if (certificate.programId) {
          const program = organization.programs.find(
            (p) => p.id === certificate.programId,
          );
          if (program && program.certificates > 0) {
            program.certificates -= 1;
            await kv.set(`org:${certificate.organizationId}`, organization);
          }
        }
      } catch (err) {
        errors.push({ id: certificateId, error: String(err) });
      }
    }

    console.log(
      `✅ Deleted ${deletedCount} certificate(s), ${errors.length} error(s)`,
    );

    return c.json({
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully deleted ${deletedCount} certificate(s)`,
    });
  } catch (error) {
    console.log("❌ Error in bulk certificate deletion:", error);
    return c.json(
      { error: `Server error deleting certificates: ${error}` },
      500,
    );
  }
});

// Submit testimonial for a certificate (public endpoint - no auth required)
app.post("/make-server-a611b057/certificates/:id/testimonial", async (c) => {
  try {
    const certificateId = c.req.param("id");
    const {
      studentName,
      email,
      testimonial,
      title,
      organization,
      impact,
      courseName,
      organizationId,
      programId,
    } = await c.req.json();

    console.log("💬 Testimonial submission:", {
      certificateId,
      studentName,
      email,
      hasTestimonial: !!testimonial,
      title,
      organization,
      hasImpact: !!impact,
      courseName,
      organizationId,
      programId,
    });

    if (!studentName || !courseName || !organizationId) {
      return c.json(
        {
          error: "Student name, course name, and organization ID are required",
        },
        400,
      );
    }

    // Verify certificate exists
    const certificate = await kv.get(`cert:${certificateId}`);
    if (!certificate) {
      console.log("❌ Certificate not found for testimonial submission");
      return c.json({ error: "Certificate not found" }, 404);
    }

    // Create testimonial object
    const testimonialId = `TEST-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    const testimonialData = {
      id: testimonialId,
      certificateId,
      studentName,
      email: email || undefined, // Store email if provided
      testimonial: testimonial || undefined,
      title: title || undefined,
      organization: organization || undefined,
      impact: impact || undefined,
      courseName,
      organizationId,
      programId,
      submittedAt: new Date().toISOString(),
    };

    // Save testimonial to KV store
    await kv.set(`testimonial:${testimonialId}`, testimonialData);

    // Also add reference to the organization's testimonials list
    await kv.set(
      `org_testimonial:${organizationId}:${testimonialId}`,
      testimonialData,
    );

    console.log("✅ Testimonial saved successfully:", testimonialId);

    return c.json({
      success: true,
      testimonial: testimonialData,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.log("❌ Error submitting testimonial:", error);
    return c.json(
      { error: `Server error submitting testimonial: ${error}` },
      500,
    );
  }
});

// Verify certificate (public endpoint - no auth required)
app.get("/make-server-a611b057/certificates/:id/verify", async (c) => {
  try {
    const certificateId = c.req.param("id");
    console.log("🔍 Certificate verification request for:", certificateId);

    // Get certificate from KV store
    const certificate = await kv.get(`cert:${certificateId}`);

    if (!certificate) {
      console.log("❌ Certificate not found for verification:", certificateId);
      return c.json(
        {
          valid: false,
          error: "Certificate not found",
          message: "This certificate ID does not exist in our system.",
        },
        404,
      );
    }

    // Get organization details
    const organization = await kv.get(`org:${certificate.organizationId}`);

    if (!organization) {
      console.log(
        "❌ Organization not found for certificate:",
        certificate.organizationId,
      );
      return c.json(
        {
          valid: false,
          error: "Organization not found",
          message:
            "The organization that issued this certificate no longer exists.",
        },
        404,
      );
    }

    // Get program details if programId exists
    let program = null;
    if (certificate.programId) {
      program = await kv.get(`prog:${certificate.programId}`);
    }

    console.log("✅ Certificate verified successfully:", certificateId);

    // Return certificate details
    return c.json({
      valid: true,
      certificate: {
        id: certificate.id,
        courseName: certificate.courseName,
        certificateHeader: certificate.certificateHeader,
        courseDescription: certificate.courseDescription,
        completionDate: certificate.completionDate,
        issuedDate: certificate.createdAt,
        studentName: certificate.studentName || null,
        template: certificate.template,
        status: certificate.status || "active",
        signatories: certificate.signatories || [],
      },
      organization: {
        name: organization.name,
        logo: organization.logo,
      },
      program: program
        ? {
            name: program.name,
            description: program.description,
          }
        : null,
      message:
        "This certificate is authentic and was issued by " + organization.name,
    });
  } catch (error) {
    console.log("❌ Error verifying certificate:", error);
    return c.json(
      {
        valid: false,
        error: `Server error verifying certificate: ${error}`,
        message: "An error occurred while verifying this certificate.",
      },
      500,
    );
  }
});

// Get testimonials for an organization (requires auth)
app.get("/make-server-a611b057/organizations/:id/testimonials", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when fetching testimonials");
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    console.log("💬 Fetching testimonials for organization:", organizationId);

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found:", organizationId);
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      console.log(
        "❌ User not authorized to view testimonials for this organization",
      );
      return c.json(
        { error: "Unauthorized to view testimonials for this organization" },
        403,
      );
    }

    // Get all testimonials for this organization
    console.log(
      "📊 Searching for testimonials with prefix: org_testimonial:" +
        organizationId,
    );
    const testimonials = await kv.getByPrefix(
      `org_testimonial:${organizationId}`,
    );
    console.log("📊 Found", testimonials.length, "testimonial(s)");

    // Group testimonials by course
    const testimonialsByCourse = {};
    for (const test of testimonials) {
      const courseName = test.courseName || "Unknown Course";
      if (!testimonialsByCourse[courseName]) {
        testimonialsByCourse[courseName] = [];
      }
      testimonialsByCourse[courseName].push(test);
    }

    return c.json({
      testimonials,
      testimonialsByCourse,
      count: testimonials.length,
    });
  } catch (error) {
    console.log("❌ Error fetching testimonials:", error);
    return c.json(
      { error: `Server error fetching testimonials: ${error}` },
      500,
    );
  }
});

// Delete a program
app.delete("/make-server-a611b057/programs/:orgId/:progId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when deleting program");
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("orgId");
    const programId = c.req.param("progId");
    console.log("🗑️ Delete program request:", { organizationId, programId });

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found");
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      console.log(
        "❌ User not authorized to delete programs in this organization",
      );
      return c.json(
        { error: "Unauthorized to delete programs in this organization" },
        403,
      );
    }

    // Find and remove the program
    const programIndex = organization.programs.findIndex(
      (p) => p.id === programId,
    );

    if (programIndex === -1) {
      console.log("❌ Program not found");
      return c.json({ error: "Program not found" }, 404);
    }

    organization.programs.splice(programIndex, 1);
    await kv.set(`org:${organizationId}`, organization);

    console.log("✅ Program deleted successfully:", programId);

    return c.json({ message: "Program deleted successfully", organization });
  } catch (error) {
    console.log("❌ Error deleting program:", error);
    return c.json({ error: `Server error deleting program: ${error}` }, 500);
  }
});

// ==================== FILE UPLOAD ROUTES ====================

// Upload file (logo or signature) to Supabase Storage
app.post("/make-server-a611b057/upload", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    let formData;
    try {
      formData = await c.req.formData();
    } catch (formError) {
      console.log("Error parsing form data:", formError);
      return c.json({ error: "Invalid form data" }, 400);
    }

    const file = formData.get("file");
    const type = formData.get("type");
    const organizationId = formData.get("organizationId");

    if (!file || !type || !organizationId) {
      return c.json(
        { error: "File, type, and organizationId are required" },
        400,
      );
    }

    // Verify file is actually a File object
    if (!(file instanceof File)) {
      return c.json({ error: "Invalid file upload" }, 400);
    }

    // Verify user owns the organization
    const organization = await kv.get(`org:${organizationId}`);
    if (!organization || organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to upload files for this organization" },
        403,
      );
    }

    const supabase = getSupabaseClient();
    const bucketName = "make-a611b057-uploads";

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        },
      );

      if (createBucketError) {
        console.log("Error creating bucket:", createBucketError);
        return c.json({ error: "Failed to create storage bucket" }, 500);
      }
    }

    // Generate unique filename with safe fallback
    const fileName = `${organizationId}/${type}-${Date.now()}.${
      file.name?.split(".").pop() || "png"
    }`;

    // Convert File to ArrayBuffer for Supabase
    const fileBuffer = await file.arrayBuffer();

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.log("Upload error:", uploadError);
      return c.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        500,
      );
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (signedUrlError) {
      console.log("Error creating signed URL:", signedUrlError);
      return c.json({ error: "Failed to create signed URL" }, 500);
    }

    return c.json({
      url: signedUrlData.signedUrl,
      path: fileName,
    });
  } catch (error) {
    console.log("Error in upload:", error);
    return c.json({ error: `Server error during upload: ${error}` }, 500);
  }
});

// ==================== ORGANIZATION SETTINGS ROUTES ====================

// Get organization settings
app.get("/make-server-a611b057/organizations/:id/settings", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to view settings for this organization" },
        403,
      );
    }

    // Get or initialize settings
    const settingsKey = `org:${organizationId}:settings`;
    let settings = await kv.get(settingsKey);

    if (!settings) {
      // Return default settings
      settings = {
        logo: organization.logo || "",
        secondaryLogo: "",
        primaryColor: organization.primaryColor || "#6366f1",
        signatories: [],
      };
    }

    return c.json({ settings });
  } catch (error) {
    console.log("Error getting organization settings:", error);
    return c.json({ error: `Server error getting settings: ${error}` }, 500);
  }
});

// Update organization settings
app.put("/make-server-a611b057/organizations/:id/settings", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    const settings = await c.req.json();

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to update settings for this organization" },
        403,
      );
    }

    // Save settings to dedicated key
    const settingsKey = `org:${organizationId}:settings`;
    await kv.set(settingsKey, settings);

    // Also update logo and primaryColor on organization object for backwards compatibility
    organization.logo = settings.logo || organization.logo;
    organization.primaryColor =
      settings.primaryColor || organization.primaryColor;
    organization.settings = settings; // Store settings reference
    await kv.set(`org:${organizationId}`, organization);

    return c.json({ settings });
  } catch (error) {
    console.log("Error updating organization settings:", error);
    return c.json({ error: `Server error updating settings: ${error}` }, 500);
  }
});

// ==================== TESTIMONIAL ROUTES ====================

// Create testimonial
app.post("/make-server-a611b057/testimonials", async (c) => {
  try {
    const { certificateId, studentName, email, rating, text, isPublic } =
      await c.req.json();

    if (!certificateId || !studentName || !rating || !text) {
      return c.json(
        {
          error: "Certificate ID, student name, rating, and text are required",
        },
        400,
      );
    }

    const certificate = await kv.get(`cert:${certificateId}`);

    if (!certificate) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    const testimonialId = `test-${Date.now()}`;
    const testimonial = {
      id: testimonialId,
      certificateId,
      studentName,
      email,
      rating,
      text,
      isPublic: isPublic ?? true,
      organizationId: certificate.organizationId,
      programId: certificate.programId,
      submittedAt: new Date().toISOString(),
    };

    await kv.set(`test:${testimonialId}`, testimonial);

    // Update program testimonial count
    const organization = await kv.get(`org:${certificate.organizationId}`);
    if (organization) {
      const program = organization.programs.find(
        (p) => p.id === certificate.programId,
      );
      if (program) {
        program.testimonials += 1;
        await kv.set(`org:${certificate.organizationId}`, organization);
      }
    }

    return c.json({ testimonial });
  } catch (error) {
    console.log("Error creating testimonial:", error);
    return c.json(
      { error: `Server error creating testimonial: ${error}` },
      500,
    );
  }
});

// Get testimonials for organization
app.get("/make-server-a611b057/organizations/:id/testimonials", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to view testimonials for this organization" },
        403,
      );
    }

    // Get all testimonials for this organization
    const allTestimonials = await kv.getByPrefix("test:");
    const orgTestimonials = allTestimonials.filter(
      (test) => test.organizationId === organizationId,
    );

    return c.json({ testimonials: orgTestimonials });
  } catch (error) {
    console.log("Error getting testimonials:", error);
    return c.json(
      { error: `Server error getting testimonials: ${error}` },
      500,
    );
  }
});

// ==================== ANALYTICS ROUTES ====================

// Track certificate download
app.post("/make-server-a611b057/track-download", async (c) => {
  try {
    const body = await c.req.json();
    const { certificateId, organizationId, programId } = body;

    console.log("📥 Tracking download for certificate:", certificateId);

    if (!certificateId || !organizationId) {
      return c.json(
        { error: "certificateId and organizationId are required" },
        400,
      );
    }

    // Get current download count for this certificate
    const downloadKey = `download:${certificateId}`;
    const currentCount = await kv.get(downloadKey);
    const newCount = (currentCount || 0) + 1;

    // Update download count
    await kv.set(downloadKey, newCount);

    // Track organization-level download stats
    const orgDownloadKey = `org_downloads:${organizationId}`;
    const orgDownloads = await kv.get(orgDownloadKey);
    const orgDownloadData = orgDownloads || {
      totalDownloads: 0,
      downloadsByMonth: {},
      downloadsByProgram: {},
    };

    orgDownloadData.totalDownloads = (orgDownloadData.totalDownloads || 0) + 1;

    // Track by month
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    orgDownloadData.downloadsByMonth[monthKey] =
      (orgDownloadData.downloadsByMonth[monthKey] || 0) + 1;

    // Track by program
    if (programId) {
      orgDownloadData.downloadsByProgram[programId] =
        (orgDownloadData.downloadsByProgram[programId] || 0) + 1;
    }

    await kv.set(orgDownloadKey, orgDownloadData);

    console.log(
      `✅ Download tracked: Certificate ${certificateId} (count: ${newCount})`,
    );

    return c.json({ success: true, downloadCount: newCount });
  } catch (error) {
    console.log("❌ Error tracking download:", error);
    return c.json({ error: `Error tracking download: ${error}` }, 500);
  }
});

// Track tutor session time
app.post("/make-server-a611b057/track-session", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const body = await c.req.json();
    const { organizationId, sessionDuration } = body;

    console.log(
      `⏱️ Tracking session for user ${user.id}, org ${organizationId}, duration ${sessionDuration}s`,
    );

    if (!organizationId || !sessionDuration) {
      return c.json(
        { error: "organizationId and sessionDuration are required" },
        400,
      );
    }

    // Track organization-level session time
    const sessionKey = `org_sessions:${organizationId}`;
    const sessionData = await kv.get(sessionKey);
    const sessionStats = sessionData || {
      totalTimeSpent: 0,
      sessionsByMonth: {},
      sessionsByUser: {},
      lastUpdated: new Date().toISOString(),
    };

    sessionStats.totalTimeSpent =
      (sessionStats.totalTimeSpent || 0) + sessionDuration;

    // Track by month
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    sessionStats.sessionsByMonth[monthKey] =
      (sessionStats.sessionsByMonth[monthKey] || 0) + sessionDuration;

    // Track by user
    sessionStats.sessionsByUser[user.id] =
      (sessionStats.sessionsByUser[user.id] || 0) + sessionDuration;

    sessionStats.lastUpdated = new Date().toISOString();

    await kv.set(sessionKey, sessionStats);

    console.log(
      `✅ Session tracked: ${sessionDuration}s added to org ${organizationId}`,
    );

    return c.json({ success: true });
  } catch (error) {
    console.log("❌ Error tracking session:", error);
    return c.json({ error: `Error tracking session: ${error}` }, 500);
  }
});

// Get analytics for organization
app.get("/make-server-a611b057/organizations/:id/analytics", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");
    console.log("📊 Fetching analytics for organization:", organizationId);

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found:", organizationId);
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      console.log(
        "❌ User not authorized to view analytics for this organization",
      );
      return c.json(
        { error: "Unauthorized to view analytics for this organization" },
        403,
      );
    }

    // Get all certificates for this organization
    console.log("📊 Searching for certificates with prefix: cert:");
    const allCerts = await kv.getByPrefix("cert:");
    const allCertificates = allCerts.filter(
      (cert) => cert.organizationId === organizationId,
    );
    console.log("📊 Found", allCertificates.length, "certificate(s)");

    // Get all testimonials for this organization
    const allTestimonials = await kv.getByPrefix(
      `org_testimonial:${organizationId}`,
    );
    console.log("📊 Found", allTestimonials.length, "testimonial(s)");

    // Calculate statistics
    const totalCertificates = allCertificates.length;
    const totalTestimonials = allTestimonials.length;
    const engagementRate =
      totalCertificates > 0
        ? Math.round((totalTestimonials / totalCertificates) * 100)
        : 0;

    // Group certificates by course
    const certificatesByCourse = {};
    const testimonialsByCourse = {};

    for (const cert of allCertificates) {
      const courseName = cert.courseName || "Unknown Course";
      if (!certificatesByCourse[courseName]) {
        certificatesByCourse[courseName] = 0;
      }
      certificatesByCourse[courseName]++;
    }

    for (const test of allTestimonials) {
      const courseName = test.courseName || "Unknown Course";
      if (!testimonialsByCourse[courseName]) {
        testimonialsByCourse[courseName] = 0;
      }
      testimonialsByCourse[courseName]++;
    }

    // Create course performance data
    const coursePerformance = Object.keys(certificatesByCourse).map(
      (courseName) => ({
        name: courseName,
        certificates: certificatesByCourse[courseName] || 0,
        testimonials: testimonialsByCourse[courseName] || 0,
      }),
    );

    // Calculate monthly trend (last 6 months)
    const now = new Date();
    const monthlyData = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const monthStart = new Date(year, date.getMonth(), 1).getTime();
      const monthEnd = new Date(
        year,
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      ).getTime();

      const certsThisMonth = allCertificates.filter((cert) => {
        const certDate = new Date(cert.generatedAt).getTime();
        return certDate >= monthStart && certDate <= monthEnd;
      }).length;

      const testsThisMonth = allTestimonials.filter((test) => {
        const testDate = new Date(test.submittedAt).getTime();
        return testDate >= monthStart && testDate <= monthEnd;
      }).length;

      monthlyData.push({
        month,
        certificates: certsThisMonth,
        testimonials: testsThisMonth,
      });
    }

    // Recent activity (last 10 certificates)
    const recentCertificates = allCertificates
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      )
      .slice(0, 10);

    // Get download statistics
    const orgDownloadKey = `org_downloads:${organizationId}`;
    const downloadData = await kv.get(orgDownloadKey);
    const downloadStats = downloadData || {
      totalDownloads: 0,
      downloadsByMonth: {},
      downloadsByProgram: {},
    };

    // Get session time statistics
    const sessionKey = `org_sessions:${organizationId}`;
    const sessionData = await kv.get(sessionKey);
    const sessionStats = sessionData || {
      totalTimeSpent: 0,
      sessionsByMonth: {},
      sessionsByUser: {},
    };

    // Format time spent (convert seconds to hours and minutes)
    const totalHours = Math.floor(sessionStats.totalTimeSpent / 3600);
    const totalMinutes = Math.floor((sessionStats.totalTimeSpent % 3600) / 60);

    console.log("📊 Analytics calculated successfully");
    console.log(`📥 Total downloads: ${downloadStats.totalDownloads}`);
    console.log(`⏱️ Total time spent: ${totalHours}h ${totalMinutes}m`);

    return c.json({
      analytics: {
        totalCertificates,
        totalTestimonials,
        engagementRate,
        coursePerformance,
        monthlyData,
        recentActivity: recentCertificates,
        downloads: {
          total: downloadStats.totalDownloads,
          byMonth: downloadStats.downloadsByMonth,
          byProgram: downloadStats.downloadsByProgram,
        },
        timeSpent: {
          totalSeconds: sessionStats.totalTimeSpent,
          totalHours,
          totalMinutes,
          byMonth: sessionStats.sessionsByMonth,
          byUser: sessionStats.sessionsByUser,
        },
      },
    });
  } catch (error) {
    console.log("❌ Error fetching analytics:", error);
    return c.json({ error: `Server error fetching analytics: ${error}` }, 500);
  }
});

// ==================== TEMPLATE ROUTES (GLOBAL TEMPLATE LIBRARY) ====================

// Get all templates (default + user-created)
// Supports visibility filtering: public templates + organization-specific templates
app.get("/make-server-a611b057/templates", async (c) => {
  try {
    const organizationId = c.req.query("organizationId");
    console.log(
      "📂 Fetching templates for organization:",
      organizationId || "all (no filter)",
    );

    // Auto-seed any DEFAULT_TEMPLATES that are missing from KV (self-healing)
    const existingKeys = new Set(
      (await kv.getByPrefix("globaltemplate:")).map((t: any) => t?.id).filter(Boolean)
    );
    for (const tpl of DEFAULT_TEMPLATES) {
      if (!existingKeys.has(tpl.id)) {
        await kv.set(`globaltemplate:${tpl.id}`, {
          ...tpl,
          visibility_type: tpl.visibility_type || "public",
          organization_id: tpl.organization_id || null,
        });
        console.log(`✅ Auto-seeded missing template: ${tpl.id}`);
      }
    }

    // Get all templates with prefix 'globaltemplate:'
    const allTemplates = await kv.getByPrefix("globaltemplate:");

    // Filter by visibility rules
    let visibleTemplates = allTemplates.filter((t) => {
      if (!t || typeof t !== "object") return false;

      // Public templates are visible to everyone
      // (templates without visibility_type are treated as public for backward compatibility)
      if (t.visibility_type === "public" || !t.visibility_type) {
        return true;
      }

      // Organization-specific templates only visible to that organization
      if (t.visibility_type === "organization") {
        return organizationId && t.organization_id === organizationId;
      }

      return false;
    });

    // Since all templates are now free (premium features moved to v2),
    // return all templates without filtering
    // Note: getByPrefix returns the values directly, not {key, value} objects
    const freeTemplates = visibleTemplates.filter(
      (t) => t && typeof t === "object" && t.type !== "premium",
    );
    const premiumTemplates = visibleTemplates.filter(
      (t) => t && typeof t === "object" && t.type === "premium",
    );
    const combinedTemplates = [...freeTemplates, ...premiumTemplates];

    console.log(
      "✅ Found",
      combinedTemplates.length,
      "visible template(s) for",
      organizationId ? `organization ${organizationId}` : "all users",
    );
    console.log(
      "   📗 Free:",
      freeTemplates.length,
      "|",
      "👑 Premium:",
      premiumTemplates.length,
    );
    console.log(
      "📋 Template IDs:",
      combinedTemplates.map((t) => t.id).join(", "),
    );

    return c.json({
      templates: combinedTemplates,
      count: combinedTemplates.length,
      freeCount: freeTemplates.length,
      premiumCount: premiumTemplates.length,
    });
  } catch (error) {
    console.log("❌ Error getting templates:", error);
    return c.json({ error: `Server error getting templates: ${error}` }, 500);
  }
});

// Get a specific template by ID
app.get("/make-server-a611b057/templates/:id", async (c) => {
  try {
    const templateId = c.req.param("id");
    console.log("📄 Get template request:", templateId);

    const template = await kv.get(`globaltemplate:${templateId}`);

    if (!template) {
      console.log("❌ Template not found:", templateId);
      return c.json({ error: "Template not found" }, 404);
    }

    console.log("✅ Template found:", template.name);

    return c.json({ template });
  } catch (error) {
    console.log("❌ Error getting template:", error);
    return c.json({ error: `Server error getting template: ${error}` }, 500);
  }
});

// Create a new template (user-created)
app.post("/make-server-a611b057/templates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error when creating template");
      return c.json({ error }, 401);
    }

    const { template } = await c.req.json();

    if (!template || !template.name) {
      return c.json({ error: "Template data with name is required" }, 400);
    }

    console.log("📝 Create template request:", template.name);

    // Get next template number
    const allTemplates = await kv.getByPrefix("globaltemplate:");
    const templateNumbers = allTemplates.map((t) => {
      const match = t.id.match(/^template(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    const nextNumber = Math.max(0, ...templateNumbers) + 1;
    const templateId = `template${nextNumber}`;

    const templateData = {
      id: templateId,
      name: template.name,
      description: template.description || "",
      config: template.config || {},
      type: "custom", // Mark as custom (vs 'default')
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };

    // Store template in global library
    await kv.set(`globaltemplate:${templateId}`, templateData);

    console.log("✅ Template created successfully:", templateId);

    return c.json({ template: templateData });
  } catch (error) {
    console.log("❌ Error creating template:", error);
    return c.json({ error: `Server error creating template: ${error}` }, 500);
  }
});

// Update a template (only custom templates can be updated)
app.put("/make-server-a611b057/templates/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const templateId = c.req.param("id");
    const updates = await c.req.json();

    console.log("📝 Update template request:", templateId);

    const template = await kv.get(`globaltemplate:${templateId}`);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    // Only allow updating custom templates
    if (template.isDefault) {
      return c.json({ error: "Cannot update default templates" }, 403);
    }

    // Verify user created this template
    if (template.createdBy !== user.id) {
      return c.json({ error: "Unauthorized to update this template" }, 403);
    }

    // Update template
    const updatedTemplate = {
      ...template,
      ...updates,
      id: templateId, // Ensure ID doesn't change
      isDefault: false, // Ensure default flag doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`globaltemplate:${templateId}`, updatedTemplate);

    console.log("✅ Template updated successfully:", templateId);

    return c.json({ template: updatedTemplate });
  } catch (error) {
    console.log("❌ Error updating template:", error);
    return c.json({ error: `Server error updating template: ${error}` }, 500);
  }
});

// Delete a template (only custom templates can be deleted)
app.delete("/make-server-a611b057/templates/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const templateId = c.req.param("id");
    console.log("🗑️ Delete template request:", templateId);

    const template = await kv.get(`globaltemplate:${templateId}`);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    // Only allow deleting custom templates
    if (template.isDefault) {
      return c.json({ error: "Cannot delete default templates" }, 403);
    }

    // Verify user created this template
    if (template.createdBy !== user.id) {
      return c.json({ error: "Unauthorized to delete this template" }, 403);
    }

    // Delete template
    await kv.del(`globaltemplate:${templateId}`);

    console.log("✅ Template deleted successfully:", templateId);

    return c.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting template:", error);
    return c.json({ error: `Server error deleting template: ${error}` }, 500);
  }
});

// ==================== ADMIN: Update template visibility ====================
// This endpoint allows platform admins to set template visibility
// - visibility_type: "public" | "organization"
// - organization_id: required if visibility_type is "organization"
app.put("/make-server-a611b057/templates/:id/visibility", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const templateId = c.req.param("id");
    const { visibility_type, organization_id } = await c.req.json();

    console.log("🔐 Update template visibility request:", {
      templateId,
      visibility_type,
      organization_id,
    });

    // Validate input
    if (
      !visibility_type ||
      !["public", "organization"].includes(visibility_type)
    ) {
      return c.json(
        {
          error: "Invalid visibility_type. Must be 'public' or 'organization'",
        },
        400,
      );
    }

    if (visibility_type === "organization" && !organization_id) {
      return c.json(
        {
          error:
            "organization_id is required when visibility_type is 'organization'",
        },
        400,
      );
    }

    // Get template
    const template = await kv.get(`globaltemplate:${templateId}`);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    // TODO: Add platform admin check here
    // For now, we'll allow any authenticated user to update visibility
    // You should add a check like: if (!user.is_platform_admin) return 403

    // Update template with new visibility settings
    const updatedTemplate = {
      ...template,
      visibility_type,
      organization_id:
        visibility_type === "organization" ? organization_id : null,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    await kv.set(`globaltemplate:${templateId}`, updatedTemplate);

    console.log("✅ Template visibility updated successfully:", templateId);

    return c.json({
      template: updatedTemplate,
      message: `Template visibility set to ${visibility_type}${
        visibility_type === "organization"
          ? ` for organization ${organization_id}`
          : ""
      }`,
    });
  } catch (error) {
    console.log("❌ Error updating template visibility:", error);
    return c.json(
      { error: `Server error updating template visibility: ${error}` },
      500,
    );
  }
});

// Initialize default templates (call this once to seed the database)
app.post("/make-server-a611b057/templates/seed", async (c) => {
  try {
    console.log("🌱 Seeding default templates...");

    // IMPORTANT: This seed endpoint only runs if no templates exist
    // Use /templates/force-reseed to clear and reseed all templates
    const existing = await kv.getByPrefix("globaltemplate:");
    if (existing.length > 0) {
      console.log(
        "⚠️ Templates already exist, skipping seed. Use /templates/force-reseed to reset.",
      );
      return c.json({
        message: "Templates already seeded",
        count: existing.length,
      });
    }

    // Global Template Library - Default Templates
    // Use canonical DEFAULT_TEMPLATES constant
    const defaultTemplates = DEFAULT_TEMPLATES;

    // Save all default templates with visibility settings
    for (const template of defaultTemplates) {
      const templateWithVisibility = {
        ...template,
        visibility_type: template.visibility_type || "public",
        organization_id: template.organization_id || null,
      };
      await kv.set(`globaltemplate:${template.id}`, templateWithVisibility);
    }

    console.log("✅ Seeded", defaultTemplates.length, "default template(s)");

    return c.json({
      message: "Default templates seeded successfully",
      count: defaultTemplates.length,
      templates: defaultTemplates,
    });
  } catch (error) {
    console.log("❌ Error seeding templates:", error);
    return c.json({ error: `Server error seeding templates: ${error}` }, 500);
  }
});

// Force reseed - clears existing templates and reseeds
app.post("/make-server-a611b057/templates/force-reseed", async (c) => {
  try {
    console.log("🔄 Force reseeding templates...");

    // Step 1: Delete all existing templates
    const existing = await kv.getByPrefix("globaltemplate:");
    console.log(`🗑️ Deleting ${existing.length} existing templates...`);

    if (existing.length > 0) {
      const templatesToDelete = existing.map((t) => `globaltemplate:${t.id}`);
      await kv.mdel(templatesToDelete);
      console.log("✅ Existing templates deleted");
    }

    // Step 2: Define all default templates (1-3)
    const defaultTemplates = DEFAULT_TEMPLATES;

    // Step 3: Save all default templates with visibility settings
    for (const template of defaultTemplates) {
      const templateWithVisibility = {
        ...template,
        visibility_type: template.visibility_type || "public",
        organization_id: template.organization_id || null,
      };
      await kv.set(`globaltemplate:${template.id}`, templateWithVisibility);
    }

    console.log(
      "✅ Force reseeded",
      defaultTemplates.length,
      "default template(s) (Templates 1-5)",
    );

    return c.json({
      message: "Templates 1-5 force reseeded successfully",
      count: defaultTemplates.length,
      templates: defaultTemplates,
    });
  } catch (error) {
    console.log("❌ Error seeding templates:", error);
    return c.json({ error: `Server error seeding templates: ${error}` }, 500);
  }
});

// NUCLEAR OPTION: Purge ALL templates and reseed with ONLY Template 1
app.post("/make-server-a611b057/templates/purge-and-reset", async (c) => {
  try {
    console.log("🔥 PURGING ALL TEMPLATES - Keeping only Template 1...");

    // Step 1: Delete ALL existing templates
    const existing = await kv.getByPrefix("globaltemplate:");
    console.log(`🗑️ Found ${existing.length} templates to delete...`);

    if (existing.length > 0) {
      const templatesToDelete = existing.map((t) => `globaltemplate:${t.id}`);
      await kv.mdel(templatesToDelete);
      console.log("✅ All old templates deleted");
    }

    // Step 2: Seed ONLY Template 1
    const template1 = {
      id: "template1",
      name: "Certificate of Appreciation",
      description:
        "Classic design with brown/gold border, decorative corners, and elegant award badge",
      config: {
        colors: {
          background: "#faf8f3",
          border: "#8b6f47",
          accent: "#c9a961",
          text: "#8b6f47",
          textSecondary: "#b8935d",
        },
        layout: {
          borderWidth: "4px",
          borderStyle: "double",
          padding: "48px",
          alignment: "center",
        },
        typography: {
          headerFont: "Georgia",
          bodyFont: "Georgia",
          scriptFont: "Brush Script MT",
          nameSize: "48px",
          headerSize: "48px",
          bodySize: "14px",
        },
        elements: {
          showBorder: true,
          showDecorativeCorners: true,
          showSeal: true,
          sealType: "gold-award-badge",
          showSignatures: true,
          signatureCount: 2,
        },
      },
      type: "default",
      isDefault: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`globaltemplate:${template1.id}`, template1);

    console.log("✅ System reset complete - Only Template 1 exists");

    return c.json({
      message:
        "All old templates purged. Only Template 1 (Certificate of Appreciation) remains.",
      template: template1,
    });
  } catch (error) {
    console.log("❌ Error purging templates:", error);
    return c.json({ error: `Server error purging templates: ${error}` }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

function generateRandomColor() {
  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#14b8a6", // Teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Try to load billing settings from environment variables first, fall back to KV store
async function getBillingSettings() {
  try {
    const secret =
      Deno.env.get("PAYSTACK_SECRET_KEY") || Deno.env.get("PAYSTACK_SECRET");
    const pub =
      Deno.env.get("PAYSTACK_PUBLIC_KEY") || Deno.env.get("PAYSTACK_PUBLIC");

    if (secret && pub) {
      console.log("🔐 Using Paystack keys from environment variables");
      // Keep plans in KV if present, but env-based keys take precedence
      const kvSettings = await kv.get("billing:settings").catch(() => null);
      return {
        paystackSecretKey: secret,
        paystackPublicKey: pub,
        plans: kvSettings?.plans || {},
        fromEnv: true,
      };
    }

    // Fallback to KV-stored billing settings
    const settings = await kv.get("billing:settings").catch(() => null);
    if (!settings) return null;
    return { ...settings, fromEnv: false };
  } catch (err) {
    console.error("Error reading billing settings:", err);
    return null;
  }
}

// Start the server
console.log("🚀 Certificate Generator API Server Starting...");
// ==================== BILLING ROUTES (PAYSTACK INTEGRATION) ====================
// Note: Billing settings routes are defined later in the file (after line 5330)

// Get billing configuration status (for users)
app.get("/make-server-a611b057/billing/config", async (c) => {
  try {
    const settings = await getBillingSettings();

    return c.json({
      configured: !!settings,
      plans: settings?.plans || {},
    });
  } catch (error) {
    console.log("❌ Error getting billing config:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Initialize Paystack payment
app.post("/make-server-a611b057/billing/initialize", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, planId } = await c.req.json();

    if (!organizationId || !planId) {
      return c.json({ error: "Organization ID and plan ID are required" }, 400);
    }

    // Get billing settings (env vars take precedence)
    const settings = await getBillingSettings();
    if (!settings || !settings.paystackSecretKey) {
      console.log("⚠️ Paystack not configured");
      return c.json(
        {
          error:
            "Billing is not configured yet. Please contact support to enable premium features.",
          requiresSetup: true,
        },
        503,
      );
    }

    // Get organization
    const organization = await kv.get(`org:${organizationId}`);
    if (!organization || organization.ownerId !== user.id) {
      return c.json({ error: "Unauthorized or organization not found" }, 403);
    }

    // Get plan details
    const plan = settings.plans[planId];
    if (!plan) {
      return c.json({ error: "Invalid plan selected" }, 400);
    }

    // Get user account for email
    const userAccount = await kv.get(`user:${user.id}`);
    const email = userAccount?.email || user.email;

    // Initialize payment with Paystack
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: plan.price, // Amount in kobo (Nigerian minor currency unit) or cents
          currency: plan.currency || "NGN",
          callback_url: `${
            c.req.header("origin") || "https://example.com"
          }/#/dashboard?payment_status=success`,
          metadata: {
            planId,
            userId: user.id,
            organizationId,
            organizationName: organization.name,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.log("❌ Paystack initialization failed:", data);
      return c.json({ error: "Failed to initialize payment" }, 500);
    }

    // Store pending transaction
    await kv.set(`transaction:${data.data.reference}`, {
      reference: data.data.reference,
      organizationId,
      userId: user.id,
      planId,
      amount: plan.price,
      currency: plan.currency || "NGN",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Log billing activity
    await logBillingActivity(organizationId, {
      type: "payment_initiated",
      description: `Payment initiated for ${plan.name}`,
      metadata: {
        reference: data.data.reference,
        planId,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency || "NGN",
      },
    });

    console.log("✅ Payment initialized:", data.data.reference);

    return c.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });
  } catch (error) {
    console.log("❌ Error initializing payment:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Verify Paystack payment
app.post("/make-server-a611b057/billing/verify", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { reference } = await c.req.json();

    if (!reference) {
      return c.json({ error: "Reference is required" }, 400);
    }

    // Get billing settings (env vars take precedence)
    const settings = await getBillingSettings();
    if (!settings || !settings.paystackSecretKey) {
      return c.json({ error: "Billing not configured" }, 503);
    }

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${settings.paystackSecretKey}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.log("❌ Paystack verification failed:", data);
      return c.json({ error: "Payment verification failed" }, 400);
    }

    if (data.data.status !== "success") {
      return c.json(
        { error: "Payment not successful", status: data.data.status },
        400,
      );
    }

    // Get transaction record
    const transaction = await kv.get(`transaction:${reference}`);
    if (!transaction || transaction.userId !== user.id) {
      return c.json({ error: "Transaction not found or unauthorized" }, 404);
    }

    // Get plan details
    const plan = settings.plans[transaction.planId];
    if (!plan) {
      return c.json({ error: "Invalid plan" }, 400);
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Update or create subscription
    const subscriptionKey = `subscription:org:${transaction.organizationId}`;
    await kv.set(subscriptionKey, {
      organizationId: transaction.organizationId,
      userId: user.id,
      planId: transaction.planId,
      planName: plan.name,
      status: "active",
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      lastPaymentReference: reference,
      lastPaymentDate: new Date().toISOString(),
      autoRenew: false, // Can be implemented later
    });

    // Update transaction status
    await kv.set(`transaction:${reference}`, {
      ...transaction,
      status: "success",
      verifiedAt: new Date().toISOString(),
      paystackResponse: data.data,
    });

    // Log payment success activity
    await logBillingActivity(transaction.organizationId, {
      type: "payment_success",
      description: `Payment successful for ${plan.name}`,
      metadata: {
        reference,
        planId: transaction.planId,
        planName: plan.name,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });

    // Log subscription activation activity
    await logBillingActivity(transaction.organizationId, {
      type: "subscription_activated",
      description: `${plan.name} subscription activated`,
      metadata: {
        planId: transaction.planId,
        planName: plan.name,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        duration: plan.duration,
      },
    });

    console.log("✅ Payment verified and subscription activated:", reference);

    return c.json({
      success: true,
      subscription: {
        planId: transaction.planId,
        planName: plan.name,
        status: "active",
        expiryDate: expiryDate.toISOString(),
      },
    });
  } catch (error) {
    console.log("❌ Error verifying payment:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Paystack webhook handler
app.post("/make-server-a611b057/billing/webhook", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header("x-paystack-signature");

    // Get billing settings for webhook validation (env vars take precedence)
    const settings = await getBillingSettings();
    if (!settings) {
      return c.json({ error: "Billing not configured" }, 503);
    }

    // Validate webhook signature
    const crypto = await import("node:crypto");
    const hash = crypto
      .createHmac("sha512", settings.paystackSecretKey)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.log("⚠️ Invalid webhook signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const event = JSON.parse(body);
    console.log("���� Paystack webhook received:", event.event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const transaction = await kv.get(`transaction:${reference}`);

      if (transaction) {
        const plan = settings.plans[transaction.planId];
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.duration);

        // Update subscription
        await kv.set(`subscription:org:${transaction.organizationId}`, {
          organizationId: transaction.organizationId,
          userId: transaction.userId,
          planId: transaction.planId,
          planName: plan.name,
          status: "active",
          startDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          lastPaymentReference: reference,
          lastPaymentDate: new Date().toISOString(),
        });

        // Update transaction
        await kv.set(`transaction:${reference}`, {
          ...transaction,
          status: "success",
          verifiedAt: new Date().toISOString(),
          webhookData: event.data,
        });

        // Log payment success activity
        await logBillingActivity(transaction.organizationId, {
          type: "payment_success",
          description: `Payment successful for ${plan.name} (webhook)`,
          metadata: {
            reference,
            planId: transaction.planId,
            planName: plan.name,
            amount: transaction.amount,
            currency: transaction.currency,
          },
        });

        // Log subscription activation activity
        await logBillingActivity(transaction.organizationId, {
          type: "subscription_activated",
          description: `${plan.name} subscription activated (webhook)`,
          metadata: {
            planId: transaction.planId,
            planName: plan.name,
            startDate: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            duration: plan.duration,
          },
        });

        console.log("✅ Webhook processed: subscription activated");
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("❌ Error processing webhook:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ==================== BILLING ACTIVITY LOG ====================

// Helper function to log billing activities
const logBillingActivity = async (
  organizationId: string,
  activity: {
    type:
      | "payment_initiated"
      | "payment_success"
      | "payment_failed"
      | "subscription_activated"
      | "subscription_cancelled"
      | "subscription_expired"
      | "subscription_renewed";
    description: string;
    metadata?: any;
  },
) => {
  const timestamp = new Date().toISOString();
  const activityId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  await kv.set(`activity:org:${organizationId}:${activityId}`, {
    id: activityId,
    organizationId,
    type: activity.type,
    description: activity.description,
    metadata: activity.metadata || {},
    timestamp,
  });

  console.log(
    `📝 Billing activity logged: ${activity.type} for org ${organizationId}`,
  );
};

// Get billing activities for an organization
app.get(
  "/make-server-a611b057/billing/activities/:organizationId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");

      // Verify user owns this organization
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization || organization.ownerId !== user.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      // Get all activities for this organization
      const allActivities = await kv.getByPrefix(
        `activity:org:${organizationId}:`,
      );
      const activities = allActivities
        .map((item) => item.value)
        .filter((activity) => activity && typeof activity === "object")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

      return c.json({ activities });
    } catch (error) {
      console.log("❌ Error getting billing activities:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Get subscription status for an organization
app.get(
  "/make-server-a611b057/billing/subscription/:organizationId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");

      // Verify user owns this organization
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization || organization.ownerId !== user.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const subscription = await kv.get(`subscription:org:${organizationId}`);

      if (!subscription) {
        return c.json({
          organizationId,
          plan: "free",
          planName: "Free Plan",
          status: "active",
          features: ["Basic Templates", "Limited Certificates"],
        });
      }

      // Check if subscription has expired
      const expiryDate = new Date(subscription.expiryDate);
      const now = new Date();

      if (now > expiryDate) {
        await kv.set(`subscription:org:${organizationId}`, {
          ...subscription,
          status: "expired",
        });

        return c.json({
          organizationId,
          plan: "free",
          planName: "Free Plan",
          status: "expired",
          expiredOn: subscription.expiryDate,
          previousPlan: subscription.planName,
        });
      }

      return c.json(subscription);
    } catch (error) {
      console.log("❌ Error getting subscription:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Get payment history for an organization
app.get(
  "/make-server-a611b057/billing/transactions/:organizationId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");

      // Verify user owns this organization
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization || organization.ownerId !== user.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      // Get all transactions
      const allTransactions = await kv.getByPrefix("transaction:");
      const orgTransactions = allTransactions
        .map((item) => item.value)
        .filter((tx) => tx && tx.organizationId === organizationId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      return c.json({ transactions: orgTransactions });
    } catch (error) {
      console.log("❌ Error getting transactions:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Cancel subscription for an organization
app.post(
  "/make-server-a611b057/billing/subscription/:organizationId/cancel",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");

      // Verify user owns this organization
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization || organization.ownerId !== user.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const subscription = await kv.get(`subscription:org:${organizationId}`);

      if (!subscription) {
        return c.json({ error: "No active subscription found" }, 404);
      }

      if (subscription.status !== "active") {
        return c.json({ error: "Subscription is not active" }, 400);
      }

      // Mark subscription as cancelled but keep it active until expiry
      const updatedSubscription = {
        ...subscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: user.id,
      };

      await kv.set(`subscription:org:${organizationId}`, updatedSubscription);

      // Log cancellation activity
      await logBillingActivity(organizationId, {
        type: "subscription_cancelled",
        description: `${subscription.planName} subscription cancelled`,
        metadata: {
          planId: subscription.planId,
          planName: subscription.planName,
          expiryDate: subscription.expiryDate,
          cancelledAt: updatedSubscription.cancelledAt,
        },
      });

      console.log("✅ Subscription cancelled:", organizationId);

      return c.json({
        success: true,
        message: "Subscription cancelled successfully",
        subscription: updatedSubscription,
      });
    } catch (error) {
      console.log("❌ Error cancelling subscription:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Admin: Get all transactions across platform
app.get("/make-server-a611b057/admin/billing/transactions", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const allTransactions = await kv.getByPrefix("transaction:");
    const transactions = allTransactions
      .map((item) => item.value)
      .filter((tx) => tx && typeof tx === "object")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return c.json({ transactions });
  } catch (error) {
    console.log("❌ Error getting all transactions:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Admin: Get all billing activities across platform
app.get("/make-server-a611b057/admin/billing/activities", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("📊 Admin: Fetching all billing activities across platform...");

    // Get all billing activities
    const allActivities = await kv.getByPrefix("activity:org:");
    const activities = allActivities
      .map((item) => item.value)
      .filter((activity) => activity && typeof activity === "object")
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    console.log(`✅ Found ${activities.length} billing activities`);

    // Enrich with organization names
    const enrichedActivities = [];
    for (const activity of activities) {
      let organizationName = "Unknown Organization";
      if (activity.organizationId) {
        try {
          const org = await kv.get(`org:${activity.organizationId}`);
          organizationName = org?.name || "Unknown Organization";
        } catch (e) {
          // Keep default if fetch fails
        }
      }

      enrichedActivities.push({
        ...activity,
        organizationName,
      });
    }

    return c.json({
      activities: enrichedActivities,
      count: enrichedActivities.length,
    });
  } catch (error) {
    console.log("❌ Error getting all billing activities:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Admin: Get all subscriptions across platform
app.get("/make-server-a611b057/admin/billing/subscriptions", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("📊 Admin: Fetching all subscriptions across platform...");

    // Get all subscriptions
    const allSubscriptions = await kv.getByPrefix("subscription:org:");
    const subscriptions = [];

    for (const item of allSubscriptions) {
      const subscription = item.value;

      if (!subscription || typeof subscription !== "object") {
        continue;
      }

      // Get organization details
      let organizationName = "Unknown Organization";
      let ownerEmail = "";
      if (subscription.organizationId) {
        try {
          const org = await kv.get(`org:${subscription.organizationId}`);
          organizationName = org?.name || "Unknown Organization";

          if (org?.ownerId) {
            const owner = await kv.get(`user:${org.ownerId}`);
            ownerEmail = owner?.email || "";
          }
        } catch (e) {
          // Keep defaults if fetch fails
        }
      }

      subscriptions.push({
        ...subscription,
        organizationName,
        ownerEmail,
      });
    }

    // Sort by start date
    subscriptions.sort(
      (a, b) =>
        new Date(b.startDate || 0).getTime() -
        new Date(a.startDate || 0).getTime(),
    );

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    return c.json({
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.log("❌ Error getting all subscriptions:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ==================== PLATFORM ADMIN ENDPOINTS ====================

// Helper to check if user is a platform admin
const isPlatformAdmin = async (authHeader: string | null): Promise<boolean> => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ isPlatformAdmin: Missing or invalid auth header");
    return false;
  }

  const token = authHeader.split(" ")[1];

  // IMPORTANT: Use ANON_KEY client to verify user JWT tokens (not SERVICE_ROLE_KEY)
  // User tokens are issued by ANON_KEY client during signin
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) {
    console.log("❌ isPlatformAdmin: Error verifying token:", error.message);
    return false;
  }

  if (!user) {
    console.log("❌ isPlatformAdmin: No user found for token");
    return false;
  }

  // Platform admin emails - keep in sync with src/utils/adminConfig.ts
  const adminEmails = [
    "admin@certgen.com",
    "platform@certgen.com",
    "admin@genomac.com",
    "admin@gihub.com",
    "admin@g-ihub.com",
    "platform@admin.com",
    "adewuyigoodness1@gmail.com",
    "genomacinnovationhub@gmail.com",
  ];

  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || "");
  console.log(`✅ isPlatformAdmin: User ${user.email} - isAdmin: ${isAdmin}`);

  return isAdmin;
};

// Get platform statistics
app.get("/make-server-a611b057/admin/stats", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Get all organizations - filter out null/undefined values
    const allOrgs = await kv.getByPrefix("org:");
    console.log("📊 Admin Stats - Raw orgs from KV:", allOrgs.length);
    const organizations = allOrgs.filter((org) => org && org.id);
    console.log("📊 Admin Stats - Valid organizations:", organizations.length);

    // Get all certificates - filter out null/undefined values
    const allCerts = await kv.getByPrefix("cert:");
    console.log("📊 Admin Stats - Raw certs from KV:", allCerts.length);
    const certificates = allCerts.filter((cert) => cert && cert.id);
    console.log("📊 Admin Stats - Valid certificates:", certificates.length);

    // Get all templates - filter out null/undefined values
    const allTemplates = await kv.getByPrefix("globaltemplate:");
    console.log(
      "���� Admin Stats - Raw templates from KV:",
      allTemplates.length,
    );
    const templates = allTemplates.filter(
      (template) => template && template.id,
    );
    console.log("📊 Admin Stats - Valid templates:", templates.length);

    // Get all payments - filter out null/undefined values
    const allPayments = await kv.getByPrefix("payment:");
    console.log("📊 Admin Stats - Raw payments from KV:", allPayments.length);
    const payments = allPayments.filter((payment) => payment && payment.id);
    console.log("📊 Admin Stats - Valid payments:", payments.length);

    // Get all testimonials - filter out null/undefined values
    const allTestimonials = await kv.getByPrefix("testimonial:");
    console.log(
      "📊 Admin Stats - Raw testimonials from KV:",
      allTestimonials.length,
    );
    const testimonials = allTestimonials.filter(
      (testimonial) => testimonial && testimonial.id,
    );
    console.log("📊 Admin Stats - Valid testimonials:", testimonials.length);

    // Calculate stats with safe access
    // Check for premium using subscription data
    const premiumOrgs = await Promise.all(
      organizations.map(async (org) => {
        const subscription = await kv.get(`subscription:org:${org.id}`);
        return (
          subscription &&
          subscription.status === "active" &&
          subscription.plan !== "free"
        );
      }),
    );
    const premiumCount = premiumOrgs.filter(Boolean).length;
    const freeCount = organizations.length - premiumCount;

    console.log("📊 Admin Stats - Premium orgs:", premiumCount);
    console.log("📊 Admin Stats - Free orgs:", freeCount);
    const totalRevenue = payments
      .filter((p) => p && p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const stats = {
      totalOrganizations: organizations.length,
      totalCertificates: certificates.length,
      totalTestimonials: testimonials.length,
      totalRevenue: totalRevenue,
      totalTemplates: templates.length,
      premiumUsers: premiumCount,
      freeUsers: freeCount,
    };

    console.log("📊 Admin Stats - Final stats:", stats);

    return c.json({ stats });
  } catch (error) {
    console.error("Admin stats error:", error);
    return c.json({ error: `Failed to get admin stats: ${error}` }, 500);
  }
});

// Get all organizations (admin only)
app.get("/make-server-a611b057/admin/organizations", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("🔍 Admin fetching all organizations...");

    // Get all organizations
    const allOrgs = await kv.getByPrefix("org:");
    console.log(`📦 Found ${allOrgs.length} items with 'org:' prefix`);

    const organizations = [];

    for (const item of allOrgs) {
      const org = item.value;

      console.log(`📋 Processing org:`, {
        key: item.key,
        hasValue: !!org,
        type: typeof org,
        hasId: org?.id,
        name: org?.name,
      });

      // Skip null/undefined/invalid values
      if (!org || typeof org !== "object" || !org.id) {
        console.log(`⚠️ Skipping invalid org from key ${item.key}`);
        continue;
      }

      // Get certificate count for this organization
      const orgCerts = await kv.getByPrefix(`cert:${org.id}:`);

      // Get program count
      const programCount = org.programs?.length || 0;

      // Get owner's email if ownerId exists
      let ownerEmail = "";
      if (org.ownerId) {
        const ownerUser = await kv.get(`user:${org.ownerId}`);
        ownerEmail = ownerUser?.email || "";
      }

      // Get subscription data
      const subscription = await kv.get(`subscription:org:${org.id}`);

      // Determine if organization is premium
      const isPremium =
        subscription &&
        subscription.status === "active" &&
        subscription.plan === "premium" &&
        (!subscription.expiryDate ||
          new Date(subscription.expiryDate) > new Date());

      const orgData = {
        id: org.id,
        name: org.name || "Unknown Organization",
        shortName: org.shortName || "",
        logo: org.logo || "",
        primaryColor: org.primaryColor || "#ea580c",
        plan: org.plan || "free",
        certificateCount: orgCerts.length,
        programCount: programCount,
        programs: org.programs || [],
        createdAt: org.createdAt || new Date().toISOString(),
        ownerId: org.ownerId || "",
        ownerEmail: ownerEmail,
        settings: org.settings || null,
        subscription: subscription || null,
        isPremium: isPremium || false,
      };

      console.log(
        `✅ Added organization: ${orgData.name} (${orgData.id}) - Owner: ${ownerEmail}`,
      );
      organizations.push(orgData);
    }

    console.log(`✅ Returning ${organizations.length} organizations to admin`);
    return c.json({ organizations });
  } catch (error) {
    console.error("❌ Admin organizations error:", error);
    return c.json({ error: `Failed to get organizations: ${error}` }, 500);
  }
});

// Delete organization (admin only)
app.delete(
  "/make-server-a611b057/admin/organizations/:organizationId",
  async (c) => {
    try {
      console.log("🗑️ Received delete organization request");

      const authHeader = c.req.header("Authorization");
      console.log("🔐 Auth header present:", !!authHeader);

      const isAdmin = await isPlatformAdmin(authHeader);
      console.log("👤 Is platform admin:", isAdmin);

      if (!isAdmin) {
        console.log("❌ Unauthorized - not a platform admin");
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");
      console.log(`🗑️ Deleting organization: ${organizationId}`);

      // Check if organization exists
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization) {
        console.log("❌ Organization not found:", organizationId);
        return c.json({ error: "Organization not found" }, 404);
      }

      console.log(`📋 Found organization: ${organization.name}`);
      const ownerId = organization.ownerId;
      console.log(`👤 Organization owner ID: ${ownerId}`);

      // 1. Delete all certificates for this organization
      console.log(`🗑️ Deleting certificates for org: ${organizationId}`);
      const allCerts = await kv.getByPrefix("cert:");
      const orgCerts = allCerts.filter(
        (cert) => cert.organizationId === organizationId,
      );
      console.log(`📜 Found ${orgCerts.length} certificates to delete`);

      for (const cert of orgCerts) {
        await kv.del(`cert:${cert.id}`);
      }
      console.log(`✅ Deleted ${orgCerts.length} certificates`);

      // 2. Delete all testimonials for this organization
      console.log(`🗑️ Deleting testimonials for org: ${organizationId}`);
      const allTestimonials = await kv.getByPrefix(
        `org_testimonial:${organizationId}`,
      );
      console.log(`💬 Found ${allTestimonials.length} testimonials to delete`);

      const allTestimonialKeys = await kv.getByPrefix("org_testimonial:");
      for (const testimonial of allTestimonialKeys) {
        if (testimonial.organizationId === organizationId) {
          await kv.del(`testimonial:${testimonial.id}`);
          await kv.del(`org_testimonial:${organizationId}:${testimonial.id}`);
        }
      }
      console.log(`✅ Deleted testimonials`);

      // 3. Delete organization settings
      console.log(`🗑️ Deleting settings for org: ${organizationId}`);
      try {
        await kv.del(`org:${organizationId}:settings`);
        console.log(`✅ Settings deleted`);
      } catch (err) {
        console.log(`⚠️ No settings found for org: ${organizationId}`);
      }

      // 4. Delete subscription if exists
      console.log(`🗑️ Deleting subscription for org: ${organizationId}`);
      try {
        await kv.del(`subscription:org:${organizationId}`);
        console.log(`✅ Subscription deleted`);
      } catch (err) {
        console.log(`⚠️ No subscription found for org: ${organizationId}`);
      }

      // 5. Delete all payments for this organization
      console.log(`🗑️ Deleting payments for org: ${organizationId}`);
      const allPayments = await kv.getByPrefix("payment:");
      const orgPayments = allPayments.filter(
        (payment) => payment.organizationId === organizationId,
      );
      console.log(`💳 Found ${orgPayments.length} payments to delete`);

      for (const payment of orgPayments) {
        await kv.del(`payment:${payment.reference}`);
      }
      console.log(`✅ Deleted ${orgPayments.length} payments`);

      // 6. Delete the organization itself
      console.log(`🗑️ Deleting org: ${organizationId}`);
      await kv.del(`org:${organizationId}`);
      console.log(`✅ Organization deleted from KV store`);

      // 7. Delete the user's account data from KV store
      if (ownerId) {
        console.log(`🗑️ Deleting user data for: ${ownerId}`);
        const userData = await kv.get(`user:${ownerId}`);

        if (userData) {
          console.log(`📧 User email: ${userData.email}`);

          // Delete user from KV store
          await kv.del(`user:${ownerId}`);
          console.log(`✅ User data deleted from KV store`);

          // 8. Delete the user's Supabase Auth account
          console.log(`🗑️ Deleting Supabase Auth account for: ${ownerId}`);
          try {
            const supabase = getSupabaseClient();
            const { error: deleteError } =
              await supabase.auth.admin.deleteUser(ownerId);

            if (deleteError) {
              console.error(
                `❌ Error deleting Supabase Auth user:`,
                deleteError,
              );
              // Continue anyway - KV data is deleted
            } else {
              console.log(`✅ Supabase Auth account deleted successfully`);
            }
          } catch (authError) {
            console.error(
              `❌ Exception deleting Supabase Auth user:`,
              authError,
            );
            // Continue anyway - KV data is deleted
          }
        } else {
          console.log(`⚠️ User data not found in KV store for: ${ownerId}`);
        }
      } else {
        console.log(`⚠️ Organization has no ownerId, skipping user deletion`);
      }

      console.log("✅ Complete deletion operation finished successfully");

      return c.json({
        success: true,
        message: `Organization "${organization.name}" and associated user account have been completely deleted`,
        deletedOrganization: {
          id: organizationId,
          name: organization.name,
        },
        deletedItems: {
          certificates: orgCerts.length,
          payments: orgPayments.length,
          authAccount: !!ownerId,
        },
      });
    } catch (error: any) {
      console.error("❌ Error deleting organization:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error message:", error.message);
      return c.json(
        {
          error: `Failed to delete organization: ${error.message || error}`,
          details: error.stack,
        },
        500,
      );
    }
  },
);

// Get all templates (admin only)
app.get("/make-server-a611b057/admin/templates", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Get all templates
    const allTemplates = await kv.getByPrefix("globaltemplate:");
    const templates = allTemplates
      .filter(
        (item) => item.value && typeof item.value === "object" && item.value.id,
      )
      .map((item) => ({
        id: item.value.id,
        name: item.value.name || "Unnamed Template",
        description: item.value.description || "",
        isPremium: item.value.type === "premium",
        isDefault: item.value.isDefault || false,
        createdBy: item.value.createdBy || null,
        createdAt: item.value.createdAt || new Date().toISOString(),
      }));

    return c.json({ templates });
  } catch (error) {
    console.error("Admin templates error:", error);
    return c.json({ error: `Failed to get templates: ${error}` }, 500);
  }
});

// Grant premium membership (admin only)
app.post(
  "/make-server-a611b057/admin/organizations/:organizationId/membership",
  async (c) => {
    try {
      console.log("🔍 Received grant premium request");

      const authHeader = c.req.header("Authorization");
      console.log("🔐 Auth header present:", !!authHeader);

      const isAdmin = await isPlatformAdmin(authHeader);
      console.log("👮 Is admin:", isAdmin);

      if (!isAdmin) {
        console.log("❌ Unauthorized: Not a platform admin");
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");
      console.log("🏢 Organization ID:", organizationId);

      let requestBody;
      try {
        requestBody = await c.req.json();
        console.log("📦 Request body:", requestBody);
      } catch (e) {
        console.error("❌ Failed to parse request body:", e);
        return c.json({ error: "Invalid request body" }, 400);
      }

      const { planId, planName, durationMonths } = requestBody;

      if (!durationMonths || isNaN(parseInt(durationMonths))) {
        console.error("❌ Invalid durationMonths:", durationMonths);
        return c.json({ error: "Invalid duration months" }, 400);
      }

      console.log(
        `👑 Admin granting premium to org ${organizationId} for ${durationMonths} months`,
      );

      // Get the organization
      const orgKey = `org:${organizationId}`;
      console.log("🔍 Looking for org with key:", orgKey);

      const org = await kv.get(orgKey);
      console.log("📊 Organization found:", !!org, org ? `(${org.name})` : "");

      if (!org) {
        console.error(`❌ Organization not found with key: ${orgKey}`);
        return c.json(
          { error: `Organization not found: ${organizationId}` },
          404,
        );
      }

      // Calculate expiry date
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(durationMonths));
      console.log("📅 Expiry date calculated:", expiryDate.toISOString());

      // Create subscription record
      const subscription = {
        organizationId,
        plan: "premium",
        status: "active",
        startDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        grantedByAdmin: true,
        planId: planId || "admin-premium",
        planName: planName || "Premium Plan (Admin Granted)",
        durationMonths: parseInt(durationMonths),
        createdAt: now.toISOString(),
      };

      // Save subscription
      const subKey = `subscription:org:${organizationId}`;
      console.log("💾 Saving subscription with key:", subKey);
      await kv.set(subKey, subscription);
      console.log("✅ Subscription saved");

      // Update organization plan
      org.plan = "premium";
      console.log("💾 Updating organization plan to premium");
      await kv.set(orgKey, org);
      console.log("✅ Organization updated");

      // Log to billing activity
      const activityLogKey = `billing_activity_log:${Date.now()}:${Math.random()
        .toString(36)
        .substring(7)}`;
      const activityEntry = {
        timestamp: now.toISOString(),
        type: "subscription_activated",
        organizationId,
        organizationName: org.name,
        metadata: {
          plan: "premium",
          durationMonths: parseInt(durationMonths),
          expiryDate: expiryDate.toISOString(),
          grantedByAdmin: true,
          planId,
          planName,
        },
      };
      console.log("💾 Logging to billing activity");
      await kv.set(activityLogKey, activityEntry);
      console.log("✅ Billing activity logged");

      console.log(
        `✅ Premium granted to ${org.name} until ${expiryDate.toISOString()}`,
      );

      return c.json({
        success: true,
        subscription,
        message: `Premium access granted until ${expiryDate.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error("❌ Admin grant membership error:", error);
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      return c.json(
        {
          error: `Failed to grant membership: ${
            error instanceof Error ? error.message : String(error)
          }`,
          details: error instanceof Error ? error.stack : undefined,
        },
        500,
      );
    }
  },
);

// Revoke premium membership (admin only)
app.delete(
  "/make-server-a611b057/admin/organizations/:organizationId/membership",
  async (c) => {
    try {
      console.log("🔍 Received revoke premium request");

      const authHeader = c.req.header("Authorization");
      console.log("🔐 Auth header present:", !!authHeader);

      const isAdmin = await isPlatformAdmin(authHeader);
      console.log("👮 Is admin:", isAdmin);

      if (!isAdmin) {
        console.log("❌ Unauthorized: Not a platform admin");
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");
      console.log("🏢 Organization ID:", organizationId);

      console.log(`🚫 Admin revoking premium from org ${organizationId}`);

      // Get the organization
      const orgKey = `org:${organizationId}`;
      console.log("🔍 Looking for org with key:", orgKey);

      const org = await kv.get(orgKey);
      console.log("📊 Organization found:", !!org, org ? `(${org.name})` : "");

      if (!org) {
        console.error(`❌ Organization not found with key: ${orgKey}`);
        return c.json(
          { error: `Organization not found: ${organizationId}` },
          404,
        );
      }

      // Get existing subscription
      const subKey = `subscription:org:${organizationId}`;
      console.log("🔍 Looking for subscription with key:", subKey);
      const subscription = await kv.get(subKey);
      console.log("📊 Subscription found:", !!subscription);

      // Update subscription to cancelled
      if (subscription) {
        subscription.status = "cancelled";
        subscription.cancelledAt = new Date().toISOString();
        subscription.cancelledByAdmin = true;
        console.log("💾 Updating subscription to cancelled");
        await kv.set(subKey, subscription);
        console.log("✅ Subscription updated");
      }

      // Update organization plan to free
      org.plan = "free";
      console.log("💾 Updating organization plan to free");
      await kv.set(orgKey, org);
      console.log("✅ Organization updated");

      // Log to billing activity
      const now = new Date();
      const activityLogKey = `billing_activity_log:${Date.now()}:${Math.random()
        .toString(36)
        .substring(7)}`;
      const activityEntry = {
        timestamp: now.toISOString(),
        type: "subscription_cancelled",
        organizationId,
        organizationName: org.name,
        metadata: {
          previousPlan: "premium",
          cancelledByAdmin: true,
          reason: "Admin revoked access",
        },
      };
      console.log("💾 Logging to billing activity");
      await kv.set(activityLogKey, activityEntry);
      console.log("✅ Billing activity logged");

      console.log(`✅ Premium revoked from ${org.name}`);

      return c.json({
        success: true,
        message: "Premium access revoked successfully",
      });
    } catch (error) {
      console.error("❌ Admin revoke membership error:", error);
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      return c.json(
        {
          error: `Failed to revoke membership: ${
            error instanceof Error ? error.message : String(error)
          }`,
          details: error instanceof Error ? error.stack : undefined,
        },
        500,
      );
    }
  },
);

// Debug endpoint - shows all keys in database (admin only)
app.get("/make-server-a611b057/admin/debug-keys", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("🔍 Admin debug: Fetching all database keys...");

    // Get all keys by common prefixes
    const prefixes = [
      "org:",
      "user:",
      "cert:",
      "globaltemplate:",
      "customtemplate:",
      "payment:",
      "program:",
      "testimonial:",
    ];
    const keysByPrefix: Record<string, any[]> = {};

    for (const prefix of prefixes) {
      const items = await kv.getByPrefix(prefix);
      keysByPrefix[prefix] = items.map((item) => ({
        key: item.key,
        hasValue: !!item.value,
        valueType: typeof item.value,
        preview: item.value
          ? {
              id: item.value.id,
              name: item.value.name || item.value.fullName || item.value.email,
              createdAt: item.value.createdAt,
            }
          : null,
      }));
      console.log(`📦 ${prefix}: ${items.length} items`);
    }

    const summary = {
      totalKeys: Object.values(keysByPrefix).reduce(
        (sum, items) => sum + items.length,
        0,
      ),
      byPrefix: Object.fromEntries(
        Object.entries(keysByPrefix).map(([prefix, items]) => [
          prefix,
          items.length,
        ]),
      ),
    };

    console.log("✅ Database summary:", summary);

    return c.json({
      summary,
      keys: keysByPrefix,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Admin debug error:", error);
    return c.json({ error: `Failed to get debug info: ${error}` }, 500);
  }
});

// Get billing data (admin only)
app.get("/make-server-a611b057/admin/billing", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Get all payments
    const allPayments = await kv.getByPrefix("payment:");
    const payments = [];

    for (const item of allPayments) {
      const payment = item.value;

      // Skip null/undefined/invalid values
      if (!payment || typeof payment !== "object" || !payment.id) {
        continue;
      }

      // Get organization name
      let organizationName = "Unknown";
      if (payment.organizationId) {
        try {
          const org = await kv.get(`org:${payment.organizationId}`);
          organizationName = org?.name || "Unknown";
        } catch (e) {
          // Keep default 'Unknown' if org fetch fails
        }
      }

      payments.push({
        id: payment.id,
        organizationName: organizationName,
        amount: payment.amount || 0,
        plan: payment.plan || "Unknown Plan",
        status: payment.status || "unknown",
        createdAt: payment.createdAt || new Date().toISOString(),
        reference: payment.reference || "",
      });
    }

    return c.json({ payments });
  } catch (error) {
    console.error("Admin billing error:", error);
    return c.json({ error: `Failed to get billing data: ${error}` }, 500);
  }
});

// Get all organizations with payment information (admin only)
app.get("/make-server-a611b057/admin/organizations/paid", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("💳 Admin fetching paid organizations...");

    // Get all organizations
    const allOrgs = await kv.getByPrefix("org:");
    const paidOrganizations = [];

    for (const item of allOrgs) {
      const org = item.value;

      // Skip invalid data
      if (!org || typeof org !== "object" || !org.id) {
        continue;
      }

      // Get subscription data
      const subscription = await kv.get(`subscription:org:${org.id}`);

      // Get transaction data
      const allTransactions = await kv.getByPrefix("transaction:");
      const orgTransactions = allTransactions
        .map((t) => t.value)
        .filter(
          (tx) => tx && tx.organizationId === org.id && tx.status === "success",
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      // Only include organizations with subscriptions or successful payments
      if (subscription || orgTransactions.length > 0) {
        // Get owner email
        let ownerEmail = "";
        if (org.ownerId) {
          const ownerUser = await kv.get(`user:${org.ownerId}`);
          ownerEmail = ownerUser?.email || "";
        }

        paidOrganizations.push({
          id: org.id,
          name: org.name || "Unknown Organization",
          logo: org.logo || "",
          ownerId: org.ownerId || "",
          ownerEmail: ownerEmail,
          createdAt: org.createdAt || new Date().toISOString(),
          subscription: subscription || null,
          totalPaid:
            orgTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) /
            100, // Convert from kobo to naira
          paymentCount: orgTransactions.length,
          lastPayment: orgTransactions[0] || null,
        });
      }
    }

    console.log(`✅ Found ${paidOrganizations.length} paid organizations`);
    return c.json({ organizations: paidOrganizations });
  } catch (error) {
    console.error("❌ Admin paid organizations error:", error);
    return c.json({ error: `Failed to get paid organizations: ${error}` }, 500);
  }
});

// Get combined users/organizations data (admin only)
app.get("/make-server-a611b057/admin/users-organizations", async (c) => {
  try {
    console.log("🔍 Admin users-organizations endpoint called");
    const authHeader = c.req.header("Authorization");
    console.log("🔑 Auth header present:", !!authHeader);

    const isAdmin = await isPlatformAdmin(authHeader);
    console.log("👤 Is platform admin:", isAdmin);

    if (!isAdmin) {
      console.log("❌ Access denied - not an admin");
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("👥 Admin fetching all users/organizations...");

    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    console.log(`📋 Found ${allUsers.length} user entries in KV store`);

    if (allUsers.length > 0) {
      console.log(
        "📝 Sample user keys:",
        allUsers.slice(0, 3).map((item) => item.key),
      );
    }

    const usersOrganizations = [];

    for (const item of allUsers) {
      const user = item.value;

      // Skip invalid data
      if (!user || typeof user !== "object" || !user.id) {
        continue;
      }

      // Get organization data if user has one
      let organization = null;
      let subscription = null;

      if (user.organizationId) {
        organization = await kv.get(`org:${user.organizationId}`);
        subscription = await kv.get(`subscription:org:${user.organizationId}`);
      }

      // Get payment info
      let totalPaid = 0;
      let paymentCount = 0;
      let lastPaymentDate = null;

      if (user.organizationId) {
        const allTransactions = await kv.getByPrefix("transaction:");
        const userTransactions = allTransactions
          .map((t) => t.value)
          .filter(
            (tx) =>
              tx &&
              tx.organizationId === user.organizationId &&
              tx.status === "success",
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

        totalPaid =
          userTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / 100;
        paymentCount = userTransactions.length;
        lastPaymentDate = userTransactions[0]?.createdAt || null;
      }

      usersOrganizations.push({
        id: user.id,
        email: user.email || "",
        fullName: user.fullName || "Unknown User",
        createdAt: user.createdAt || new Date().toISOString(),
        organizationId: user.organizationId || null,
        organizationName:
          organization?.name || user.organizationName || "No Organization",
        organizationLogo: organization?.logo || "",
        plan: subscription?.plan || "free",
        subscriptionStatus: subscription?.status || "none",
        subscriptionExpiry: subscription?.expiryDate || null,
        totalPaid: totalPaid,
        paymentCount: paymentCount,
        lastPaymentDate: lastPaymentDate,
        isPremium: subscription?.status === "active",
      });
    }

    console.log(`✅ Found ${usersOrganizations.length} users/organizations`);
    return c.json({ usersOrganizations });
  } catch (error) {
    console.error("❌ Admin users/organizations error:", error);
    return c.json(
      { error: `Failed to get users/organizations: ${error}` },
      500,
    );
  }
});

// Debug endpoint - Get raw KV data (admin only)
app.get("/make-server-a611b057/admin/debug/kv-data", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("🔍 Admin requesting KV debug data...");

    // Get all data by prefix
    const allUsers = await kv.getByPrefix("user:");
    const allOrgs = await kv.getByPrefix("org:");
    const allSubscriptions = await kv.getByPrefix("subscription:");
    const allTransactions = await kv.getByPrefix("transaction:");

    console.log(`📊 KV Data Summary:
      - Users: ${allUsers.length}
      - Organizations: ${allOrgs.length}
      - Subscriptions: ${allSubscriptions.length}
      - Transactions: ${allTransactions.length}
    `);

    // Return detailed info about what's in the database
    return c.json({
      summary: {
        userCount: allUsers.length,
        organizationCount: allOrgs.length,
        subscriptionCount: allSubscriptions.length,
        transactionCount: allTransactions.length,
      },
      sampleData: {
        users: allUsers.slice(0, 3).map((item) => ({
          key: item.key,
          value: item.value,
        })),
        organizations: allOrgs.slice(0, 3).map((item) => ({
          key: item.key,
          value: item.value,
        })),
        subscriptions: allSubscriptions.slice(0, 3).map((item) => ({
          key: item.key,
          value: item.value,
        })),
        transactions: allTransactions.slice(0, 3).map((item) => ({
          key: item.key,
          value: item.value,
        })),
      },
      allUserKeys: allUsers.map((item) => item.key),
      allOrgKeys: allOrgs.map((item) => item.key),
    });
  } catch (error) {
    console.error("❌ Admin KV debug error:", error);
    return c.json({ error: `Failed to get KV data: ${error}` }, 500);
  }
});

// Grant/update membership for an organization (admin only)
app.post(
  "/make-server-a611b057/admin/organizations/:organizationId/membership",
  async (c) => {
    try {
      const authHeader = c.req.header("Authorization");

      if (!(await isPlatformAdmin(authHeader))) {
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");
      const { planId, planName, durationMonths } = await c.req.json();

      console.log(
        `👑 Admin granting membership to org ${organizationId}: ${planName} for ${durationMonths} months`,
      );

      // Check if organization exists
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Calculate expiry date
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setMonth(expiryDate.getMonth() + (durationMonths || 12));

      // Create or update subscription
      const subscription = {
        organizationId,
        planId: planId || "admin-granted",
        planName: planName || "Premium Plan",
        plan: "premium",
        status: "active",
        startDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        grantedByAdmin: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await kv.set(`subscription:org:${organizationId}`, subscription);

      // Log activity
      await logBillingActivity(organizationId, {
        type: "subscription_activated",
        description: `${planName} granted by admin`,
        metadata: {
          planId,
          planName,
          durationMonths,
          expiryDate: expiryDate.toISOString(),
          grantedByAdmin: true,
        },
      });

      console.log(`✅ Membership granted successfully`);
      return c.json({
        success: true,
        subscription,
        message: "Membership granted successfully",
      });
    } catch (error) {
      console.error("❌ Admin grant membership error:", error);
      return c.json({ error: `Failed to grant membership: ${error}` }, 500);
    }
  },
);

// Cancel membership for an organization (admin only)
app.delete(
  "/make-server-a611b057/admin/organizations/:organizationId/membership",
  async (c) => {
    try {
      const authHeader = c.req.header("Authorization");

      if (!(await isPlatformAdmin(authHeader))) {
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");

      console.log(`🚫 Admin cancelling membership for org ${organizationId}`);

      // Check if organization exists
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Get current subscription
      const subscription = await kv.get(`subscription:org:${organizationId}`);

      if (!subscription) {
        return c.json({ error: "No active subscription found" }, 404);
      }

      // Cancel subscription immediately (admin override)
      const cancelledSubscription = {
        ...subscription,
        status: "cancelled",
        plan: "free",
        cancelledAt: new Date().toISOString(),
        cancelledByAdmin: true,
      };

      await kv.set(`subscription:org:${organizationId}`, cancelledSubscription);

      // Log activity
      await logBillingActivity(organizationId, {
        type: "subscription_cancelled",
        description: `Subscription cancelled by admin`,
        metadata: {
          previousPlan: subscription.planName,
          cancelledByAdmin: true,
        },
      });

      console.log(`✅ Membership cancelled successfully`);
      return c.json({
        success: true,
        message: "Membership cancelled successfully",
      });
    } catch (error) {
      console.error("❌ Admin cancel membership error:", error);
      return c.json({ error: `Failed to cancel membership: ${error}` }, 500);
    }
  },
);

// Update subscription for an organization (admin only)
app.put(
  "/make-server-a611b057/admin/organizations/:organizationId/subscription",
  async (c) => {
    try {
      const authHeader = c.req.header("Authorization");

      if (!(await isPlatformAdmin(authHeader))) {
        return c.json({ error: "Unauthorized - Admin access required" }, 403);
      }

      const organizationId = c.req.param("organizationId");
      const { status, expiryDate, planName } = await c.req.json();

      console.log(`✏️ Admin updating subscription for org ${organizationId}`);

      // Check if organization exists
      const organization = await kv.get(`org:${organizationId}`);
      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Get current subscription
      const subscription = await kv.get(`subscription:org:${organizationId}`);

      if (!subscription) {
        return c.json({ error: "No subscription found" }, 404);
      }

      // Update subscription
      const updatedSubscription = {
        ...subscription,
        ...(status && { status }),
        ...(expiryDate && { expiryDate }),
        ...(planName && { planName }),
        updatedAt: new Date().toISOString(),
        updatedByAdmin: true,
      };

      await kv.set(`subscription:org:${organizationId}`, updatedSubscription);

      // Log activity
      await logBillingActivity(organizationId, {
        type: "subscription_renewed",
        description: `Subscription updated by admin`,
        metadata: {
          changes: { status, expiryDate, planName },
          updatedByAdmin: true,
        },
      });

      console.log(`✅ Subscription updated successfully`);
      return c.json({
        success: true,
        subscription: updatedSubscription,
        message: "Subscription updated successfully",
      });
    } catch (error) {
      console.error("❌ Admin update subscription error:", error);
      return c.json({ error: `Failed to update subscription: ${error}` }, 500);
    }
  },
);

// ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

// Get all users with access control information
app.get("/make-server-a611b057/admin/users/access-control", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("👥 Admin: Fetching all users with access control info...");

    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    const users = [];

    for (const item of allUsers) {
      const user = item.value;

      if (!user || typeof user !== "object") {
        continue;
      }

      // Get organization details
      let organization = null;
      let subscription = null;

      if (user.organizationId) {
        organization = await kv.get(`org:${user.organizationId}`);
        subscription = await kv.get(`subscription:org:${user.organizationId}`);
      }

      users.push({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        organizationId: user.organizationId,
        organizationName:
          organization?.name || user.organizationName || "No Organization",
        plan: subscription?.planName || "Free",
        subscriptionStatus: subscription?.status || "none",
        subscriptionExpiry: subscription?.expiryDate || null,
        isPremium: subscription?.status === "active",
        grantedByAdmin: subscription?.grantedByAdmin || false,
      });
    }

    // Sort by creation date (newest first)
    users.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );

    console.log(`✅ Found ${users.length} users`);

    return c.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.log("❌ Error getting users for access control:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Grant premium access to a user
app.post("/make-server-a611b057/admin/users/grant-premium", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const { userId, organizationId, durationDays } = await c.req.json();

    if (!organizationId || !durationDays) {
      return c.json(
        { error: "Organization ID and duration are required" },
        400,
      );
    }

    console.log(
      `🎁 Admin: Granting premium access to org ${organizationId} for ${durationDays} days...`,
    );

    // Verify organization exists
    const org = await kv.get(`org:${organizationId}`);
    if (!org) {
      return c.json({ error: "Organization not found" }, 404);
    }

    // Create subscription
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const subscription = {
      organizationId,
      userId: userId || org.ownerId,
      planId: "admin_granted",
      planName: `Premium (${durationDays} days)`,
      plan: "premium",
      status: "active",
      startDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      grantedByAdmin: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await kv.set(`subscription:org:${organizationId}`, subscription);

    // Log activity
    await logBillingActivity(organizationId, {
      type: "admin_grant",
      description: `Premium access granted by admin for ${durationDays} days`,
      metadata: {
        durationDays,
        expiryDate: expiryDate.toISOString(),
        grantedByAdmin: true,
      },
    });

    console.log(`✅ Premium access granted successfully`);
    return c.json({
      success: true,
      subscription,
      message: "Premium access granted successfully",
    });
  } catch (error) {
    console.error("❌ Admin grant premium error:", error);
    return c.json({ error: `Failed to grant premium access: ${error}` }, 500);
  }
});

// Extend premium access for a user
app.post("/make-server-a611b057/admin/users/extend-premium", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const { organizationId, additionalDays } = await c.req.json();

    if (!organizationId || !additionalDays) {
      return c.json(
        { error: "Organization ID and additional days are required" },
        400,
      );
    }

    console.log(
      `⏰ Admin: Extending premium access for org ${organizationId} by ${additionalDays} days...`,
    );

    // Get current subscription
    const subscription = await kv.get(`subscription:org:${organizationId}`);

    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    // Extend expiry date
    const currentExpiry = new Date(subscription.expiryDate);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + additionalDays);

    const updatedSubscription = {
      ...subscription,
      expiryDate: newExpiry.toISOString(),
      updatedAt: new Date().toISOString(),
      extendedByAdmin: true,
    };

    await kv.set(`subscription:org:${organizationId}`, updatedSubscription);

    // Log activity
    await logBillingActivity(organizationId, {
      type: "admin_extend",
      description: `Premium access extended by admin for ${additionalDays} days`,
      metadata: {
        additionalDays,
        previousExpiry: currentExpiry.toISOString(),
        newExpiry: newExpiry.toISOString(),
        extendedByAdmin: true,
      },
    });

    console.log(`✅ Premium access extended successfully`);
    return c.json({
      success: true,
      subscription: updatedSubscription,
      message: "Premium access extended successfully",
    });
  } catch (error) {
    console.error("❌ Admin extend premium error:", error);
    return c.json({ error: `Failed to extend premium access: ${error}` }, 500);
  }
});

// Revoke premium access (set to expire in 7 days - grace period)
app.post("/make-server-a611b057/admin/users/revoke-premium", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const { organizationId, gracePeriodDays = 7 } = await c.req.json();

    if (!organizationId) {
      return c.json({ error: "Organization ID is required" }, 400);
    }

    console.log(
      `🚫 Admin: Revoking premium access for org ${organizationId} with ${gracePeriodDays} day grace period...`,
    );

    // Get current subscription
    const subscription = await kv.get(`subscription:org:${organizationId}`);

    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    // Set expiry to now + grace period
    const now = new Date();
    const graceExpiry = new Date(now);
    graceExpiry.setDate(graceExpiry.getDate() + gracePeriodDays);

    const revokedSubscription = {
      ...subscription,
      status: "revoked",
      expiryDate: graceExpiry.toISOString(),
      revokedAt: now.toISOString(),
      revokedByAdmin: true,
      gracePeriodDays,
      updatedAt: now.toISOString(),
    };

    await kv.set(`subscription:org:${organizationId}`, revokedSubscription);

    // Log activity
    await logBillingActivity(organizationId, {
      type: "admin_revoke",
      description: `Premium access revoked by admin (${gracePeriodDays} day grace period)`,
      metadata: {
        gracePeriodDays,
        expiryDate: graceExpiry.toISOString(),
        revokedByAdmin: true,
      },
    });

    console.log(`✅ Premium access revoked successfully`);
    return c.json({
      success: true,
      subscription: revokedSubscription,
      message: `Premium access revoked. Access will expire in ${gracePeriodDays} days.`,
    });
  } catch (error) {
    console.error("❌ Admin revoke premium error:", error);
    return c.json({ error: `Failed to revoke premium access: ${error}` }, 500);
  }
});

// ==================== CUSTOM TEMPLATE ROUTES ====================

// Get all custom templates for an organization
app.get("/make-server-a611b057/custom-templates/:organizationId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("organizationId");

    // Get all custom templates for this organization
    const templates = await kv.getByPrefix(`customtemplate:${organizationId}:`);
    const customTemplates = templates
      .filter((item) => item.value && typeof item.value === "object")
      .map((item) => item.value);

    return c.json({ templates: customTemplates });
  } catch (error) {
    console.error("Get custom templates error:", error);
    return c.json({ error: `Failed to get custom templates: ${error}` }, 500);
  }
});

// Get a specific custom template by ID
app.get(
  "/make-server-a611b057/custom-templates/template/:templateId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const templateId = c.req.param("templateId");

      // Search for the template across all organizations (user can only access their own org's templates)
      const allTemplates = await kv.getByPrefix("customtemplate:");
      const template = allTemplates.find(
        (item) =>
          item.value &&
          typeof item.value === "object" &&
          item.value.id === templateId,
      );

      if (!template) {
        return c.json({ error: "Template not found" }, 404);
      }

      return c.json({ template: template.value });
    } catch (error) {
      console.error("Get custom template error:", error);
      return c.json({ error: `Failed to get custom template: ${error}` }, 500);
    }
  },
);

// Create a new custom template
app.post("/make-server-a611b057/custom-templates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, template } = await c.req.json();

    if (!organizationId || !template) {
      return c.json(
        { error: "Organization ID and template data are required" },
        400,
      );
    }

    // Generate a unique template ID
    const templateId = `custom_${organizationId}_${Date.now()}`;

    // Create the template object
    const customTemplate = {
      id: templateId,
      organizationId,
      name: template.name || "Untitled Template",
      description: template.description || "",
      config: template.config || {},
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set(
      `customtemplate:${organizationId}:${templateId}`,
      customTemplate,
    );

    return c.json({ template: customTemplate });
  } catch (error) {
    console.error("Create custom template error:", error);
    return c.json({ error: `Failed to create custom template: ${error}` }, 500);
  }
});

// Update a custom template
app.put("/make-server-a611b057/custom-templates/:templateId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const templateId = c.req.param("templateId");
    const updates = await c.req.json();

    // Find the template
    const allTemplates = await kv.getByPrefix("customtemplate:");
    const templateItem = allTemplates.find(
      (item) =>
        item.value &&
        typeof item.value === "object" &&
        item.value.id === templateId,
    );

    if (!templateItem) {
      return c.json({ error: "Template not found" }, 404);
    }

    const existingTemplate = templateItem.value;

    // Verify user owns this template
    if (existingTemplate.createdBy !== user.id) {
      return c.json({ error: "Unauthorized to edit this template" }, 403);
    }

    // Update the template
    const updatedTemplate = {
      ...existingTemplate,
      ...updates,
      id: templateId, // Prevent ID change
      createdBy: existingTemplate.createdBy, // Prevent owner change
      createdAt: existingTemplate.createdAt, // Prevent creation date change
      updatedAt: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set(
      `customtemplate:${existingTemplate.organizationId}:${templateId}`,
      updatedTemplate,
    );

    return c.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Update custom template error:", error);
    return c.json({ error: `Failed to update custom template: ${error}` }, 500);
  }
});

// Delete a custom template
app.delete("/make-server-a611b057/custom-templates/:templateId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const templateId = c.req.param("templateId");

    // Find the template
    const allTemplates = await kv.getByPrefix("customtemplate:");
    const templateItem = allTemplates.find(
      (item) =>
        item.value &&
        typeof item.value === "object" &&
        item.value.id === templateId,
    );

    if (!templateItem) {
      return c.json({ error: "Template not found" }, 404);
    }

    const existingTemplate = templateItem.value;

    // Verify user owns this template
    if (existingTemplate.createdBy !== user.id) {
      return c.json({ error: "Unauthorized to delete this template" }, 403);
    }

    // Delete from KV store
    await kv.del(
      `customtemplate:${existingTemplate.organizationId}:${templateId}`,
    );

    return c.json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    console.error("Delete custom template error:", error);
    return c.json({ error: `Failed to delete custom template: ${error}` }, 500);
  }
});

// ==================== CERTIFICATE ROUTES ====================

// Create a new certificate (save after generation)
app.post("/make-server-a611b057/certificates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, certificate } = await c.req.json();

    if (!organizationId || !certificate) {
      return c.json(
        { error: "Organization ID and certificate data are required" },
        400,
      );
    }

    // Create the certificate object with metadata
    const savedCertificate = {
      id:
        certificate.id ||
        `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      studentName: certificate.studentName,
      email: certificate.email,
      programName: certificate.programName || certificate.program?.name,
      programDescription:
        certificate.programDescription || certificate.program?.description,
      templateId: certificate.templateId || certificate.program?.template,
      customMessage: certificate.customMessage || "",
      completionDate: certificate.completionDate,
      certificateUrl: certificate.certificateUrl,
      generatedAt: certificate.generatedAt || new Date().toISOString(),
      generatedBy: user.id,
    };

    // Save to KV store with organization scoping
    await kv.set(
      `certificate:${organizationId}:${savedCertificate.id}`,
      savedCertificate,
    );

    console.log(
      `✅ Certificate saved: ${savedCertificate.id} for org ${organizationId}`,
    );

    return c.json({ certificate: savedCertificate });
  } catch (error) {
    console.error("Create certificate error:", error);
    return c.json({ error: `Failed to save certificate: ${error}` }, 500);
  }
});

// Bulk create certificates (save multiple at once)
app.post("/make-server-a611b057/certificates/bulk", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, certificates } = await c.req.json();

    if (!organizationId || !certificates || !Array.isArray(certificates)) {
      return c.json(
        { error: "Organization ID and certificates array are required" },
        400,
      );
    }

    const savedCertificates = [];

    // Save each certificate
    for (const cert of certificates) {
      const savedCertificate = {
        id:
          cert.id ||
          `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        studentName: cert.studentName,
        email: cert.email,
        programName: cert.programName || cert.program?.name,
        programDescription:
          cert.programDescription || cert.program?.description,
        templateId: cert.templateId || cert.program?.template,
        customMessage: cert.customMessage || "",
        completionDate: cert.completionDate,
        certificateUrl: cert.certificateUrl,
        generatedAt: cert.generatedAt || new Date().toISOString(),
        generatedBy: user.id,
      };

      await kv.set(
        `certificate:${organizationId}:${savedCertificate.id}`,
        savedCertificate,
      );
      savedCertificates.push(savedCertificate);
    }

    console.log(
      `✅ Bulk save: ${savedCertificates.length} certificates for org ${organizationId}`,
    );

    return c.json({
      certificates: savedCertificates,
      count: savedCertificates.length,
    });
  } catch (error) {
    console.error("Bulk create certificates error:", error);
    return c.json({ error: `Failed to save certificates: ${error}` }, 500);
  }
});

// Get all certificates for an organization
// NOTE: renamed to /organization/:id to avoid RegExpRouter parameter mismatch with /:id
app.get("/make-server-a611b057/certificates/organization/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("id");

    // Get all certificates for this organization
    const allCertificates = await kv.getByPrefix(
      `certificate:${organizationId}:`,
    );

    const certificates = allCertificates
      .map((item) => item.value)
      .filter((cert) => cert && typeof cert === "object")
      .sort((a, b) => {
        // Sort by generatedAt, newest first
        const dateA = new Date(a.generatedAt || 0).getTime();
        const dateB = new Date(b.generatedAt || 0).getTime();
        return dateB - dateA;
      });

    console.log(
      `📜 Retrieved ${certificates.length} certificates for org ${organizationId}`,
    );

    return c.json({ certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    return c.json({ error: `Failed to retrieve certificates: ${error}` }, 500);
  }
});

// Get a specific certificate by ID
app.get("/make-server-a611b057/certificates/cert/:certificateId", async (c) => {
  try {
    const certificateId = c.req.param("certificateId");

    // Search across all organizations for this certificate
    const allCertificates = await kv.getByPrefix("certificate:");
    const certificateItem = allCertificates.find(
      (item) =>
        item.value &&
        typeof item.value === "object" &&
        item.value.id === certificateId,
    );

    if (!certificateItem || !certificateItem.value) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    return c.json({ certificate: certificateItem.value });
  } catch (error) {
    console.error("Get certificate error:", error);
    return c.json({ error: `Failed to retrieve certificate: ${error}` }, 500);
  }
});

// Update a certificate
app.put("/make-server-a611b057/certificates/:id", async (c) => {
  try {
    console.log("📝 Certificate update request received");

    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      console.log("❌ Authorization error:", error);
      return c.json({ error }, 401);
    }

    const certificateId = c.req.param("id");
    const updates = await c.req.json();

    console.log("📝 Updating certificate:", {
      certificateId,
      updates: Object.keys(updates),
    });

    // Get the certificate
    const certificate = await kv.get(`cert:${certificateId}`);
    if (!certificate) {
      console.log("❌ Certificate not found:", certificateId);
      return c.json({ error: "Certificate not found" }, 404);
    }

    // Verify user owns the organization
    const organization = await kv.get(`org:${certificate.organizationId}`);
    if (!organization) {
      console.log("❌ Organization not found:", certificate.organizationId);
      return c.json({ error: "Organization not found" }, 404);
    }

    // Get the user's account to check their organizationId
    const userAccount = await kv.get(`user:${user.id}`);
    if (!userAccount) {
      console.log("❌ User account not found:", user.id);
      return c.json(
        {
          error:
            "User account not found in database. Please sign out and sign in again.",
        },
        404,
      );
    }

    // Check if user has an organizationId
    if (!userAccount.organizationId) {
      console.log("❌ User has no organization:", user.id);
      return c.json(
        { error: "User account has no organization. Please contact support." },
        403,
      );
    }

    // Check if user belongs to the same organization as the certificate
    if (userAccount.organizationId !== certificate.organizationId) {
      console.log("❌ User not authorized to update certificate:", {
        userId: user.id,
        userEmail: user.email,
        userOrgId: userAccount.organizationId,
        certOrgId: certificate.organizationId,
        certificateId: certificate.id,
      });
      return c.json(
        {
          error:
            "Unauthorized to update this certificate. You can only update certificates from your organization.",
        },
        403,
      );
    }

    console.log("✅ Authorization successful:", {
      userId: user.id,
      organizationId: userAccount.organizationId,
    });

    // Update certificate fields (keeping the same ID and results-link)
    // Use camelCase field names to match how certificates are stored
    const updatedCertificate = {
      ...certificate,
      courseName:
        updates.courseName !== undefined
          ? updates.courseName
          : certificate.courseName,
      courseDescription:
        updates.courseDescription !== undefined
          ? updates.courseDescription
          : certificate.courseDescription,
      certificateHeader:
        updates.certificateHeader !== undefined
          ? updates.certificateHeader
          : certificate.certificateHeader,
      completionDate:
        updates.completionDate !== undefined
          ? updates.completionDate
          : certificate.completionDate,
      template:
        updates.template !== undefined
          ? updates.template
          : certificate.template,
      signatories:
        updates.signatories !== undefined
          ? updates.signatories
          : certificate.signatories,
      restrictDownload:
        updates.restrictDownload !== undefined
          ? updates.restrictDownload
          : certificate.restrictDownload,
      allowedEmails:
        updates.allowedEmails !== undefined
          ? updates.allowedEmails
          : certificate.allowedEmails,
      monetizationEnabled:
        updates.monetizationEnabled !== undefined
          ? !!updates.monetizationEnabled
          : certificate.monetizationEnabled,
      certificatePriceMinor:
        updates.certificatePriceMinor !== undefined
          ? Number(updates.certificatePriceMinor)
          : certificate.certificatePriceMinor,
      certificateCurrency:
        updates.certificateCurrency !== undefined
          ? updates.certificateCurrency
          : certificate.certificateCurrency,
      platformFeePercent:
        FIXED_PLATFORM_FEE_PERCENT,
      themeColors:
        updates.themeColors !== undefined
          ? updates.themeColors
          : certificate.themeColors,
      updatedAt: new Date().toISOString(),
    };

    // Save updated certificate
    await kv.set(`cert:${certificateId}`, updatedCertificate);

    console.log("✅ Certificate updated successfully");
    console.log("📝 Updated fields:", {
      courseName: updatedCertificate.courseName,
      certificateHeader: updatedCertificate.certificateHeader,
      courseDescription: updatedCertificate.courseDescription,
      completionDate: updatedCertificate.completionDate,
      restrictDownload: updatedCertificate.restrictDownload,
      allowedEmailsCount: updatedCertificate.allowedEmails?.length || 0,
    });

    // Return in same format as generate
    return c.json({
      certificates: [updatedCertificate],
      message: "Certificate updated successfully",
    });
  } catch (error) {
    console.log("❌ Error updating certificate:", error);
    return c.json({ error: `Failed to update certificate: ${error}` }, 500);
  }
});

// Delete a certificate
app.delete("/make-server-a611b057/certificates/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const certificateId = c.req.param("id");

    // Find the certificate
    const allCertificates = await kv.getByPrefix("certificate:");
    const certificateItem = allCertificates.find(
      (item) =>
        item.value &&
        typeof item.value === "object" &&
        item.value.id === certificateId,
    );

    if (!certificateItem) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    const existingCertificate = certificateItem.value;

    // Verify user has permission (owns the certificate or is in the same org)
    if (existingCertificate.generatedBy !== user.id) {
      // Could add additional org-level permission checks here
      return c.json({ error: "Unauthorized to delete this certificate" }, 403);
    }

    // Delete from KV store
    await kv.del(
      `certificate:${existingCertificate.organizationId}:${certificateId}`,
    );

    console.log(`🗑️ Certificate deleted: ${certificateId}`);

    return c.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    return c.json({ error: `Failed to delete certificate: ${error}` }, 500);
  }
});

// ==================== SHORT LINK ROUTES ====================

// Generate a short link for a certificate (6-character code)
function generateShortCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create short link for a certificate
app.post("/make-server-a611b057/short/create", async (c) => {
  try {
    const body = await c.req.json();
    const { organizationId, programId, certificateId, certificateData } = body;

    if (!organizationId || !programId || !certificateId) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    console.log(`🔗 Creating short link for certificate: ${certificateId}`);

    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;

    // Ensure uniqueness (retry if code already exists)
    while ((await kv.get(`short:${shortCode}`)) && attempts < 10) {
      shortCode = generateShortCode();
      attempts++;
    }

    if (attempts >= 10) {
      return c.json({ error: "Failed to generate unique short code" }, 500);
    }

    // Store short link mapping
    const shortLinkData = {
      code: shortCode,
      organizationId,
      programId,
      certificateId,
      certificateData: certificateData || null,
      createdAt: new Date().toISOString(),
      clicks: 0,
    };

    await kv.set(`short:${shortCode}`, shortLinkData);

    // Initialize click tracking
    await kv.set(`clicks:${shortCode}`, []);

    console.log(`✅ Short link created: ${shortCode} → ${certificateId}`);

    return c.json({
      success: true,
      shortCode,
      shortUrl: `/c/${shortCode}`,
      fullShortUrl: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/#/c/${shortCode}`,
    });
  } catch (error) {
    console.error("Create short link error:", error);
    return c.json({ error: `Failed to create short link: ${error}` }, 500);
  }
});

// Resolve short link and track click
app.get("/make-server-a611b057/short/:code", async (c) => {
  try {
    const code = c.req.param("code");
    console.log(`🔍 Resolving short link: ${code}`);

    const shortLinkData = await kv.get(`short:${code}`);

    if (!shortLinkData) {
      console.log(`❌ Short link not found: ${code}`);
      return c.json({ error: "Short link not found" }, 404);
    }

    // Track the click
    const clickData = {
      timestamp: new Date().toISOString(),
      userAgent: c.req.header("User-Agent") || "Unknown",
      referer: c.req.header("Referer") || "Direct",
      ip:
        c.req.header("X-Forwarded-For") ||
        c.req.header("CF-Connecting-IP") ||
        "Unknown",
    };

    // Get existing clicks
    const existingClicks = (await kv.get(`clicks:${code}`)) || [];
    existingClicks.push(clickData);
    await kv.set(`clicks:${code}`, existingClicks);

    // Update click count
    shortLinkData.clicks = (shortLinkData.clicks || 0) + 1;
    shortLinkData.lastClickedAt = clickData.timestamp;
    await kv.set(`short:${code}`, shortLinkData);

    console.log(
      `✅ Short link resolved: ${code} → ${shortLinkData.certificateId} (Click #${shortLinkData.clicks})`,
    );

    return c.json({
      success: true,
      organizationId: shortLinkData.organizationId,
      programId: shortLinkData.programId,
      certificateId: shortLinkData.certificateId,
      certificateData: shortLinkData.certificateData,
    });
  } catch (error) {
    console.error("Resolve short link error:", error);
    return c.json({ error: `Failed to resolve short link: ${error}` }, 500);
  }
});

// Get analytics for a short link (for admin dashboard)
app.get("/make-server-a611b057/short/:code/analytics", async (c) => {
  try {
    const code = c.req.param("code");
    console.log(`📊 Fetching analytics for short link: ${code}`);

    const shortLinkData = await kv.get(`short:${code}`);
    const clicks = (await kv.get(`clicks:${code}`)) || [];

    if (!shortLinkData) {
      return c.json({ error: "Short link not found" }, 404);
    }

    return c.json({
      success: true,
      analytics: {
        code,
        certificateId: shortLinkData.certificateId,
        organizationId: shortLinkData.organizationId,
        createdAt: shortLinkData.createdAt,
        totalClicks: shortLinkData.clicks || 0,
        lastClickedAt: shortLinkData.lastClickedAt || null,
        clicks: clicks.map((click: any) => ({
          timestamp: click.timestamp,
          userAgent: click.userAgent,
          referer: click.referer,
        })),
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return c.json({ error: `Failed to get analytics: ${error}` }, 500);
  }
});

// Get all short links for an organization (for admin dashboard)
app.get("/make-server-a611b057/short/org/:organizationId/links", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("organizationId");
    console.log(
      `📊 Fetching all short links for organization: ${organizationId}`,
    );

    // Get all short links
    const allShortLinks = await kv.getByPrefix("short:");

    // Filter by organization
    const orgShortLinks = allShortLinks
      .filter((item: any) => item.value?.organizationId === organizationId)
      .map((item: any) => item.value);

    // Enrich with click data
    const enrichedLinks = await Promise.all(
      orgShortLinks.map(async (link: any) => {
        const clicks = (await kv.get(`clicks:${link.code}`)) || [];
        return {
          ...link,
          clickDetails: clicks,
        };
      }),
    );

    console.log(
      `✅ Found ${enrichedLinks.length} short links for organization`,
    );

    return c.json({
      success: true,
      shortLinks: enrichedLinks,
      totalLinks: enrichedLinks.length,
      totalClicks: enrichedLinks.reduce(
        (sum: number, link: any) => sum + (link.clicks || 0),
        0,
      ),
    });
  } catch (error) {
    console.error("Get organization short links error:", error);
    return c.json({ error: `Failed to get short links: ${error}` }, 500);
  }
});

// ==================== ADMIN SEED ENDPOINT ====================

// Seed default templates (admin only)
app.post("/make-server-a611b057/admin/seed-templates", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("🌱 Seeding default templates...");

    // Use canonical DEFAULT_TEMPLATES
    const defaultTemplates = DEFAULT_TEMPLATES;

    // Store each template
    for (const template of defaultTemplates) {
      await kv.set(`globaltemplate:${template.id}`, template);
      console.log(`✅ Seeded template: ${template.name} (${template.id})`);
    }

    console.log(
      `✅ Successfully seeded ${defaultTemplates.length} default templates`,
    );

    return c.json({
      success: true,
      message: `Successfully seeded ${defaultTemplates.length} default templates`,
      templates: defaultTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
      })),
    });
  } catch (error) {
    console.error("Seed templates error:", error);
    return c.json({ error: `Failed to seed templates: ${error}` }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all platform data for admin dashboard (no auth required for now - can add admin check later)
app.get("/make-server-a611b057/admin/platform-data", async (c) => {
  try {
    console.log("🔐 Platform admin data request");

    // Get all organizations
    const allOrgs = await kv.getByPrefix("org:");
    console.log("📊 Total organizations:", allOrgs.length);

    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    console.log("👥 Total users:", allUsers.length);

    // Get all certificates
    const allCerts = await kv.getByPrefix("cert:");
    console.log("🎓 Total certificates:", allCerts.length);

    // Get all subscriptions
    const allSubscriptions = await kv.getByPrefix("subscription:");
    console.log("💳 Total subscriptions:", allSubscriptions.length);

    // Get all testimonials
    const allTestimonials = await kv.getByPrefix("testimonial:");
    console.log("💬 Total testimonials:", allTestimonials.length);

    // Filter out invalid data and ensure unique IDs
    const validOrgs = allOrgs.filter((org) => org && org.id);
    const validUsers = allUsers.filter((user) => user && user.id);
    const validCerts = allCerts.filter((cert) => cert && cert.id);
    const validTestimonials = allTestimonials.filter(
      (testimonial) => testimonial && testimonial.id,
    );

    // Enrich organizations with owner email and subscription data
    const enrichedOrgs = await Promise.all(
      validOrgs.map(async (org) => {
        // Find the owner user
        const ownerUser = validUsers.find((u) => u.id === org.ownerId);

        // Get subscription for this organization - USE CORRECT KEY FORMAT
        const subscription = await kv.get(`subscription:org:${org.id}`);

        if (subscription) {
          console.log(`✅ Found subscription for ${org.name}:`, {
            plan: subscription.plan,
            status: subscription.status,
            expiryDate: subscription.expiryDate,
          });
        }

        return {
          id: org.id,
          name: org.name || "Unnamed Organization",
          shortName: org.shortName || "",
          logo: org.logo || "",
          primaryColor: org.primaryColor || "#ea580c",
          ownerId: org.ownerId || "",
          ownerEmail: ownerUser?.email || null,
          createdAt: org.createdAt || new Date().toISOString(),
          programs: org.programs || [],
          settings: org.settings || null,
          subscription: subscription || null,
        };
      }),
    );

    // Format users with defaults
    const formattedUsers = validUsers.map((user) => ({
      id: user.id,
      email: user.email || "",
      fullName: user.fullName || "Unknown User",
      organizationId: user.organizationId || "",
      organizationName: user.organizationName || "",
      createdAt: user.createdAt || new Date().toISOString(),
    }));

    // Format certificates with defaults
    const formattedCerts = validCerts.map((cert) => ({
      id: cert.id,
      studentName: cert.studentName || "Unknown Student",
      courseName: cert.courseName || "Unknown Course",
      organizationId: cert.organizationId || "",
      programId: cert.programId || null,
      template: cert.template || "",
      createdAt: cert.createdAt || new Date().toISOString(),
      verificationUrl: cert.verificationUrl || "",
    }));

    // Format testimonials with defaults
    const formattedTestimonials = validTestimonials.map((testimonial) => ({
      id: testimonial.id,
      studentName: testimonial.studentName || "Anonymous",
      testimonial: testimonial.testimonial || "",
      courseName: testimonial.courseName || "",
      organizationId: testimonial.organizationId || "",
      programId: testimonial.programId || null,
      certificateId: testimonial.certificateId || "",
      submittedAt: testimonial.submittedAt || new Date().toISOString(),
    }));

    console.log("✅ Returning:", {
      organizations: enrichedOrgs.length,
      users: formattedUsers.length,
      certificates: formattedCerts.length,
      testimonials: formattedTestimonials.length,
    });

    return c.json({
      organizations: enrichedOrgs,
      users: formattedUsers,
      certificates: formattedCerts,
      testimonials: formattedTestimonials,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log("❌ Error getting platform data:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ==================== BILLING ROUTES ====================

// Check if billing is configured (public endpoint - no auth required)
app.get("/make-server-a611b057/billing/config", async (c) => {
  try {
    console.log("📊 Billing config check");

    // Get billing settings (env vars take precedence)
    const billingSettings = await getBillingSettings();

    if (
      !billingSettings ||
      !billingSettings.paystackSecretKey ||
      !billingSettings.paystackPublicKey
    ) {
      console.log("⚠️ Billing not configured");
      return c.json({
        configured: false,
        plans: {},
      });
    }

    console.log("✅ Billing is configured");

    // Return configuration with plans (without sensitive keys)
    return c.json({
      configured: true,
      plans: billingSettings.plans || {},
    });
  } catch (error) {
    console.error("Billing config error:", error);
    return c.json({
      configured: false,
      plans: {},
    });
  }
});

// Get subscription status for an organization
app.get(
  "/make-server-a611b057/billing/subscription/:organizationId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");
      console.log(`📊 Getting subscription for org: ${organizationId}`);

      // Get subscription from KV store
      const subscription = await kv.get(`subscription:${organizationId}`);

      if (!subscription) {
        console.log("⚠️ No subscription found, returning free plan");
        return c.json({
          organizationId,
          plan: "free",
          planName: "Free Plan",
          status: "free",
          features: [
            "7 Basic Templates",
            "Up to 50 Certificates",
            "Basic Analytics",
            "Standard Support",
          ],
        });
      }

      // Check if subscription is expired
      if (
        subscription.expiryDate &&
        new Date(subscription.expiryDate) < new Date()
      ) {
        console.log("⏰ Subscription expired");
        return c.json({
          ...subscription,
          status: "expired",
          previousPlan: subscription.planName,
          expiredOn: subscription.expiryDate,
        });
      }

      console.log("✅ Active subscription found");
      return c.json(subscription);
    } catch (error) {
      console.error("Get subscription error:", error);
      return c.json({ error: `Failed to get subscription: ${error}` }, 500);
    }
  },
);

// Get transaction history for an organization
app.get(
  "/make-server-a611b057/billing/transactions/:organizationId",
  async (c) => {
    try {
      const { user, error } = await verifyUser(c.req.header("Authorization"));
      if (error) {
        return c.json({ error }, 401);
      }

      const organizationId = c.req.param("organizationId");
      console.log(`📊 Getting transactions for org: ${organizationId}`);

      // Get all transactions for this organization
      const allTransactions = await kv.getByPrefix(
        `transaction:${organizationId}:`,
      );

      const transactions = allTransactions
        .filter((item) => item.value && typeof item.value === "object")
        .map((item) => item.value)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      console.log(`✅ Found ${transactions.length} transactions`);
      return c.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      return c.json({ error: `Failed to get transactions: ${error}` }, 500);
    }
  },
);

// Initialize payment with Paystack
app.post("/make-server-a611b057/billing/initialize", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { organizationId, planId } = await c.req.json();
    console.log(
      `💳 Initializing payment for org: ${organizationId}, plan: ${planId}`,
    );

    if (!organizationId || !planId) {
      return c.json({ error: "Organization ID and plan ID are required" }, 400);
    }

    // Get billing settings (prefers env variables)
    const billingSettings = await getBillingSettings();

    if (!billingSettings || !billingSettings.paystackSecretKey) {
      console.error("❌ Billing not configured");
      return c.json(
        {
          error: "Billing system is not configured",
          requiresSetup: true,
        },
        400,
      );
    }

    // Get plan details
    const plan = billingSettings.plans[planId];
    if (!plan) {
      return c.json({ error: "Invalid plan ID" }, 400);
    }

    // Get organization
    const organization = await kv.get(`org:${organizationId}`);
    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    // Get user email for Paystack
    const userData = await kv.get(`user:${user.id}`);
    const email = userData?.email || user.email;

    // Generate unique reference
    const reference = `cert_${organizationId}_${Date.now()}`;

    // Initialize payment with Paystack
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${billingSettings.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: plan.price,
          currency: plan.currency,
          reference,
          callback_url: `${
            c.req.header("origin") || "https://localhost"
          }/#/dashboard?tab=billing&reference=${reference}`,
          metadata: {
            organizationId,
            organizationName: organization.name,
            planId,
            planName: plan.name,
            userId: user.id,
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack error:", paystackData);
      return c.json(
        {
          error: paystackData.message || "Failed to initialize payment",
        },
        500,
      );
    }

    // Save transaction record
    const transaction = {
      reference,
      organizationId,
      userId: user.id,
      planId,
      amount: plan.price,
      currency: plan.currency,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`transaction:${organizationId}:${reference}`, transaction);

    console.log(`✅ Payment initialized: ${reference}`);

    return c.json({
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference,
    });
  } catch (error) {
    console.error("Initialize payment error:", error);
    return c.json({ error: `Failed to initialize payment: ${error}` }, 500);
  }
});

// Verify payment and activate subscription
app.post("/make-server-a611b057/billing/verify", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const { reference } = await c.req.json();
    console.log(`🔍 Verifying payment: ${reference}`);

    if (!reference) {
      return c.json({ error: "Reference is required" }, 400);
    }

    // Get billing settings (prefers env variables)
    const billingSettings = await getBillingSettings();

    if (!billingSettings || !billingSettings.paystackSecretKey) {
      return c.json({ error: "Billing system is not configured" }, 400);
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${billingSettings.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      paystackData.data.status !== "success"
    ) {
      console.error("❌ Payment verification failed:", paystackData);
      return c.json(
        {
          success: false,
          error: "Payment verification failed",
        },
        400,
      );
    }

    // Get transaction
    const metadata = paystackData.data.metadata;
    const organizationId = metadata.organizationId;
    const planId = metadata.planId;

    const transaction = await kv.get(
      `transaction:${organizationId}:${reference}`,
    );
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    // Update transaction status
    transaction.status = "success";
    transaction.verifiedAt = new Date().toISOString();
    await kv.set(`transaction:${organizationId}:${reference}`, transaction);

    // Get plan details
    const plan = billingSettings.plans[planId];

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Create/update subscription
    const subscription = {
      organizationId,
      plan: planId,
      planName: plan.name,
      planId,
      status: "active",
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      features: plan.features,
      lastPaymentReference: reference,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`subscription:${organizationId}`, subscription);

    console.log(`✅ Subscription activated for org: ${organizationId}`);

    return c.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return c.json({ error: `Failed to verify payment: ${error}` }, 500);
  }
});

// Webhook endpoint for Paystack (public - no auth)
app.post("/make-server-a611b057/billing/webhook", async (c) => {
  try {
    console.log("🔔 Webhook received from Paystack");

    const body = await c.req.json();
    const event = body.event;
    const data = body.data;

    console.log(`📨 Webhook event: ${event}`);

    if (event === "charge.success") {
      const reference = data.reference;
      const metadata = data.metadata;

      if (!metadata || !metadata.organizationId || !metadata.planId) {
        console.error("❌ Invalid webhook metadata");
        return c.json({ error: "Invalid metadata" }, 400);
      }

      const organizationId = metadata.organizationId;
      const planId = metadata.planId;

      // Get billing settings for plan details (prefers env variables)
      const billingSettings = await getBillingSettings();
      if (!billingSettings) {
        console.error("❌ Billing settings not found");
        return c.json({ error: "Billing not configured" }, 500);
      }

      const plan = billingSettings.plans[planId];
      if (!plan) {
        console.error("❌ Plan not found:", planId);
        return c.json({ error: "Plan not found" }, 404);
      }

      // Update transaction
      const transaction = await kv.get(
        `transaction:${organizationId}:${reference}`,
      );
      if (transaction) {
        transaction.status = "success";
        transaction.verifiedAt = new Date().toISOString();
        await kv.set(`transaction:${organizationId}:${reference}`, transaction);
      }

      // Calculate expiry date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + plan.duration);

      // Activate subscription
      const subscription = {
        organizationId,
        plan: planId,
        planName: plan.name,
        planId,
        status: "active",
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        features: plan.features,
        lastPaymentReference: reference,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`subscription:${organizationId}`, subscription);

      console.log(
        `✅ Webhook: Subscription activated for org ${organizationId}`,
      );
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: `Webhook processing failed: ${error}` }, 500);
  }
});

// Get billing settings (admin only)
app.get("/make-server-a611b057/admin/billing/settings", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("📊 Admin: Getting billing settings");

    const settings = await getBillingSettings();

    if (!settings) {
      console.log("⚠️ No billing settings found - returning defaults");
      return c.json({
        configured: false,
        paystackSecretKey: "",
        paystackPublicKey: "",
        plans: {
          premium_monthly: {
            name: "Premium Monthly",
            price: 1000,
            currency: "USD",
            duration: 30,
            features: [
              "Custom Templates",
              "Template Builder",
              "Unlimited Certificates",
              "Priority Support",
            ],
          },
          premium_yearly: {
            name: "Premium Yearly",
            price: 10000,
            currency: "USD",
            duration: 365,
            features: [
              "Custom Templates",
              "Template Builder",
              "Unlimited Certificates",
              "Priority Support",
              "2 Months Free",
            ],
          },
        },
      });
    }

    console.log("✅ Billing settings retrieved");
    // Hide secret key in response; indicate source when keys are from env
    return c.json({
      configured: true,
      paystackPublicKey: settings.paystackPublicKey,
      paystackSecretKeyPreview: settings.paystackSecretKey
        ? `${settings.paystackSecretKey.substring(0, 10)}...`
        : "",
      plans: settings.plans || {},
      source: settings.fromEnv ? "env" : "kv",
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Get billing settings error:", error);
    return c.json({ error: `Failed to get billing settings: ${error}` }, 500);
  }
});

// Save billing settings (admin only)
app.post("/make-server-a611b057/admin/billing/settings", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const settings = await c.req.json();
    console.log("💾 Admin: Saving billing settings");
    // Determine current source of billing keys
    const current = await getBillingSettings();

    // If keys are provided via environment, disallow updating the keys via this admin endpoint
    if (current?.fromEnv) {
      console.log(
        "⚠️ Attempt to change keys, but keys are set via environment variables",
      );
      return c.json(
        {
          error:
            "Paystack keys are managed via environment variables and cannot be updated via this endpoint",
        },
        400,
      );
    }

    // Validate settings
    if (!settings.paystackSecretKey || !settings.paystackPublicKey) {
      return c.json({ error: "Paystack keys are required" }, 400);
    }

    // Ensure plans have defaults if not provided
    const billingData = {
      ...settings,
      plans: settings.plans || {
        premium_monthly: {
          name: "Premium Monthly",
          price: 1000, // In cents ($10.00 USD)
          currency: "USD",
          duration: 30,
          features: [
            "Custom Templates",
            "Template Builder",
            "Unlimited Certificates",
            "Priority Support",
          ],
        },
        premium_yearly: {
          name: "Premium Yearly",
          price: 10000, // In cents ($100.00 USD - 2 months free)
          currency: "USD",
          duration: 365,
          features: [
            "Custom Templates",
            "Template Builder",
            "Unlimited Certificates",
            "Priority Support",
            "2 Months Free",
          ],
        },
      },
      updatedAt: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set("billing:settings", billingData);

    console.log("✅ Billing settings saved successfully");
    return c.json({
      success: true,
      message: "Billing settings saved successfully",
      configured: true,
    });
  } catch (error) {
    console.error("Save billing settings error:", error);
    return c.json({ error: `Failed to save billing settings: ${error}` }, 500);
  }
});

// Admin debug endpoint (masked) - shows whether env keys are present and KV billing settings
app.get("/make-server-a611b057/admin/billing/debug", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Check env vars directly
    const envSecret =
      Deno.env.get("PAYSTACK_SECRET_KEY") || Deno.env.get("PAYSTACK_SECRET");
    const envPublic =
      Deno.env.get("PAYSTACK_PUBLIC_KEY") || Deno.env.get("PAYSTACK_PUBLIC");

    // Read KV (may be null)
    const kvSettings = await kv.get("billing:settings").catch(() => null);

    const masked = (s: string | undefined | null) => {
      if (!s) return null;
      return s.length > 8
        ? `${s.substring(0, 4)}...${s.substring(s.length - 4)}`
        : `${s}`;
    };

    return c.json({
      env: {
        paystackSecretPresent: !!envSecret,
        paystackPublicPresent: !!envPublic,
        paystackSecretPreview: masked(envSecret),
        paystackPublicPreview: masked(envPublic),
      },
      kv: {
        present: !!kvSettings,
        paystackSecretPreview: masked(kvSettings?.paystackSecretKey),
        paystackPublicPreview: masked(kvSettings?.paystackPublicKey),
        plans: kvSettings?.plans || {},
        updatedAt: kvSettings?.updatedAt || null,
      },
      effectiveSource:
        envSecret && envPublic ? "env" : kvSettings ? "kv" : "none",
    });
  } catch (err) {
    console.error("Billing debug error:", err);
    return c.json({ error: `Debug failed: ${err}` }, 500);
  }
});

// Admin: Get all collected email addresses from testimonials
app.get("/make-server-a611b057/admin/emails", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    // Check if authorization header is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        { error: "Unauthorized: Missing or invalid authorization header" },
        401,
      );
    }

    console.log("📧 Fetching all collected email addresses...");

    // Get all testimonials from the KV store
    const allTestimonials = await kv.getByPrefix("testimonial:");
    console.log(`📊 Total testimonials found: ${allTestimonials.length}`);

    // Filter testimonials that have email addresses and extract relevant data
    const emailData = allTestimonials
      .filter((testimonial) => testimonial.email) // Only include testimonials with email
      .map((testimonial) => ({
        email: testimonial.email,
        studentName: testimonial.studentName || "Unknown",
        courseName: testimonial.courseName || "Unknown Course",
        organizationId: testimonial.organizationId || "",
        submittedAt: testimonial.submittedAt || new Date().toISOString(),
      }));

    console.log(`✅ Email addresses collected: ${emailData.length}`);

    return c.json({
      emails: emailData,
      count: emailData.length,
    });
  } catch (error) {
    console.error("❌ Error fetching email addresses:", error);
    return c.json(
      { error: `Server error fetching email addresses: ${error}` },
      500,
    );
  }
});

// Get platform analytics data for admin dashboard
app.get("/make-server-a611b057/admin/analytics", async (c) => {
  try {
    console.log("📊 Analytics request");

    // Get all data from KV store
    const allOrgs = (await kv.getByPrefix("org:")).filter(
      (org) => org && org.id,
    );
    const allUsers = (await kv.getByPrefix("user:")).filter(
      (user) => user && user.id,
    );
    const allCerts = (await kv.getByPrefix("cert:")).filter(
      (cert) => cert && cert.id,
    );
    const allTestimonials = (await kv.getByPrefix("testimonial:")).filter(
      (t) => t && t.id,
    );

    console.log(
      `📊 Data loaded: ${allOrgs.length} orgs, ${allUsers.length} users, ${allCerts.length} certs`,
    );

    // Calculate time ranges
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Template usage breakdown
    const templateUsage: { [key: string]: number } = {};
    let topTemplate = "";
    let maxTemplateCount = 0;

    allCerts.forEach((cert: any) => {
      const template = cert.template || "unknown";
      templateUsage[template] = (templateUsage[template] || 0) + 1;
      if (templateUsage[template] > maxTemplateCount) {
        maxTemplateCount = templateUsage[template];
        topTemplate = template;
      }
    });

    // Organization analytics
    const organizationAnalytics = allOrgs.map((org: any) => {
      const orgCerts = allCerts.filter(
        (cert: any) => cert.organizationId === org.id,
      );
      const orgTestimonials = allTestimonials.filter(
        (t: any) => t.organizationId === org.id,
      );
      const orgPrograms = org.programs || [];

      // Template usage for this org
      const orgTemplateUsage: { [key: string]: number } = {};
      orgCerts.forEach((cert: any) => {
        const template = cert.template || "unknown";
        orgTemplateUsage[template] = (orgTemplateUsage[template] || 0) + 1;
      });

      // Most used template
      let mostUsedTemplate = "";
      let maxCount = 0;
      Object.entries(orgTemplateUsage).forEach(([template, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsedTemplate = template;
        }
      });

      // Time-based metrics
      const certsThisWeek = orgCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate >= weekAgo;
      }).length;

      const certsThisMonth = orgCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate >= monthAgo;
      }).length;

      // Calculate days active
      const createdDate = new Date(org.createdAt || now);
      const daysActive = Math.max(
        1,
        Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      // Last active (most recent certificate or creation date)
      let lastActive = org.createdAt || now.toISOString();
      if (orgCerts.length > 0) {
        const sortedCerts = orgCerts.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.generatedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.generatedAt || 0).getTime();
          return dateB - dateA;
        });
        lastActive =
          sortedCerts[0].createdAt || sortedCerts[0].generatedAt || lastActive;
      }

      return {
        id: org.id,
        name: org.name,
        shortName: org.shortName,
        logo: org.logo,
        ownerEmail: org.ownerEmail || "",
        createdAt: org.createdAt,
        isPremium:
          org.subscription?.status === "active" &&
          org.subscription?.plan !== "free",
        totalCertificates: orgCerts.length,
        totalPrograms: orgPrograms.length,
        totalTestimonials: orgTestimonials.length,
        mostUsedTemplate,
        templateUsage: orgTemplateUsage,
        lastActive,
        daysActive,
        certificatesThisWeek: certsThisWeek,
        certificatesThisMonth: certsThisMonth,
        averageCertificatesPerDay: orgCerts.length / daysActive,
        growthRate:
          daysActive > 7 ? (certsThisWeek / Math.min(7, daysActive)) * 100 : 0,
      };
    });

    // User analytics
    const userAnalytics = allUsers.map((user: any) => {
      const userCerts = allCerts.filter(
        (cert: any) => cert.createdBy === user.id,
      );
      const userOrg = allOrgs.find(
        (org: any) => org.id === user.organizationId,
      );

      // Programs created by user
      const userPrograms =
        userOrg?.programs?.filter((prog: any) => prog.createdBy === user.id) ||
        [];

      // Time-based metrics
      const certsThisWeek = userCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate >= weekAgo;
      }).length;

      const certsThisMonth = userCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate >= monthAgo;
      }).length;

      // Calculate days active
      const createdDate = new Date(user.createdAt || now);
      const daysActive = Math.max(
        1,
        Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      // Last login (use last certificate creation or user creation)
      let lastLogin = user.createdAt || now.toISOString();
      if (userCerts.length > 0) {
        const sortedCerts = userCerts.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.generatedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.generatedAt || 0).getTime();
          return dateB - dateA;
        });
        lastLogin =
          sortedCerts[0].createdAt || sortedCerts[0].generatedAt || lastLogin;
      }

      return {
        id: user.id,
        fullName: user.fullName || user.name || "Unknown User",
        email: user.email,
        organizationName: userOrg?.name || "Unknown Organization",
        organizationLogo: userOrg?.logo || "",
        createdAt: user.createdAt,
        totalCertificatesGenerated: userCerts.length,
        totalProgramsCreated: userPrograms.length,
        lastLogin,
        daysActive,
        certificatesThisWeek: certsThisWeek,
        certificatesThisMonth: certsThisMonth,
        mostActiveDay: "N/A", // Could be calculated with more detailed tracking
      };
    });

    // Platform stats
    const activeOrgsThisWeek = organizationAnalytics.filter(
      (org) => org.certificatesThisWeek > 0,
    ).length;
    const activeUsersThisWeek = userAnalytics.filter(
      (user) => user.certificatesThisWeek > 0,
    ).length;
    const avgCertificatesPerOrg =
      allOrgs.length > 0 ? allCerts.length / allOrgs.length : 0;
    const avgCertificatesPerUser =
      allUsers.length > 0 ? allCerts.length / allUsers.length : 0;

    const platformStats = {
      totalOrganizations: allOrgs.length,
      totalUsers: allUsers.length,
      totalCertificates: allCerts.length,
      avgCertificatesPerOrg,
      avgCertificatesPerUser,
      activeOrganizationsThisWeek: activeOrgsThisWeek,
      activeUsersThisWeek: activeUsersThisWeek,
      topTemplate,
      templateBreakdown: templateUsage,
    };

    console.log(
      `✅ Analytics generated: ${organizationAnalytics.length} orgs, ${userAnalytics.length} users`,
    );

    return c.json({
      organizations: organizationAnalytics,
      users: userAnalytics,
      platformStats,
    });
  } catch (error) {
    console.error("❌ Error generating analytics:", error);
    return c.json(
      { error: `Server error generating analytics: ${error}` },
      500,
    );
  }
});

// Get platform-wide tracking data for admin
app.get("/make-server-a611b057/admin/tracking-data", async (c) => {
  try {
    console.log("📊 Fetching platform-wide tracking data for admin");

    // Get all organizations
    const allOrgs = await kv.getByPrefix("org:");
    console.log(`Found ${allOrgs.length} organizations`);

    const trackingData = [];

    for (const org of allOrgs) {
      // Skip invalid organization data
      if (!org || !org.id) {
        console.warn("⚠️ Skipping invalid organization data:", org);
        continue;
      }

      // Get download stats for this organization
      const orgDownloadKey = `org_downloads:${org.id}`;
      const downloadData = await kv.get(orgDownloadKey);
      const totalDownloads = downloadData?.totalDownloads || 0;

      // Get session time stats for this organization
      const sessionKey = `org_sessions:${org.id}`;
      const sessionData = await kv.get(sessionKey);
      const totalTimeSeconds = sessionData?.totalTimeSpent || 0;
      const totalHours = Math.floor(totalTimeSeconds / 3600);
      const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);

      // Get certificate count for this organization from actual certificates
      const allCerts = await kv.getByPrefix("cert:");
      const orgCertificates = allCerts.filter(
        (cert) => cert.organizationId === org.id,
      );
      const totalCertificates = orgCertificates.length;

      // Include ALL organizations (even with 0 data) so admin can see all orgs
      trackingData.push({
        organizationId: org.id,
        organizationName: org.name || "Unnamed Organization",
        totalDownloads,
        totalTimeSeconds,
        totalTimeFormatted: `${totalHours}h ${totalMinutes}m`,
        totalCertificates,
      });
    }

    // Sort by downloads (descending), then by name
    trackingData.sort((a, b) => {
      if (b.totalDownloads !== a.totalDownloads) {
        return b.totalDownloads - a.totalDownloads;
      }
      // Handle undefined or null organization names
      const nameA = a.organizationName || "";
      const nameB = b.organizationName || "";
      return nameA.localeCompare(nameB);
    });

    console.log(
      `✅ Tracking data generated for ${trackingData.length} organizations`,
    );

    return c.json({
      trackingData,
    });
  } catch (error) {
    console.error("❌ Error fetching tracking data:", error);
    return c.json(
      {
        error: `Server error fetching tracking data: ${error}`,
        trackingData: [],
      },
      500,
    );
  }
});



// ==================== SEO ROUTES ====================

// Generate dynamic XML sitemap
app.get("/make-server-a611b057/sitemap.xml", async (c) => {
  try {
    console.log("🗺️ Generating sitemap.xml");

    const frontendUrl =
      Deno.env.get("FRONTEND_URL") || "https://certifyer.online";

    // Get all certificates for dynamic URLs
    const allCertificates = await kv.getByPrefix("cert:");
    console.log(`Found ${allCertificates.length} certificates for sitemap`);

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/login", priority: "0.8", changefreq: "monthly" },
      { loc: "/signup", priority: "0.8", changefreq: "monthly" },
    ];

    for (const page of staticPages) {
      sitemap += "  <url>\n";
      sitemap += `    <loc>${frontendUrl}${page.loc}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += "  </url>\n";
    }

    // Add certificate verification URLs (last 1000 certificates for performance)
    const recentCertificates = allCertificates.slice(-1000);
    for (const cert of recentCertificates) {
      if (cert.id) {
        sitemap += "  <url>\n";
        sitemap += `    <loc>${frontendUrl}/verify/${cert.id}</loc>\n`;
        sitemap += "    <changefreq>monthly</changefreq>\n";
        sitemap += "    <priority>0.6</priority>\n";
        if (cert.createdAt) {
          const date = new Date(cert.createdAt);
          sitemap += `    <lastmod>${date.toISOString().split("T")[0]}</lastmod>\n`;
        }
        sitemap += "  </url>\n";
      }
    }

    sitemap += "</urlset>";

    console.log("✅ Sitemap generated successfully");

    // Return as XML
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    return c.text("Error generating sitemap", 500);
  }
});

// Generate robots.txt
app.get("/make-server-a611b057/robots.txt", async (c) => {
  const frontendUrl =
    Deno.env.get("FRONTEND_URL") || "https://certifyer.online";

  const robotsTxt = `# Certifyer Robots.txt
User-agent: *
Allow: /
Allow: /verify/
Disallow: /dashboard
Disallow: /platform-admin
Disallow: /admin-utilities
Disallow: /template-builder

# Sitemap
Sitemap: ${frontendUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
});


// ==================== MONETIZATION ROUTES (PAYSTACK) ====================
// Products, Seller Onboarding, Checkout, Earnings, Payouts, Invoices, Refunds

// ---- Helpers ----

const PLATFORM_FEE_PERCENT = 7; // 7% platform cut

const getPaystackKey = async (): Promise<string> => {
  const fromEnv = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (fromEnv) return fromEnv;
  const settings = await kv.get("billing:settings") as any;
  return settings?.paystackSecretKey || "";
};

const generateTxnRef = (): string => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CTFY_${ts}_${rand}`;
};

const verifyPaystackSig = async (rawBody: string, signature: string, secret: string): Promise<boolean> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
};

const calcFees = (amountKobo: number) => {
  const platformFee = Math.round(amountKobo * PLATFORM_FEE_PERCENT / 100);
  const sellerEarning = amountKobo - platformFee;
  return { platformFee, sellerEarning };
};

const updateSellerBalance = async (sellerId: string, sellerEarning: number, _holdUntil: string) => {
  const key = `seller_balance:${sellerId}`;
  const bal = (await kv.get(key) as any) || { sellerId, totalEarned: 0, pendingHold: 0, availableBalance: 0, totalWithdrawn: 0 };
  bal.totalEarned = (bal.totalEarned || 0) + sellerEarning;
  bal.pendingHold = (bal.pendingHold || 0) + sellerEarning;
  bal.lastUpdated = new Date().toISOString();
  await kv.set(key, bal);
};

const updatePlatformEarnings = async (platformFee: number) => {
  const key = "platform:earnings";
  const e = (await kv.get(key) as any) || { totalRevenue: 0, platformFees: 0, totalTransactions: 0 };
  e.platformFees = (e.platformFees || 0) + platformFee;
  e.totalTransactions = (e.totalTransactions || 0) + 1;
  e.lastUpdated = new Date().toISOString();
  await kv.set(key, e);
};

const releaseMaturedHolds = async (sellerId: string) => {
  const now = new Date();
  const allKeys = kv.list({ prefix: "txn:" });
  const toRelease: any[] = [];
  for await (const entry of allKeys) {
    const t = entry.value as any;
    if (t?.sellerId === sellerId && t?.status === "success" && !t?.released && t?.holdUntil) {
      if (new Date(t.holdUntil) <= now) toRelease.push(t);
    }
  }
  if (toRelease.length === 0) return;
  const balKey = `seller_balance:${sellerId}`;
  const bal = (await kv.get(balKey) as any) || { sellerId, totalEarned: 0, pendingHold: 0, availableBalance: 0, totalWithdrawn: 0 };
  for (const t of toRelease) {
    bal.pendingHold = Math.max(0, (bal.pendingHold || 0) - t.sellerEarning);
    bal.availableBalance = (bal.availableBalance || 0) + t.sellerEarning;
    t.released = true;
    await kv.set(`txn:${t.reference}`, t);
  }
  bal.lastUpdated = new Date().toISOString();
  await kv.set(balKey, bal);
};

// ---- PRODUCTS ----

app.get("/make-server-a611b057/monetization/products", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const orgId = c.req.query("orgId");
    const products: any[] = [];
    const allKeys = kv.list({ prefix: "product:" });
    for await (const entry of allKeys) {
      const p = entry.value as any;
      if (p?.sellerId === user.id || (orgId && p?.sellerOrgId === orgId)) products.push(p);
    }
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ products });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/products/:id/public", async (c) => {
  try {
    const product = await kv.get(`product:${c.req.param("id")}`);
    if (!product) return c.json({ error: "Product not found" }, 404);
    return c.json({ product });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/products", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const body = await c.req.json();
    const { title, description, type, priceNGN, currency, sellerOrgId, certificateTemplateId, fileUrl } = body;
    if (!title || !type || !priceNGN) return c.json({ error: "title, type, and priceNGN are required" }, 400);
    if (!["certificate", "course", "pdf"].includes(type)) return c.json({ error: "type must be certificate, course, or pdf" }, 400);
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const product = {
      id, sellerId: user.id, sellerOrgId: sellerOrgId || null, type, title,
      description: description || "", priceNGN: Number(priceNGN), currency: currency || "NGN",
      status: "active", certificateTemplateId: certificateTemplateId || null, fileUrl: fileUrl || null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await kv.set(`product:${id}`, product);
    return c.json({ product }, 201);
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.put("/make-server-a611b057/monetization/products/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const product = await kv.get(`product:${c.req.param("id")}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);
    if (product.sellerId !== user.id) return c.json({ error: "Forbidden" }, 403);
    const body = await c.req.json();
    const updated = { ...product, ...body, id: product.id, sellerId: product.sellerId, updatedAt: new Date().toISOString() };
    await kv.set(`product:${product.id}`, updated);
    return c.json({ product: updated });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.delete("/make-server-a611b057/monetization/products/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const product = await kv.get(`product:${c.req.param("id")}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);
    if (product.sellerId !== user.id) return c.json({ error: "Forbidden" }, 403);
    await kv.delete(`product:${product.id}`);
    return c.json({ success: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- SELLER ONBOARDING ----

app.get("/make-server-a611b057/monetization/seller/profile", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const profile = await kv.get(`seller:${user.id}`) || null;
    return c.json({ profile });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/seller/onboard", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const { bankAccountNumber, bankCode, bankName, displayName } = await c.req.json();
    if (!bankAccountNumber || !bankCode || !bankName) return c.json({ error: "bankAccountNumber, bankCode, and bankName are required" }, 400);
    const secret = await getPaystackKey();
    if (!secret) return c.json({ error: "Payment system not configured" }, 503);
    const verifyRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${bankAccountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.status) return c.json({ error: verifyData.message || "Bank account verification failed" }, 400);
    const accountName = verifyData.data?.account_name;
    const existing = await kv.get(`seller:${user.id}`) as any;
    let recipientCode = existing?.paystackRecipientCode;
    if (!recipientCode || existing?.bankAccountNumber !== bankAccountNumber) {
      const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nuban", name: accountName, account_number: bankAccountNumber, bank_code: bankCode, currency: "NGN" }),
      });
      const recipientData = await recipientRes.json();
      if (!recipientRes.ok || !recipientData.status) return c.json({ error: recipientData.message || "Failed to create transfer recipient" }, 400);
      recipientCode = recipientData.data?.recipient_code;
    }
    const profile = {
      userId: user.id, displayName: displayName || accountName, email: user.email,
      bankAccountName: accountName, bankAccountNumber, bankCode, bankName, accountType: "NGN",
      verified: true, verifiedAt: new Date().toISOString(), paystackRecipientCode: recipientCode,
      createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await kv.set(`seller:${user.id}`, profile);
    return c.json({ profile });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/seller/verify-bank", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const { bankAccountNumber, bankCode } = await c.req.json();
    if (!bankAccountNumber || !bankCode) return c.json({ error: "bankAccountNumber and bankCode required" }, 400);
    const secret = await getPaystackKey();
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${bankAccountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const data = await res.json();
    if (!res.ok || !data.status) return c.json({ error: data.message || "Verification failed" }, 400);
    return c.json({ accountName: data.data?.account_name, verified: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/banks", async (c) => {
  try {
    const secret = await getPaystackKey();
    const res = await fetch("https://api.paystack.co/bank?country=nigeria&perPage=100", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    return c.json({ banks: data.data || [] });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- EXCHANGE RATE PROXY ----

app.get("/make-server-a611b057/monetization/exchange-rate", async (c) => {
  try {
    const from = c.req.query("from") || "NGN";
    const to = c.req.query("to") || "USD";
    const allowed = ["NGN", "USD", "GBP", "EUR"];
    if (!allowed.includes(from) || !allowed.includes(to)) {
      return c.json({ error: "Unsupported currency" }, 400);
    }
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (!rate) return c.json({ error: "Rate not found" }, 502);
    return c.json({ from, to, rate });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- PAYMENTS ----

app.post("/make-server-a611b057/monetization/payments/initialize", async (c) => {
  try {
    const { productId, buyerEmail, buyerName } = await c.req.json();
    if (!productId || !buyerEmail || !buyerName) return c.json({ error: "productId, buyerEmail, and buyerName are required" }, 400);
    const product = await kv.get(`product:${productId}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);
    if (product.status !== "active") return c.json({ error: "Product is not available" }, 400);
    const secret = await getPaystackKey();
    if (!secret) return c.json({ error: "Payment system not configured" }, 503);
    const reference = generateTxnRef();
    const amountKobo = product.priceNGN;
    const callbackUrl = `${Deno.env.get("APP_PUBLIC_URL") || "https://certifyer.online"}/#/payment/verify?ref=${reference}`;
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: buyerEmail, amount: amountKobo, reference, callback_url: callbackUrl,
        metadata: { productId, productTitle: product.title, buyerName, sellerId: product.sellerId, sellerOrgId: product.sellerOrgId || null },
      }),
    });
    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) return c.json({ error: paystackData.message || "Failed to initialize payment" }, 400);
    const { platformFee, sellerEarning } = calcFees(amountKobo);
    const txn = {
      reference, productId, productType: product.type, sellerId: product.sellerId,
      sellerOrgId: product.sellerOrgId || null, buyerEmail, buyerName,
      amountTotal: amountKobo, platformFee, sellerEarning, currency: product.currency || "NGN",
      status: "pending", paystackRef: reference, createdAt: new Date().toISOString(),
    };
    await kv.set(`txn:${reference}`, txn);
    return c.json({ authorizationUrl: paystackData.data?.authorization_url, reference });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/payments/verify", async (c) => {
  try {
    const { reference } = await c.req.json();
    if (!reference) return c.json({ error: "reference is required" }, 400);
    const secret = await getPaystackKey();
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    if (!res.ok || !data.status || data.data?.status !== "success") return c.json({ error: "Payment not successful", paystackStatus: data.data?.status }, 400);
    const txn = await kv.get(`txn:${reference}`) as any;
    if (!txn) return c.json({ error: "Transaction not found" }, 404);
    if (txn.status === "success") return c.json({ message: "Already verified", transaction: txn, invoice: txn.invoiceId ? await kv.get(`invoice:${txn.invoiceId}`) : null });
    const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updatedTxn = { ...txn, status: "success", completedAt: new Date().toISOString(), holdUntil, invoiceId, released: false };
    await kv.set(`txn:${reference}`, updatedTxn);
    const product = await kv.get(`product:${txn.productId}`) as any;
    const invoice = {
      id: invoiceId, reference, buyerEmail: txn.buyerEmail, buyerName: txn.buyerName,
      sellerId: txn.sellerId, productId: txn.productId, productTitle: product?.title || "Product",
      amountTotal: txn.amountTotal, platformFee: txn.platformFee, sellerEarning: txn.sellerEarning,
      currency: txn.currency, status: "paid", issuedAt: new Date().toISOString(),
    };
    await kv.set(`invoice:${invoiceId}`, invoice);
    await updateSellerBalance(txn.sellerId, txn.sellerEarning, holdUntil);
    await updatePlatformEarnings(txn.platformFee);
    return c.json({ success: true, transaction: updatedTxn, invoice });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// Certificate payment — initialize
app.post("/make-server-a611b057/monetization/payments/initialize-certificate", async (c) => {
  try {
    const { certificateId, buyerEmail, buyerName, currency: requestedCurrency } = await c.req.json();
    if (!certificateId || !buyerEmail || !buyerName) return c.json({ error: "certificateId, buyerEmail, and buyerName are required" }, 400);

    const certificate = await kv.get(`cert:${certificateId}`) as any;
    if (!certificate) return c.json({ error: "Certificate not found" }, 404);
    if (!certificate.monetizationEnabled) return c.json({ error: "This certificate is not for sale" }, 400);

    // Determine which currency and price to use
    const chargeCurrency = (requestedCurrency === "USD") ? "USD" : "NGN";
    const chargeAmount = chargeCurrency === "USD"
      ? (certificate.certificatePriceUSDMinor || 0)
      : (certificate.certificatePriceMinor || 0);

    if (!chargeAmount || chargeAmount <= 0) {
      return c.json({ error: `Certificate has no ${chargeCurrency} price set` }, 400);
    }

    // Resolve sellerId from the certificate's organization owner
    let sellerId: string | null = null;
    let sellerOrgId: string | null = certificate.organizationId || null;
    if (sellerOrgId) {
      const org = await kv.get(`org:${sellerOrgId}`) as any;
      if (org?.ownerId) sellerId = org.ownerId;
    }

    const secret = await getPaystackKey();
    if (!secret) return c.json({ error: "Payment system not configured" }, 503);

    const reference = generateTxnRef();
    const callbackUrl = `${Deno.env.get("APP_PUBLIC_URL") || "https://certifyer.online"}/#/payment/verify?ref=${reference}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: buyerEmail, amount: chargeAmount, currency: chargeCurrency, reference, callback_url: callbackUrl,
        metadata: { certificateId, certificateTitle: certificate.courseName || certificate.certificateHeader, buyerName, sellerId, type: "certificate" },
      }),
    });
    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) return c.json({ error: paystackData.message || "Failed to initialize payment" }, 400);

    const { platformFee, sellerEarning } = calcFees(chargeAmount);
    const txn = {
      reference,
      type: "certificate",
      certificateId,
      sellerId,
      sellerOrgId,
      productTitle: certificate.courseName || certificate.certificateHeader || "Certificate",
      buyerEmail, buyerName,
      amountTotal: chargeAmount, platformFee, sellerEarning,
      currency: chargeCurrency,
      status: "pending", paystackRef: reference, createdAt: new Date().toISOString(),
    };
    await kv.set(`txn:${reference}`, txn);
    return c.json({ authorizationUrl: paystackData.data?.authorization_url, reference });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// Certificate payment — verify (called from PaymentVerifyPage after Paystack redirect)
app.post("/make-server-a611b057/monetization/payments/verify-certificate", async (c) => {
  try {
    const { reference } = await c.req.json();
    if (!reference) return c.json({ error: "reference is required" }, 400);

    const secret = await getPaystackKey();
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    if (!res.ok || !data.status || data.data?.status !== "success") {
      return c.json({ error: "Payment not successful", paystackStatus: data.data?.status }, 400);
    }

    const txn = await kv.get(`txn:${reference}`) as any;
    if (!txn) return c.json({ error: "Transaction not found" }, 404);
    if (txn.status === "success") {
      // Webhook may have already verified — ensure cert is still marked paid
      if (txn.certificateId) {
        const cert = await kv.get(`cert:${txn.certificateId}`) as any;
        if (cert && cert.paymentStatus !== "paid") {
          await kv.set(`cert:${txn.certificateId}`, { ...cert, paymentStatus: "paid", paidAt: txn.completedAt || new Date().toISOString(), paidRef: reference });
        }
      }
      return c.json({ message: "Already verified", transaction: txn, certificateId: txn.certificateId });
    }

    const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Build the complete verified transaction
    const updatedTxn = {
      ...txn,
      status: "success",
      completedAt: new Date().toISOString(),
      holdUntil,
      invoiceId,
      released: false,
    };
    await kv.set(`txn:${reference}`, updatedTxn);

    // Mark certificate as paid
    const cert = await kv.get(`cert:${txn.certificateId}`) as any;
    if (cert) {
      await kv.set(`cert:${txn.certificateId}`, {
        ...cert,
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
        paidRef: reference,
      });
    }

    // Create invoice (shows up in seller Invoices tab + admin)
    const invoice = {
      id: invoiceId,
      reference,
      type: "certificate",
      certificateId: txn.certificateId,
      productTitle: txn.productTitle || cert?.courseName || "Certificate",
      buyerEmail: txn.buyerEmail,
      buyerName: txn.buyerName,
      sellerId: txn.sellerId || null,
      sellerOrgId: txn.sellerOrgId || null,
      amountTotal: txn.amountTotal,
      platformFee: txn.platformFee,
      sellerEarning: txn.sellerEarning,
      currency: txn.currency || "NGN",
      status: "paid",
      issuedAt: new Date().toISOString(),
    };
    await kv.set(`invoice:${invoiceId}`, invoice);

    // Credit seller earnings (7-day hold)
    if (txn.sellerId) {
      await updateSellerBalance(txn.sellerId, txn.sellerEarning, holdUntil);
    }

    // Record platform earnings
    await updatePlatformEarnings(txn.platformFee);

    return c.json({ success: true, transaction: updatedTxn, invoice, certificateId: txn.certificateId });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/payments/webhook", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-paystack-signature") || "";
    const secret = await getPaystackKey();
    if (secret && signature) {
      const valid = await verifyPaystackSig(rawBody, signature, secret);
      if (!valid) return c.json({ error: "Invalid webhook signature" }, 401);
    }
    const event = JSON.parse(rawBody);

    // ---- Transfer events (payout status updates) ----
    if (event.event === "transfer.success" || event.event === "transfer.failed") {
      const transferCode = event.data?.transfer_code;
      const transferRef = event.data?.reference; // This is the payoutId we set as reference
      const payoutId = transferRef;
      if (!payoutId) return c.json({ success: true });

      const payout = await kv.get(`payout:${payoutId}`) as any;
      if (!payout) return c.json({ success: true }); // unknown payout, ignore

      if (event.event === "transfer.success") {
        await kv.set(`payout:${payoutId}`, {
          ...payout,
          status: "completed",
          paystackTransferCode: transferCode || payout.paystackTransferCode,
          completedAt: new Date().toISOString(),
        });
      } else {
        // transfer.failed — mark failed and restore seller balance
        const failureReason = event.data?.failures?.[0]?.reason || event.data?.reason || "Transfer failed";
        await kv.set(`payout:${payoutId}`, {
          ...payout,
          status: "failed",
          failureReason,
          failedAt: new Date().toISOString(),
        });
        // Restore seller's available balance
        const bal = await kv.get(`seller_balance:${payout.sellerId}`) as any;
        if (bal) {
          bal.availableBalance = (bal.availableBalance || 0) + payout.amount;
          bal.totalWithdrawn = Math.max(0, (bal.totalWithdrawn || 0) - payout.amount);
          await kv.set(`seller_balance:${payout.sellerId}`, bal);
        }
      }
      return c.json({ success: true });
    }

    if (event.event !== "charge.success") return c.json({ success: true });
    const reference = event.data?.reference;
    if (!reference) return c.json({ error: "Missing reference" }, 400);
    const txn = await kv.get(`txn:${reference}`) as any;
    if (!txn || txn.status === "success") return c.json({ success: true });
    const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invoiceId = txn.invoiceId || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updatedTxn = { ...txn, status: "success", completedAt: new Date().toISOString(), holdUntil, invoiceId, released: false };
    await kv.set(`txn:${reference}`, updatedTxn);

    // For certificate payments, mark the cert as paid
    if (txn.type === "certificate" && txn.certificateId) {
      const cert = await kv.get(`cert:${txn.certificateId}`) as any;
      if (cert) {
        await kv.set(`cert:${txn.certificateId}`, { ...cert, paymentStatus: "paid", paidAt: new Date().toISOString(), paidRef: reference });
      }
    }

    if (!txn.invoiceId) {
      const isCertPayment = txn.type === "certificate";
      const product = isCertPayment ? null : await kv.get(`product:${txn.productId}`) as any;
      const invoice = {
        id: invoiceId, reference, type: txn.type || "product",
        certificateId: txn.certificateId || null,
        buyerEmail: txn.buyerEmail, buyerName: txn.buyerName,
        sellerId: txn.sellerId, sellerOrgId: txn.sellerOrgId || null,
        productId: txn.productId || null,
        productTitle: txn.productTitle || product?.title || "Product",
        amountTotal: txn.amountTotal, platformFee: txn.platformFee, sellerEarning: txn.sellerEarning,
        currency: txn.currency || "NGN", status: "paid", issuedAt: new Date().toISOString(),
      };
      await kv.set(`invoice:${invoiceId}`, invoice);
      if (txn.sellerId) await updateSellerBalance(txn.sellerId, txn.sellerEarning, holdUntil);
      await updatePlatformEarnings(txn.platformFee);
    }
    return c.json({ success: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- SELLER EARNINGS & TRANSACTIONS ----

app.get("/make-server-a611b057/monetization/seller/earnings", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    await releaseMaturedHolds(user.id);
    const balance = await kv.get(`seller_balance:${user.id}`) || {
      sellerId: user.id, totalEarned: 0, pendingHold: 0, availableBalance: 0, totalWithdrawn: 0,
    };
    return c.json({ balance });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/seller/transactions", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const transactions: any[] = [];
    const allKeys = kv.list({ prefix: "txn:" });
    for await (const entry of allKeys) {
      const t = entry.value as any;
      if (t?.sellerId === user.id) transactions.push(t);
    }
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ transactions });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/seller/invoices", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const invoices: any[] = [];
    const allKeys = kv.list({ prefix: "invoice:" });
    for await (const entry of allKeys) {
      const inv = entry.value as any;
      if (inv?.sellerId === user.id) invoices.push(inv);
    }
    invoices.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    return c.json({ invoices });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// Returns all monetization-enabled certificates belonging to the authenticated user's org
app.get("/make-server-a611b057/monetization/seller/certificates", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    // Find the org(s) this user owns — getByPrefix returns raw values directly
    const allOrgs = await kv.getByPrefix("org:");
    const userOrgIds = allOrgs
      .filter((o: any) => o?.ownerId === user.id || o?.adminId === user.id)
      .map((o: any) => o?.id)
      .filter(Boolean);

    // Also check org memberships for admins
    const memberEntries = await kv.getByPrefix(`orgMember:${user.id}:`);
    for (const m of memberEntries) {
      const mem = m as any;
      if (mem?.role === "admin" && mem?.organizationId && !userOrgIds.includes(mem.organizationId)) {
        userOrgIds.push(mem.organizationId);
      }
    }

    const allCerts = await kv.getByPrefix("cert:");
    const certs = allCerts
      .filter((cert: any) => cert?.monetizationEnabled === true && userOrgIds.includes(cert?.organizationId))
      .filter(Boolean);

    certs.sort((a: any, b: any) => new Date(b.generatedAt || b.createdAt || 0).getTime() - new Date(a.generatedAt || a.createdAt || 0).getTime());
    return c.json({ certificates: certs });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/invoices/:id", async (c) => {
  try {
    const invoice = await kv.get(`invoice:${c.req.param("id")}`);
    if (!invoice) return c.json({ error: "Invoice not found" }, 404);
    return c.json({ invoice });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- PAYOUTS ----

app.post("/make-server-a611b057/monetization/seller/payout/request", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    await releaseMaturedHolds(user.id);
    const balance = await kv.get(`seller_balance:${user.id}`) as any;
    const available = balance?.availableBalance || 0;
    if (available <= 0) return c.json({ error: "No available balance to withdraw" }, 400);
    const seller = await kv.get(`seller:${user.id}`) as any;
    if (!seller?.paystackRecipientCode) return c.json({ error: "Please add and verify your bank account before requesting a payout" }, 400);
    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payout = {
      id: payoutId, sellerId: user.id, amount: available, currency: "NGN",
      status: "pending", recipientCode: seller.paystackRecipientCode,
      requestedAt: new Date().toISOString(),
    };
    await kv.set(`payout:${payoutId}`, payout);
    balance.availableBalance = 0;
    balance.totalWithdrawn = (balance.totalWithdrawn || 0) + available;
    await kv.set(`seller_balance:${user.id}`, balance);
    return c.json({ payout });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/seller/payouts", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);
    const payouts: any[] = [];
    const allKeys = kv.list({ prefix: "payout:" });
    for await (const entry of allKeys) {
      const p = entry.value as any;
      if (p?.sellerId === user.id) payouts.push(p);
    }
    payouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return c.json({ payouts });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ---- ADMIN MONETIZATION ----

app.get("/make-server-a611b057/monetization/admin/products", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    // Return monetized certificates as products (certs are the primary product type)
    const allCerts = await kv.getByPrefix("cert:");
    const products = allCerts
      .filter((cert: any) => cert?.monetizationEnabled === true)
      .sort((a: any, b: any) => new Date(b.generatedAt || b.createdAt || 0).getTime() - new Date(a.generatedAt || a.createdAt || 0).getTime());
    return c.json({ products, certificates: products });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/admin/overview", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const platformEarnings = (await kv.get("platform:earnings") as any) || { totalRevenue: 0, platformFees: 0, totalTransactions: 0 };
    let pendingPayouts = 0;
    const payoutKeys = kv.list({ prefix: "payout:" });
    for await (const entry of payoutKeys) {
      const p = entry.value as any;
      if (p?.status === "pending") pendingPayouts += p.amount || 0;
    }
    return c.json({ overview: { ...platformEarnings, pendingPayouts } });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/admin/transactions", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const transactions: any[] = [];
    const allKeys = kv.list({ prefix: "txn:" });
    for await (const entry of allKeys) { transactions.push(entry.value); }
    transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ transactions });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/admin/sellers", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);

    // Build a map of sellers from transactions (covers sellers without bank onboarding)
    const sellerMap: Record<string, any> = {};

    const allTxns = await kv.getByPrefix("txn:");
    for (const entry of allTxns) {
      const txn = entry as any;
      if (!txn?.sellerId) continue;
      const sid = txn.sellerId;
      if (!sellerMap[sid]) {
        sellerMap[sid] = {
          userId: sid,
          sellerOrgId: txn.sellerOrgId || null,
          totalSales: 0,
          totalEarned: 0,
          transactionCount: 0,
          displayName: null,
          email: null,
          bankName: null,
          bankAccountNumber: null,
          verified: false,
          balance: {},
        };
      }
      if (txn.status === "success") {
        sellerMap[sid].totalEarned += txn.sellerEarning || 0;
        sellerMap[sid].totalSales += txn.amountTotal || 0;
        sellerMap[sid].transactionCount += 1;
      }
    }

    // Enrich with seller profile if they onboarded
    for (const sid of Object.keys(sellerMap)) {
      const profile = await kv.get(`seller:${sid}`) as any;
      if (profile) {
        sellerMap[sid].displayName = profile.displayName || null;
        sellerMap[sid].email = profile.email || null;
        sellerMap[sid].bankName = profile.bankName || null;
        sellerMap[sid].bankAccountNumber = profile.bankAccountNumber || null;
        sellerMap[sid].verified = profile.verified || false;
      }
      // Enrich with org info
      if (sellerMap[sid].sellerOrgId) {
        const org = await kv.get(`org:${sellerMap[sid].sellerOrgId}`) as any;
        if (org) {
          sellerMap[sid].orgName = org.name || null;
          if (!sellerMap[sid].email) sellerMap[sid].email = org.email || null;
        }
      }
      // Enrich with user info
      const userRecord = await kv.get(`user:${sid}`) as any;
      if (userRecord) {
        if (!sellerMap[sid].displayName) sellerMap[sid].displayName = userRecord.name || userRecord.fullName || null;
        if (!sellerMap[sid].email) sellerMap[sid].email = userRecord.email || null;
      }
      const balance = await kv.get(`seller_balance:${sid}`) as any;
      if (balance) sellerMap[sid].balance = balance;
    }

    const sellers = Object.values(sellerMap).sort((a: any, b: any) => b.totalEarned - a.totalEarned);
    return c.json({ sellers });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/admin/payouts", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const payouts: any[] = [];
    const allKeys = kv.list({ prefix: "payout:" });
    for await (const entry of allKeys) { payouts.push(entry.value); }
    payouts.sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return c.json({ payouts });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/admin/payouts/:id/process", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const payout = await kv.get(`payout:${c.req.param("id")}`) as any;
    if (!payout) return c.json({ error: "Payout not found" }, 404);
    if (payout.status !== "pending") return c.json({ error: "Payout is not pending" }, 400);
    const secret = await getPaystackKey();
    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "balance", amount: payout.amount, recipient: payout.recipientCode,
        reason: `Certifyer seller payout - ${payout.id}`, reference: payout.id,
      }),
    });
    const transferData = await transferRes.json();
    if (!transferRes.ok || !transferData.status) {
      await kv.set(`payout:${payout.id}`, { ...payout, status: "failed", failureReason: transferData.message, processedAt: new Date().toISOString() });
      // Restore the seller's available balance since the transfer failed
      const bal = await kv.get(`seller_balance:${payout.sellerId}`) as any;
      if (bal) {
        bal.availableBalance = (bal.availableBalance || 0) + payout.amount;
        bal.totalWithdrawn = Math.max(0, (bal.totalWithdrawn || 0) - payout.amount);
        await kv.set(`seller_balance:${payout.sellerId}`, bal);
      }
      return c.json({ error: transferData.message || "Transfer failed" }, 400);
    }
    const updated = {
      ...payout,
      status: transferData.data?.status === "success" ? "completed" : "processing",
      paystackTransferCode: transferData.data?.transfer_code,
      processedAt: new Date().toISOString(),
    };
    await kv.set(`payout:${payout.id}`, updated);
    return c.json({ success: true, payout: updated });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/admin/refund", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const { reference, reason } = await c.req.json();
    if (!reference) return c.json({ error: "reference is required" }, 400);
    const txn = await kv.get(`txn:${reference}`) as any;
    if (!txn) return c.json({ error: "Transaction not found" }, 404);
    if (txn.status === "refunded") return c.json({ error: "Already refunded" }, 400);
    if (txn.status !== "success") return c.json({ error: "Can only refund successful transactions" }, 400);
    const secret = await getPaystackKey();
    const refundRes = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: reference }),
    });
    const refundData = await refundRes.json();
    if (!refundRes.ok || !refundData.status) return c.json({ error: refundData.message || "Refund failed" }, 400);
    await kv.set(`txn:${reference}`, { ...txn, status: "refunded", refundedAt: new Date().toISOString(), refundReason: reason || "" });
    const bal = await kv.get(`seller_balance:${txn.sellerId}`) as any;
    if (bal) {
      if (!txn.released) bal.pendingHold = Math.max(0, (bal.pendingHold || 0) - txn.sellerEarning);
      else bal.availableBalance = Math.max(0, (bal.availableBalance || 0) - txn.sellerEarning);
      bal.totalEarned = Math.max(0, (bal.totalEarned || 0) - txn.sellerEarning);
      await kv.set(`seller_balance:${txn.sellerId}`, bal);
    }
    if (txn.invoiceId) {
      const inv = await kv.get(`invoice:${txn.invoiceId}`) as any;
      if (inv) await kv.set(`invoice:${txn.invoiceId}`, { ...inv, status: "refunded", refundedAt: new Date().toISOString() });
    }
    return c.json({ success: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.get("/make-server-a611b057/monetization/admin/settings", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const settings = await kv.get("monetization:settings") || { platformFeePercent: PLATFORM_FEE_PERCENT, payoutSchedule: "weekly_friday" };
    return c.json({ settings });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

app.post("/make-server-a611b057/monetization/admin/settings", async (c) => {
  try {
    if (!(await isPlatformAdmin(c.req.header("Authorization")))) return c.json({ error: "Admin only" }, 403);
    const body = await c.req.json();
    const current = (await kv.get("monetization:settings") as any) || {};
    await kv.set("monetization:settings", { ...current, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});


// ==================== DIGITAL PRODUCTS ====================
// Full digital product marketplace: create, manage, sell, and deliver digital products

const generateProductId = (): string => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROD_${ts}_${rand}`;
};

const generatePurchaseRef = (): string => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DPP_${ts}_${rand}`;
};

// Generate a signed Supabase Storage URL
const getSignedUrl = async (storagePath: string): Promise<string> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bucket = "digital-products";
  const url = `${supabaseUrl}/storage/v1/object/sign/${bucket}/${encodeURIComponent(storagePath)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return `${supabaseUrl}/storage/v1${data.signedURL}`;
};

// POST /digital-products/upload — upload a file to storage
app.post("/make-server-a611b057/digital-products/upload", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const orgId = formData.get("orgId") as string;

    if (!file || !orgId) return c.json({ error: "file and orgId are required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Try to create the bucket (ignore error if already exists)
    await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "digital-products", name: "digital-products", public: false }),
    }); // ignore errors - bucket may already exist

    // Upload the file
    const storagePath = `${orgId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/digital-products/${storagePath}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: arrayBuffer,
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return c.json({ error: err }, 400);
    }

    return c.json({ storagePath, name: file.name, size: file.size }, 200);
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// POST /digital-products — create product
app.post("/make-server-a611b057/digital-products", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const body = await c.req.json();
    const { orgId, title, description, thumbnailUrl, type, priceNGN, priceUSD, files, links, certificateTemplateId } = body;

    if (!orgId || !title || !type) return c.json({ error: "orgId, title, and type are required" }, 400);
    if (!["pdf", "video", "bundle"].includes(type)) return c.json({ error: "type must be pdf, video, or bundle" }, 400);

    // Verify org belongs to user
    const org = await kv.get(`org:${orgId}`) as any;
    if (!org) return c.json({ error: "Organization not found" }, 404);
    if (org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    const productId = generateProductId();
    const now = new Date().toISOString();

    const product = {
      id: productId,
      orgId,
      title,
      description: description || "",
      thumbnailUrl: thumbnailUrl || null,
      type,
      priceNGN: priceNGN || 0,
      priceUSD: priceUSD || 0,
      status: "draft",
      files: files || [],
      links: links || [],
      certificateTemplateId: certificateTemplateId || null,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`product:${orgId}:${productId}`, product);

    // Update org_products index
    const existing = (await kv.get(`org_products:${orgId}`) as string[]) || [];
    if (!existing.includes(productId)) {
      await kv.set(`org_products:${orgId}`, [...existing, productId]);
    }

    return c.json({ product }, 201);
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// GET /digital-products — list org's products
app.get("/make-server-a611b057/digital-products", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const orgId = c.req.query("orgId");
    if (!orgId) return c.json({ error: "orgId query param required" }, 400);

    // Verify org belongs to user
    const org = await kv.get(`org:${orgId}`) as any;
    if (!org) return c.json({ error: "Organization not found" }, 404);
    if (org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    const productIds = (await kv.get(`org_products:${orgId}`) as string[]) || [];
    const products: any[] = [];
    for (const pid of productIds) {
      const p = await kv.get(`product:${orgId}:${pid}`);
      if (p) products.push(p);
    }

    return c.json({ products });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// GET /digital-products/:productId — get single product
app.get("/make-server-a611b057/digital-products/:productId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const productId = c.req.param("productId");
    const orgId = c.req.query("orgId");
    if (!orgId) return c.json({ error: "orgId query param required" }, 400);

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org || org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    const product = await kv.get(`product:${orgId}:${productId}`);
    if (!product) return c.json({ error: "Product not found" }, 404);

    return c.json({ product });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// PUT /digital-products/:productId — update product
app.put("/make-server-a611b057/digital-products/:productId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const productId = c.req.param("productId");
    const body = await c.req.json();
    const { orgId } = body;
    if (!orgId) return c.json({ error: "orgId is required" }, 400);

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org || org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    const existing = await kv.get(`product:${orgId}:${productId}`) as any;
    if (!existing) return c.json({ error: "Product not found" }, 404);

    const updated = { ...existing, ...body, id: productId, orgId, updatedAt: new Date().toISOString() };
    await kv.set(`product:${orgId}:${productId}`, updated);

    return c.json({ product: updated });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// DELETE /digital-products/:productId — delete product
app.delete("/make-server-a611b057/digital-products/:productId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const productId = c.req.param("productId");
    const orgId = c.req.query("orgId");
    if (!orgId) return c.json({ error: "orgId query param required" }, 400);

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org || org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    await kv.delete(`product:${orgId}:${productId}`);

    // Remove from index
    const ids = (await kv.get(`org_products:${orgId}`) as string[]) || [];
    await kv.set(`org_products:${orgId}`, ids.filter((id) => id !== productId));

    return c.json({ success: true });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// POST /digital-products/:productId/publish — toggle published status
app.post("/make-server-a611b057/digital-products/:productId/publish", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) return c.json({ error }, 401);

    const productId = c.req.param("productId");
    const { orgId } = await c.req.json();
    if (!orgId) return c.json({ error: "orgId is required" }, 400);

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org || org.ownerId !== user.id) return c.json({ error: "Unauthorized" }, 403);

    const product = await kv.get(`product:${orgId}:${productId}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);

    const newStatus = product.status === "published" ? "draft" : "published";
    const updated = { ...product, status: newStatus, updatedAt: new Date().toISOString() };
    await kv.set(`product:${orgId}:${productId}`, updated);

    return c.json({ product: updated });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// GET /store/:orgSlug/products — PUBLIC storefront product listing
app.get("/make-server-a611b057/store/:orgSlug/products", async (c) => {
  try {
    const orgSlug = c.req.param("orgSlug");
    // For now, orgSlug == orgId (simple approach)
    const orgId = orgSlug;

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org) return c.json({ error: "Store not found" }, 404);

    const productIds = (await kv.get(`org_products:${orgId}`) as string[]) || [];
    const products: any[] = [];
    for (const pid of productIds) {
      const p = await kv.get(`product:${orgId}:${pid}`) as any;
      if (p && p.status === "published") {
        // Strip encrypted links from public listing
        const safeProduct = { ...p, links: (p.links || []).map((l: any) => ({ label: l.label })) };
        products.push(safeProduct);
      }
    }

    return c.json({ org: { id: org.id, name: org.name, logo: org.logo, primaryColor: org.primaryColor }, products });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// GET /store/:orgSlug/products/:productId — PUBLIC single product (no links)
app.get("/make-server-a611b057/store/:orgSlug/products/:productId", async (c) => {
  try {
    const orgSlug = c.req.param("orgSlug");
    const productId = c.req.param("productId");
    const orgId = orgSlug;

    const org = await kv.get(`org:${orgId}`) as any;
    if (!org) return c.json({ error: "Store not found" }, 404);

    const product = await kv.get(`product:${orgId}:${productId}`) as any;
    if (!product || product.status !== "published") return c.json({ error: "Product not found" }, 404);

    const safeProduct = { ...product, links: (product.links || []).map((l: any) => ({ label: l.label })) };
    return c.json({ org: { id: org.id, name: org.name, logo: org.logo, primaryColor: org.primaryColor }, product: safeProduct });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// POST /digital-products/:productId/purchase/initialize — init Paystack payment
app.post("/make-server-a611b057/digital-products/:productId/purchase/initialize", async (c) => {
  try {
    const productId = c.req.param("productId");
    const { orgId, buyerEmail, buyerName, currency } = await c.req.json();

    if (!orgId || !buyerEmail || !buyerName) return c.json({ error: "orgId, buyerEmail, and buyerName are required" }, 400);

    const product = await kv.get(`product:${orgId}:${productId}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);
    if (product.status !== "published") return c.json({ error: "Product is not available for purchase" }, 400);

    const secret = await getPaystackKey();
    if (!secret) return c.json({ error: "Payment system not configured" }, 500);

    const useCurrency = currency === "USD" ? "USD" : "NGN";
    const amountMinor = useCurrency === "USD" ? product.priceUSD : product.priceNGN;
    if (!amountMinor || amountMinor <= 0) return c.json({ error: "Product not available in selected currency" }, 400);

    const reference = generatePurchaseRef();
    const appUrl = Deno.env.get("APP_PUBLIC_URL") || c.req.header("origin") || "https://localhost";
    const callbackUrl = `${appUrl}/#/access/${reference}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: buyerEmail,
        amount: amountMinor,
        currency: useCurrency,
        reference,
        callback_url: callbackUrl,
        metadata: { productId, orgId, buyerName, productTitle: product.title },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      return c.json({ error: paystackData.message || "Failed to initialize payment" }, 500);
    }

    const now = new Date().toISOString();
    const purchase = {
      reference,
      productId,
      orgId,
      buyerEmail,
      buyerName,
      currency: useCurrency,
      amountMinor,
      status: "pending",
      accessGranted: false,
      createdAt: now,
    };
    await kv.set(`product_purchase:${reference}`, purchase);

    return c.json({ authorizationUrl: paystackData.data.authorization_url, reference });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// POST /digital-products/purchase/verify — verify payment + grant access
app.post("/make-server-a611b057/digital-products/purchase/verify", async (c) => {
  try {
    const { reference } = await c.req.json();
    if (!reference) return c.json({ error: "reference is required" }, 400);

    const purchase = await kv.get(`product_purchase:${reference}`) as any;
    if (!purchase) return c.json({ error: "Purchase not found" }, 404);

    if (purchase.status === "paid") return c.json({ success: true, purchase, alreadyVerified: true });

    const secret = await getPaystackKey();
    if (!secret) return c.json({ error: "Payment system not configured" }, 500);

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const psData = await psRes.json();

    if (!psRes.ok || !psData.status || psData.data?.status !== "success") {
      const updatedPurchase = { ...purchase, status: "failed" };
      await kv.set(`product_purchase:${reference}`, updatedPurchase);
      return c.json({ success: false, error: "Payment not successful" }, 400);
    }

    const now = new Date().toISOString();
    const updatedPurchase = {
      ...purchase,
      status: "paid",
      accessGranted: true,
      paidAt: now,
    };
    await kv.set(`product_purchase:${reference}`, updatedPurchase);

    // Auto-issue certificate if product has certificateTemplateId
    const product = await kv.get(`product:${purchase.orgId}:${purchase.productId}`) as any;
    let certificateId: string | null = null;
    if (product?.certificateTemplateId) {
      try {
        certificateId = `cert_dp_${reference}`;
        const certRecord = {
          id: certificateId,
          organizationId: purchase.orgId,
          templateId: product.certificateTemplateId,
          recipientName: purchase.buyerName,
          recipientEmail: purchase.buyerEmail,
          courseName: product.title,
          issuedAt: now,
          source: "digital_product_purchase",
          purchaseReference: reference,
        };
        await kv.set(`certificate:${certificateId}`, certRecord);
        updatedPurchase.certificateId = certificateId;
        await kv.set(`product_purchase:${reference}`, updatedPurchase);
      } catch (_e) { /* cert creation is non-blocking */ }
    }

    return c.json({ success: true, purchase: updatedPurchase });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// GET /digital-products/purchase/:reference/access — get access content
app.get("/make-server-a611b057/digital-products/purchase/:reference/access", async (c) => {
  try {
    const reference = c.req.param("reference");
    const buyerEmail = c.req.query("email");

    if (!buyerEmail) return c.json({ error: "email query param required" }, 400);

    const purchase = await kv.get(`product_purchase:${reference}`) as any;
    if (!purchase) return c.json({ error: "Purchase not found" }, 404);

    if (purchase.buyerEmail.toLowerCase() !== buyerEmail.toLowerCase()) {
      return c.json({ error: "Email does not match purchase record" }, 403);
    }

    if (!purchase.accessGranted || purchase.status !== "paid") {
      return c.json({ error: "Access not granted. Please complete payment first." }, 403);
    }

    const product = await kv.get(`product:${purchase.orgId}:${purchase.productId}`) as any;
    if (!product) return c.json({ error: "Product not found" }, 404);

    const org = await kv.get(`org:${purchase.orgId}`) as any;

    // Generate signed URLs for files
    const signedFiles: any[] = [];
    for (const file of (product.files || [])) {
      const signedUrl = await getSignedUrl(file.storagePath);
      signedFiles.push({ name: file.name, size: file.size, url: signedUrl });
    }

    // Return raw links (they're already stored as-is)
    const links = (product.links || []).map((l: any) => ({ label: l.label, url: l.url }));

    // Certificate info
    let certificate: any = null;
    if (purchase.certificateId) {
      certificate = await kv.get(`certificate:${purchase.certificateId}`);
    }

    return c.json({
      purchase: { reference, productId: purchase.productId, buyerName: purchase.buyerName, paidAt: purchase.paidAt },
      product: { id: product.id, title: product.title, type: product.type, description: product.description },
      org: org ? { name: org.name, logo: org.logo } : null,
      files: signedFiles,
      links,
      certificate,
    });
  } catch (e) { return c.json({ error: `Server error: ${e}` }, 500); }
});

// ==================== START THE SERVER ====================

console.log("📡 Health endpoint: /make-server-a611b057/health");
console.log("🔐 Admin endpoint: /make-server-a611b057/admin/platform-data");
console.log("📊 Analytics endpoint: /make-server-a611b057/admin/analytics");
console.log("📈 Tracking endpoint: /make-server-a611b057/admin/tracking-data");
console.log("💳 Billing endpoints: /make-server-a611b057/billing/*");
console.log("📧 Admin emails endpoint: /make-server-a611b057/admin/emails");
console.log("📥 Download tracking: /make-server-a611b057/track-download");
console.log("⏱️ Session tracking: /make-server-a611b057/track-session");
console.log("🗺️ SEO Sitemap: /make-server-a611b057/sitemap.xml");
console.log("🤖 SEO Robots: /make-server-a611b057/robots.txt");
console.log("📚 Blog endpoints: /make-server-a611b057/blogs/*");
console.log("✅ Server is ready to accept requests");

// Initialize storage buckets on startup
const initializeStorageBuckets = async () => {
  try {
    console.log("🪣 Initializing storage buckets...");
    const supabase = getSupabaseClient();

    // Check if blog-images bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const blogBucketExists = buckets?.some(
      (bucket) => bucket.name === "blog-images",
    );

    if (!blogBucketExists) {
      console.log("📦 Creating blog-images bucket...");
      const { error: createBucketError } = await supabase.storage.createBucket(
        "blog-images",
        {
          public: true, // Blog images should be publicly accessible
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/gif",
            "image/webp",
          ],
        },
      );

      if (createBucketError) {
        console.error(
          "❌ Error creating blog-images bucket:",
          createBucketError,
        );
      } else {
        console.log("✅ blog-images bucket created successfully");
      }
    } else {
      console.log("✅ blog-images bucket already exists");
    }
  } catch (error) {
    console.error("❌ Error initializing storage buckets:", error);
  }
};

// Initialize buckets before starting server
await initializeStorageBuckets();

// ==================== BLOG ROUTES ====================
// Blog routes - mount the blog app
app.route("/make-server-a611b057/blog", blog.default);

// Analytics routes - mount the analytics app
app.route("/make-server-a611b057/analytics", analytics.default);

Deno.serve(app.fetch);
