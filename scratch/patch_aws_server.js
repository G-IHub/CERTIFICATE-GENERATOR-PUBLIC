const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'aws', 'server', 'index.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize all newlines to LF for standard replacements, then we can write back.
content = content.replace(/\r\n/g, '\n');

// Patch platform-data enrichedOrgs block
const targetEnrichedOrgs = `    // Enrich organizations with owner email and subscription data
    const enrichedOrgs = await Promise.all(
      validOrgs.map(async (org) => {
        // Find the owner user
        const ownerUser = validUsers.find((u) => u.id === org.ownerId);

        // Get subscription for this organization - USE CORRECT KEY FORMAT
        const subscription = await kv.get(\`subscription:org:\${org.id}\`);

        if (subscription) {
          console.log(\`✅ Found subscription for \${org.name}:\`, {
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
          courses: org.courses || [],
          settings: org.settings || null,
          subscription: subscription || null,
        };
      }),
    );`;

const replacementEnrichedOrgs = `    // Enrich organizations with owner email and subscription data
    const enrichedOrgs = validOrgs.map((org) => {
      // Find the owner user
      const ownerUser = validUsers.find((u) => u.id === org.ownerId);

      // Find subscription from pre-fetched list
      const subEntry = subscriptionList.find((s) => s.key === \`subscription:org:\${org.id}\`);
      const subscription = subEntry ? subEntry.value : null;

      if (subscription) {
        console.log(\`✅ Found subscription for \${org.name}:\`, {
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
        courses: org.courses || [],
        settings: org.settings || null,
        subscription: subscription || null,
      };
    });`;

if (content.includes(targetEnrichedOrgs)) {
  content = content.replace(targetEnrichedOrgs, replacementEnrichedOrgs);
  console.log("✅ Patched enrichedOrgs successfully");
} else {
  console.error("❌ Could not find enrichedOrgs target block");
}

// Convert newlines back to CRLF (since this is on Windows)
const finalContent = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("🎉 All patches applied to AWS index.ts successfully!");
