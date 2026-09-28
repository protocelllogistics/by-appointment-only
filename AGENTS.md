<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared site-wide consent UI in the root route so it appears consistently on every page.
- Keep booking selection UI reusable between the mobile sheet and desktop hero to prevent behaviour drift.
- Front page lives in src/routes/index.tsx (markup as JSX, selection chips server-rendered) with its CSS/behaviour in src/routes/-home/; booking stays in-page and must show a loading state until real availability resolves — user requirement: no false fully-booked flash before "Book in 1 minute".

- Staff back office is `/dashboard`: widths up to 767px receive only the native stylist handheld UI, while wider widths receive the full Dashboard, switching live on resize regardless of device identity; open only in pre-production, role-protect before launch.
- Treat the uploaded mock’s staff Today records, states, actions, right rail, and chart as canonical unless the user explicitly changes them.
- Replace demo data with uploaded System CSVs in dependency order; preserve both Dashboard presentations and public booking UI.
- Use one route-adjacent React handheld UI in mobile Dashboard and mobile demo; the supplied HTML and screenshots are visual/interaction references, never an embedded runtime, so both presentations stay canonical.
- Render service/risk views from relational service, SOP, inventory, staff qualification and breed CSV data.
- Supplied Dashboard HTML/images are exact visual and interaction specifications; do not approximate or omit their structure.
- Keep the desktop shell navigation-only and canonical seed calculations in shared math accepting empty inputs; this prevents drift and supports staged seeding.
- Google Calendar sync lives in src/lib/calendar-sync.server.ts and pushes only appointments created after a sync cursor; why: avoids re-routing historical bookings.
- /demo and public booking save nothing; auto-generate gender-neutral fictional contact details, leave only filtered pet name/notes editable, and expose only server-sized Index 1–5.
