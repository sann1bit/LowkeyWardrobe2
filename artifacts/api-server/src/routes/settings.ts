import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "aurum-secret-key";

const DEFAULT_SETTINGS: Record<string, { value: string; label: string }> = {
  sale_banner_text:       { value: "Up to 60% off",          label: "Sale Banner Text" },
  hero_1_eyebrow:         { value: "SS26 Collection",         label: "Hero Slide 1 — Eyebrow" },
  hero_1_line1:           { value: "Be Seen",                 label: "Hero Slide 1 — Line 1" },
  hero_1_line2:           { value: "Be Remembered",           label: "Hero Slide 1 — Line 2" },
  hero_2_eyebrow:         { value: "New Arrivals",            label: "Hero Slide 2 — Eyebrow" },
  hero_2_line1:           { value: "Luxury is a Feeling",     label: "Hero Slide 2 — Line 1" },
  hero_2_line2:           { value: "We Make it Real",         label: "Hero Slide 2 — Line 2" },
  hero_3_eyebrow:         { value: "Heritage",                label: "Hero Slide 3 — Eyebrow" },
  hero_3_line1:           { value: "Less Noise",              label: "Hero Slide 3 — Line 1" },
  hero_3_line2:           { value: "Pure Class.",             label: "Hero Slide 3 — Line 2" },
  hero_cta_primary:       { value: "Shop Collection",         label: "Hero CTA — Primary Button" },
  hero_cta_secondary:     { value: "New Arrivals",            label: "Hero CTA — Secondary Button" },
  marquee_text:           { value: "Free shipping on orders over PKR 15,000 · Complimentary gift wrapping · SS26 Collection — Now Available · 7-day returns · Exclusive member benefits ·", label: "Marquee Banner Text" },
  free_shipping_threshold:{ value: "15000",                   label: "Free Shipping Threshold (PKR)" },
  newsletter_tagline:     { value: "First access to new collections, exclusive events, and members-only offers.", label: "Newsletter Tagline" },
  new_arrivals_title:     { value: "New Arrivals",            label: "New Arrivals — Section Title" },
  new_arrivals_cta:       { value: "View All Products",       label: "New Arrivals — CTA Button" },
  show_marquee:           { value: "true",                    label: "Show Marquee Banner" },
  show_sale_banner:       { value: "true",                    label: "Show Sale Banner" },
  show_new_arrivals:      { value: "true",                    label: "Show New Arrivals" },
  show_editorial:         { value: "true",                    label: "Show Editorial Section" },
  show_brands:            { value: "true",                    label: "Show Brands Strip" },
  show_features:          { value: "true",                    label: "Show Features (Shipping/Returns)" },
  home_section_order:     { value: JSON.stringify(["marquee","categories","sale_banner","new_arrivals","editorial","brands","features","newsletter"]), label: "Homepage Section Order (JSON)" },
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL DEFAULT '',
      label      TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  tableReady = true;
}

async function ensureDefaultSettings() {
  await ensureTable();
  for (const [key, { value, label }] of Object.entries(DEFAULT_SETTINGS)) {
    await db.execute(sql`
      INSERT INTO site_settings (key, value, label, updated_at)
      VALUES (${key}, ${value}, ${label}, NOW())
      ON CONFLICT (key) DO NOTHING
    `);
  }
}

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/settings", async (req, res) => {
  try {
    await ensureDefaultSettings();
    const rows = await db.select().from(siteSettingsTable);
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) result[k] = v.value;
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
  } catch (err) {
    req.log.error(err);
    const fallback: Record<string, string> = {};
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) fallback[k] = v.value;
    res.json(fallback);
  }
});

router.get("/admin/settings", verifyAdmin, async (req, res) => {
  try {
    await ensureDefaultSettings();
    const rows = await db.select().from(siteSettingsTable);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/admin/settings/:key", verifyAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body as { value: string };
  if (typeof value !== "string") return res.status(400).json({ error: "value must be a string" });
  try {
    await ensureTable();
    await db.execute(sql`
      INSERT INTO site_settings (key, value, label, updated_at)
      VALUES (${key}, ${value}, ${DEFAULT_SETTINGS[key]?.label ?? key}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    res.json({ key, value });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
