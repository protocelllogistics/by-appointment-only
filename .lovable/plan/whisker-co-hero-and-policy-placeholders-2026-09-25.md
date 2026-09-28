# Whisker & Co. hero and policy placeholders

## Build

- Replace the blank home screen with the supplied Whisker & Co. hero, following the uploaded desktop and mobile references and the exact Organic coral-and-teal tokens.
- Preserve all supplied copy, measurements, breakpoints, chip choices, defaults, interaction states, accessibility requirements, whisker paths, and responsive behaviour exactly as written.
- Use the uploaded mobile and desktop images as visual references only. Keep the arched salon-photo area as a styled placeholder because no salon photograph was supplied.
- On mobile, provide the fixed “Book in three taps” bar and accessible bottom sheet. On desktop, show the three booking groups inside the large coral circle.
- Make “Show times” hand off the selected service, stylist, and time preference to `/book` as query parameters. The booking flow itself remains out of scope.

## Policy placeholders

- Add separate routes for Terms & Conditions, Privacy Policy, No-Show Policy, Cookies Policy, and Book.
- Leave the five requested policy page bodies empty as instructed; add only route metadata so each URL is valid and identifiable outside the visible page.
- Keep `/book` as an empty hand-off destination that accepts the hero’s query parameters; do not build booking content.

## Cookie consent

- Add a site-wide cookie banner styled with the same Organic system and subtle pet-inspired visual details in the interface only.
- Use neutral legal disclosure text explaining essential cookies and optional cookies; do not make pet-themed legal claims or invent business-specific practices.
- Provide exactly two actions: accept optional cookies and reject non-essential cookies.
- Store the visitor’s choice in the browser so the banner stays dismissed on return visits; essential storage remains available for remembering that choice.
- Ensure keyboard access, visible focus, minimum tap sizes, appropriate labels, and mobile safe-area clearance.

## Technical details

- Implement with the existing TanStack Start and Tailwind v4 structure, semantic tokens in the global stylesheet, reusable React components, and the existing button component for controls.
- Load Caprasimo and Figtree through document-head links with swap behaviour; use inline SVG for the exact whisker paths and Lucide icons for interface symbols.
- Use client-side state only for the requested interactions; no backend or persistent customer data is introduced.