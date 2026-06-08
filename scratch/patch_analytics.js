const fs = require('fs');
const path = require('path');

const replacement = `app.get("/make-server-a611b057/admin/analytics", async (c) => {
  try {
    console.log("📊 Analytics request");

    // Get all data from KV store in parallel
    const [rawOrgs, rawUsers, rawCerts, rawTestimonials, subscriptionList] = await Promise.all([
      kv.getByPrefix("org:"),
      kv.getByPrefix("user:"),
      kv.getByPrefix("cert:"),
      kv.getByPrefix("testimonial:"),
      (async () => {
        const list = [];
        for await (const entry of kv.list({ prefix: "subscription:org:" })) {
          list.push(entry);
        }
        return list;
      })(),
    ]);

    const allOrgs = rawOrgs.filter((org) => org && org.id);
    const allUsers = rawUsers.filter((user) => user && user.id);
    const allCerts = rawCerts.filter((cert) => cert && cert.id);
    const allTestimonials = rawTestimonials.filter((t) => t && t.id);

    console.log(
      \`📊 Data loaded: \${allOrgs.length} orgs, \${allUsers.length} users, \${allCerts.length} certs\`
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
        (cert: any) => cert.organizationId === org.id
      );
      const orgTestimonials = allTestimonials.filter(
        (t: any) => t.organizationId === org.id
      );
      const orgCourses = org.courses || org.programs || [];

      // Find the owner user to get their actual email
      const ownerUser = allUsers.find((u: any) => u.id === org.ownerId);
      const ownerEmail = ownerUser?.email || "";

      // Find subscription from pre-fetched list
      const subEntry = subscriptionList.find((s) => s.key === \`subscription:org:\${org.id}\`);
      const subscription = subEntry ? subEntry.value : null;
      const isPremium =
        subscription &&
        subscription.status === "active" &&
        subscription.plan !== "free";

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
        return certDate.getTime() >= weekAgo.getTime();
      }).length;

      const certsThisMonth = orgCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate.getTime() >= monthAgo.getTime();
      }).length;

      // Calculate days active
      const createdDate = new Date(org.createdAt || now);
      const daysActive = Math.max(
        1,
        Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        )
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
        ownerEmail: ownerEmail,
        createdAt: org.createdAt,
        isPremium,
        totalCertificates: orgCerts.length,
        totalCourses: orgCourses.length,
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
        (cert: any) => cert.createdBy === user.id || cert.organizationId === user.organizationId
      );
      const userOrg = allOrgs.find(
        (org: any) => org.id === user.organizationId
      );

      // Courses created by user
      const userOrgCourses = userOrg?.courses || userOrg?.programs || [];
      const userCourses = userOrgCourses.filter(
        (prog: any) => prog.createdBy === user.id || !prog.createdBy
      );

      // Time-based metrics
      const certsThisWeek = userCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate.getTime() >= weekAgo.getTime();
      }).length;

      const certsThisMonth = userCerts.filter((cert: any) => {
        const certDate = new Date(cert.createdAt || cert.generatedAt || 0);
        return certDate.getTime() >= monthAgo.getTime();
      }).length;

      // Calculate days active
      const createdDate = new Date(user.createdAt || now);
      const daysActive = Math.max(
        1,
        Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        )
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
        totalCoursesCreated: userCourses.length,
        lastLogin,
        daysActive,
        certificatesThisWeek: certsThisWeek,
        certificatesThisMonth: certsThisMonth,
        mostActiveDay: "N/A",
      };
    });

    // Platform stats
    const activeOrgsThisWeek = organizationAnalytics.filter(
      (org) => org.certificatesThisWeek > 0
    ).length;
    const activeUsersThisWeek = userAnalytics.filter(
      (user) => user.certificatesThisWeek > 0
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
      \`✅ Analytics generated: \${organizationAnalytics.length} orgs, \${userAnalytics.length} users\`
    );

    return c.json({
      organizations: organizationAnalytics,
      users: userAnalytics,
      platformStats,
    });
  } catch (error) {
    console.error("❌ Error generating analytics:", error);
    return c.json(
      { error: \`Server error generating analytics: \${error}\` },
      500
    );
  }
});`;

function patchFile(relativeFilePath) {
  const filePath = path.join(__dirname, '..', relativeFilePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const normalized = content.replace(/\r\n/g, '\n');

  // We want to find the app.get("/make-server-a611b057/admin/analytics", ...) block and replace it.
  const startIdx = normalized.indexOf('app.get("/make-server-a611b057/admin/analytics"');
  if (startIdx === -1) {
    console.error(`❌ Could not find analytics route start in ${relativeFilePath}`);
    return;
  }

  // Find the end of this block by matching curly braces or identifying where the next route starts.
  // The next route in index.ts is // ==================== LOGS/AUDIT SYSTEM ==================== or billing
  // Let's find: return c.json({ organizations: organizationAnalytics, ... })
  // and trace to the end of the try-catch block
  const endMarker = 'return c.json(\n      { error: `Server error generating analytics: ${error}` },\n      500,\n    );\n  }\n});';
  const endMarkerAlt = 'return c.json(\n      { error: `Server error generating analytics: ${error}` },\n      500\n    );\n  }\n});';
  let endIdx = normalized.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    endIdx = normalized.indexOf(endMarkerAlt, startIdx);
  }

  if (endIdx === -1) {
    // Let's try finding the next route prefix: "app.post" or "app.get"
    console.error(`❌ Could not find analytics route end in ${relativeFilePath}`);
    return;
  }

  const exactEndIdx = endIdx + (normalized.includes(endMarker) ? endMarker.length : endMarkerAlt.length);
  const targetBlock = normalized.substring(startIdx, exactEndIdx);

  const newNormalized = normalized.replace(targetBlock, replacement);
  const finalContent = newNormalized.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log(`✅ Successfully patched ${relativeFilePath}`);
}

patchFile('supabase/functions/make-server-a611b057/index.ts');
patchFile('src/aws/server/index.ts');
console.log("🎉 Analytics patch run complete!");
