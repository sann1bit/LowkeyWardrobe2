import { randomUUID, createHmac } from 'crypto';

// ── Supabase helpers ──────────────────────────────────────────────────────────

function sb() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  return { url, key };
}

function sbHeaders(key, extra) {
  return Object.assign(
    { Authorization: 'Bearer ' + key, apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    extra || {}
  );
}

// ── JWT verification ──────────────────────────────────────────────────────────

function verifyJwt(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const secret = process.env.SESSION_SECRET || 'aurum-secret-key';
    const sig = createHmac('sha256', secret)
      .update(parts[0] + '.' + parts[1])
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return sig === parts[2];
  } catch (_) {
    return false;
  }
}

// ── Normalize DB row → API shape ──────────────────────────────────────────────

function normalize(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : null,
    category: p.category,
    subcategory: p.subcategory || null,
    badge: p.badge || null,
    colors: p.colors || [],
    sizes: p.sizes || [],
    description: p.description || '',
    imageUrl: p.image_url || null,
    images: p.images || [],
    featured: p.featured || false,
    sku: p.sku || '',
    stock: Number(p.stock) || 0,
    tags: p.tags || [],
    isActive: p.is_active !== false,
    figType: p.fig_type || 'a',
    bgGradient: p.bg_gradient || '#f5f5f5',
    figColorA: p.fig_color_a || '#cccccc',
    figColorB: p.fig_color_b || '#aaaaaa',
    createdAt: p.created_at || null,
  };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') { try { return JSON.parse(body); } catch (_) { return {}; } }
  return body;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Admin = valid JWT in Authorization header
  const isAdmin = verifyJwt(req);

  let url_, key_;
  try { const s = sb(); url_ = s.url; key_ = s.key; }
  catch (err) { return res.status(500).json({ error: err.message }); }

  const base = url_ + '/rest/v1/products';
  const h = sbHeaders(key_);

  // ID comes from query param (set by Vercel rewrite) OR URL path
  const q = req.query || {};
  const idFromQuery = q.id;
  const idFromPath = (req.url || '').match(/\/products\/(\d+)/)?.[1];
  const id = idFromQuery || idFromPath || null;

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (id) {
      // Single product by ID
      const r = await fetch(base + '?id=eq.' + id + '&limit=1', {
        headers: Object.assign({}, h, { Prefer: '' }),
      });
      if (!r.ok) return res.status(r.status).json({ error: await r.text() });
      const rows = await r.json();
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(normalize(rows[0]));
    }

    // Build Supabase query with filters
    const params = new URLSearchParams();

    // Active-only for public requests
    if (!isAdmin) params.append('is_active', 'eq.true');

    // Category filter
    if (q.category) params.append('category', 'eq.' + q.category);

    // Badge filter (new / sale)
    if (q.badge) params.append('badge', 'eq.' + q.badge);

    // Price range
    if (q.minPrice) params.append('price', 'gte.' + q.minPrice);
    if (q.maxPrice) params.append('price', 'lte.' + q.maxPrice);

    // Full-text search via name/brand ilike
    if (q.q) {
      const term = q.q.replace(/[%_]/g, '\\$&');
      params.append('or', `(name.ilike.*${term}*,brand.ilike.*${term}*)`);
    }

    // Sort
    switch (q.sortBy) {
      case 'price-asc':  params.append('order', 'price.asc');        break;
      case 'price-desc': params.append('order', 'price.desc');       break;
      case 'name-asc':   params.append('order', 'name.asc');         break;
      case 'newest':     params.append('order', 'created_at.desc');  break;
      default:           params.append('order', 'id.asc');           break;
    }

    const qs = params.toString();
    const endpoint = base + (qs ? '?' + qs : '');
    const r = await fetch(endpoint, { headers: Object.assign({}, h, { Prefer: '' }) });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const rows = await r.json();
    return res.status(200).json((rows || []).map(normalize));
  }

  // All write operations require admin JWT
  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

  // ── POST (create) ──────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const b = parseBody(req.body);
    if (!b.name || b.price == null) {
      return res.status(400).json({ error: 'name and price are required' });
    }
    const images = Array.isArray(b.images) ? b.images.filter(Boolean) : [];
    const payload = {
      name: b.name,
      slug: slugify(b.name) + '-' + Date.now(),
      sku: b.sku || ('LKW-' + randomUUID().slice(0, 8).toUpperCase()),
      brand: b.brand || 'Lowkey Wardrobe',
      price: Number(b.price),
      original_price: b.originalPrice ? Number(b.originalPrice) : null,
      category: b.category || 'clothing',
      subcategory: b.subcategory || null,
      badge: b.badge || null,
      colors: b.colors || [],
      sizes: b.sizes || [],
      description: b.description || '',
      image_url: b.imageUrl || images[0] || null,
      images,
      featured: b.featured || false,
      stock: Number(b.stock) || 0,
      tags: b.tags || [],
      is_active: b.isActive !== false,
      fig_type: b.figType || 'a',
      bg_gradient: b.bgGradient || '#f5f5f5',
      fig_color_a: b.figColorA || '#cccccc',
      fig_color_b: b.figColorB || '#aaaaaa',
    };

    const r = await fetch(base, { method: 'POST', headers: h, body: JSON.stringify(payload) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: JSON.stringify(data) });
    const row = Array.isArray(data) ? data[0] : data;
    return res.status(201).json(normalize(row));
  }

  // ── PUT / PATCH (update) ───────────────────────────────────────────────────
  if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
    const b = parseBody(req.body);
    const patch = {};
    if (b.name !== undefined) patch.name = b.name;
    if (b.brand !== undefined) patch.brand = b.brand;
    if (b.category !== undefined) patch.category = b.category;
    if (b.subcategory !== undefined) patch.subcategory = b.subcategory || null;
    if (b.price !== undefined) patch.price = Number(b.price);
    if (b.originalPrice !== undefined) patch.original_price = b.originalPrice ? Number(b.originalPrice) : null;
    if (b.badge !== undefined) patch.badge = b.badge || null;
    if (b.stock !== undefined) patch.stock = Number(b.stock);
    if (b.sizes !== undefined) patch.sizes = b.sizes;
    if (b.colors !== undefined) patch.colors = b.colors;
    if (b.description !== undefined) patch.description = b.description;
    if (b.imageUrl !== undefined) patch.image_url = b.imageUrl || null;
    if (b.images !== undefined) {
      const imgs = Array.isArray(b.images) ? b.images.filter(Boolean) : [];
      patch.images = imgs;
      if (patch.image_url === undefined && imgs.length > 0) patch.image_url = imgs[0];
    }
    if (b.featured !== undefined) patch.featured = b.featured;
    if (b.isActive !== undefined) patch.is_active = b.isActive;
    if (b.tags !== undefined) patch.tags = b.tags;
    if (b.figType !== undefined) patch.fig_type = b.figType;
    if (b.bgGradient !== undefined) patch.bg_gradient = b.bgGradient;
    if (b.figColorA !== undefined) patch.fig_color_a = b.figColorA;
    if (b.figColorB !== undefined) patch.fig_color_b = b.figColorB;

    const r = await fetch(base + '?id=eq.' + id, { method: 'PATCH', headers: h, body: JSON.stringify(patch) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: JSON.stringify(data) });
    const row = Array.isArray(data) ? data[0] : data;
    return res.status(200).json(normalize(row));
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE' && id) {
    const r = await fetch(base + '?id=eq.' + id, {
      method: 'DELETE',
      headers: Object.assign({}, h, { Prefer: '' }),
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
