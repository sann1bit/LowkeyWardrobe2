const crypto = require("crypto");

const BUCKET = "product-images";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!SUPABASE_URL || !KEY) {
    return res.status(500).json({
      error: "Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel project settings.",
    });
  }

  // Parse body — Vercel parses JSON automatically but handle string case too
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const base64 = body && body.data;
  const contentType = body && body.type;

  if (!base64 || typeof base64 !== "string") {
    return res.status(400).json({ error: "Missing field: data (base64 string)" });
  }
  if (!contentType || typeof contentType !== "string") {
    return res.status(400).json({ error: "Missing field: type (MIME type)" });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    return res.status(400).json({ error: "Empty file after base64 decode" });
  }

  const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const objectName = "uploads/" + crypto.randomUUID() + "." + ext;

  const headers = {
    Authorization: "Bearer " + KEY,
    apikey: KEY,
  };

  // Auto-create bucket if missing
  try {
    const listRes = await fetch(SUPABASE_URL + "/storage/v1/bucket", { headers });
    if (listRes.ok) {
      const buckets = await listRes.json();
      if (!Array.isArray(buckets) || !buckets.some(function(b) { return b.name === BUCKET; })) {
        await fetch(SUPABASE_URL + "/storage/v1/bucket", {
          method: "POST",
          headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
          body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
        });
      }
    }
  } catch (_) { /* non-fatal — bucket probably exists already */ }

  // Upload to Supabase Storage
  const uploadRes = await fetch(
    SUPABASE_URL + "/storage/v1/object/" + BUCKET + "/" + objectName,
    {
      method: "POST",
      headers: Object.assign({}, headers, {
        "Content-Type": contentType,
        "x-upsert": "true",
      }),
      body: buffer,
    }
  );

  if (!uploadRes.ok) {
    const raw = await uploadRes.text();
    let msg = raw;
    try { msg = JSON.parse(raw).message || JSON.parse(raw).error || raw; } catch (_) {}
    console.error("Supabase Storage upload error", uploadRes.status, msg);
    return res.status(500).json({ error: "Upload failed (" + uploadRes.status + "): " + msg });
  }

  const publicUrl =
    SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/" + objectName;

  return res.status(200).json({ publicUrl: publicUrl, objectName: objectName });
};
