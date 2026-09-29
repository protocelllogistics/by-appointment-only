import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — By Appointment Only" },
    { name: "description", content: "Privacy policy for By Appointment Only" },
    { property: "og:title", content: "Privacy Policy — By Appointment Only" },
    { property: "og:description", content: "Privacy policy for By Appointment Only" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://baowow.xyz/privacy-policy" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" },
  ], links: [{ rel: "canonical", href: "https://baowow.xyz/privacy-policy" }] }),
  component: () => (
    <PolicyPage title="Privacy Policy">
      <article className="policy-body">
        <section className="policy-section" id="simulated-payments" aria-labelledby="simulated-payments-h">
          <h3 id="simulated-payments-h">Simulated payments</h3>
          <p>
            Every simulated checkout in the booking form and demonstration is pre-filled with the name of the
            automatically generated fictional booker and fictional test card details. No real customer, card or payment
            details are entered, collected or stored at any point.
          </p>
        </section>
      </article>
    </PolicyPage>
  ),
});