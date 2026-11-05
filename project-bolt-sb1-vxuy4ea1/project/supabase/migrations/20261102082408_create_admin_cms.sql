/*
# Create role-protected CMS tables and admin authorization

1. New Tables
- `profiles`
  - `id` (uuid, matches the Supabase auth user)
  - `role` (text, defaults to `member`; only server-side SQL can promote an account)
  - `created_at` (timestamp)
- `site_content`
  - `id` (uuid, primary key)
  - `content_key` (unique text key used by the public site)
  - `eyebrow` (text)
  - `title` (text)
  - `body` (text)
  - `updated_at` (timestamp)
- `site_tabs`
  - `id` (uuid, primary key)
  - `label` (text shown in navigation)
  - `path` (text route)
  - `page_key` (text content key)
  - `sort_order` (integer)
  - `is_visible` (boolean)
  - `created_at` and `updated_at` (timestamps)

2. Authorization
- New auth users receive a `member` profile automatically.
- The `is_admin()` function checks the database-owned profile role for the current authenticated user.
- Admin role data is never writable through the browser Data API.
- Only authenticated users can read their own profile.

3. CMS Access
- Anonymous and authenticated visitors can read published site content and visible tabs.
- Only users whose database profile role is `admin` can insert, update, or delete CMS records.
- RLS is enabled on every new table, and grants are limited to the verbs used by the site.

4. Seed Content
- Seed the current public navigation labels and the home hero content so the existing site has a database-backed starting point.

5. Important Notes
- To create the first administrator, create an account through the admin login screen, then run the documented role-promotion SQL as a trusted project administrator. Never promote a role from the browser.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL UNIQUE,
  page_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_tabs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT SELECT ON public.site_tabs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_tabs TO authenticated;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can create site content" ON public.site_content;
CREATE POLICY "Admins can create site content"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
CREATE POLICY "Admins can delete site content"
ON public.site_content FOR DELETE
TO authenticated
USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Anyone can read visible site tabs" ON public.site_tabs;
CREATE POLICY "Anyone can read visible site tabs"
ON public.site_tabs FOR SELECT
TO anon, authenticated
USING (is_visible = true OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can create site tabs" ON public.site_tabs;
CREATE POLICY "Admins can create site tabs"
ON public.site_tabs FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update site tabs" ON public.site_tabs;
CREATE POLICY "Admins can update site tabs"
ON public.site_tabs FOR UPDATE
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete site tabs" ON public.site_tabs;
CREATE POLICY "Admins can delete site tabs"
ON public.site_tabs FOR DELETE
TO authenticated
USING ((SELECT public.is_admin()));

INSERT INTO public.site_content (content_key, eyebrow, title, body)
VALUES ('home_hero', 'HHC AXIOMS PRIVATE LIMITED', 'Manufacturing nutraceuticals with purpose.', 'A growing nutraceutical manufacturing company supporting brands with formulation, production, and quality-focused delivery.')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_tabs (label, path, page_key, sort_order, is_visible)
VALUES
  ('Capabilities', '/capabilities', 'capabilities', 1, true),
  ('Quality', '/quality', 'quality', 2, true),
  ('About', '/about', 'about', 3, true),
  ('Gallery', '/gallery', 'gallery', 4, true),
  ('Contact', '/contact', 'contact', 5, true)
ON CONFLICT (path) DO NOTHING;