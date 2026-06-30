# Database ownership

This site shares one Supabase database with the affiliate portal and the CRM, but
it does **not** own database migrations. The shared database is owned by the
**RRAI-Internal-Tools** repo, which is the only place schema changes are written
and pushed (`supabase db push`).

- The SQL in [`proposals/`](proposals) is historical reference (the website-facing
  affiliate RPCs `submit_website_lead`, `record_website_referral_click`,
  `record_website_referral_intent`). Those are **already applied**; the canonical
  copy now lives in the owner repo's migrations.
- Need a schema change? Add the migration in
  `RRAI-Internal-Tools/supabase/migrations/` and apply it there.

The site's serverless functions (`/api`) talk to the database directly at runtime
with the service-role key; no migrations run from this repo.
