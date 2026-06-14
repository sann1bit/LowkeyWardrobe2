import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid email address" });
    return;
  }

  const { email } = parsed.data;

  const [existing] = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, email));

  if (existing) {
    res.status(201).json({ success: true, message: "You are already subscribed!" });
    return;
  }

  await db.insert(newsletterSubscribersTable).values({ email });

  res.status(201).json({ success: true, message: "Welcome to the inner circle!" });
});

export default router;
