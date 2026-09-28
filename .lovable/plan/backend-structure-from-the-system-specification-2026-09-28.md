# Backend structure from the System specification

## Source of truth
- `By_Appointment_Only_-_System_specification` (wins on any conflict), then the seed `README.md`.
- Column definitions come only from the seed CSV header rows you upload. No column is added, renamed or guessed.
- No data is created. Tables are left empty until you supply the seeded values.

## Step 1: wait for the CSVs
Nothing is built until the seed CSV files are uploaded. For tables the specification needs but the seed does not hold (§4.2), I build only the fields the specification names, and list any field whose type is not stated so you can confirm it.

## Step 2: create the tables (structure only)
Seed tables (§4.1): staff, rota, rota_exceptions, staff_shifts, services, service_sop, service_inventory, service_staff, breeds, clients, pets, bookings_history, booking_events, health_style_log, behaviour_notes, service_failures.

Product tables (§4.2): rules, rule_settings, settings, tasks, equipment, stock, message_templates, messages, client_requests, offers, calendar_links, sync_log, consents, audit.

`derived_client_profiles` is not created (test fixture only, never seeded).

Keys and links exactly as §4.1/§4.2: each table keyed as listed, and every link to booking_id, client_id, pet_id or staff_id enforced. No table stores a figure that History can derive.

Booking statuses exactly as the README/§4.4 list: completed, completed_reduced, in_progress, booked, confirmed, reserved, cancelled, late_cancel, no_show_pending, no_show_confirmed, no_show_rescheduled, moved, clash_not_rebooked, expired.

## Step 3: load order
Recorded in the backend exactly as §4.3:
1. staff, rota, rota_exceptions, staff_shifts
2. services, service_sop, service_inventory, service_staff, breeds
3. clients, pets, consents
4. bookings_history
5. booking_events, health_style_log, behaviour_notes, service_failures, messages, client_requests, offers, calendar_links
6. settings, rules, rule_settings, message_templates, tasks, equipment, stock

The existing CSV import notes are replaced with this order and the file list.

## Existing tables
The earlier tables and their rows stay exactly as they are. The website booking keeps working from them. Nothing is deleted (§2.7, no record is ever deleted).

## Not in this step
Booking gate, derived figures (visits, on time, reliability, allocated time), messaging, calendar sync and Dashboard wiring. These follow after your data is loaded.

## Technical details
- New tables use distinct names where they would collide with existing ones (staff, services, bookings, rota_entries, tasks); the naming is confirmed with you before creating, since the old tables stay.
- Every table: grants, row-level security on, readable/writable only by staff roles (admin, stylist, front_desk) via `has_role`; History tables allow no updates or deletes (corrections are new events).
- Record the structure decision in `AGENTS.md`.
