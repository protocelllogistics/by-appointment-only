/**
 * CANONICAL DATA REPLACEMENT — STRUCTURE / LOAD ORDER ONLY
 *
 * Authority: By_Appointment_Only_-_System_specification_pasted.md, section 4;
 * then the uploaded seed README.md. CSV headers determine actual seed columns.
 * This file does not execute, import rows, or calculate recommendations.
 *
 * 1. staff.csv, rota.csv, rota_exceptions.csv, staff_shifts.csv
 * 2. services.csv, service_sop.csv, service_inventory.csv, service_staff.csv,
 *    breeds.csv
 * 3. clients.csv, pets.csv, consents (product table without a seed CSV)
 * 4. bookings_history.csv — the single source of truth for bookings
 * 5. booking_events.csv, health_style_log.csv, behaviour_notes.csv,
 *    service_failures.csv, messages, client_requests, offers, calendar_links
 * 6. settings, rules, rule_settings, message_templates, tasks, equipment, stock
 *
 * The first nine canonical CSVs have been supplied and loaded into their
 * matching public tables: staff, rota, rota_exceptions, staff_shifts,
 * services, service_sop, service_inventory, service_staff and breeds.
 * An uploaded source-of-truth CSV is itself authorization to load its exact
 * rows. Do not substitute invented rows, inferred CSV columns, or old demo
 * records for missing source files.
 * derived_client_profiles.csv is a test fixture, not a seed.
 *
 * The old demo schema (legacy_staff, rota_entries, bookings, etc.)
 * still powers the website's live availability and booking confirmation.
 * Keep the existing website and both Dashboard presentations unchanged during
 * replacement. Cut the booking flow over only when the remaining canonical
 * data and its booking dependencies are available; retire the old data path
 * after that cutover, not by silently pointing the UI at incomplete tables.
 *
 * Risk assessments are recommendations configured by admins in Settings.
 * This data replacement does not invent thresholds, risk scores or labels.
 */
export {};
