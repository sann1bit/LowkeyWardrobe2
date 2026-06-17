import { randomUUID } from "crypto";

const BUCKET_NAME = "product-images";

function requireSupabaseConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return { url, key };
}

export async function ensureBucket(): Promise<void> {
  const { url, key } = requireSupabaseConfig();

  const listRes = await fetch(`${url}/storage/v1/bucket`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!listRes.ok) {
    return;
  }

  const buckets = (await listRes.json()) as Array<{ name: string }>;
  const exists = buckets.some((b) => b.name === BUCKET_NAME);
  if (exists) return;

  await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: BUCKET_NAME, name: BUCKET_NAME, public: true }),
  });
}

export function getObjectPublicUrl(objectName: string): string {
  const { url } = requireSupabaseConfig();
  return `${url}/storage/v1/object/public/${BUCKET_NAME}/${objectName}`;
}

export async function uploadObject(
  objectName: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const { url, key } = requireSupabaseConfig();
  await ensureBucket();

  const uploadUrl = `${url}/storage/v1/object/${BUCKET_NAME}/${objectName}`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: new Blob([buffer], { type: contentType }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      message = parsed.message || parsed.error || text;
    } catch {
      // keep raw text
    }
    throw new Error(message || `Upload failed with status ${res.status}`);
  }
}

export async function getUploadSignedUrl(
  contentType: string,
): Promise<{ uploadURL: string; objectPath: string; publicUrl: string }> {
  const { url, key } = requireSupabaseConfig();
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const objectName = `uploads/${randomUUID()}.${ext}`;

  await ensureBucket();

  const signRes = await fetch(
    `${url}/storage/v1/object/upload/sign/${BUCKET_NAME}/${objectName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!signRes.ok) {
    const text = await signRes.text();
    throw new Error(`Failed to create signed upload URL: ${text}`);
  }

  const data = (await signRes.json()) as { signedUrl?: string; url?: string };
  const uploadURL = data.signedUrl || data.url;
  if (!uploadURL) {
    throw new Error("Signed upload URL missing from Supabase response");
  }

  return {
    uploadURL,
    objectPath: `/storage/objects/${objectName}`,
    publicUrl: getObjectPublicUrl(objectName),
  };
}

export async function getPublicUrl(objectName: string): Promise<string> {
  return getObjectPublicUrl(objectName);
}

export async function downloadObject(
  objectName: string,
): Promise<{ data: Blob; contentType: string } | null> {
  const { url, key } = requireSupabaseConfig();
  const res = await fetch(`${url}/storage/v1/object/${BUCKET_NAME}/${objectName}`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) return null;
  const data = await res.blob();
  return { data, contentType: data.type };
}
