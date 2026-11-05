/*
Backfill existing single-image page headers into hero slide 1.
Existing slide slots take precedence, so rerunning this migration is safe.
*/

INSERT INTO public.hero_slides (page_key, position, image_url, storage_path, alt_text)
SELECT 'home', 1, image_url, storage_path, ''
FROM public.site_content
WHERE content_key = 'home_hero' AND image_url IS NOT NULL
ON CONFLICT (page_key, position) DO NOTHING;

INSERT INTO public.hero_slides (page_key, position, image_url, storage_path, alt_text)
SELECT 'about', 1, image_url, storage_path, ''
FROM public.site_content
WHERE content_key = 'about_intro' AND image_url IS NOT NULL
ON CONFLICT (page_key, position) DO NOTHING;

INSERT INTO public.hero_slides (page_key, position, image_url, storage_path, alt_text)
SELECT 'contact', 1, image_url, storage_path, ''
FROM public.site_content
WHERE content_key = 'contact_intro' AND image_url IS NOT NULL
ON CONFLICT (page_key, position) DO NOTHING;
