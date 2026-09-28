# Restore the Dashboard to the canonical source

## Goal

Rebuild the desktop Dashboard from the supplied HTML and reference images without reinterpretation. Preserve the separate phone-only stylist terminal. Make the source-defined create and edit controls functional against the canonical relational data, without inventing records or fields.

## Work

1. **Create an exact source map**
  - Extract every desktop screen, left-rail group, tab, panel, table, right rail, state, color, spacing rule, and interaction from the supplied HTML.
  - Compare each React screen against that map and treat every difference as a defect.
2. **Restore the shared Dashboard shell**
  - Match the source navigation hierarchy, selected states, typography, colors, widths, spacing, surfaces, buttons, tags, and page proportions.
  - Keep the full desktop Dashboard unavailable on phones; phones continue to receive only the supplied stylist terminal.
3. **Correct each Dashboard screen**
  - Restore Today, Tasks, Bookings, Staff rota, Clients & pets, Planning, Risk assessments, SLAs & performance, Services, History, and Settings to their source-defined structures and states.
  - For Services specifically, restore the 300px list/detail layout, selected coral outline, duration and supporting counts, New/Edit controls, species pills, three summary tiles, SOP and inventory panels, stylist-match table, and rule placement shown in the supplied visual.
  - Use only supplied database rows for displayed operational values. Where a source visual expects a value not yet present in canonical data, keep the visual structure but show no invented value.
4. **Implement source-defined editing**
  - Reproduce the exact view, new, edit, cancel, and save states from the supplied HTML.
  - Add authenticated server-side create/update operations for canonical tables that currently have source-defined editors, with validation and cache refresh after successful saves.
  - New actions insert new rows; edit actions update the selected canonical row. Related rows such as service SOP, inventory, and staff qualification are saved together consistently.
  - Do not create seed rows, defaults, ratings, visit history, or other content not explicitly present in the supplied sources.

## Technical details

- Keep the React Dashboard route-adjacent and use the existing canonical tables through authenticated server functions.
- Preserve row-level access controls and perform privileged writes only after server-side role verification.
- Do not alter uploaded source files, generated backend clients/types, the public booking UI, or the phone terminal.