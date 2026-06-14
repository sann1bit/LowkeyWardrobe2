import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

function generateOrderNumber() {
  return (
    "LKW-" +
    Date.now().toString(36).toUpperCase().slice(-6) +
    Math.random().toString(36).slice(2, 4).toUpperCase()
  );
}

router.post("/orders", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    address,
    city,
    country,
    zip,
    phone,
    paymentMethod,
    items,
    subtotal,
    shipping,
    total,
    notes,
  } = req.body as any;

  if (!email || !firstName || !lastName || !address || !city || !zip || !items?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Capture customer IP
  const customerIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "";

  try {
    const orderNumber = generateOrderNumber();
    const result = await db.execute(sql`
      INSERT INTO orders (
        order_number, email, first_name, last_name,
        address, city, country, zip, phone,
        payment_method, items, subtotal, shipping, total,
        notes, customer_ip, user_agent
      ) VALUES (
        ${orderNumber}, ${email}, ${firstName}, ${lastName},
        ${address}, ${city}, ${country || "Pakistan"}, ${zip}, ${phone || null},
        ${paymentMethod || "cod"}, ${JSON.stringify(items)}::jsonb,
        ${subtotal}, ${shipping}, ${total},
        ${notes || null}, ${customerIp}, ${userAgent}
      )
      RETURNING *
    `);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:orderNumber", async (req, res) => {
  try {
    const result = await db.execute(
      sql`SELECT * FROM orders WHERE order_number = ${req.params.orderNumber}`
    );
    if (!result.rows.length) return res.status(404).json({ error: "Order not found" });
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
