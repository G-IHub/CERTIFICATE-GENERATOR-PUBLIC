/**
 * Upload blog image to Supabase Storage
 */
export async function uploadBlogImage(c: Context) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const bucketName = "make-a611b057-blog-images";

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating blog images bucket: ${bucketName}`);
      const { error: bucketError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: true, // Make images publicly accessible
        },
      );

      if (bucketError) {
        console.error("❌ Error creating bucket:", bucketError);
        return c.json(
          {
            error: "Failed to create storage bucket",
            details: bucketError.message,
          },
          500,
        );
      }
    }

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "file is required" }, 400);
    }

    console.log(`📤 Uploading blog image: ${file.name} (${file.size} bytes)`);

    // Generate unique filename  (platform-wide, no org folder needed)
    const ext = file.name.split(".").pop();
    const filename = `platform/${crypto.randomUUID()}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("❌ Error uploading image:", error);
      return c.json(
        { error: "Failed to upload image", details: error.message },
        500,
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    console.log(`✅ Image uploaded successfully: ${urlData.publicUrl}`);

    return c.json({
      url: urlData.publicUrl,
      filename: data.path,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Error uploading blog image:", error);
    return c.json(
      { error: "Failed to upload image", details: String(error) },
      500,
    );
  }
}