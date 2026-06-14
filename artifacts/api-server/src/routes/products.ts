import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  GetProductResponse,
  ListProductsResponse,
  GetProductSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/summary", async (req, res): Promise<void> => {
  const rows = await db.select().from(productsTable).where(eq(productsTable.isActive, true));
  const total = rows.length;
  const clothing = rows.filter(r => r.category === "clothing").length;
  const shoes = rows.filter(r => r.category === "shoes").length;
  const accessories = rows.filter(r => r.category === "accessories").length;
  const sale = rows.filter(r => r.badge === "sale").length;
  const newArrivals = rows.filter(r => r.badge === "new").length;

  res.json(GetProductSummaryResponse.parse({ total, clothing, shoes, accessories, sale, newArrivals }));
});

router.get("/products", async (req, res): Promise<void> => {
  const queryResult = ListProductsQueryParams.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ error: queryResult.error.message });
    return;
  }

  const { category, subcategory, badge, q, minPrice, maxPrice, sortBy } = queryResult.data;

  let rows = await db.select().from(productsTable).where(eq(productsTable.isActive, true));

  if (category) {
    rows = rows.filter(r => r.category === category);
  }
  if (subcategory) {
    rows = rows.filter(r => r.subcategory === subcategory);
  }
  if (badge) {
    rows = rows.filter(r => r.badge === badge);
  }
  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(r =>
      r.name.toLowerCase().includes(lower) ||
      r.brand.toLowerCase().includes(lower) ||
      (r.tags ?? []).some(t => t.toLowerCase().includes(lower))
    );
  }
  if (minPrice !== undefined) {
    rows = rows.filter(r => Number(r.price) >= minPrice);
  }
  if (maxPrice !== undefined) {
    rows = rows.filter(r => Number(r.price) <= maxPrice);
  }

  const normalized = rows.map(r => ({
    ...r,
    price: Number(r.price),
    originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
    stock: r.stock ?? 0,
    colors: r.colors ?? [],
    sizes: r.sizes ?? [],
    tags: r.tags ?? [],
    images: r.images ?? [],
    featured: r.featured ?? false,
    subcategory: r.subcategory ?? null,
  }));

  if (sortBy) {
    normalized.sort((a, b) => {
      switch (sortBy) {
        case "featured": return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-asc": return a.name.localeCompare(b.name);
        case "newest": return (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0);
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  } else {
    normalized.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json(ListProductsResponse.parse(normalized));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, slug));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse({
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    stock: product.stock ?? 0,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    tags: product.tags ?? [],
    images: product.images ?? [],
    featured: product.featured ?? false,
    subcategory: product.subcategory ?? null,
  }));
});

export default router;
