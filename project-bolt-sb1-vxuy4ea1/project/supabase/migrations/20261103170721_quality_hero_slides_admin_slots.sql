/*
# Quality hero slides for admin management

1. Modified tables
- `hero_slides`: the three existing slides are moved from the `home` page key to `quality`, because their descriptions match the Quality page slider.
- `hero_slides.image_url` is now nullable so an admin can remove a photo from a slot while keeping the slot.
- A unique key on (page_key, position) means each slide slot exists only once, so saves can update the slot in place.

2. Security
- Anonymous visitors keep read access only. Their insert, update, and delete grants are removed. Admin writes were already limited to administrators by row policies.

3. Notes
- Existing data is preserved. Only the page key and nullability change.
- The migration is safe to re-run.
*/

UPDATE public.hero_slides SET page_key = 'quality' WHERE page_key = 'home';

ALTER TABLE public.hero_slides ALTER COLUMN image_url DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS hero_slides_page_key_position_key ON public.hero_slides (page_key, position);

REVOKE INSERT, UPDATE, DELETE ON public.hero_slides FROM anon;
