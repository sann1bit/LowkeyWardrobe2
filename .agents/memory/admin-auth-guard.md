---
name: Admin auth guard pattern
description: How AdminLayout handles auth checking to avoid blank-page flash or rendering before token is verified
---

## Rule
`AdminLayout` must NOT render its full content until the auth check (localStorage token check) has completed. Use an `authChecked` boolean state.

## Why
Previously, `AdminLayout` rendered the full admin layout before `useEffect` fired to check the token. If no token was present, `setLocation('/admin/login')` was called but React had already rendered (and possibly crashed on) the admin content. This caused the blank page on Vercel.

## How to apply
```tsx
const [authChecked, setAuthChecked] = useState(false);
useEffect(() => {
  const token = localStorage.getItem('aurum_admin_token');
  if (!token) setLocation('/admin/login');
  else setAuthChecked(true);
}, [setLocation]);

if (!authChecked) return <spinner />;
// ... rest of layout
```

## Note
The `App.tsx` also wraps admin routes in a React `ErrorBoundary` so any crash in an admin component shows a helpful error message instead of a blank page.
