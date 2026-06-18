import { randomUUID } from "crypto";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel project settings.",
    });
  }

  const { data: base64, type: contentType } = req.body ?? {};

  if (typeof base64 !== "string" || !base64) {
    return res.status(400).json({ error: "Missing required field: data (base64 string)" });
  }
  if (typeof contentType !== "string" || !contentType) {
    return res.status(400).json({ error: "Missing required field: type (MIME type)" });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    return res.status(400).json({ error: "Empty file data" });
  }

  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const objectName = `uploads/${randomUUID()}.${ext}`;
  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  const uploadUrl = `${baseUrl}/storage/v1/object/product-images/${objectName}`;

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Blob([buffer], { type: contentType }),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return res.status(500).json({ error: `Supabase upload failed: ${text}` });
  }

  const publicUrl = `${baseUrl}/storage/v1/object/public/product-images/${objectName}`;
  return res.json({ publicUrl, objectName });
}
