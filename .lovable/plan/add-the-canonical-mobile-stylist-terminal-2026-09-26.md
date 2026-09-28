# Add the canonical mobile stylist terminal

## What will change

- Preserve the supplied `Stylist_Terminal.html` exactly as the Dashboard experience on phones.
- Keep the current uploaded Dashboard unchanged for tablets and desktop screens.
- Make `/dashboard` choose the correct terminal before loading either file, so a phone never loads or briefly shows the desktop Dashboard.
- Apply the same mobile-only behavior to old `/staff/*` addresses because they already lead to Dashboard.

## Technical details

- Add the supplied terminal as a separate static Dashboard document, retaining its embedded UI, states, sample data, and interactions rather than rebuilding or approximating them.
- Gate the Dashboard iframe by the phone breakpoint, with an undecided initial state so server rendering cannot expose the desktop file on mobile.
- Switch immediately if the viewport crosses the breakpoint; only the matching document receives an iframe source.
- Record the mobile stylist-terminal operational rule alongside the existing Dashboard architecture rule.

