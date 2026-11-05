/*
# Per-tab hero and side photos

1. Hero slide rules
- Widens the allowed `hero_slides.page_key` values from `home` and `quality` to all six tabs: `home`, `capabilities`, `quality`, `about`, `gallery`, `contact`. Existing rows are unaffected.

2. New columns on `site_content`
- `side_image_url` (text): public URL of the photo shown beside a tab's main text.
- `side_storage_path` (text): storage path of that photo, used for replacement and removal.

3. Data preserved by copying (originals are left in place)
- The Quality side photo, previously stored in `site_content.image_url`, is copied into the new side columns.
- The header photos for Capabilities and Gallery, previously stored in `site_content.image_url`, are copied into hero slot 1 for their pages.

4. Security
- No new policies or grants are needed. Existing `site_content` and `hero_slides` policies already restrict writes to admins and allow public reads.

5. Notes
- The old `site_content.image_url` and `storage_path` columns are retained for existing page-header photo compatibility; side-content photos use the new side columns.
- The migration is safe to re-run: copies only fill empty targets.
*/

ALTER TABLE public.hero_slides DROP CONSTRAINT IF EXISTS hero_slides_page_key_check;
ALTER TABLE public.hero_slides ADD CONSTRAINT hero_slides_page_key_check
  CHECK (page_key IN ('home', 'capabilities', 'quality', 'about', 'gallery', 'contact'));

ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS side_image_url text;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS side_storage_path text;

UPDATE public.site_content
SET side_image_url = image_url, side_storage_path = storage_path
WHERE content_key = 'quality_intro' AND side_image_url IS NULL AND image_url IS NOT NULL;

INSERT INTO public.hero_slides (page_key, position, image_url, storage_path, alt_text)
SELECT 'capabilities', 1, image_url, storage_path, ''
FROM public.site_content
WHERE content_key = 'capabilities_intro' AND image_url IS NOT NULL
ON CONFLICT (page_key, position) DO NOTHING;

INSERT INTO public.hero_slides (page_key, position, image_url, storage_path, alt_text)
SELECT 'gallery', 1, image_url, storage_path, ''
FROM public.site_content
WHERE content_key = 'gallery_intro' AND image_url IS NOT NULL
ON CONFLICT (page_key, position) DO NOTHING;
