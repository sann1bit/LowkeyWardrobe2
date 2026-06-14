---
name: PKR price filter default
description: Products page filter state default and price comparison for PKR currency
---

The Products page has a `priceRange` useState default that must match the price scale.
When switching to PKR, changed from `[0, 2000]` to `[0, 100000]` — failing to update this
causes all products to be filtered out (showing 0 pieces) even though the API returns them correctly.

**Why:** The filter runs `Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]`
on every render. If default max is 2000 and all PKR prices are 5,900–79,900, nothing passes.

**How to apply:** Any time currency/price scale changes, update: (1) useState default,
(2) slider max, (3) reset button hardcoded value, and (4) the filter comparison to use `Number()`.
