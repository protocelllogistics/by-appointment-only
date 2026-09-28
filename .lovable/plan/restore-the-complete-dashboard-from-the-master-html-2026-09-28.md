# Restore the complete Dashboard from the master HTML

## Source of truth
- Treat `Pet_Stylist_Backend_New_Data.html` as the exact specification for desktop presentation, state, calculations, and interactions.
- Use the supplied screenshots only as visual checkpoints; never infer missing behavior from them.
- Preserve the existing phone-only stylist terminal and public booking experience unchanged.
- Preserve source-defined screen content where canonical tables are not loaded yet, then replace only the data source when each CSV arrives.

## Implementation sequence
1. Build a source map of every desktop destination, nested tab, panel, table, rail, modal, control, state transition, and style token in the master HTML.
2. Restore shared Dashboard rules first: navigation hierarchy, page geometry, typography, spacing, colors, badges, buttons, menus, tables, selected states, rails, dialogs, and empty states.
3. Correct **Today** against the source, including the exact `Still going` transition: increment the overrun count, extend due-out by the configured buffer, update the status and audit log, and expose only the actions the source permits afterward.
4. Port and verify each operational screen in source order:
   - Tasks
   - Bookings
   - Staff rota
   - Clients & pets
   - Planning
   - Risk assessments
   - SLAs & performance
5. Complete the three remaining supplied screens without approximation:
   - Services, including its 300px selector, overview tiles, SOP, inventory, stylist matching, rule placement, and exact new/edit/save/cancel states.
   - History, including Records/Analysis, all filters, row states, right rail, logs, notes, failures, metrics, and CSV download.
   - Settings, including all policy, booking, connection, message, and edit states defined by the source.
6. Keep canonical reads and existing secure writes connected where their tables are available. Do not seed or invent missing records, and do not change the screen structure while data is incomplete.

## Verification
- Compare every destination and nested state against the corresponding master HTML structure and supplied screenshot.
- Exercise all source-defined controls, selections, filters, menus, tabs, rails, dialogs, new/edit/cancel/save flows, and Today transitions.
- Check desktop and tablet for clipping or overlap, and confirm phones still load only the stylist terminal.
- Confirm no browser errors and a successful app build after each screen group.

## Technical details
- Keep desktop screens as route-adjacent React components with shared Dashboard styles and reusable controls.
- Split the current large Dashboard module into focused screen components without changing visible behavior.
- Keep the master HTML external as a specification; do not copy or serve it as the application.
- Do not alter uploaded CSVs, generated backend files, the public site, or the mobile terminal.
