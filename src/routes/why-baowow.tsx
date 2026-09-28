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
        content: "Risk-based buffering, no-show recovery and idle-time task recovery for appointment-based businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/why-baowow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: homeCss },
      { rel: "canonical", href: "https://baowow.xyz/why-baowow" },
    ],
  }),
  component: WhyBaowowPage,
});

const STORY = [
  {
    title: "The problem",
    body: "We all know that days rarely run entirely as planned. Yet booking tools are built as calendars: as pre-planned days. Customers book online, by phone, by email or at the door, while late arrivals, no-shows and work taking longer than expected change the day. Most systems keep showing the plan while everyone else deals with the reality, and every commitment the business has to change risks the trust its customer placed in it.",
  },
  {
    title: "The solution",
    body: "By Appointment Only sits between manual scheduling and locked-in automation. It connects to the calendar the business already uses and becomes one source of truth across every way customers and staff interact with the business. Every appointment is sized from the business's history, so a booking stops being a free calendar slot and becomes an operationally backed commitment.",
  },
  {
    title: "Why it matters",
    body: "Booking systems promise a time and date. By Appointment Only makes sure the day can keep that promise, with fewer manual fixes, fewer evenings lost to catching up, and missed time turned into useful work. It gives an appointment-based business the backbone to use its full capacity, without letting the day overrun the people running it.",
  },
];

const PILLARS = [
  {
    title: "Risk-based buffering",
    body: "Every booking is given the time it truly needs, sized from its real risk, so the day holds together through late arrivals, overruns, no-shows and last-minute changes.",
  },
  {
    title: "Intelligent Automation",
    body: "The system reads the day as it unfolds and recommends the next best move, so the front desk is never left guessing.",
  },
  {
    title: "Idle-time task recovery",
    body: "Missed time is converted into admin tasks and inventory checks, so the business never loses a minute.",
  },
];

function WhyBaowowPage() {
  return (
    <div className="wk-root why-page">
      <div className="public-sections why-page-wrap">
        <div className="public-inner">
          <section className="public-section why-section" aria-labelledby="why-title">
            <Link to="/" className="why-home-link">
              ← Back to By Appointment Only
            </Link>
            <h2 id="why-title">Why BAOWOW?</h2>
            <p className="why-lead">
              By Appointment Only turns salon scheduling chaos and lost revenue into real-day bookings. Every
              appointment carries the operational margin it actually needs, and the system absorbs the friction
              automatically — the front desk and stylists simply confirm what the system already prepared.
            </p>

            <div className="why-story">
              {STORY.map((s) => (
                <div className="why-story-block" key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>

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
