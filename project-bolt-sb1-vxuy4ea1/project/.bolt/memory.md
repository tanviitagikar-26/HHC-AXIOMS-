# Project memory

## Product intent & audience

- B2B website for HHC Axioms Pvt. Ltd., a nutraceutical manufacturer.
- Audience: buyers, brands, and contract partners seeking third-party manufacturing and loan licensing.
- Primary buyer action: submit a general inquiry via contact form to reach sales.

## Brand personality & voice

- Industrial and bold; credible, trustworthy, professional B2B tone.
- Plain, factual, buyer-focused copy; no unsupported health/efficacy claims.
- Emphasis on manufacturing capabilities and quality processes, not medical benefits.

## Visual design & UX direction

- Palette: charcoal + amber; light grey section accents; full-bleed darkened facility/production imagery.
- Hero: darkened production-equipment photo, heavy condensed sans-serif headline, amber CTA.
- Sections: horizontal process timeline (Inquiry → Formulation → Production → Testing → Delivery) with square icons, tight grid, sharp corners.
- Logo: `logo.jpg` used in header and as favicon.
- Multi-page structure: Home, Capabilities/Services, About, Quality & Compliance, Gallery, Contact.
- Gallery: responsive grid, lazy-loaded images, lightbox viewer with close/prev/next and Escape-key support; single editable photo list in site content data.
- Components: React + Tailwind; lucide-react icons; `@/` path alias for imports.

## Decisions, constraints & rationale

- Source `hhcaxioms.com` is factual basis; company name, services, 25+ years experience, R&D positioning, office addresses carried over.
- Phone, email, certifications, and exact USA office wording not publicly available; represented as clearly marked placeholders, not fabricated.
- All usable source images reused; no images reported as unretrievable.
- Gallery reuses existing source-image object pattern; photo list is one editable data block for easy add/remove without page rewrites.
- Gallery images lazy-load for performance; lightbox supports keyboard navigation (Escape, prev/next controls).
- Inquiry form stores submissions locally/securely; no backend wiring confirmed.
- Vite + React build, type checks, and lint pass cleanly.

## Open questions & assumptions

- Verify/replace before launch: contact email and phone, certifications/registrations/quality standards, manufacturing formats/capacity/product specifics, exact USA office wording.
- Backend/destination for inquiry form submissions not yet specified.
- Any missing/unretrievable source images may need replacement if discovered later.
- Regulatory copy review recommended before production launch.