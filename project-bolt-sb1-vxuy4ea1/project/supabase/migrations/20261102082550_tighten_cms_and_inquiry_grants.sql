/*
# Tighten browser grants for protected CMS and inquiries

1. Security Changes
- Revoke any broad existing Data API privileges from `profiles`, `site_content`, `site_tabs`, and `contact_inquiries` for anon and authenticated roles.
- Restore only the minimum privileges needed by the public site and the protected administrator.

2. Allowed Access
- `profiles`: authenticated users can SELECT only their own row through RLS.
- `site_content`: public SELECT; admin-only INSERT, UPDATE, and DELETE through RLS.
- `site_tabs`: public SELECT of visible rows; admin-only INSERT, UPDATE, and DELETE through RLS.
- `contact_inquiries`: public INSERT only; no browser role can read, update, or delete inquiries.

3. Important Notes
- This migration changes grants only; it does not remove data or alter table structure.
- The role checks remain enforced by database policies, not by the interface.
*/

REVOKE ALL PRIVILEGES ON public.profiles FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.site_content FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.site_tabs FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.contact_inquiries FROM anon, authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT SELECT ON public.site_tabs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_tabs TO authenticated;
GRANT INSERT ON public.contact_inquiries TO anon, authenticated;