import { createClient } from "jsr:@supabase/supabase-js";

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_a611b057").upsert({
    key,
    value,
  });
  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_a611b057")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_a611b057")
    .delete()
    .eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_a611b057")
    .upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_a611b057")
    .select("value")
    .in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_a611b057")
    .delete()
    .in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_a611b057")
    .select("key, value")
    .like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Get keys by prefix (returns array of keys, not values)
export const getKeysByPrefix = async (prefix: string): Promise<string[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_a611b057")
    .select("key")
    .like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.key) ?? [];
};

// List entries by prefix — returns an async iterable of { key, value } objects.
// Mimics the Deno KV list() API so monetization code can iterate with "for await".
export async function* list(options: { prefix: string }): AsyncGenerator<{ key: string; value: any }> {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_a611b057")
    .select("key, value")
    .like("key", options.prefix + "%");
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    yield { key: row.key, value: row.value };
  }
}