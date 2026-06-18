const { randomUUID } = require("crypto");

const BUCKET = "product-images";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !KEY) {
    return res.status(500).json({
      error:
        "Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your Vercel project environment variables.",
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const base64 = body && body.data;
  const contentType = body && body.type;

  if (typeof base64 !== "string" || !base64) {
    return res.status(400).json({ error: "Missing required field: data (base64 string)" });
  }
  if (typeof contentType !== "string" || !contentType) {
    return res.status(400).json({ error: "Missing required field: type (MIME type)" });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    return res.status(400).json({ error: "Empty file data after base64 decode" });
  }

  const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const objectName = `uploads/${randomUUID()}.${ext}`;

  const supabaseHeaders = {
    Authorization: `Bearer ${KEY}`,
    apikey: KEY,
  };

  try {
    const bucketsRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: supabaseHeaders,
    });
    if (bucketsRes.ok) {
      const buckets = await bucketsRes.json();
      const exists = Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET);
      if (!exists) {
        await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
          method: "POST",
          headers: { ...supabaseHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
        });
      }
    }
  } catch (_) {}

  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectName}`,
    {
      method: "POST",
      headers: {
        ...supabaseHeaders,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: buffer,
    }
  );

  if (!uploadRes.ok) {
    const raw = await uploadRes.text();
    let msg = raw;
    try {
      const parsed = JSON.parse(raw);
      msg = parsed.message || parsed.error || raw;
    } catch (_) {}
    console.error("Supabase upload error:", uploadRes.status, msg);
    return res.status(500).json({
      error: `Upload to Supabase failed (${uploadRes.status}): ${msg}`,
    });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectName}`;
  return res.status(200).json({ publicUrl, objectName });
};
