---
name: Upload approach — JSON/base64
description: Why uploads use JSON base64 instead of multipart, and how the Vercel serverless function handles it for the Vercel+Railway deployment
---

## Rule
The `/api/storage/uploads/file` endpoint accepts `POST` with `Content-Type: application/json` body `{ data: "<base64>", type: "image/jpeg" }`. Do NOT use multipart/form-data.

## Why
Railway cannot reach `jtmiwrvncryakejotndt.supabase.co` storage API — both direct upload and presigned URL generation fail with "fetch failed" on Railway. This is a Railway → Supabase network issue, not a code issue. The previous multipart/multer approach also had a Node.js Buffer → fetch-body issue (fixed with `new Blob([buffer])` but still can't help Railway's network block).

## How to apply
- **Frontend** (`AdminProducts.tsx`): `FileReader.readAsDataURL` → strip prefix → send JSON `{ data, type }` via `fetch()`
- **Express server** (`storage.ts`): reads `req.body.data`, does `Buffer.from(base64, 'base64')`, uploads with `new Blob([buffer], { type })`  
- **Vercel function** (`artifacts/aurum/api/storage/uploads/file.js`): same JSON/base64 approach; handles the upload for the Vercel+Railway deployment since Railway can't do it
- **vercel.json**: Only proxies specific routes (`/api/products/*`, `/api/admin/*`, `/api/newsletter/*`, `/api/orders/*`) to Railway — `/api/storage/*` is NOT proxied, falls through to Vercel function

## User must do
For the Vercel deployment to upload images, the user must add these in Vercel project settings → Environment Variables:
- `SUPABASE_URL` = `https://jtmiwrvncryakejotndt.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = (the key from Replit secrets)
