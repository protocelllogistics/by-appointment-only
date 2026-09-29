import { createFileRoute, Link } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/cookies-policy")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Cookies Policy — By Appointment Only" },
      { name: "description", content: "Cookies policy for By Appointment Only" },
      { property: "og:title", content: "Cookies Policy — By Appointment Only" },
      { property: "og:description", content: "Cookies policy for By Appointment Only" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/cookies-policy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://baowow.xyz/cookies-policy" }],
  }),
  component: CookiesPage,
});

const LAST_UPDATED = "29 September 2026";
const CONTACT = "apps@protocell.io";

type Section = { id: string; title: string; paragraphs: string[] };

const SECTIONS: Section[] = [
  {
    id: "what-is-stored",
    title: "1. What this site actually stores",
    paragraphs: [
      "This policy describes exactly what the site does, because a prototype should not be described in vaguer terms than it behaves. The site uses a very small number of items of browser storage, all of them essential to the site functioning, and none of them track you or identify you.",
      "We do not use advertising cookies, social media pixels, cross-site trackers or analytics profiles. No personal information is stored, in line with our privacy policy.",
    ],
  },
  {
    id: "consent-choice",
    title: "2. Remembering your choice in the cookie banner",
    paragraphs: [
      "When you accept or reject cookies in the banner, we store that choice (under the name whisker-cookie-consent) so the banner does not ask you again on every page. This item exists solely to remember the answer you gave. Clearing your browser storage removes it, and the banner will simply ask again.",
    ],
  },
  {
    id: "sign-in",
    title: "3. Keeping staff signed in",
    paragraphs: [
      "The staff dashboard behind the site is locked, and access requires signing in. Signing in stores a session item in the browser so the dashboard stays open while you move between pages, instead of asking for the password on every screen. This is strictly functional, applies only to invited staff accounts, and is removed when you sign out.",
    ],
  },
  {
    id: "preferences",
    title: "4. Interface preferences in the dashboard",
    paragraphs: [
      "The staff dashboard stores a small interface preference (whether a side panel is open) so the workspace looks the same when you return. It is a settings marker only, set as a short-lived cookie called sidebar_state, and holds no information about you.",
    ],
  },
  {
    id: "demonstration",
    title: "5. The demonstration",
    paragraphs: [
      "Everything you do in the demonstration — bookings, messages, simulated calls and payments — is held in memory for the current visit only. It is not written to browser storage, not saved, and not transmitted. Closing the page ends it.",
    ],
  },
  {
    id: "optional-cookies",
    title: "6. Optional cookies",
    paragraphs: [
      "The banner offers a choice between essential and optional cookies. At present the site runs no optional cookies at all — there are no analytics or measurement tools switched on. If optional cookies are ever added, they will be described here, and your choice in the banner will be honoured before anything optional runs.",
    ],
  },
  {
    id: "changes",
    title: "7. Changes to this policy",
    paragraphs: [
      "This policy may be updated from time to time. The date at the top of this page shows when it was last changed. Continuing to use the site means you accept the current version.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact",
    paragraphs: [`For questions about this policy, or anything else on this site, email ${CONTACT}.`],
  },
];

function CookiesPage() {
  return (
    <PolicyPage
      title="Cookies Policy"
      updated={LAST_UPDATED}
      introduction={
        <p>
          By Appointment Only is a prototype design. This policy lists the only storage the site actually uses: a
          handful of essential items that keep the site working, remember your banner choice and keep staff signed in.
          Nothing tracks you and no personal information is stored.
        </p>
      }
    >
      <div className="policy-layout">
        <nav className="policy-toc" aria-label="Contents">
          <p>On this page</p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, "")}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="policy-body">
          {SECTIONS.map((s) => (
            <section className="policy-section" id={s.id} key={s.id} aria-labelledby={`${s.id}-h`}>
              <h3 id={`${s.id}-h`}>{s.title}</h3>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </article>
      </div>

      <div className="policy-actions">
        <a className="access-link" href={`mailto:${CONTACT}`}>
          Request Product Access
        </a>
        <Link className="access-link" to="/demo">
          View Demo
        </Link>
      </div>
    </PolicyPage>
  );
}
