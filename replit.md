# AURUM — Luxury Fashion eCommerce

A complete luxury fashion eCommerce website with a black-and-white minimalist editorial aesthetic (Zara × COS × Prada × Saint Laurent). Full-stack React + Vite frontend with Express backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/aurum run dev` — run the frontend (port 19800, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS, Framer Motion, Zustand, Wouter
- API: Express 5, JWT auth (jsonwebtoken), Drizzle ORM, PostgreSQL
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aurum/src/pages/` — page components (Home, Products, ProductDetail, Cart, Wishlist, Checkout, Admin*)
- `artifacts/aurum/src/components/` — Navbar, Footer, CartDrawer, SearchOverlay, FigureSVG, AdminLayout
- `artifacts/aurum/src/stores/` — Zustand stores: cartStore, wishlistStore, uiStore
- `artifacts/aurum/src/data/products.ts` — hardcoded product fallback data (12 products)
- `artifacts/api-server/src/routes/` — products, newsletter, admin, orders, health
- `lib/db/src/schema/` — Drizzle schema: productsTable, newsletterSubscribersTable + orders (raw SQL)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)
- `lib/api-client-react/src/generated/` — Generated React Query hooks

## Architecture decisions

- Route handlers do NOT include `/api/` prefix — the reverse proxy adds it via `paths = ["/api"]` in artifact.toml
- DB table exports use `productsTable` / `newsletterSubscribersTable` naming (not bare `products`)
- Admin auth uses JWT signed with `SESSION_SECRET` env var; credentials hardcoded with env var override
- Zustand stores use `persist` middleware for cart and wishlist (localStorage)
- Frontend falls back to hardcoded product data if API is unavailable
- Orders table created via raw SQL (not in Drizzle schema file); uses `db.execute(sql\`...\`)`

## Product

12 luxury fashion products across 3 categories (Clothing, Shoes, Accessories). Full shopping flow: browse → product detail → add to bag → cart drawer → checkout with order creation. Wishlist with move-to-bag. Admin dashboard at `/admin` with products management, order tracking, and newsletter subscriber list.

## Admin Access

- URL: `/admin/login`
- Username: `ahsan`
- Password: `ahsanahsanahsan`
- Features: Dashboard stats, Products management (edit price/stock/badge/visibility), Orders (status updates), Newsletter subscribers (CSV export)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Route paths in `api-server` must NOT include `/api/` prefix — the proxy adds it
- DB table names: always use `productsTable` / `newsletterSubscribersTable` (not `products`)
- Orders table was added as raw SQL — it's not in the Drizzle schema files
- `pnpm --filter @workspace/aurum add <pkg>` needed for any new frontend package (zustand was installed this way)
- Admin routes require `Authorization: Bearer <jwt>` header

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
