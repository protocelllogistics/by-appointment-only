import { createFileRoute, Link } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — By Appointment Only" },
      { name: "description", content: "Privacy policy for By Appointment Only" },
      { property: "og:title", content: "Privacy Policy — By Appointment Only" },
      { property: "og:description", content: "Privacy policy for By Appointment Only" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/privacy-policy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://baowow.xyz/privacy-policy" }],
  }),
  component: PrivacyPage,
});

const LAST_UPDATED = "29 September 2026";
const CONTACT = "apps@protocell.io";

type Section = { id: string; title: string; paragraphs: string[] };

const SECTIONS: Section[] = [
  {
    id: "prototype",
    title: "1. A prototype, stated plainly",
    paragraphs: [
      "By Appointment Only (“BAOWOW”, “the site”) is a prototype design, built by PROTOCELL IO for demonstration purposes only.",
      "We recognise that this site is designed to feel like a true product and a true business. That is deliberate: a demonstration is only convincing if it behaves like the real thing. But it is not a live service, and this policy exists to make our intentions clear. Nothing on this site collects personal information about you, and nothing here is designed to.",
    ],
  },
  {
    id: "no-personal-information",
    title: "2. No personal information, anywhere",
    paragraphs: [
      "There is no instance on this site where you are asked for, or need to enter, personal information. There is no account sign-up, no profile to create, no name, address, email address, phone number or payment detail that belongs to a real person.",
      "Every booker, pet, appointment, conversation, note and card shown anywhere on this site is fictional, generated automatically, and cycles from pre-written mock details. If a field appears to ask for details, it is already filled in with fictional content.",
    ],
  },
  {
    id: "filters",
    title: "3. Filters that keep it that way",
    paragraphs: [
      "Where it could ever be possible for personal information to be typed in, filter systems are in place to prevent it. Inputs are restricted to pre-written selections and cycling fictional details, so no real personal information can be captured at the point of entry.",
      "Nothing entered during a demonstration is saved or transmitted. It is cleared when your session ends, when you close your browser, or when you clear your browsing history.",
    ],
  },
  {
    id: "booking-form",
    title: "4. The booking form",
    paragraphs: [
      "The booking form is a demonstration of how a real booking would feel. The booker’s name and any card details at a simulated checkout are always pre-filled with the fictional booker generated for your session. No real card, payment or customer details can be entered, and no money is taken at any point.",
      "Notes, preferences and messages are chosen from pre-written options rather than typed freely, so the booking form never becomes a channel for personal information.",
    ],
  },
  {
    id: "simulated-payments",
    title: "5. Simulated payments",
    paragraphs: [
      "Any fee shown in the booking form or demonstration, including pay-in-advance fast check-out, slot reservation, late or no-show fees, uses a simulated checkout. The name on the card always matches the automatically generated fictional booker, and the card details are pre-filled test numbers. No real card, payment or customer details can be entered, and no money is taken at any point.",
    ],
  },
  {
    id: "messages",
    title: "6. Messages, emails and calls in the demonstration",
    paragraphs: [
      "The messages, emails, phone calls and reminders you see in the demonstration are scripted, fictional and pre-written. No message is ever actually sent from this site, and no real inbox, phone or calendar is ever contacted.",
    ],
  },
  {
    id: "communications",
    title: "7. The only real way to reach us",
    paragraphs: [
      `The only real channel to communicate with us is by email, at ${CONTACT}. That inbox is read by a person and is never automated. We do not send marketing, newsletters or follow-up emails, because we do not hold an email address to send them to.`,
      "If you have any questions about this policy, the site, or the product, email us at the address above and a person will reply.",
    ],
  },
  {
    id: "changes",
    title: "8. Changes to this policy",
    paragraphs: [
      "This policy may be updated from time to time. The date at the top of this page shows when it was last changed. Continuing to use the site means you accept the current version.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact",
    paragraphs: [`For questions about this policy, or anything else on this site, email ${CONTACT}.`],
  },
];

function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated={LAST_UPDATED}
      introduction={
        <p>
          By Appointment Only is a prototype design. It is built to feel like a real product and a real business — but
          it is a demonstration, and this policy states our intentions clearly: no personal information is collected,
          and the only real way to reach us is by email.
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
