/*
# Seed editable public page introductions

1. Data Changes
- Add the current source-based intro copy for the Capabilities, Quality, About, Gallery, and Contact pages to `site_content`.
- Existing rows are preserved through conflict-safe inserts.

2. Security
- No permissions or policies are changed.
- Existing public read and admin-only write rules remain in force.

3. Important Notes
- These values provide the initial editable content shown by the public site.
- Administrators can revise them from the protected CMS after promotion.
*/

INSERT INTO public.site_content (content_key, eyebrow, title, body)
VALUES
  ('capabilities_intro', 'Capabilities', 'Manufacturing support built around your brief.', 'HHC Axioms states that it manufactures a wide range of nutraceutical formulations and offers third-party manufacturing and loan licensing services.'),
  ('quality_intro', 'Quality & compliance', 'Quality is part of the manufacturing conversation.', 'HHC Axioms describes a strong focus on quality, innovation, and regulatory compliance. Specific certificates and standards are not published on the source page and are marked for verification below.'),
  ('about_intro', 'Company', 'A growing company with a research-led outlook.', 'HHC Axioms Pvt. Ltd. is described by the source site as a nutraceutical manufacturing company dedicated to quality, innovation, and regulatory compliance.'),
  ('gallery_intro', 'Gallery', 'A closer look at the work behind the brief.', 'Explore a selection of HHC Axioms imagery from manufacturing, research, and company communications.'),
  ('contact_intro', 'Contact', 'Tell us what you are building.', 'Send an inquiry to start a conversation about nutraceutical manufacturing, formulation development, third-party manufacturing, or loan licensing.')
ON CONFLICT (content_key) DO NOTHING;