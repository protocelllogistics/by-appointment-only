import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import homeCss from "./-home/home.css?url";
import { initHero } from "./-home/booking";
import { PRICE_GBP_PUBLIC } from "@/lib/demo-presets";
import findUsImage from "@/assets/BAOWOW-Find-Us.jpeg.asset.json";
import tomPhoto from "@/assets/TOM.jpeg.asset.json";
import mayaPhoto from "@/assets/Maya.jpeg.asset.json";
import samPhoto from "@/assets/Sam.jpeg.asset.json";
import priyaPhoto from "@/assets/Priya.jpeg.asset.json";
import teamPhoto from "@/assets/Team.jpeg.asset.json";
import teamSalonPhoto from "@/assets/team-salon.jpeg.asset.json";

const SERVICES = ["Full style", "Bath & tidy", "Nail trim", "Puppy intro"] as const;
type TeamFact = { icon: "scissors" | "paw" | "sparkles" | "grad"; label: string };
type TeamMember = { name: string; role?: string; photo?: string; alt?: string; bio?: string[]; facts?: TeamFact[] };
const TEAM: TeamMember[] = [
  {
    name: "Sam",
    role: "Co-Founder & Senior Stylist",
    photo: samPhoto.url,
    alt: "Sam from By Appointment Only greeting a golden retriever outside the salon",
    bio: [
      "Sam and their three siblings founded By Appointment Only to bring a more personal, thoughtful approach to pet care to their local area. With a background in biology and a natural creative energy, Sam brings the character to the business — from the way clients are welcomed to the little details that make pets and their people feel at home.",
    ],
    facts: [{ icon: "scissors", label: "All coat types" }],
  },
  {
    name: "Maya",
    role: "Co-Founder & Senior Stylist",
    photo: mayaPhoto.url,
    alt: "Maya, senior pet stylist at By Appointment Only, with two dogs and a cat",
    bio: [
      "One of the four siblings behind By Appointment Only, Maya is our senior pet stylist, specialising in large breeds and full-groom services. She's known for her calm handling, practical approach and experience working with dogs that need a little more time and patience.",
      "With a busy grooming schedule, Maya also helps keep the day moving when appointments change. She enjoys working across different breeds, personalities and coat types, and brings plenty of experience to every appointment.",
    ],
    facts: [{ icon: "scissors", label: "Large breeds" }],
  },
  {
    name: "Priya",
    role: "Co-Founder & Stylist",
    photo: priyaPhoto.url,
    alt: "Priya, pet stylist at By Appointment Only, with a golden retriever",
    bio: [
      "One of the four siblings behind By Appointment Only, Priya is a pet stylist with a calm, considered approach and a more adventurous side. She has a particular role in cat grooming while working across breeds, coat types and services, and brings an outdoorsy, natural perspective to the team.",
    ],
    facts: [{ icon: "scissors", label: "Small dogs, cats" }],
  },
  {
    name: "Tom",
    role: "Co-Founder & Stylist",
    photo: tomPhoto.url,
    alt: "Tom, pet stylist at By Appointment Only, with a golden retriever",
    bio: [
      "One of the four siblings behind By Appointment Only, Tom is a pet stylist with a growing focus on developing his skills across all coat types and breeds. He enjoys working with a wide range of dogs and takes a thoughtful, detail-oriented approach to every groom.",
      "With a busy schedule, Tom plays an important role in keeping the day running smoothly and is working towards becoming a senior stylist.",
    ],
    facts: [{ icon: "scissors", label: "All breeds" }],
  },
];
const TEAM_TAB = "The team";
const SERVICE_DETAILS = {
  "Full style": {
    duration: "2–3 hours",
    includes: [
      "Consultation and coat assessment",
      "Bath and condition",
      "Dry and brush-out",
      "Full breed-suitable cut",
      "Nails, ears and finishing",
    ],
  },
  "Bath & tidy": {
    duration: "1–2 hours",
    includes: [
      "Bath and condition",
      "Dry and brush-out",
      "Face, feet and hygiene tidy",
      "Nail trim",
      "Finishing spritz",
    ],
  },
  "Nail trim": {
    duration: "15 minutes",
    includes: ["Nail length check", "Careful nail trim", "Paw-pad check", "Smooth finish where needed"],
  },
  "Puppy intro": {
    duration: "45–60 minutes",
    includes: [
      "Gentle salon introduction",
      "Bath and light dry",
      "Brush and comb",
      "Face, feet and hygiene tidy",
      "Positive handling breaks",
    ],
  },
} as const;
const STYLISTS = ["Any available", "Maya", "Tom", "Priya", "Sam"];
const WHEN = ["Earliest", "Morning", "Afternoon"];

