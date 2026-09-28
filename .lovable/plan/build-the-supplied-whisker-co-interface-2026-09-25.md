# Build the supplied Whisker & Co. interface

## Scope

Use `Pet_Stylist_Mockups.dc-2.html` as the authoritative UI and interaction specification. Preserve the current approved hero refinements, including “Book in 1 minute,” the motionless booking overlay, and the existing booking-flow corrections.

## Public website

- Extend the front page below the hero with the mockup’s exact **What we do**, **The team**, and **Find us** sections.
- Keep booking in-page on desktop and mobile; no booking route and no delay before the booking controls are usable.
- Replace generated availability with availability read from the backend. Do not show “Next free” unless a genuine open slot is returned.
- Keep the supplied legal placeholder routes and site-wide cookie banner.
- Treat the names, schedules, customers, pets, appointments, address, and hours in the file as supplied demo content. Do not invent additional company facts or imagery.

## Staff area

Build the fully specified staff screens from the file with shared navigation and the same coral/teal design system:

- **Today:** appointment list and timeline, task list, row details, status history, check-in/check-out, late-client chase, no-show handling, freed-slot offering, and walk-in booking.
- **Continuity planning:** bay count, buffer rules, service times, allocated-time calculator, edit/cancel/save states, and calendar connection status.
- **Staff rota:** the supplied weekly hours and breaks view, copy-last-week action, and publish state.
- **Risk profiling:** breed SLA view, stylist adjustments, capacity summary, and client/pet reliability and service-failure details.
- **Stylist prompt:** mobile missing-checkout view with “Still going” and “Done, check out.”

Only these fully designed staff screens will be implemented. Unspecified Bookings, Clients & pets, and Settings screens will not be invented.

## Backend and data

- Add persistent tables for staff, services, availability, bookings, booking events, tasks, capacity rules, rota entries, and client/pet operational profiles.
- Seed the exact mock records from the supplied file so the designed first states are present immediately.
- Calculate available times from staff rota, service duration, bay capacity, buffers, and existing bookings rather than the file’s cosmetic slot-removal formula.
- Commit a booking atomically so two clients cannot take the same staff/bay time; return the supplied clash state with live alternatives when a conflict occurs.
- Persist staff actions and booking history so Today, rota, risk, and public availability use the same source.
- Keep customer-facing reads narrowly public and staff changes protected by backend access rules. Staff roles will live in a dedicated roles table.

## Routing and reuse

- Keep `/` as the public page.
- Add routes only for the specified staff screens: `/staff/today`, `/staff/continuity`, `/staff/rota`, `/staff/risk`, and `/staff/prompt`.
- Share the staff shell, booking selection logic, status controls, and semantic design tokens to prevent visual or behavioural drift.

## Verification

- Confirm every route has unique page metadata.
- Check the public page and each staff screen at the mockup’s desktop and mobile sizes.
- Exercise booking success, genuine conflict, late arrival, no-show, freed slot, walk-in, rota save, and continuity-rule save flows.
- Confirm the database access rules prevent public writes and unauthorized staff changes.
