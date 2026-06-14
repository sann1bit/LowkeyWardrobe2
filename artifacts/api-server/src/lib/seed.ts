import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

// Seed is handled externally for Supabase.
// This function is a no-op if products already exist.
export async function ensureSeeded() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    if (count > 0) return; // Already seeded
    // If somehow empty, log a warning — seed via the Supabase migration script
    console.warn("[seed] Products table is empty. Run the seed script to populate.");
  } catch {
    // Non-fatal: DB may not be ready yet
  }
}
