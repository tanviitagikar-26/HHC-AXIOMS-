/*
# Harden the administrator role check

1. Function Security
- Change `public.is_admin()` from SECURITY DEFINER to SECURITY INVOKER.
- The function now evaluates the caller's own profile through the profile table's RLS policy.
- Keep EXECUTE available only to authenticated callers and deny it to anonymous callers.

2. Tab Read Policies
- Replace the combined visible-or-admin policy with two explicit policies.
- Anonymous and authenticated visitors can read visible tabs.
- Authenticated administrators can additionally read hidden tabs.
- Anonymous visitors never need to invoke the admin role check.

3. Important Notes
- Admin writes remain protected by the same database role predicate.
- No data is removed or changed by this migration.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Anyone can read visible site tabs" ON public.site_tabs;
DROP POLICY IF EXISTS "Admins can read hidden site tabs" ON public.site_tabs;

CREATE POLICY "Anyone can read visible site tabs"
ON public.site_tabs FOR SELECT
TO anon, authenticated
USING (is_visible = true);

CREATE POLICY "Admins can read hidden site tabs"
ON public.site_tabs FOR SELECT
TO authenticated
USING ((SELECT public.is_admin()));