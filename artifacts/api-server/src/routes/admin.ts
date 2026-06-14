import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { productsTable, newsletterSubscribersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "ahsan";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ahsanahsanahsan";
const JWT_SECRET = process.env.SESSION_SECRET || "aurum-secret-key";

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = auth.slice(7);
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, username });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.get("/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    const [subscriberCount] = await db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribersTable);

    let orderCount = 0;
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    try {
      const ordersResult = await db.execute(sql`SELECT COUNT(*)::int as count, COALESCE(SUM(total),0)::numeric as revenue FROM orders`);
      orderCount = (ordersResult.rows[0] as any)?.count || 0;
      totalRevenue = parseFloat((ordersResult.rows[0] as any)?.revenue || 0);
      const recentResult = await db.execute(sql`
        SELECT id, order_number, email, first_name, last_name, total, status, payment_method, customer_ip, created_at
        FROM orders ORDER BY created_at DESC LIMIT 5
      `);
      recentOrders = recentResult.rows as any[];
    } catch {
      // orders table may not be ready yet
    }

    res.json({
      products: productCount.count,
      subscribers: subscriberCount.count,
      orders: orderCount,
      revenue: totalRevenue,
      recentOrders,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/products", verifyAdmin, async (req, res) => {
  try {
    const all = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/admin/products", verifyAdmin, async (req, res) => {
  const {
    name, brand, category, subcategory, price, originalPrice, badge,
    description, stock, sizes, colors, imageUrl, images, featured,
    isActive, figType, bgGradient, figColorA, figColorB,
  } = req.body as any;

  if (!name || !category || !price) {
    return res.status(400).json({ error: "name, category, and price are required" });
  }
  try {
    const baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    const sku = "LKW-" + Date.now().toString().slice(-6);

    const defaultFigType = figType || (category === "shoes" ? "sneaker" : category === "accessories" ? "watch" : "coat");
    const defaultBgGradient = bgGradient || "linear-gradient(135deg, #f0f0f0, #e0e0e0)";
    const defaultFigColorA = figColorA || "#c0c0c0";
    const defaultFigColorB = figColorB || "#1e1e1e";

    const imagesList: string[] = Array.isArray(images) ? images.filter(Boolean) : [];
    const primaryImage = imageUrl || imagesList[0] || null;

    const [created] = await db.insert(productsTable).values({
      slug, sku, name,
      brand: brand || "Lowkey Wardrobe",
      category,
      subcategory: subcategory || null,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : null,
      badge: badge || null,
      description: description || "",
      stock: parseInt(stock) || 0,
      sizes: sizes || [],
      colors: colors || [],
      imageUrl: primaryImage,
      images: imagesList,
      featured: featured === true,
      isActive: isActive !== undefined ? isActive : true,
      figType: defaultFigType,
      bgGradient: defaultBgGradient,
      figColorA: defaultFigColorA,
      figColorB: defaultFigColorB,
      tags: [],
    }).returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    name, brand, category, subcategory, price, originalPrice, badge,
    description, stock, isActive, sizes, colors, imageUrl, images, featured,
  } = req.body as any;
  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (category !== undefined) updates.category = category;
    if (subcategory !== undefined) updates.subcategory = subcategory || null;
    if (price !== undefined) updates.price = price.toString();
    if (originalPrice !== undefined) updates.originalPrice = originalPrice ? originalPrice.toString() : null;
    if (badge !== undefined) updates.badge = badge || null;
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (isActive !== undefined) updates.isActive = isActive;
    if (sizes !== undefined) updates.sizes = sizes;
    if (colors !== undefined) updates.colors = colors;
    if (featured !== undefined) updates.featured = featured === true;

    if (images !== undefined) {
      const imagesList: string[] = Array.isArray(images) ? images.filter(Boolean) : [];
      updates.images = imagesList;
      updates.imageUrl = imageUrl !== undefined ? (imageUrl || null) : (imagesList[0] || null);
    } else if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl || null;
    }

    updates.updatedAt = new Date();

    const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/admin/newsletter", verifyAdmin, async (req, res) => {
  try {
    const subs = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.subscribedAt));
    res.json(subs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// Full order details including customer IP, address, phone, payment method
router.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        id, order_number, email,
        first_name, last_name,
        address, city, country, zip,
        phone, payment_method,
        items, subtotal, shipping, total,
        notes, status,
        customer_ip, user_agent,
        created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.json([]);
  }
});

router.put("/admin/orders/:id/status", verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body as { status: string };
  try {
    const result = await db.execute(sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${parseInt(id)} RETURNING *
    `);
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
