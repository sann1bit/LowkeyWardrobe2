import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "product-images";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  }
}

export async function getUploadSignedUrl(
  contentType: string
): Promise<{ uploadURL: string; objectPath: string; publicUrl: string }> {
  const ext = contentType.split("/")[1] || "jpg";
  const objectName = `uploads/${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(objectName);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(objectName);

  return {
    uploadURL: data.signedUrl,
    objectPath: `/storage/objects/${objectName}`,
    publicUrl: urlData.publicUrl,
  };
}

export async function getPublicUrl(objectName: string): Promise<string> {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectName);
  return data.publicUrl;
}

export async function downloadObject(
  objectName: string
): Promise<{ data: Blob; contentType: string } | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(objectName);
  if (error || !data) return null;
  return { data, contentType: data.type };
}
