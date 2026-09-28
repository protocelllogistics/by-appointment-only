# Restore the end-to-end demo and booking presentation

## Outcome

The demo will show a believable staff/customer interaction without saving data, exposing proprietary risk language, or presenting a customer portal that does not exist.

## Changes

- Replace every visible Low/Medium/High risk label in the demo and Dashboard risk view with **Index 1–5**, where Index 1 needs the most allowance and Index 5 the least.
- Remove the mock-derived summary strip from the demo staff view, including “Time left to sell”, and use the established business language throughout.
- Make demo diary appointments clickable, opening details, notes, source, allocated time, and practical reschedule/cancel/no-show controls.
- Add a usable staff **New booking** flow for phone bookings. A simulated customer call will surface a short call summary and booking recommendations for staff to act on.
- Rebuild the customer side as a recognisable phone with separate Phone, Messages/WhatsApp, Email, and browser booking experiences rather than an app portal.
- Keep the demo customer’s name, phone, and email pre-filled and non-editable; only pet, breed, service, pet stylist, time, and permitted notes can be chosen.
- Restore the complete browser booking sequence: choose service/stylist/time, details, the “Fluffing the towels…” securing state, then confirmation. Ensure cards and booking content scroll inside the phone.
- Keep both `/demo` and the public booking placeholder browser-only for now: no customer booking is written to the backend.
- Apply profanity, secret, password, card-number, and unreadable-character checks to editable pet names and notes on both client and server boundaries. All data stays in browser, nothing is sent to backend, this is just a prototype , but will be a public prototype. 
- the implementation however needs to be kept belivable and real, including how admins can check the tab groups from the demo dashboard, but not the risk assesments, or anything that is historical data; all that must be stimulated from what you know how the system works. 
- A very clear exmaple how the index helps to determine the appointment time for admins, where customers see an average time recommedned it will take, but admins gets a detailed version of the actual calcualted time based on the index and median based on historical data and daily written notes, which why clicking into the admin view is important
- The demo must be centered mid down the display. Disable it for ismobile recommending that users switch to a full browser for the best performance; if users stay on mobile, then prefer the mobile stylist dashboard (which is the very basic terminal control, not the full dashboard, see attached HTML). 

## Technical details

- Preserve proprietary appointment sizing behind the existing server function; return only allocated duration, rounded customer duration, and the 1–5 index.
- Keep all demo state ephemeral and resettable.
- Reuse one appointment model across the diary, phone booking, staff booking, messages, email, call recommendations, and simulated calendar entry so every action updates both sides consistently.
- Verify the demo at desktop size and the public booking at phone size, including scroll, intermediate confirmation, appointment details, new booking, call, message, email, reschedule, and cancel paths.