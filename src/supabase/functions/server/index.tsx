// Certificate Generator Platform - Edge Function Server
// Fixed: Removed duplicate Hono import
import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// Load local .env during development so Deno.env.get(...) picks up values
// This is a no-op in environments that don't have a .env file.
try {
  // Top-level dynamic import; load.ts will populate Deno.env from .env when present
  await import("https://deno.land/std@0.203.0/dotenv/load.ts");
  console.log("✅ Loaded .env into Deno.env (if present)");
} catch (err) {
  // Non-fatal: production environments may not allow network imports or .env isn't present
  console.log(
    "ℹ️ .env loader not applied (ok in production):",
    err?.message || err
  );
}

const app = new Hono();

// Middleware - Configure CORS to allow all requests
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
  })
);
app.use("*", logger(console.log));

// Handle OPTIONS preflight requests for all routes
app.options("*", (c) => c.text("", 204));

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
};

// Helper to verify user token
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.split(" ")[1];

  // IMPORTANT: Use ANON_KEY client to verify user JWT tokens (not SERVICE_ROLE_KEY)
  // User tokens are issued by ANON_KEY client during signin
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
};

// ==================== HEALTH CHECK ====================
// Root endpoint for basic connectivity test
app.get("/make-server-a611b057", (c) => {
  console.log("Root endpoint called");
  return c.json({
    status: "online",
    message: "Certificate Generator API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/make-server-a611b057/health",
      auth: "/make-server-a611b057/auth/*",
      organizations: "/make-server-a611b057/organizations/*",
      programs: "/make-server-a611b057/programs/*",
      certificates: "/make-server-a611b057/certificates/*",
    },
  });
});

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

// ==================== AUTH ROUTES ====================

