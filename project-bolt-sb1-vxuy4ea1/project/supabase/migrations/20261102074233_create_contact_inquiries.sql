/*
# Create contact inquiries table

1. New Tables
- `contact_inquiries`
- `id` (uuid, primary key)
- `full_name` (text, buyer's name)
- `company` (text, buyer's organization)
- `email` (text, buyer's reply address)
- `phone` (text, submitter's phone number)
- `message` (text, inquiry details)
- `created_at` (timestamp, submission time)

2. Security
- Enable row level security.
- Grant INSERT only to anon and authenticated so the public contact form can submit inquiries.
- Do not grant public read access because inquiries contain personal and business contact information.
- Add a single INSERT policy validating required fields at the database boundary.

3. Important Notes
- This is a single-tenant, no-sign-in contact flow.
- The public website can submit records but cannot read, update, or delete them.
*/

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.contact_inquiries TO anon, authenticated;

DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(full_name)) BETWEEN 2 AND 120
  AND char_length(trim(company)) BETWEEN 2 AND 160
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  AND char_length(trim(message)) BETWEEN 10 AND 4000
  AND char_length(trim(phone)) BETWEEN 7 AND 40
  AND trim(phone) ~ '^[+0-9(). -]+$'
);