// @ts-nocheck
import { demoPublicSlots } from "@/lib/demo-rota";
import { validateDemoEditable } from "@/lib/demo-validation";
import { createFictionalContact } from "@/lib/fictional-contact";
import { NOTE_PRESETS, PRICE_GBP_PUBLIC, hexCode, icsHref, toggleNote } from "@/lib/demo-presets";

// Behaviour follows the supplied mockup, backed by live availability.
export function initHero(signal: AbortSignal) {
  const fictionalContact = createFictionalContact();
  /* ---------- Data (replace with API) ---------- */
  const CONFIG = {
    inactivityMinutes: 10, // idle time before the form times out
    goodwill: "£5", // clash goodwill discount
    simulateClash: new URLSearchParams(location.search).has("clash"), // ?clash to demo the clash screen
  };
  const SERVICES = ["Full style", "Bath & tidy", "Nail trim", "Puppy intro"];
  const STYLISTS = ["Any available", "Maya", "Tom", "Priya", "Sam"];
  const WHEN = ["Earliest", "Morning", "Afternoon"];
  const ABOUT = {
    "Full style": "2 hours",
    "Bath & tidy": "1 hour",
    "Nail trim": "30 minutes",
    "Puppy intro": "45 minutes",
  };
  const MINUTES = { "Full style": 120, "Bath & tidy": 60, "Nail trim": 30, "Puppy intro": 45 };
  const CONTACT_ICONS = {
    Phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    Messages: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    Email: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  };
  const BREEDS = [
    ["Chihuahua", "S"],
    ["Cockapoo", "M"],
    ["Poodle", "M"],
    ["Siberian Husky", "L"],
    ["Mastiff", "XL"],
    ["Mixed / not sure", "?"],
  ];
  const SIZE_C = {
    S: "var(--color-accent-2-500)",
    M: "var(--color-accent-2-700)",
    L: "var(--color-accent-600)",
    XL: "var(--color-accent-800)",
    "?": "var(--color-neutral-600)",
  };
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    MONL = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  const OPEN = (() => {
    const o = [],
      d = new Date();
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setDate(end.getDate() + 18);
    while (d < end) {
      if (d.getDay() !== 0) o.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return o;
  })();
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  const dayShort = (i) => {
    const d = OPEN[i];
    return (
      (i === 0 && isToday(d) ? "Today, " : i === 1 && isTomorrow(d) ? "Tomorrow, " : "") +
      WD[d.getDay()] +
      " " +
      d.getDate() +
      " " +
      MON[d.getMonth()]
    );
  };
  const dayLong = (i) => {
    const d = OPEN[i];
    return (
      (isToday(d) ? "Today, " : isTomorrow(d) ? "Tomorrow, " : "") +
      WDL[d.getDay()] +
      " " +
      d.getDate() +
      " " +
      MONL[d.getMonth()]
    );
  };
  function isToday(d) {
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }
  function isTomorrow(d) {
    const n = new Date();
    n.setDate(n.getDate() + 1);
    return d.toDateString() === n.toDateString();
  }
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  let liveSlots = [], availabilityError = "", availabilityLoading = false;
  function daySlots(key, when, i) {
    return liveSlots.filter((x) => x.slot_date === isoDay(OPEN[i])).map((x) => [x.starts_at.slice(0,5), x.staff_name]).slice(0,8);
  }
  function clashAlts(p, any) {
    return liveSlots.filter(x=>!(x.slot_date===p.date&&x.starts_at.slice(0,5)===p.time&&x.staff_name===p.who)).map(x=>({time:x.starts_at.slice(0,5),who:x.staff_name,i:OPEN.findIndex(d=>isoDay(d)===x.slot_date),date:x.slot_date})).filter(x=>x.i>=0).slice(0,3);
  }

  /* ---------- State ---------- */
  const S = {
    service: "Full style",
    stylist: "Any available",
    when: "Earliest",
    step: "taps",
    picked: null,
    owner: fictionalContact.name,
    mobile: fictionalContact.mobile,
    email: fictionalContact.email,
    pet: "",
    breed: "Cockapoo",
    notes: "",
    contact: "Messages",
    code: "",
    breedOpen: false,
    discounted: false,
  };
  const $ = (id) => document.getElementById(id);
  const desktop = () => matchMedia("(min-width:1024px)").matches;
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let idleT = null,
    lastFocus = null;

  /* ---------- Three taps ---------- */
  function renderGroups() {
    const g = (label, key, opts) =>
      `<div><div class="glabel" id="gl-${key}">${label}</div><div class="chips" role="radiogroup" aria-labelledby="gl-${key}">` +
      opts
        .map(
          (o) =>
            `<button class="chip" role="radio" aria-checked="${S[key] === o}" tabindex="${S[key] === o ? 0 : -1}" data-k="${key}" data-v="${esc(o)}">${esc(o)}</button>`,
        )
        .join("") +
      `</div></div>`;
    $("groups").innerHTML =
      g("Service", "service", SERVICES) + g("Pet stylist", "stylist", STYLISTS) + g("When", "when", WHEN);
  }
  $("groups").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    S[b.dataset.k] = b.dataset.v;
    renderGroups();
    $("groups").querySelector(`[data-k="${b.dataset.k}"][aria-checked="true"]`).focus();
  });
  $("groups").addEventListener("keydown", (e) => {
    const b = e.target.closest(".chip");
    if (!b || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const sib = [...b.parentElement.children],
      i = sib.indexOf(b),
      n = sib[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + sib.length) % sib.length];
    n.click();
  });

  function openTaps() {
    if (desktop()) return;
    lastFocus = document.activeElement;
    $("taps").classList.add("on");
    $("scrim").classList.add("on");
    $("bar").setAttribute("aria-expanded", "true");
    setTimeout(() => $("taps").querySelector('[aria-checked="true"]').focus(), 60);
  }
  function closeTaps() {
    if (desktop()) return;
    $("taps").classList.remove("on");
    if (S.step === "taps") $("scrim").classList.remove("on");
    $("bar").setAttribute("aria-expanded", "false");
    (lastFocus || $("bar")).focus();
  }
  $("bar").onclick = openTaps;
  $("handle").onclick = closeTaps;
  $("scrim").onclick = () => {
    if (S.step !== "taps") go("taps");
    closeTaps();
  };
  // swipe down to close
  (() => {
    let y0 = null;
    const t = $("taps");
    t.addEventListener(
      "touchstart",
      (e) => {
        y0 = e.touches[0].clientY;
      },
      { passive: true },
    );
    t.addEventListener("touchend", (e) => {
      if (y0 != null && e.changedTouches[0].clientY - y0 > t.offsetHeight * 0.25) closeTaps();
      y0 = null;
    });
  })();

  async function loadAvailability() {
    availabilityError = "";
    availabilityLoading = true;
    liveSlots = [];
    if (S.step === "times" || S.step === "clash") render();
    try {
      const minutes = { "Full style": 120, "Bath & tidy": 60, "Nail trim": 30, "Puppy intro": 45 }[S.service] || 60;
      liveSlots = demoPublicSlots(isoDay(OPEN[0]), 18, minutes, S.stylist === "Any available" ? null : S.stylist)
        .filter((row) => S.when === "Earliest" || (S.when === "Morning" ? row.starts_at < "12:00:00" : row.starts_at >= "12:00:00"));
    } catch { liveSlots = []; availabilityError = "We couldn't load available times. Please try again."; }
    availabilityLoading = false;
    if (S.step === "times" || S.step === "clash") render();
  }
  $("showTimes").onclick = () => {
    document.dispatchEvent(
      new CustomEvent("showtimes", { detail: { service: S.service, stylist: S.stylist, when: S.when } }),
    );
    availabilityLoading = true;
    liveSlots = [];
    go("times");
    loadAvailability();
  };

  // "Book now" on a service: open booking in place with that service chosen — no scrolling.
  let flowHome = null;
  const onBookService = (e) => {
    const svc = e.detail?.service;
    if (!SERVICES.includes(svc)) return;
    S.service = svc;
    renderGroups();
    if (desktop()) {
      // The hero sits in a transformed pager, so lift the panel to <body> to float over the page.
      if (!flowHome) {
        const el = $("flow");
        flowHome = document.createComment("flow");
        el.replaceWith(flowHome);
        document.body.appendChild(el);
      }
      $("flow").classList.add("modal");
      document.documentElement.classList.add("book-modal");
    }
    $("showTimes").click();
  };
  document.addEventListener("bao:book", onBookService, { signal });
  signal.addEventListener("abort", () => {
    if (flowHome) flowHome.replaceWith($("flow"));
    document.documentElement.classList.remove("book-modal");
  });

  /* ---------- Flow ---------- */
  function go(step) {
    S.step = step;
    S.breedOpen = false;
    const inFlow = step !== "taps";
    if (!inFlow && flowHome) {
      flowHome.replaceWith($("flow"));
      flowHome = null;
    }
    if (!inFlow) {
      $("flow").classList.remove("modal");
      document.documentElement.classList.remove("book-modal");
    }
    $("flow").classList.toggle("on", inFlow);
    $("taps").classList.toggle("hidden", inFlow && desktop());
    if (!desktop()) {
      $("taps").classList.remove("on");
      $("scrim").classList.toggle("on", inFlow);
      $("bar").style.visibility = inFlow ? "hidden" : "";
      document.documentElement.classList.toggle("booking-open", inFlow);
    }
    resetIdle();
    render();
    if (inFlow)
      setTimeout(() => {
        const f = $("body").querySelector("h2,button,input");
        f && f.focus({ preventScroll: true });
      }, 80);
  }
  const BACK = {
    times: "taps",
    details: "times",
    reserved: "details",
    expired: "times",
    clash: "times",
    done: "taps",
    checking: "details",
  };
  $("back").onclick = () => {
    const b = BACK[S.step] || "taps";
    go(b);
    if (b === "taps") openTaps();
  };
  $("close").onclick = () => {
    go("taps");
    closeTaps();
  };
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape") return;
      if (S.step !== "taps") {
        go("taps");
        closeTaps();
      }
      else closeTaps();
    },
    { signal },
  );

  // inactivity timeout (no visible countdown)
  signal.addEventListener("abort", () => clearTimeout(idleT));
  signal.addEventListener("abort", () => document.documentElement.classList.remove("booking-open"));
  function resetIdle() {
    clearTimeout(idleT);
    if (["times", "details"].includes(S.step))
      idleT = setTimeout(() => go("expired"), CONFIG.inactivityMinutes * 60000);
  }
  ["pointerdown", "keydown", "scroll", "input"].forEach((ev) =>
    $("flow").addEventListener(ev, resetIdle, { passive: true, capture: true }),
  );

  function render() {
    $("ctx").textContent = S.service + " · " + S.stylist;
    const b = $("body"),
      key = S.stylist === "Any available" ? "Any" : S.stylist;
    let h = "";
    if (S.step === "times") {
      const availabilityContent = availabilityLoading
        ? `<div class="availability-loading" role="status">Checking live availability…</div>`
        : availabilityError
          ? `<div class="note">${availabilityError}</div>`
          : OPEN.map((d, i) => {
              const sl = daySlots(key, S.when, i);
              return `<div class="day"><div class="dayh"><b>${dayLong(i)}</b><span>${sl.length ? sl.length + " free" : "Fully booked"}</span></div>
            <div class="times">${sl.map(([t, w]) => `<button class="slot" data-t="${t}" data-w="${w}" data-i="${i}"><b>${t}</b><span>${w}</span></button>`).join("")}</div></div>`;
            }).join("") + `<div class="muted">Finish your book to confirm appointment time.</div>`;
      h =
        `<div class="kicker">Step 1 of 2</div><h2 style="font-size:28px">${S.when === "Earliest" ? "Pick a time" : S.when + " times"}</h2>
      <div class="muted" style="margin-top:-6px">${key === "Any" ? "Across all pet stylists" : "With " + esc(S.stylist) + " only"}</div>${availabilityContent}`;
    } else if (S.step === "details") {
      const p = S.picked;
      h = `<div class="banner"><div class="banner-row"><span class="dot" aria-hidden="true"></span><div class="banner-text">You are reserving <b>${p.time}, ${p.day}</b> with <b>${p.who}</b></div><button class="btn" data-go="times">Change</button></div></div>
      <div class="kicker">Step 2 of 2</div>
      <div style="font-size:15px;color:var(--color-neutral-800);margin-top:-6px">Your appointment will last about <b>${ABOUT[S.service]}</b> and costs <b>£${PRICE_GBP_PUBLIC[S.service]}</b>.</div>
      <h3 style="font-size:22px">Your details</h3>
       <div class="field"><label for="f-owner">Full name · automatically generated</label><input class="input" id="f-owner" value="${esc(S.owner)}" readonly aria-readonly="true"></div>
       <div class="grid2"><div class="field"><label for="f-mobile">Mobile · automatically generated</label><input class="input" id="f-mobile" type="tel" value="${esc(S.mobile)}" readonly aria-readonly="true"></div>
       <div class="field"><label for="f-email">Email · automatically generated</label><input class="input" id="f-email" type="email" value="${esc(S.email)}" readonly aria-readonly="true"></div></div>
      <h3 style="font-size:22px;margin-top:6px">Your pet</h3>
      <div class="grid2"><div class="field"><label for="f-pet">Pet's name</label><input class="input" id="f-pet" value="${esc(S.pet)}" data-f="pet"></div>
      <div class="field"><label id="l-breed">Breed</label><div class="pick"><button type="button" id="breedBtn" aria-haspopup="listbox" aria-expanded="${S.breedOpen}" aria-labelledby="l-breed breedBtn"><span style="flex:1">${esc(S.breed)}</span><span class="chev"><svg class="icon" style="width:14px;height:14px" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></button>
        <ul role="listbox" class="${S.breedOpen ? "on" : ""}" aria-labelledby="l-breed">${BREEDS.map(([n, z]) => `<li role="option" tabindex="0" data-breed="${esc(n)}" aria-selected="${n === S.breed}"><span class="sz" style="background:${SIZE_C[z]}">${z}</span><span style="flex:1">${esc(n)}</span>${n === S.breed ? '<span style="color:var(--color-accent-700);font-weight:700">✓</span>' : ""}</li>`).join("")}</ul></div></div></div>
      <div class="field"><label id="l-notes">Anything we should know?</label><div class="note-chips" role="group" aria-labelledby="l-notes">${NOTE_PRESETS.map((n) => `<button type="button" class="note-chip" data-note="${esc(n)}" aria-pressed="${S.notes.split(" · ").includes(n)}">${esc(n)}</button>`).join("")}</div></div>
      <div class="field"><label id="l-contact">Send me updates by</label><div class="contact-seg" role="radiogroup" aria-labelledby="l-contact">${Object.keys(CONTACT_ICONS).map((c) => `<button type="button" role="radio" aria-checked="${S.contact === c}" aria-label="${c === "Messages" ? "Text message" : c}" title="${c === "Messages" ? "Text message" : c}" data-contact="${c}"><svg class="icon" viewBox="0 0 24 24">${CONTACT_ICONS[c]}</svg></button>`).join("")}</div></div>
      <button class="btn btn-primary btn-block" style="min-height:56px;font-size:17px;margin-top:4px" id="confirm">Confirm booking</button>
      <button class="btn btn-ghost" style="align-self:center;font-size:14px;margin-top:-6px" data-go="reserved">Not sure yet? Reserve this slot at no extra cost</button>`;
    } else if (S.step === "checking") {
      h = `<div class="center" style="align-items:center;text-align:center"><div class="pulse"></div><h2 style="font-size:24px">Fluffing the towels for ${esc(S.pet || "your pet")}…</h2><p class="muted" style="margin:-8px 0 0">Securing your time…</p></div>`;
    } else if (S.step === "done") {
      const p = S.picked;
      h = `<div class="center"><div class="badge" style="background:var(--color-accent-2);color:var(--color-bg)"><svg class="icon" style="width:28px;height:28px" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h2 style="font-size:30px">${esc(S.pet || "Your pet")} is booked in</h2>
      <div class="summary"><div><span>When</span><b>${p.day}, ${p.time}</b></div><div><span>Service</span><b>${esc(S.service)}</b></div><div><span>Lasts about</span><b>${ABOUT[S.service]}</b></div><div><span>Pet stylist</span><b>${p.who}</b></div><div><span>Cost</span><b>£${PRICE_GBP_PUBLIC[S.service]}</b></div><div><span>Confirmation number</span><b style="font-family:ui-monospace,monospace;letter-spacing:.08em">${S.code}</b></div>${S.owner ? `<div><span>Booked by</span><b>${esc(S.owner)}</b></div>` : ""}${S.discounted ? `<div style="color:var(--color-accent-2-800)"><span style="color:inherit">Thank-you discount</span><b>−${CONFIG.goodwill}</b></div>` : ""}</div>
      <div class="done-actions"><a class="btn btn-outline" download="appointment-${S.code}.ics" href="${icsHref({ title: `${S.service} · ${S.pet || "Your pet"}`, date: p.date, start: p.time, minutes: MINUTES[S.service] || 60, code: S.code, who: p.who })}">Add to calendar (.ics)</a><button class="btn btn-outline" data-go="taps">Book another pet</button></div>
      <p class="muted" style="margin:0;font-size:14px">Want to see how the business handles your request? <a href="/demo" style="color:var(--color-accent-800);text-decoration:underline">See the demo →</a></p></div>`;
    } else if (S.step === "reserved") {
      const p = S.picked;
      h = `<div class="center"><div class="badge" style="background:var(--color-accent-2-200);color:var(--color-accent-2-800)"><svg class="icon" style="width:28px;height:28px" viewBox="0 0 24 24"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></div>
      <h2 style="font-size:28px">${p.time} is reserved for ${esc(S.pet || "your pet")}</h2>
      <div class="summary"><div><span>When</span><b>${p.day}, ${p.time}</b></div><div><span>Pet stylist</span><b>${p.who}</b></div><div><span>Cost to reserve</span><b>Nothing</b></div></div>
      <p class="muted" style="margin:0;font-size:15px">No one else can take this time. We'll text you a link to finish booking when you're ready.</p>
      <button class="btn btn-primary" data-go="details">Finish booking now</button><button class="btn btn-ghost" data-go="times">Choose another time</button></div>`;
    } else if (S.step === "clash") {
      const alts = clashAlts(S.picked, S.stylist === "Any available");
      h = `<div class="center" style="gap:14px"><div class="badge" style="background:var(--color-accent-200);color:var(--color-accent-800)"><svg class="icon" style="width:26px;height:26px" viewBox="0 0 24 24"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m14 14-4 4"/><path d="m10 14 4 4"/></svg></div>
      <h2 style="font-size:26px;text-wrap:balance">We're sorry, we couldn't confirm your booking</h2>
      <p style="margin:0;font-size:15px;color:var(--color-neutral-800)">Someone else booked that time just moments before you.</p>
      <h3 style="font-size:18px;margin-top:4px">The closest times we have</h3>
      ${alts.map((a) => `<div class="alt"><div><b>${a.time}</b><span>${dayShort(a.i)} · with ${a.who}</span></div><button class="btn btn-primary" data-alt="${a.time}|${a.who}|${a.i}">Book this time</button></div>`).join("")}
      <div class="note">As a thank-you for your patience, we've taken ${CONFIG.goodwill} off this booking.</div>
      <button class="btn btn-ghost" style="align-self:flex-start" data-go="times">See all available times</button></div>`;
    } else if (S.step === "expired") {
      h = `<div class="center"><h2 style="font-size:28px">Still there?</h2>
      <p style="margin:0;font-size:16px;color:var(--color-neutral-800)">We closed the booking form after ${CONFIG.inactivityMinutes} minutes without activity. Nothing was sent. Times go to whoever confirms first, so check yours is still free.</p>
      <button class="btn btn-primary" data-go="times">See available times</button></div>`;
    }
    b.innerHTML = h;
  }

  $("body").addEventListener("click", (e) => {
    const s = e.target.closest(".slot");
    if (s) {
      const i = +s.dataset.i;
      S.picked = { time: s.dataset.t, who: s.dataset.w, i, day: dayShort(i), date: isoDay(OPEN[i]) };
      return go("details");
    }
    const g = e.target.closest("[data-go]");
    if (g) {
      const to = g.dataset.go;
      if (to === "taps") {
        go("taps");
        openTaps();
      } else go(to);
      return;
    }
    if (e.target.closest("#breedBtn")) {
      S.breedOpen = !S.breedOpen;
      render();
      $("breedBtn").focus();
      return;
    }
    const li = e.target.closest("[data-breed]");
    if (li) {
      S.breed = li.dataset.breed;
      S.breedOpen = false;
      render();
      $("breedBtn").focus();
      return;
    }
    const note = e.target.closest("[data-note]");
    if (note) {
      S.notes = toggleNote(S.notes, note.dataset.note);
      note.setAttribute("aria-pressed", String(S.notes.split(" · ").includes(note.dataset.note)));
      return;
    }
    const ct = e.target.closest("[data-contact]");
    if (ct) {
      S.contact = ct.dataset.contact;
      $("body").querySelectorAll("[data-contact]").forEach((x) => x.setAttribute("aria-checked", String(x === ct)));
      return;
    }
    if (e.target.closest("#confirm")) {
      S.discounted = false;
      return confirm();
    }
    const a = e.target.closest("[data-alt]");
    if (a) {
      const [t, w, i] = a.dataset.alt.split("|");
      S.picked = { time: t, who: w, i: +i, day: dayShort(+i), date: isoDay(OPEN[+i]) };
      S.discounted = true;
      return confirm(true);
    }
  });
  $("body").addEventListener("keydown", (e) => {
    const li = e.target.closest("[data-breed]");
    if (li && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      li.click();
    }
  });
  $("body").addEventListener("input", (e) => {
    const k = e.target.dataset.f;
    if (k) S[k] = e.target.value;
  });

  async function confirm(isRebook) {
    if (!S.owner.trim() || !S.mobile.trim() || !S.email.trim() || !S.pet.trim()) {
      const first = $("body").querySelector("input[value='']");
      first?.focus();
      return;
    }
    const safe = validateDemoEditable({ petName: S.pet, notes: S.notes });
    if (!safe.ok) {
      availabilityError = safe.errors.petName || safe.errors.notes || "Please check the pet details.";
      go("details");
      return;
    }
    go("checking");
    if (CONFIG.simulateClash && !isRebook) return go("clash");
    // Public prototype only: no customer details or booking are sent or saved.
    S.code = hexCode();
    window.setTimeout(() => go("done"), 1100);
  }

  addEventListener(
    "resize",
    () => {
      if (S.step !== "taps") go(S.step);
      else {
        $("taps").classList.remove("hidden");
      }
    },
    { signal },
  );
  renderGroups();
  render();
}
