import { createFileRoute, Link } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/no-show-policy")({
  head: () => ({
    meta: [
      { title: "No-Show Policy — By Appointment Only" },
      { name: "description", content: "No-show policy for By Appointment Only" },
      { property: "og:title", content: "No-Show Policy — By Appointment Only" },
      { property: "og:description", content: "No-show policy for By Appointment Only" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/no-show-policy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://baowow.xyz/no-show-policy" }],
  }),
  component: NoShowPage,
});

const LAST_UPDATED = "29 September 2026";
const CONTACT = "apps@protocell.io";

type Section = { id: string; title: string; paragraphs: string[] };

const SECTIONS: Section[] = [
  {
    id: "purpose",
    title: "1. Why we have this policy",
    paragraphs: [
      "When you book an appointment, the salon reserves a specific block of time and prepares a station and a stylist just for you. If the appointment does not happen, that time cannot be offered to anyone else at short notice — it is lost for the business and for other clients who wanted it.",
      "This policy explains what happens when an appointment is late, missed or cancelled, so the rules are the same for everyone and there are no surprises.",
    ],
  },
  {
    id: "grace-period",
    title: "2. The first 15 minutes are included",
    paragraphs: [
      "Life happens. If you arrive up to 15 minutes after your appointment's start time, you will not be charged anything and your service simply continues from the moment you arrive.",
      "The salon keeps your slot for you during that window. If you know you are running late, a quick call or message lets us plan around it.",
    ],
  },
  {
    id: "late-fee",
    title: "3. Late arrival fee — £10",
    paragraphs: ["If you arrive more than 15 minutes after your appointment's start time, a £10 late fee applies."],
  },
  {
    id: "no-show",
    title: "4. No-show — £25 after 25 minutes",
    paragraphs: [
      "If you have not arrived or made contact within 25 minutes of your appointment's start time, the appointment is marked as a no-show. Your slot is released and a £25 no-show fee applies.",
    ],
  },
  {
    id: "cancellations",
    title: "5. Cancellations and changes within 24 hours",
    paragraphs: [
      "Appointments can be cancelled or changed free of charge up to 24 hours before the start time. Within the last 24 hours, cancelling or changing an appointment applies the £25 no-show fee.",
    ],
  },
  {
    id: "reservation",
    title: "6. Reserving a slot",
    paragraphs: [
      "If you are not ready to confirm a booking, you can reserve a slot with a £25 refundable reservation fee. The fee is refunded — or taken off your bill — when you finish booking and attend.",
    ],
  },
  {
    id: "inclusivity",
    title: "7. Our inclusivity approach",
    paragraphs: [
      "We understand that days are dynamic, which measn that sometimes we arrive late, miss appointments or cancel for many reasons. This policy is written to work for all of these circumstances. If you are running late for an appoinment or have missed it entirely, reaching out is always is the best plan of action. We will look for a way to fit you in, and where a fee can be waived, it will be waived. We want to make sure your Pet is well taken care off and healthy, especially if they were looking forward to the visit.",
    ],
  },
  {
    id: "how-fees-are-applied",
    title: "8. How fees are applied",
    paragraphs: [
      "Fees are applied automatically based on the appointment's real timeline: the reserved slot, the actual arrival, and any cancellation or change. You receive the payment link by your preferred contact method, and paying it before check-out keeps everything quick.",
    ],
  },
  {
    id: "prototype",
    title: "9. This is a prototype",
    paragraphs: [
      "By Appointment Only is a prototype built by PROTOCELL IO for demonstration purposes. This policy shows how the product is designed to behave [it uses realistic rules and figures, including the £10 late fee and the £25 no-show fee] but no money is ever charged and no real appointment exists. Any payment you see in the demo is simulated with fictional details and is never transmitted.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    paragraphs: [`Questions about this policy? Email ${CONTACT}.`],
  },
];

function NoShowPage() {
  return (
    <PolicyPage
      title="No-Show Policy"
      updated={LAST_UPDATED}
      introduction={
        <p>
          This policy sets out what happens when an appointment runs late, is missed or is cancelled — the same rules
          for every client, applied automatically. It is written with real, realistic parameters so the product can be
          judged as it would actually behave.
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
          <div className="policy-notice">
            <p>
              <b>Prototype notice:</b> this is an example policy for demonstration purposes, built by PROTOCELL IO. The
              rules and amounts shown here reflect how By Appointment Only is designed to work, but no money is ever
              charged and no real appointment exists. All payments in the demo are simulated.
            </p>
          </div>

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