// Sign up new user
app.post("/make-server-a611b057/auth/signup", async (c) => {
  try {
    const { email, password, fullName, organizationName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json(
        { error: "Email, password, and full name are required" },
        400
      );
    }

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
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
    console.log(`✅ Auto-created organization for user ${email}: ${orgName}`);

    // Create user account with organization
    const userAccount = {
      id: userId,
      fullName,
      email,
      userType: "company", // All users are organization users
      organizationId: organizationId,
      organizationName: orgName,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userAccount);

    // Sign in to get session token
    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email,
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
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
    const userAccount = await kv.get(`user:${userId}`);

    if (!userAccount) {
      return c.json({ error: "User account not found" }, 404);
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
app.post("/make-server-a611b057/auth/reset-password", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Send password reset email
    // Note: Supabase will handle sending the email with a magic link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        c.req.header("origin") || "http://localhost:5173"
      }/reset-password`,
    });

    if (error) {
      console.log("Password reset error:", error);
      // Don't reveal if email exists or not for security
      // Always return success to prevent email enumeration
    }

    console.log(`Password reset email requested for: ${email}`);

    // Always return success (security best practice - don't reveal if email exists)
    return c.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.log("Error in password reset:", error);
    return c.json(
      { error: `Server error during password reset: ${error}` },
      500
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
      500
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
        }))
      );
    }

    return c.json({ organizations: userOrgs });
  } catch (error) {
    console.log("❌ Error getting organizations:", error);
    return c.json(
      { error: `Server error getting organizations: ${error}` },
      500
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
      500
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
        400
      );
    }

    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    if (organization.ownerId !== user.id) {
      return c.json(
        { error: "Unauthorized to add programs to this organization" },
        403
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
          403
        );
      }

      const programIndex = organization.programs.findIndex(
        (p) => p.id === programId
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
  }
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
        c.req.header("Authorization") ? "Present" : "Missing"
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
          400
        );
      }
    }

    console.log("🔍 Looking up organization:", organizationId);
    const organization = await kv.get(`org:${organizationId}`);

    if (!organization) {
      console.log("❌ Organization not found in database");
      return c.json(
        { error: `Organization not found: ${organizationId}` },
        404
      );
    }
    console.log("��� Organization found:", organization.name);

    if (organization.ownerId !== user.id) {
      console.log("❌ User not authorized for this organization");
      console.log("   - Organization owner:", organization.ownerId);
      console.log("   - Current user:", user.id);
      return c.json(
        { error: "Unauthorized: You do not own this organization" },
        403
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
            403
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
        organizationId,
        programId: programId || programSlug, // Use provided programId or generate slug
        generatedAt: new Date().toISOString(),
        certificateUrl: `certificate/${organizationId}/${programSlug}/${certificateId}`,
        status: "active",
        downloadCount: 0,
      };

      await kv.set(`cert:${certificateId}`, certificate);
      console.log(
        "✅ Certificate saved to KV store with key: cert:" + certificateId
      );
      certificates.push(certificate);

      // Update program certificate count if program exists
      if (programId) {
        console.log(
          "📊 Attempting to update program statistics for programId:",
          programId
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
          "ℹ️ No programId provided, skipping program statistics update"
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
          organizationId,
          programId,
          generatedAt: new Date().toISOString(),
          certificateUrl: `certificate/${organizationId}/${programId}/${certificateId}`,
          status: "active",
          emailSent: false,
          downloadCount: 0,
          completionDate: student.completionDate || new Date().toISOString(),
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
      "certificate(s)"
    );
    return c.json({ certificates, count: certificates.length });
  } catch (error) {
    console.log("❌ Error generating certificates:", error);
    return c.json(
      { error: `Server error generating certificates: ${error}` },
      500
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
          "signatories"
        );
      }
    }

    const program = organization?.programs.find(
      (p) => p.id === certificate.programId
    );
    console.log(
      "📜 Program found:",
      program
        ? "YES (ID: " + program.id + ")"
        : "NO (searching for: " + certificate.programId + ")"
    );

    console.log("✅ Returning certificate data");
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
        "❌ User not authorized to view certificates for this organization"
      );
      return c.json(
        { error: "Unauthorized to view certificates for this organization" },
        403
      );
    }

    // Get all certificates for this organization
    console.log("📊 Searching for certificates with prefix: cert:");
    const allCerts = await kv.getByPrefix("cert:");
    console.log("📊 Total certificates in database:", allCerts.length);

    const orgCerts = allCerts.filter(
      (cert) => cert.organizationId === organizationId
    );
    console.log("📊 Certificates for this organization:", orgCerts.length);

    if (orgCerts.length > 0) {
      console.log(
        "📜 Certificate IDs:",
        orgCerts.map((c) => c.id)
      );
    }

    return c.json({ certificates: orgCerts });
  } catch (error) {
    console.log("❌ Error getting organization certificates:", error);
    return c.json(
      { error: `Server error getting certificates: ${error}` },
      500
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
        (p) => p.id === certificate.programId
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
      500
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
      "certificates"
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
            (p) => p.id === certificate.programId
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
      `✅ Deleted ${deletedCount} certificate(s), ${errors.length} error(s)`
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
      500
    );
  }
});

// Submit testimonial for a certificate (public endpoint - no auth required)
app.post("/make-server-a611b057/certificates/:id/testimonial", async (c) => {
  try {
    const certificateId = c.req.param("id");
    const { studentName, testimonial, courseName, organizationId, programId } =
      await c.req.json();

    console.log("💬 Testimonial submission:", {
      certificateId,
      studentName,
      hasTestimonial: !!testimonial,
      courseName,
      organizationId,
      programId,
    });

    if (!studentName || !testimonial || !courseName || !organizationId) {
      return c.json(
        {
          error:
            "Student name, testimonial, course name, and organization ID are required",
        },
        400
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
      testimonial,
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
      testimonialData
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
      500
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
        "❌ User not authorized to view testimonials for this organization"
      );
      return c.json(
        { error: "Unauthorized to view testimonials for this organization" },
        403
      );
    }

    // Get all testimonials for this organization
    console.log(
      "📊 Searching for testimonials with prefix: org_testimonial:" +
        organizationId
    );
    const testimonials = await kv.getByPrefix(
      `org_testimonial:${organizationId}`
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
      500
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
        "❌ User not authorized to delete programs in this organization"
      );
      return c.json(
        { error: "Unauthorized to delete programs in this organization" },
        403
      );
    }

    // Find and remove the program
    const programIndex = organization.programs.findIndex(
      (p) => p.id === programId
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
        400
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
        403
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
        }
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
        500
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
        403
      );
    }

    // Get or initialize settings
    const settingsKey = `org:${organizationId}:settings`;
    let settings = await kv.get(settingsKey);

    if (!settings) {
      // Return default settings
      settings = {
        logo: organization.logo || "",
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
        403
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
        400
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
        (p) => p.id === certificate.programId
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
      500
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
        403
      );
    }

    // Get all testimonials for this organization
    const allTestimonials = await kv.getByPrefix("test:");
    const orgTestimonials = allTestimonials.filter(
      (test) => test.organizationId === organizationId
    );

    return c.json({ testimonials: orgTestimonials });
  } catch (error) {
    console.log("Error getting testimonials:", error);
    return c.json(
      { error: `Server error getting testimonials: ${error}` },
      500
    );
  }
});

// ==================== ANALYTICS ROUTES ====================

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
        "❌ User not authorized to view analytics for this organization"
      );
      return c.json(
        { error: "Unauthorized to view analytics for this organization" },
        403
      );
    }

    // Get all certificates for this organization
    const allCertificates = await kv.getByPrefix(
      `org_certificate:${organizationId}`
    );
    console.log("📊 Found", allCertificates.length, "certificate(s)");

    // Get all testimonials for this organization
    const allTestimonials = await kv.getByPrefix(
      `org_testimonial:${organizationId}`
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
      })
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
        59
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
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      )
      .slice(0, 10);

    console.log("📊 Analytics calculated successfully");

    return c.json({
      analytics: {
        totalCertificates,
        totalTestimonials,
        engagementRate,
        coursePerformance,
        monthlyData,
        recentActivity: recentCertificates,
      },
    });
  } catch (error) {
    console.log("❌ Error fetching analytics:", error);
    return c.json({ error: `Server error fetching analytics: ${error}` }, 500);
  }
});

// ==================== TEMPLATE ROUTES (GLOBAL TEMPLATE LIBRARY) ====================

// Get all templates (default + user-created)
// This endpoint returns ALL templates in the system, not just for one organization
app.get("/make-server-a611b057/templates", async (c) => {
  try {
    console.log("📂 Fetching all templates from global library");

    // Get all templates with prefix 'globaltemplate:'
    const allTemplates = await kv.getByPrefix("globaltemplate:");

    // Return all templates: free (template1-5) and premium (template7+)
    // Separate them for easy filtering on frontend
    const freeTemplates = allTemplates.filter(
      (t) =>
        t.id === "template1" ||
        t.id === "template2" ||
        t.id === "template3" ||
        t.id === "template4" ||
        t.id === "template5"
    );
    const premiumTemplates = allTemplates.filter(
      (t) => t.value?.type === "premium"
    );
    const combinedTemplates = [...freeTemplates, ...premiumTemplates];

    console.log(
      "✅ Found",
      combinedTemplates.length,
      "template(s) in global library"
    );
    console.log(
      "   📗 Free:",
      freeTemplates.length,
      "|",
      "👑 Premium:",
      premiumTemplates.length
    );
    console.log(
      "📋 Template IDs:",
      combinedTemplates.map((t) => t.id).join(", ")
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

// Initialize default templates (call this once to seed the database)
app.post("/make-server-a611b057/templates/seed", async (c) => {
  try {
    console.log("🌱 Seeding default templates...");

    // IMPORTANT: This seed endpoint only runs if no templates exist
    // Use /templates/force-reseed to clear and reseed all templates
    const existing = await kv.getByPrefix("globaltemplate:");
    if (existing.length > 0) {
      console.log(
        "⚠️ Templates already exist, skipping seed. Use /templates/force-reseed to reset."
      );
      return c.json({
        message: "Templates already seeded",
        count: existing.length,
      });
    }

    // Global Template Library - Default Templates
    // Currently 5 templates are available - more will be added
    const defaultTemplates = [
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
    ];

    // Save all default templates
    for (const template of defaultTemplates) {
      await kv.set(`globaltemplate:${template.id}`, template);
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
    const defaultTemplates = [
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
    ];

    // Step 3: Save all default templates
    for (const template of defaultTemplates) {
      await kv.set(`globaltemplate:${template.id}`, template);
    }

    console.log(
      "✅ Force reseeded",
      defaultTemplates.length,
      "default template(s) (Templates 1-5)"
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
    const defaultTemplates = [
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
      // ===== PREMIUM TEMPLATES START HERE =====
      {
        id: "template7",
        name: "Brand Award Certificate",
        description:
          "PREMIUM: Elegant certificate with gold medallion seal, brown/orange accents, and social media icons",
        config: {
          colors: {
            background: "#ffffff",
            border: "#ea580c",
            accent: "#d4af37",
            text: "#3d2817",
            textSecondary: "#666666",
          },
          layout: {
            borderWidth: "6px",
            borderStyle: "double",
            padding: "0px",
            alignment: "center",
          },
          typography: {
            headerFont: "Georgia",
            bodyFont: "Georgia",
            scriptFont: "Brush Script MT",
            nameSize: "48px",
            headerSize: "60px",
            bodySize: "12px",
          },
          elements: {
            showBorder: true,
            showDecorativeCorners: true,
            showSeal: true,
            sealType: "gold-medallion",
            showSignatures: true,
            signatureCount: 1,
            showSocialIcons: true,
          },
        },
        type: "premium",
        isDefault: false,
        isPremium: true,
        tier: "paid",
        pricing: {
          oneTime: 29.99,
          subscription: 9.99,
        },
        createdAt: new Date().toISOString(),
      },
    ];

    // Step 3: Save all templates (free + premium)
    for (const template of defaultTemplates) {
      await kv.set(`globaltemplate:${template.id}`, template);
    }

    const freeCount = defaultTemplates.filter(
      (t) => t.type === "default"
    ).length;
    const premiumCount = defaultTemplates.filter(
      (t) => t.type === "premium"
    ).length;

    console.log(
      "✅ Force reseeded",
      defaultTemplates.length,
      "template(s):",
      freeCount,
      "free +",
      premiumCount,
      "premium"
    );

    return c.json({
      message: `Templates force reseeded successfully (${freeCount} free, ${premiumCount} premium)`,
      count: defaultTemplates.length,
      freeCount,
      premiumCount,
      templates: defaultTemplates,
    });
  } catch (error) {
    console.log("❌ Error force reseeding templates:", error);
    return c.json(
      { error: `Server error force reseeding templates: ${error}` },
      500
    );
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
        503
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
      }
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
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.log("❌ Paystack verification failed:", data);
      return c.json({ error: "Payment verification failed" }, 400);
    }

    if (data.data.status !== "success") {
      return c.json(
        { error: "Payment not successful", status: data.data.status },
        400
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
    console.log("📩 Paystack webhook received:", event.event);

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
  }
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
    `📝 Billing activity logged: ${activity.type} for org ${organizationId}`
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
        `activity:org:${organizationId}:`
      );
      const activities = allActivities
        .map((item) => item.value)
        .filter((activity) => activity && typeof activity === "object")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      return c.json({ activities });
    } catch (error) {
      console.log("❌ Error getting billing activities:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  }
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
  }
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
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      return c.json({ transactions: orgTransactions });
    } catch (error) {
      console.log("❌ Error getting transactions:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  }
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
  }
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
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
        new Date(a.startDate || 0).getTime()
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
    Deno.env.get("SUPABASE_ANON_KEY")!
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

  // Platform admin emails - add your admin emails here
  const adminEmails = [
    "admin@certgen.com",
    "platform@certgen.com",
    "admin@genomac.com",
    "admin@gihub.com",
    "admin@g-ihub.com",
    "platform@admin.com",
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
    const organizations = allOrgs
      .map((item) => item.value)
      .filter((org) => org && typeof org === "object");

    // Get all certificates - filter out null/undefined values
    const allCerts = await kv.getByPrefix("cert:");
    const certificates = allCerts
      .map((item) => item.value)
      .filter((cert) => cert && typeof cert === "object");

    // Get all templates - filter out null/undefined values
    const allTemplates = await kv.getByPrefix("globaltemplate:");
    const templates = allTemplates
      .map((item) => item.value)
      .filter((template) => template && typeof template === "object");

    // Get all payments - filter out null/undefined values
    const allPayments = await kv.getByPrefix("payment:");
    const payments = allPayments
      .map((item) => item.value)
      .filter((payment) => payment && typeof payment === "object");

    // Calculate stats with safe access
    const premiumOrgs = organizations.filter(
      (org) => org && org.plan === "premium"
    ).length;
    const freeOrgs = organizations.filter(
      (org) => org && (org.plan === "free" || !org.plan)
    ).length;
    const totalRevenue = payments
      .filter((p) => p && p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const stats = {
      totalOrganizations: organizations.length,
      totalCertificates: certificates.length,
      totalRevenue: totalRevenue,
      totalTemplates: templates.length,
      premiumUsers: premiumOrgs,
      freeUsers: freeOrgs,
    };

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
        `✅ Added organization: ${orgData.name} (${orgData.id}) - Owner: ${ownerEmail}`
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
        (item) => item.value && typeof item.value === "object" && item.value.id
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
        `👑 Admin granting premium to org ${organizationId} for ${durationMonths} months`
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
          404
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
        `✅ Premium granted to ${org.name} until ${expiryDate.toISOString()}`
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
        error instanceof Error ? error.stack : "No stack trace"
      );
      return c.json(
        {
          error: `Failed to grant membership: ${
            error instanceof Error ? error.message : String(error)
          }`,
          details: error instanceof Error ? error.stack : undefined,
        },
        500
      );
    }
  }
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
          404
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
        error instanceof Error ? error.stack : "No stack trace"
      );
      return c.json(
        {
          error: `Failed to revoke membership: ${
            error instanceof Error ? error.message : String(error)
          }`,
          details: error instanceof Error ? error.stack : undefined,
        },
        500
      );
    }
  }
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
        0
      ),
      byPrefix: Object.fromEntries(
        Object.entries(keysByPrefix).map(([prefix, items]) => [
          prefix,
          items.length,
        ])
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
          (tx) => tx && tx.organizationId === org.id && tx.status === "success"
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
        allUsers.slice(0, 3).map((item) => item.key)
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
              tx.status === "success"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      500
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
        `👑 Admin granting membership to org ${organizationId}: ${planName} for ${durationMonths} months`
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
  }
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
  }
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
  }
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
        new Date(a.createdAt || 0).getTime()
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
        400
      );
    }

    console.log(
      `🎁 Admin: Granting premium access to org ${organizationId} for ${durationDays} days...`
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
        400
      );
    }

    console.log(
      `⏰ Admin: Extending premium access for org ${organizationId} by ${additionalDays} days...`
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
      `🚫 Admin: Revoking premium access for org ${organizationId} with ${gracePeriodDays} day grace period...`
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
          item.value.id === templateId
      );

      if (!template) {
        return c.json({ error: "Template not found" }, 404);
      }

      return c.json({ template: template.value });
    } catch (error) {
      console.error("Get custom template error:", error);
      return c.json({ error: `Failed to get custom template: ${error}` }, 500);
    }
  }
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
        400
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
      customTemplate
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
        item.value.id === templateId
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
      updatedTemplate
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
        item.value.id === templateId
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
      `customtemplate:${existingTemplate.organizationId}:${templateId}`
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
        400
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
      savedCertificate
    );

    console.log(
      `✅ Certificate saved: ${savedCertificate.id} for org ${organizationId}`
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
        400
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
        savedCertificate
      );
      savedCertificates.push(savedCertificate);
    }

    console.log(
      `✅ Bulk save: ${savedCertificates.length} certificates for org ${organizationId}`
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
app.get("/make-server-a611b057/certificates/:organizationId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const organizationId = c.req.param("organizationId");

    // Get all certificates for this organization
    const allCertificates = await kv.getByPrefix(
      `certificate:${organizationId}:`
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
      `📜 Retrieved ${certificates.length} certificates for org ${organizationId}`
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
        item.value.id === certificateId
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

// Delete a certificate
app.delete("/make-server-a611b057/certificates/:certificateId", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header("Authorization"));
    if (error) {
      return c.json({ error }, 401);
    }

    const certificateId = c.req.param("certificateId");

    // Find the certificate
    const allCertificates = await kv.getByPrefix("certificate:");
    const certificateItem = allCertificates.find(
      (item) =>
        item.value &&
        typeof item.value === "object" &&
        item.value.id === certificateId
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
      `certificate:${existingCertificate.organizationId}:${certificateId}`
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

// ==================== ADMIN SEED ENDPOINT ====================

// Seed default templates (admin only)
app.post("/make-server-a611b057/admin/seed-templates", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!(await isPlatformAdmin(authHeader))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    console.log("🌱 Seeding default templates...");

    const defaultTemplates = [
      {
        id: "template1",
        name: "Professional Certificate",
        description: "Clean and professional design with elegant borders",
        type: "free",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "centered",
          colors: {
            primary: "#1a1a1a",
            secondary: "#4a4a4a",
            accent: "#ea580c",
          },
        },
      },
      {
        id: "template2",
        name: "Modern Minimalist",
        description: "Simple and modern design with clean lines",
        type: "free",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "minimal",
          colors: {
            primary: "#000000",
            secondary: "#666666",
            accent: "#ea580c",
          },
        },
      },
      {
        id: "template3",
        name: "Classic Elegant",
        description: "Traditional certificate with ornate borders",
        type: "free",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "classic",
          colors: {
            primary: "#2c3e50",
            secondary: "#7f8c8d",
            accent: "#ea580c",
          },
        },
      },
      {
        id: "template4",
        name: "Bold Impact",
        description: "Eye-catching design with strong visual presence",
        type: "premium",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "bold",
          colors: {
            primary: "#ea580c",
            secondary: "#1a1a1a",
            accent: "#fb923c",
          },
        },
      },
      {
        id: "template5",
        name: "Corporate Professional",
        description: "Sophisticated design for corporate training",
        type: "premium",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "corporate",
          colors: {
            primary: "#1e40af",
            secondary: "#3b82f6",
            accent: "#ea580c",
          },
        },
      },
      {
        id: "template6",
        name: "Creative Studio",
        description: "Artistic and creative certificate design",
        type: "premium",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "creative",
          colors: {
            primary: "#7c3aed",
            secondary: "#a78bfa",
            accent: "#ea580c",
          },
        },
      },
      {
        id: "template7",
        name: "Academic Excellence",
        description: "Perfect for educational institutions",
        type: "premium",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        config: {
          layout: "academic",
          colors: {
            primary: "#dc2626",
            secondary: "#991b1b",
            accent: "#ea580c",
          },
        },
      },
    ];

    // Store each template
    for (const template of defaultTemplates) {
      await kv.set(`globaltemplate:${template.id}`, template);
      console.log(`✅ Seeded template: ${template.name} (${template.id})`);
    }

    console.log(
      `✅ Successfully seeded ${defaultTemplates.length} default templates`
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

    // Filter out invalid data and ensure unique IDs
    const validOrgs = allOrgs.filter((org) => org && org.id);
    const validUsers = allUsers.filter((user) => user && user.id);
    const validCerts = allCerts.filter((cert) => cert && cert.id);

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
      })
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

    console.log("✅ Returning:", {
      organizations: enrichedOrgs.length,
      users: formattedUsers.length,
      certificates: formattedCerts.length,
    });

    return c.json({
      organizations: enrichedOrgs,
      users: formattedUsers,
      certificates: formattedCerts,
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
  }
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
        `transaction:${organizationId}:`
      );

      const transactions = allTransactions
        .filter((item) => item.value && typeof item.value === "object")
        .map((item) => item.value)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      console.log(`✅ Found ${transactions.length} transactions`);
      return c.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      return c.json({ error: `Failed to get transactions: ${error}` }, 500);
    }
  }
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
      `💳 Initializing payment for org: ${organizationId}, plan: ${planId}`
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
        400
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
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack error:", paystackData);
      return c.json(
        {
          error: paystackData.message || "Failed to initialize payment",
        },
        500
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
      }
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
        400
      );
    }

    // Get transaction
    const metadata = paystackData.data.metadata;
    const organizationId = metadata.organizationId;
    const planId = metadata.planId;

    const transaction = await kv.get(
      `transaction:${organizationId}:${reference}`
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
        `transaction:${organizationId}:${reference}`
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
        `✅ Webhook: Subscription activated for org ${organizationId}`
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
        "⚠️ Attempt to change keys, but keys are set via environment variables"
      );
      return c.json(
        {
          error:
            "Paystack keys are managed via environment variables and cannot be updated via this endpoint",
        },
        400
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

// ==================== START THE SERVER ====================

console.log("📡 Health endpoint: /make-server-a611b057/health");
console.log("🔐 Admin endpoint: /make-server-a611b057/admin/platform-data");
console.log("💳 Billing endpoints: /make-server-a611b057/billing/*");
console.log("✅ Server is ready to accept requests");

Deno.serve(app.fetch);
