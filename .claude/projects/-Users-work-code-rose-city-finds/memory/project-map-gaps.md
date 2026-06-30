---
name: project-map-gaps
description: Known UI and data gaps on the /map page (MapResultsPage) identified June 2026 via seed data analysis
metadata:
  type: project
---

Gap analysis of /map page against seed.sql data as of 2026-06-29.

**Why:** Cross-referenced all benefit_category enum values and seed edge cases against the MapResultsPage implementation and /api/locations DB query.

**How to apply:** Use this as a backlog for the /map feature. Tests for all gaps live in `__tests__/app/map/MapResultsPage.test.tsx` (currently failing).

1. Filtering not implemented — chips update URL only, never filter the locations array
2. Chip keys (price/foodType/accessType) have no mapping to benefit_category enum
3. Inactive resources (is_active=false) leak — DB query doesn't filter resources.is_active
4. Expired resources (expires_at past) leak — DB query doesn't filter resources.expires_at
5. Online-only resources (r15) are invisible — no physical location, not in /api/locations
6. Duplicate React keys — multi-location resources (r1 has pl1+pl2) both use resource id as key
7. Null lat/lon (r10 Kenton Hub) — LocationMap not tested for this case
8. "other" and "snap_accepted" benefits have no chip home
