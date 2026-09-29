import { createFileRoute, Link } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — By Appointment Only" },
      { name: "description", content: "Terms and conditions for By Appointment Only" },
      { property: "og:title", content: "Terms & Conditions — By Appointment Only" },
      { property: "og:description", content: "Terms and conditions for By Appointment Only" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/terms-and-conditions" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://baowow.xyz/terms-and-conditions" }],
  }),
  component: TermsPage,
});

const LAST_UPDATED = "29 September 2026";
const CONTACT = "apps@protocell.io";

type Section = { id: string; title: string; paragraphs: string[] };

const SECTIONS: Section[] = [
  {
    id: "prototype",
    title: "1. A prototype for demonstration only",
    paragraphs: [
      "By Appointment Only (“BAOWOW”, “the site”) is a prototype design. It exists purely to demonstrate a concept for appointment-based businesses. It is not a live commercial service, and nothing on the site should be relied on as one.",
      "No real appointments are made, changed or cancelled through this site. Booking forms, calendars, front-desk tools, recommendations and dashboards are demonstrations only.",
    ],
  },
  {
    id: "why",
    title: "2. Why this website exists",
    paragraphs: [
      "This site was created as an entry to the #lovablechallenge, hosted by Lovable and Contra. It was built with Lovable, and we thank both hosts for the opportunity to share this work.",
      "Its purpose is to show, as clearly as possible, how an appointment system can adapt to the real day rather than a pre-planned one. It is shared for demonstration, review and judging purposes only.",
    ],
  },
  {
    id: "fictional",
    title: "3. Fictional business and characters",
    paragraphs: [
      "The pet styling business shown on this site, its name, location, team, clients, pets, appointments, history and all other people and events are fictional. Any resemblance to real businesses, people or animals is coincidental.",
      "The address shown on this site, 16 Paws Street, Barking, Greater London, is a fictional location.",
      "PROTOCELL IO does not provide, and does not commit to providing, pet grooming, pet styling or any other pet care services.",
    ],
  },
  {
    id: "demo-content",
    title: "4. Demonstration content",
    paragraphs: [
      "The demonstration is pre-filled with fictional content by default, so that no personal data can be entered. The only field that can be changed is a pet name.",
      "Nothing you do in the demonstration is saved or transmitted. It is cleared when your session ends, when you close your browser, or when you clear your browsing history.",
    ],
  },
  {
    id: "access",
    title: "5. Access to the product",
    paragraphs: [
      `Access to the product beyond this public demonstration is by invitation only, or by approval following a request. To request access, email ${CONTACT}. Requests are subject to acceptance, and PROTOCELL IO may decline or withdraw access at its discretion.`,
    ],
  },
  {
    id: "governance",
    title: "6. Governance and ownership",
    paragraphs: [
      "This site and its contents are governed by PROTOCELL IO. The owner is Dr Emmanuel Gonzalez-Escobar.",
      "PROTOCELL IO is a brand name of Protocell Logistics, a trade mark registered in the United Kingdom.",
      `${CONTACT} is the public contact for the website and product owner, and for all governance matters.`,
    ],
  },
  {
    id: "ip",
    title: "7. Intellectual property",
    paragraphs: [
      "All designs, logic, rules, system intelligence and written content on this site were designed by Dr Emmanuel Gonzalez-Escobar via PROTOCELL IO, and are protected by intellectual property law.",
      "You may view the site for personal and evaluation purposes. You may not copy, reproduce, adapt or use its designs, logic or content for commercial purposes without written permission from PROTOCELL IO.",
      "Lovable, Contra and any other third-party names or marks belong to their respective owners and are used only to give credit.",
    ],
  },
  {
    id: "warranty",
    title: "8. No warranty",
    paragraphs: [
      "The site is provided “as is” and “as available”, without warranties of any kind. As a prototype, it may contain errors, change without notice or be taken offline at any time.",
      "Figures, durations, recommendations and outcomes shown in the demonstration are illustrative and based on fictional data. They are not advice and should not be used to run a real business.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, PROTOCELL IO and its owner are not liable for any loss or damage arising from your use of, or reliance on, this site. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to these terms",
    paragraphs: [
      "These terms may be updated from time to time. The date at the top of this page shows when they were last changed. Continuing to use the site means you accept the current version.",
    ],
  },
  {
    id: "law",
    title: "11. Governing law",
    paragraphs: [
      "These terms are governed by the laws of England and Wales, and the courts of England and Wales have jurisdiction over any dispute relating to them.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact",
    paragraphs: [`For questions about these terms, governance or access, email ${CONTACT}.`],
  },
];

function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      updated={LAST_UPDATED}
      introduction={
        <p>
          By Appointment Only is a prototype design created for the #lovablechallenge. The business and characters are
          fictional, booking tools are demonstrations only, and the demonstration is pre-filled with fictional content
          so that no personal data can be entered.
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