// Server-rendered with the defaults so "Book in three taps" is complete on first paint.
const groupsHtml = (
  [
    ["Service", "service", SERVICES, "Full style"],
    ["Pet stylist", "stylist", STYLISTS, "Any available"],
    ["When", "when", WHEN, "Earliest"],
  ] as const
)
  .map(
    ([label, key, opts, sel]) =>
      `<div><div class="glabel" id="gl-${key}">${label}</div><div class="chips" role="radiogroup" aria-labelledby="gl-${key}">` +
      (opts as readonly string[])
        .map((o) => {
          const v = o.replace(/&/g, "&amp;");
          return `<button class="chip" role="radio" aria-checked="${o === sel}" tabindex="${o === sel ? 0 : -1}" data-k="${key}" data-v="${v}">${v}</button>`;
        })
        .join("") +
      `</div></div>`,
  )
  .join("");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "By Appointment Only (BAOWOW) — Real-day Salon Bookings" },
      {
        name: "description",
        content:
          "BAOWOW turns salon scheduling chaos into real-day bookings through risk-based buffering, intelligent automation and idle-time task recovery.",
      },
      { property: "og:title", content: "By Appointment Only (BAOWOW) — Real-day Salon Bookings" },
      {
        property: "og:description",
        content:
          "BAOWOW turns salon scheduling chaos into real-day bookings through risk-based buffering, intelligent automation and idle-time task recovery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: homeCss },
      { rel: "canonical", href: "https://baowow.xyz/" },
    ],
  }),
  component: HomePage,
});

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="icon" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function FactIcon({ k }: { k: "scissors" | "paw" | "sparkles" | "grad" }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {k === "scissors" && (
        <>
          <circle cx="6" cy="6" r="3" />
          <path d="M8.12 8.12 12 12" />
          <path d="M20 4 8.12 15.88" />
          <circle cx="6" cy="18" r="3" />
          <path d="M14.8 14.8 20 20" />
        </>
      )}
      {k === "paw" && (
        <>
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
        </>
      )}
      {k === "sparkles" && (
        <>
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </>
      )}
      {k === "grad" && (
        <>
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </>
      )}
    </svg>
  );
}

function PawDeco({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="6.2" cy="8" rx="2" ry="2.7" />
      <ellipse cx="10.4" cy="5.6" rx="2.1" ry="2.8" />
      <ellipse cx="15" cy="6.4" rx="2.1" ry="2.8" />
      <ellipse cx="18.6" cy="9.6" rx="1.9" ry="2.5" />
      <path d="M12.4 10.4c-3.4 0-6.6 3-6.6 6.1 0 2 1.5 3.3 3.4 3.3 1.1 0 2.1-.5 3.2-.5s2.1.5 3.2.5c1.9 0 3.4-1.3 3.4-3.3 0-3.1-3.2-6.1-6.6-6.1Z" />
    </svg>
  );
}

