import { createFileRoute, Link } from "@tanstack/react-router";

import homeCss from "./-home/home.css?url";

export const Route = createFileRoute("/why-baowow")({
  head: () => ({
    meta: [
      { title: "Why BAOWOW? — By Appointment Only" },
      {
        name: "description",
        content:
          "Why BAOWOW: risk-based buffering, no-show recovery and idle-time task recovery — turning salon scheduling chaos into real-day bookings.",
      },
      { property: "og:title", content: "Why BAOWOW? — By Appointment Only" },
      {
        property: "og:description",
        content:
          "Risk-based buffering, no-show recovery and idle-time task recovery for appointment-based businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/why-baowow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://baowow.xyz/why-baowow" }],
  }),
  component: WhyBaowowPage,
});

const PILLARS = [
  {
    title: "Risk-based buffering",
    body: "Every booking carries a buffer sized to the appointment’s real risk, so the day holds together even when a groom runs longer than planned.",
  },
  {
    title: "No-show recovery",
    body: "Late arrivals and no-shows are detected and absorbed automatically, and freed time is handed back to the day instead of being lost.",
  },
  {
    title: "Idle-time task recovery",
    body: "Time not used last minute converts into admin tasks and inventory checks, so no time is ever lost at business level.",
  },
];

function WhyBaowowPage() {
  return (
    <div className="wk-root why-page">
      <div className="public-sections why-page-wrap">
        <div className="public-inner">
          <section className="public-section why-section">
            <Link to="/" className="why-home-link">
              ← Back to By Appointment Only
            </Link>
            <h2 id="why-title">Why BAOWOW?</h2>
            <p className="why-lead">
              By Appointment Only turns salon scheduling chaos and lost revenue into real-day bookings. Every
              appointment carries the operational margin it actually needs, and the system absorbs the
              friction automatically — the front desk and stylists simply confirm what the system already
              prepared.
            </p>
            <div className="why-grid">
              {PILLARS.map((p) => (
                <div className="why-card" key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
            <div className="why-cta">
              <a className="access-link" href="mailto:apps@protocell.io">
                Request Product Access
              </a>
              <Link className="access-link" to="/demo">
                View Demo
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
