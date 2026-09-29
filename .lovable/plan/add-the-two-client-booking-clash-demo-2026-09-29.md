# Add the two-client booking clash demo

## Outcome

The demo rail will include a new **Booking Clashes** scenario above the existing scenario controls. Selecting it will replace the staff dashboard with a focused two-phone customer experience showing how one confirmed booking wins a shared slot and the other customer is retained with live alternatives and a £5 thank-you discount.

## Changes

- Add a distinct Booking Clashes selector in the demo controls and a clear way to return to the normal dashboard/customer workflow.
- Build the supplied reference as native React UI inside `/demo`; do not embed or copy the uploaded HTML runtime.
- Show You (Jo and Luna) and Other Customer (Chris and Pepper) in parallel, with only You interactive while every choice is mirrored to Other Customer.
- Mirror service, stylist, time and confirmation choices across both phones, then simulate the confirmation race.
- Confirm the first committed booking for Chris; never show Jo a generic error or false success.
- Give Jo the three nearest live alternatives and a £5 retention discount, then allow one-tap rebooking to a successful confirmation.
- Show a central, timestamped system view explaining the race, successful commit, clash recovery, and service-failure logging without assigning fault to either customer.
- Keep this mode ephemeral and resettable, and leave the existing late-arrival/no-show demo unchanged.

## Technical details

- Add a route-adjacent clash component and styles, sharing the demo’s existing service names and visual tokens.
- Keep interaction state local to the clash component and save nothing.
- Fit the complete three-column presentation within the dashboard footprint without internal page scrolling; scale it for narrower desktop widths.
- On phone-width screens, keep the existing Hand-Held App/customer-phone presentation rather than attempting to show two phones side by side.
- Verify the full flow: mirrored choices, securing states, first confirmation, clash alternatives, discounted rebooking, replay, return to dashboard, and responsive switching.