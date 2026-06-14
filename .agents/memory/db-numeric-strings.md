---
name: DB numeric prices as strings
description: Drizzle ORM returns PostgreSQL numeric columns as strings, not numbers
---

Drizzle ORM returns `numeric` / `decimal` PostgreSQL columns as JavaScript strings, not numbers.
This affects price, originalPrice, and similar fields.

**Why:** PostgreSQL numeric precision can exceed JS float precision, so the pg driver returns them as strings.

**How to apply:** Always wrap DB-sourced price fields with `Number()` before arithmetic or comparison:
`Number(p.price)` not `p.price`. Also applies to `originalPrice`.
This is already handled in ProductCard, ProductDetail, CartStore, and Products page filter.
