const { randomUUID, createHmac } = require("crypto");

const SUPABASE_REST = () => {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return { url, key };
};

function supabaseHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function verifyAdminJwt(req) {
  const auth = req.headers["authorization"] || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const secret = process.env.SESSION_SECRET || "";
    const sig = createHmac("sha256", secret)
      .update(parts[0] + "." + parts[1])
      .digest("base64url");
    return sig === parts[2];
  } catch (_) {
    return false;
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory || null,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    badge: p.badge || null,
    stock: Number(p.stock) || 0,
    sizes: p.sizes || [],
    colors: p.colors || [],
    description: p.description || "",
    imageUrl: p.image_url || null,
    images: p.images || [],
    featured: p.featured ?? false,
    isActive: p.is_active ?? true,
    sku: p.sku || "",
  };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch (_) { return {}; }
  }
  return body;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const urlPath = req.url || "";
  const isAdminRoute =
    urlPath.includes("/admin/products") || urlPath.startsWith("/api/admin/products");

  if (isAdminRoute && !verifyAdminJwt(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let sbUrl, sbKey;
  try {
    const sb = SUPABASE_REST();
    sbUrl = sb.url;
    sbKey = sb.key;
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const restBase = `${sbUrl}/rest/v1/products`;
  const headers = supabaseHeaders(sbKey);

  const idMatch = urlPath.match(/\/products\/(\d+)/);
  const productId = idMatch ? idMatch[1] : null;

  if (req.method === "GET") {
    let endpoint = restBase + "?order=id.desc";
    if (productId) {
      endpoint = restBase + `?id=eq.${productId}`;
    } else if (!isAdminRoute) {
      endpoint += "&is_active=eq.true";
    }

    const r = await fetch(endpoint, {
      headers: { ...headers, Prefer: "" },
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: t });
    }
    const data = await r.json();
    if (productId) {
      if (!data || data.length === 0) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(normalizeProduct(data[0]));
    }
    return res.status(200).json((data || []).map(normalizeProduct));
  }

  if (req.method === "POST" && isAdminRoute) {
    const body = parseBody(req.body);
    const { name, brand, category, subcategory, price, originalPrice, badge, stock, sizes, colors, description, imageUrl, images, featured, isActive } = body;

    if (!name || price == null) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const slug = slugify(name) + "-" + Date.now();
    const sku = "LKW-" + randomUUID().slice(0, 8).toUpperCase();
    const imageList = Array.isArray(images) ? images.filter(Boolean) : [];

    const payload = {
      name,
      slug,
      sku,
      brand: brand || "Lowkey Wardrobe",
      category: category || "clothing",
      subcategory: subcategory || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      badge: badge || null,
      stock: Number(stock) || 0,
      sizes: sizes || [],
      colors: colors || [],
      description: description || "",
      image_url: imageUrl || imageList[0] || null,
      images: imageList,
      featured: featured ?? false,
      is_active: isActive ?? true,
    };

    const r = await fetch(restBase, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: JSON.stringify(data) });
    const created = Array.isArray(data) ? data[0] : data;
    return res.status(201).json(normalizeProduct(created));
  }

  if (req.method === "PUT" && isAdminRoute && productId) {
    const body = parseBody(req.body);
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.category !== undefined) updates.category = body.category;
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory || null;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.originalPrice !== undefined) updates.original_price = body.originalPrice ? Number(body.originalPrice) : null;
    if (body.badge !== undefined) updates.badge = body.badge || null;
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.sizes !== undefined) updates.sizes = body.sizes;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.description !== undefined) updates.description = body.description;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.images !== undefined) {
      const imageList = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
      updates.images = imageList;
      if (!updates.image_url && imageList.length > 0) updates.image_url = imageList[0];
    }
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const r = await fetch(`${restBase}?id=eq.${productId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: JSON.stringify(data) });
    const updated = Array.isArray(data) ? data[0] : data;
    return res.status(200).json(normalizeProduct(updated));
  }

  if (req.method === "DELETE" && isAdminRoute && productId) {
    const r = await fetch(`${restBase}?id=eq.${productId}`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "" },
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: t });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
