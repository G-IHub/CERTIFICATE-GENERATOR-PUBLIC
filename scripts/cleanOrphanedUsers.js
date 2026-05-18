
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanOrphanedUsers() {
  console.log("Fetching all users from Supabase Auth...");
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error fetching auth users:", authError);
    return;
  }
  
  const authUsers = authData.users;
  console.log(`Found ${authUsers.length} users in Supabase Auth.`);

  console.log("Fetching user records from KV store...");
  const { data: kvData, error: kvError } = await supabase
    .from("kv_store_a611b057")
    .select("key")
    .like("key", "user:%");

  if (kvError) {
    console.error("Error fetching KV store data:", kvError);
    return;
  }

  const validUserIds = new Set(kvData.map(row => row.key.replace("user:", "")));
  console.log(`Found ${validUserIds.size} valid users in KV store.`);

  let deletedCount = 0;

  for (const user of authUsers) {
    if (!validUserIds.has(user.id)) {
      console.log(`Deleting orphaned user: ${user.email} (ID: ${user.id})`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError);
      } else {
        console.log(`Successfully deleted ${user.email}`);
        deletedCount++;
      }
    }
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} orphaned users.`);
}

cleanOrphanedUsers();
