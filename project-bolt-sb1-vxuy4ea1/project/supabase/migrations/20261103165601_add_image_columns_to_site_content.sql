/*
# Add image columns to site content

1. Modified tables
- `site_content`: adds two nullable columns.
  - `image_url` (text): public URL of the photo shown for this content record.
  - `storage_path` (text): path of the file inside the `site-media` storage bucket, used to replace or remove it.

2. Security
- No new policies or grants are needed. The existing `site_content` policies already restrict writes to admins and allow anyone to read, and the table-level grants cover the new columns.

3. Notes
- Existing rows keep NULL for both columns, so the website keeps showing its built-in photos until an admin uploads one.
- The migration is idempotent.
*/

ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS storage_path text;
