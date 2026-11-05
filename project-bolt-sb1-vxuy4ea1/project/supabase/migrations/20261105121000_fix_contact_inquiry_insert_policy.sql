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
