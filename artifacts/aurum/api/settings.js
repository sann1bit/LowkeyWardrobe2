import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const DEFAULTS = {
  sale_banner_text:       { value: 'Up to 60% off',          label: 'Sale Banner Text' },
  hero_1_eyebrow:         { value: 'SS26 Collection',         label: 'Hero Slide 1 — Eyebrow' },
  hero_1_line1:           { value: 'Be Seen',                 label: 'Hero Slide 1 — Line 1' },
  hero_1_line2:           { value: 'Be Remembered',           label: 'Hero Slide 1 — Line 2' },
  hero_2_eyebrow:         { value: 'New Arrivals',            label: 'Hero Slide 2 — Eyebrow' },
  hero_2_line1:           { value: 'Luxury is a Feeling',     label: 'Hero Slide 2 — Line 1' },
  hero_2_line2:           { value: 'We Make it Real',         label: 'Hero Slide 2 — Line 2' },
  hero_3_eyebrow:         { value: 'Heritage',                label: 'Hero Slide 3 — Eyebrow' },
  hero_3_line1:           { value: 'Less Noise',              label: 'Hero Slide 3 — Line 1' },
  hero_3_line2:           { value: 'Pure Class.',             label: 'Hero Slide 3 — Line 2' },
  hero_cta_primary:       { value: 'Shop Collection',         label: 'Hero CTA — Primary Button' },
  hero_cta_secondary:     { value: 'New Arrivals',            label: 'Hero CTA — Secondary Button' },
  marquee_text:           { value: 'Free shipping on orders over PKR 15,000 · Complimentary gift wrapping · SS26 Collection — Now Available · 7-day returns · Exclusive member benefits ·', label: 'Marquee Banner Text' },
  free_shipping_threshold:{ value: '15000',                   label: 'Free Shipping Threshold (PKR)' },
  newsletter_tagline:     { value: 'First access to new collections, exclusive events, and members-only offers.', label: 'Newsletter Tagline' },
  new_arrivals_title:     { value: 'New Arrivals',            label: 'New Arrivals — Section Title' },
  new_arrivals_cta:       { value: 'View All Products',       label: 'New Arrivals — CTA Button' },
  show_marquee:           { value: 'true',                    label: 'Show Marquee Banner' },
  show_sale_banner:       { value: 'true',                    label: 'Show Sale Banner' },
  show_new_arrivals:      { value: 'true',                    label: 'Show New Arrivals' },
  show_editorial:         { value: 'true',                    label: 'Show Editorial Section' },
  show_brands:            { value: 'true',                    label: 'Show Brands Strip' },
  show_features:          { value: 'true',                    label: 'Show Features (Shipping/Returns)' },
  home_section_order:     { value: JSON.stringify(['marquee','categories','sale_banner','new_arrivals','editorial','brands','features','newsletter']), label: 'Homepage Section Order (JSON)' },
};

function verifyJwt(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const secret = process.env.SESSION_SECRET || '';
    const sig = createHmac('sha256', secret)
      .update(parts[0] + '.' + parts[1])
      .digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return sig === parts[2];
  } catch (_) { return false; }
}

async function ensureDefaults(supabase) {
  const rows = Object.entries(DEFAULTS).map(([key, { value, label }]) => ({
    key, value, label, updated_at: new Date().toISOString(),
  }));
  await supabase.from('site_settings').upsert(rows, { onConflict: 'key', ignoreDuplicates: true });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(
    (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const isAdmin = verifyJwt(req);
  const q = req.query || {};

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    await ensureDefaults(supabase);
    const { data, error } = await supabase.from('site_settings').select('*').order('key');
    if (error) {
      // Return hardcoded defaults on DB error
      const fallback = {};
      for (const [k, v] of Object.entries(DEFAULTS)) fallback[k] = v.value;
      return res.status(200).json(isAdmin ? Object.entries(DEFAULTS).map(([key, d]) => ({ key, value: d.value, label: d.label, updated_at: null })) : fallback);
    }

    if (isAdmin) {
      // Admin: return full rows array
      return res.status(200).json(data || []);
    } else {
      // Public: return key→value map
      const map = {};
      for (const [k, v] of Object.entries(DEFAULTS)) map[k] = v.value; // defaults first
      for (const row of (data || [])) map[row.key] = row.value;
      return res.status(200).json(map);
    }
  }

  // ── PUT (update single setting) ────────────────────────────────────────────
  if (req.method === 'PUT') {
    if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

    // Key comes from query param (set by Vercel rewrite from /api/admin/settings/:key)
    const key = q.key;
    if (!key) return res.status(400).json({ error: 'Missing key' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }

    const value = body?.value;
    if (typeof value !== 'string') return res.status(400).json({ error: 'value must be a string' });

    const { error } = await supabase.from('site_settings').upsert(
      { key, value, label: DEFAULTS[key]?.label ?? key, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ key, value });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