function HomePage() {
  const [panel, setPanel] = useState(0);
  const [selectedService, setSelectedService] = useState<(typeof SERVICES)[number]>("Full style");
  const [teamMember, setTeamMember] = useState<string>(TEAM_TAB);
  const panelRef = useRef(0);
  const secondRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    initHero(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onMobileTeamClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest('a[href="#team"]') : null;
      if (!link) return;
      e.preventDefault();
      document.querySelector("#team")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (!desktopQuery.matches) {
      document.addEventListener("click", onMobileTeamClick);
      return () => document.removeEventListener("click", onMobileTeamClick);
    }

    let locked = false;
    let touchY: number | null = null;
    const go = (next: number) => {
      if (locked || next === panelRef.current || next < 0 || next > 2) return;
      locked = true;
      panelRef.current = next;
      setPanel(next);
      window.setTimeout(() => {
        locked = false;
      }, 900);
    };
    const inBooking = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("#taps, #flow, #scrim, .cookie-banner, [role=dialog]");
    const move = (dir: number, target: EventTarget | null) => {
      if (inBooking(target)) return false;
      const second = secondRef.current;
      if (dir > 0 && panelRef.current < 2) {
        go(panelRef.current + 1);
        return true;
      }
      if (dir < 0 && panelRef.current === 2) {
        go(1);
        return true;
      }
      if (panelRef.current === 1 && dir < 0 && (!second || second.scrollTop <= 0)) {
        go(0);
        return true;
      }
      return false;
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      if (move(Math.sign(e.deltaY), e.target) || panelRef.current === 0) {
        if (!inBooking(e.target)) e.preventDefault();
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
      touchY = null;
      if (Math.abs(dy) > 50) move(Math.sign(dy), e.target);
    };
    const onKey = (e: KeyboardEvent) => {
      if (inBooking(e.target) || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        if (move(1, e.target)) e.preventDefault();
      }
      if (["ArrowUp", "PageUp"].includes(e.key)) {
        if (move(-1, e.target)) e.preventDefault();
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href="#team"]') : null;
      if (a) {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="wk-root pager">
      <div className="pager-track" style={{ transform: `translate3d(0, ${panel * -100}dvh, 0)` }}>
        <section className="hero pager-panel" aria-labelledby="h">
          <div className="hero-left">
            <div className="brand">
              <i aria-hidden="true"></i>By Appointment Only
            </div>
            <h1 id="h">
              Good
              <br />
              dog days.
            </h1>
            <p className="sub">
              By Appointment Only: Turning salon scheduling chaos and lost revenue into real-day bookings, through
              risk-based buffering, intelligent automation, and idle-time task recovery.
            </p>
            <div className="team-row">
              <a className="btn btn-outline team" href="#team">
                Meet the team
              </a>
              <Link className="why-link" to="/why-baowow">
                Why BAOWOW?
              </Link>
            </div>
            <div className="photo">
              <img src={teamSalonPhoto.url} alt="The By Appointment Only team in the salon with their dogs" />
            </div>
            <div className="spacer"></div>
            <svg className="whiskers" width="720" height="190" viewBox="0 0 720 190" aria-hidden="true">
              <path d="M0 84 C190 50 420 16 640 12 C420 18 190 58 0 93 Z" fill="var(--color-accent)" />
              <path d="M0 102 C230 92 470 88 720 104 C470 93 230 99 0 109 Z" fill="var(--color-accent-2-800)" />
              <path d="M0 118 C220 124 450 146 670 182 C450 150 220 132 0 126 Z" fill="var(--color-accent-400)" />
            </svg>
            <div className="hero-access">
              <a className="access-link" href="mailto:apps@protocell.io">
                Request Product Access
              </a>
              <Link className="access-link" to="/demo">
                View Demo
              </Link>
            </div>
            <div className="addr">
              <Icon>
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </Icon>
              16 Paws Street, Barking, Greater London
            </div>
          </div>

          <div className="hero-right">
            <div className="scrim" id="scrim"></div>
            <div className="taps" id="taps" role="dialog" aria-modal="true" aria-labelledby="tapsTitle">
              <button className="handle" id="handle" aria-label="Close"></button>
              <h2 id="tapsTitle">
                <span className="t-desk">Book in 1 minute</span>
                <span className="t-mob">Book a visit</span>
              </h2>
              <div className="groups" id="groups" dangerouslySetInnerHTML={{ __html: groupsHtml }} />
              <button className="btn btn-light go" id="showTimes">
                Show times
              </button>
            </div>
            <div className="flow" id="flow" role="dialog" aria-modal="true" aria-label="Booking">
              <div className="flow-top">
                <button className="iconbtn" id="back" aria-label="Back">
                  <Icon>
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </Icon>
                </button>
                <div className="ctx" id="ctx"></div>
                <button className="iconbtn" id="close" aria-label="Close">
                  <Icon>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </Icon>
                </button>
              </div>
              <div className="flow-body" id="body" aria-live="polite"></div>
            </div>
            <div className="deco" aria-hidden="true">
              <i style={{ left: 260, top: -140, width: 560, height: 560, background: "var(--color-accent)" }}></i>
              <i
                style={{ left: 20, bottom: -100, width: 240, height: 240, background: "var(--color-accent-2-300)" }}
              ></i>
            </div>
          </div>
        </section>
        <div className="public-sections pager-panel" ref={secondRef}>
          <div className="public-inner">
            <section className="public-section services-section">
              <h2>What we do</h2>
              <div className="services-explorer">
                <div className="service-list" role="tablist" aria-label="Services">
                  {SERVICES.map((service) => (
                    <button
                      className="service-item"
                      type="button"
                      role="tab"
                      aria-selected={selectedService === service}
                      aria-controls="service-detail"
                      key={service}
                      onClick={() => setSelectedService(service)}
                    >
                      <span>{service}</span>
                      <Icon>
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </Icon>
                    </button>
                  ))}
                </div>
                <div className="service-detail" id="service-detail" role="tabpanel">
                  <div className="service-detail-head">
                    <h3>{selectedService}</h3>
                    <span>
                      Average {SERVICE_DETAILS[selectedService].duration} · <b>£{PRICE_GBP_PUBLIC[selectedService]}</b>
                    </span>
                  </div>
                  <div className="service-includes">
                    <div className="service-includes-label">Includes</div>
                    <ul>
                      {SERVICE_DETAILS[selectedService].includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost service-book"
                    onClick={() => {
                      // Snap (no scroll animation) to the top booking area with times already open.
                      const track = document.querySelector<HTMLElement>(".pager-track");
                      track?.classList.add("snap");
                      panelRef.current = 0;
                      setPanel(0);
                      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
                      document.dispatchEvent(new CustomEvent("bao:book", { detail: { service: selectedService } }));
                      window.setTimeout(() => track?.classList.remove("snap"), 60);
                    }}
                  >
                    Book {selectedService} now · £{PRICE_GBP_PUBLIC[selectedService]} →
                  </button>
                </div>
              </div>
            </section>
            <section className="public-section" id="team">
              <div className="team-layout">
                <div className="team-names" role="tablist" aria-label="Team members">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={teamMember === TEAM_TAB}
                    aria-controls="team-card"
                    className="team-name-btn"
                    onClick={() => setTeamMember(TEAM_TAB)}
                  >
                    <span className="team-name-btn-name">{TEAM_TAB}</span>
                  </button>
                  {TEAM.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      role="tab"
                      aria-selected={teamMember === m.name}
                      aria-controls="team-card"
                      className="team-name-btn"
                      onClick={() => setTeamMember(m.name)}
                    >
                      <span className="team-name-btn-name">{m.name}</span>
                      {m.role && <span className="team-name-btn-role">{m.role}</span>}
                    </button>
                  ))}
                </div>
                <div className="team-stage">
                  {teamMember === TEAM_TAB ? (
                    <article className="team-card team-group" id="team-card" aria-label="The team">
                      <div className="team-photo">
                        <img src={teamPhoto.url} alt="The By Appointment Only team outside the salon" />
                      </div>
                    </article>
                  ) : (
                    (() => {
                      const m = (TEAM.find((x) => x.name === teamMember) ?? TEAM[0]) as TeamMember;
                      return (
                        <article className="team-card" id="team-card">
                          {m.photo ? (
                            <div className="team-photo">
                              <img src={m.photo} alt={m.alt} />
                            </div>
                          ) : (
                            <div className="team-photo team-photo-empty" aria-hidden="true">
                              <PawDeco className="team-empty-paw" />
                            </div>
                          )}
                          <div className="team-info">
                            <PawDeco className="team-paw-deco" />
                            <h3>{m.name}</h3>
                            {m.role && <div className="team-info-role">{m.role}</div>}
                            <span className="team-rule" aria-hidden="true"></span>
                            {m.bio?.map((p, i) => (
                              <p className="team-bio" key={i}>
                                {p}
                              </p>
                            ))}
                            {m.facts && (
                              <ul className="team-facts">
                                {m.facts.map((f) => (
                                  <li key={f.label}>
                                    <FactIcon k={f.icon} />
                                    <span>{f.label}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </article>
                      );
                    })()
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
        <section className="find-section pager-panel" aria-labelledby="find-us-title">
          <div className="find-inner">
            <div className="find-intro">
              <div className="find-brand">By Appointment Only</div>
              <h2 id="find-us-title">Find us</h2>
              <img
                className="find-logo"
                src={findUsImage.url}
                alt="BAOWOW mark with a dog silhouette"
                width={260}
                height={260}
              />
              <div className="find-address">
                <Icon>
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </Icon>
                <address>
                  16 Paws Street,
                  <br />
                  Barking,
                  <br />
                  Greater London
                </address>
              </div>
              <div className="find-tags" aria-label="Ways to book">
                <span>Book Online</span>
                <span>Book by Phone</span>
                <span>Book by Email</span>
              </div>
            </div>
            <div className="opening-times">
              <div className="opening-label">Opening times</div>
              <div className="opening-row">
                <span>Monday</span>
                <b>08:30</b>
                <em aria-hidden="true">to</em>
                <b>17:30</b>
              </div>
              <div className="opening-row">
                <span>Tuesday</span>
                <b>08:30</b>
                <em aria-hidden="true">to</em>
                <b>17:30</b>
              </div>
              <div className="opening-row">
                <span>Wednesday</span>
                <b>08:30</b>
                <em aria-hidden="true">to</em>
                <b>17:30</b>
              </div>
              <div className="opening-row">
                <span>Thursday</span>
                <b>08:30</b>
                <em aria-hidden="true">to</em>
                <b>17:30</b>
              </div>
              <div className="opening-row">
                <span>Friday</span>
                <b>08:30</b>
                <em aria-hidden="true">to</em>
                <b>17:30</b>
              </div>
              <div className="opening-row">
                <span>Saturday</span>
                <b>09:00</b>
                <em aria-hidden="true">to</em>
                <b>16:00</b>
              </div>
              <div className="opening-row">
                <span>Sunday</span>
                <b>10:00</b>
                <em aria-hidden="true">to</em>
                <b>13:00</b>
              </div>
            </div>
          </div>
          <footer className="site-footer">
            <div className="footer-brand">By Appointment Only</div>
            <div className="footer-addr">16 Paws Street, Barking, Greater London</div>
            <nav className="footer-legal" aria-label="Legal">
              <a href="/terms-and-conditions">Terms & Conditions</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/no-show-policy">No-Show Policy</a>
              <a href="/cookies-policy">Cookies Policy</a>
              <Link to="/dashboard">Login</Link>
            </nav>
            <p className="footer-disclaimer">
              This is a prototype of BAOWOW, an application prototype for automated appointment-based businesses
              developed by{" "}
              <a href="https://protocell.io" target="_blank" rel="noopener noreferrer">
                PROTOCELL IO
              </a>
              , intended for demonstration purposes only.
            </p>
            <div className="footer-copy">© {new Date().getFullYear()} By Appointment Only. All rights reserved.</div>
          </footer>
        </section>
      </div>

      <button className="bar" id="bar" aria-haspopup="dialog" aria-expanded="false" aria-controls="taps">
        <span>
          <b>Book a visit</b>
        </span>
        <span className="knob">
          <Icon>
            <path d="m18 15-6-6-6 6" />
          </Icon>
        </span>
      </button>
    </div>
  );
}
