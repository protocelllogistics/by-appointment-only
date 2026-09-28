# Convert the supplied Dashboard into React

## Source of truth
- Use `Pet_Stylist_Backend_New_Data-2.html` as the exact visual and interaction source.
- Preserve its palette, typography, spacing, navigation labels, tab groups, controls, states, and screen content.
- Keep the existing phone-only stylist terminal unchanged.
- Keep `/dashboard` as the only back-office address and keep it open during pre-production.

## Build
1. Extract the supplied desktop Dashboard’s reusable visual tokens, navigation, screen layouts, controls, and state transitions.
2. Replace the desktop iframe with a real React Dashboard shell and reusable React controls.
3. Recreate every supplied left-rail destination and nested tab group:
   - Today and Tasks
   - Bookings
   - Staff rota
   - Clients & pets
   - Planning
   - Risk assessments
   - SLAs & performance
   - Services
   - History
   - Settings
4. Transfer the supplied UI elements and interactions for each screen, including list/chart switches, selections, right-hand details, forms, filters, settings controls, and modal flows.
5. Connect only the canonical staff, rota, rota-exception, and shift data already uploaded; retain supplied screen data elsewhere until its matching source file arrives. Visual structure must not change when data sources change.
6. Keep the phone breakpoint operationally isolated so phones never load the desktop Dashboard.

## Verification
- Confirm every supplied navigation destination and nested tab opens in React.
- Confirm canonical staff/rota data appears where those screens use it.
- Check desktop and tablet layouts for clipping or overlap; check phones still receive only the stylist terminal.
- Confirm the app builds without errors.

## Technical details
- The desktop Dashboard will live in route-adjacent React/CSS modules rather than `public/dashboard/app.html` or an iframe.
- Data reads will use server functions so database access remains behind the application boundary.
- No visual or content invention: unsupported data areas retain the supplied artifact’s content until their canonical files are uploaded.
