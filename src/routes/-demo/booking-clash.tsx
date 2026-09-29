import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./booking-clash.css";

/* Faithful port of the supplied Clash_Demo_4a.html (Coral & teal palette). The supplied design is canon. */

type Step = "taps" | "times" | "details" | "race";
type Out = "" | "checking" | "clash" | "done";
type Pick = { time: string; who: string; day: string; i: number };

const SLOTS: Record<string, [string, string][]> = {
  Any: [["09:15", "Maya"], ["09:45", "Tom"], ["10:30", "Priya"], ["11:00", "Sam"], ["13:30", "Maya"], ["14:15", "Priya"], ["15:00", "Tom"], ["16:00", "Sam"]],
  Maya: [["09:15", "Maya"], ["13:30", "Maya"], ["16:15", "Maya"]],
  Tom: [["09:45", "Tom"], ["15:00", "Tom"]],
  Priya: [["10:30", "Priya"], ["14:15", "Priya"], ["16:30", "Priya"]],
  Sam: [["11:00", "Sam"], ["16:00", "Sam"]],
};
const OPEN = (() => { const o: Date[] = []; const d = new Date(2026, 8, 25); while (o.length < 18) { if (d.getDay() !== 0) o.push(new Date(d)); d.setDate(d.getDate() + 1); } return o; })();
const WORKS: Record<string, number[]> = { Maya: [1, 2, 4, 5, 6], Tom: [1, 2, 3, 5, 6], Priya: [2, 3, 4, 5, 6], Sam: [1, 2, 3, 4] };
const WDN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ABOUT: Record<string, string> = { "Full style": "2 hours", "Bath & tidy": "1 hour", "Nail trim": "30 minutes", "Puppy intro": "45 minutes" };
const GOODWILL = "£5";

function daySlots(key: string, when: string, i: number) {
  const d = OPEN[i]!, wd = d.getDay();
  let sl = (SLOTS[key] ?? []).filter(([t, w], j) => WORKS[w]!.includes(wd) && (wd !== 6 || t < "14:00") && (d.getDate() + j) % 4 !== 0);
  if (when === "Morning") sl = sl.filter((x) => x[0] < "12:00");
  if (when === "Afternoon") sl = sl.filter((x) => x[0] >= "12:00");
  return sl.slice(0, 8);
}
const toMin = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);
const dayShort = (i: number) => { const d = OPEN[i]!; return (i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "") + WDN[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; };
function clashAlts(p: Pick, any: boolean) {
  const i = p.i ?? 0, t = p.time, w = p.who, out: { time: string; di: number; who: string }[] = [];
  const ok = (who: string, di: number, time: string) => { const wd = OPEN[di]!.getDay(); return WORKS[who]!.includes(wd) && (wd !== 6 || time < "14:00"); };
  if (any) { const o = Object.keys(WORKS).find((x) => x !== w && ok(x, i, t)); if (o) out.push({ time: t, di: i, who: o }); }
  const own = [...new Set([...(SLOTS[w] ?? []).map((x) => x[0]), ...SLOTS["Any"]!.filter((x) => x[1] === w).map((x) => x[0])])]
    .filter((x) => x !== t && ok(w, i, x)).sort((a, b) => Math.abs(toMin(a) - toMin(t)) - Math.abs(toMin(b) - toMin(t)));
  if (own[0]) out.push({ time: own[0], di: i, who: w });
  for (let di = i + 1; di < OPEN.length; di++) { if (ok(w, di, t)) { out.push({ time: t, di, who: w }); break; } }
  return out.slice(0, 3);
}

const INIT: Pick = { time: "13:30", who: "Maya", day: dayShort(0), i: 0 };
const chipStyle = (on: boolean): CSSProperties => ({ all: "unset", cursor: "pointer", boxSizing: "border-box", minHeight: 44, display: "flex", alignItems: "center", padding: "0 15px", borderRadius: 999, fontSize: 14, fontWeight: 600, background: on ? "var(--color-bg)" : "color-mix(in srgb, var(--color-bg) 18%, transparent)", color: on ? "var(--color-accent-800)" : "var(--color-bg)" });
const Svg = ({ size, children }: { size: number; children: ReactNode }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;

export function BookingClash({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("taps");
  const [svc, setSvc] = useState("Full style");
  const [sty, setSty] = useState("Any available");
  const [when, setWhen] = useState("Afternoon");
  const [p, setP] = useState<Pick>(INIT);
  const [a, setA] = useState<Out>("");
  const [b, setB] = useState<Out>("");
  const [aFinal, setAFinal] = useState<Omit<Pick, "i"> | null>(null);
  const [n, setN] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [stageHeight, setStageHeight] = useState(0);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useLayoutEffect(() => {
    const f = () => {
      if (!wrap.current || !stage.current) return;
      const nextFit = Math.min(1, wrap.current.clientWidth / stage.current.offsetWidth);
      setFit(nextFit);
      setStageHeight(stage.current.offsetHeight * nextFit);
    };
    f();
    const ro = new ResizeObserver(f);
    if (wrap.current) ro.observe(wrap.current);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const reset = () => { timers.current.forEach(window.clearTimeout); timers.current = []; setStep("taps"); setA(""); setB(""); setAFinal(null); setN(null); setP(INIT); };

  const key = sty === "Any available" ? "Any" : sty;
  const groups = OPEN.slice(0, 2).map((d, i) => { const sl = daySlots(key, when, i); return { label: (i === 0 ? "Today, " : "Tomorrow, ") + WDN[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()], count: sl.length ? sl.length + " free" : "Fully booked", times: sl.map(([t, w]) => ({ t, w, i, on: p.time === t && p.who === w && p.i === i })) }; });
  const race = () => { if (step !== "details") return; setStep("race"); setA("checking"); setB("checking"); setN(4); later(() => { setB("done"); setN(5); }, 900); later(() => { setA("clash"); setN(6); }, 1900); };
  const altsA = clashAlts(p, sty === "Any available").map((x) => ({ time: x.time, who: x.who, day: dayShort(x.di) }));
  const pickAlt = (x: { time: string; who: string; day: string }) => { setA("checking"); setAFinal(x); setN(7); later(() => { setA("done"); setN(8); }, 1200); };
  const fa = aFinal ?? p;
  const dn = n ?? (step === "taps" ? 1 : step === "times" ? 2 : 3);
  const LG: [string, string, "n" | "a" | "b"][] = [
    ["10:41:52", "Jo and Chris both open the booking page.", "n"],
    ["10:42:01", "Both see the same free times. Nothing is held.", "n"],
    ["10:42:05", `Both choose ${p.time}, ${p.day} with ${p.who}.`, "n"],
    ["10:42:07.3", `Chris confirms. ${p.time} is committed to Pepper.`, "b"],
    ["10:42:07.8", "Jo confirms 0.5s later. The slot is already taken.", "a"],
    ["10:42:08", "Jo sees the clash screen with three live alternatives. Nothing was booked for Jo, so no success screen was shown.", "a"],
    ["10:42:15", `Jo taps "Book this time": ${fa.time} with ${fa.who}.`, "a"],
    ["10:42:16", `Luna is booked with ${GOODWILL} off. Logged as a service failure, not against Jo.`, "b"],
  ];
  const lc = { n: ["var(--color-neutral-100)", "var(--color-text)"], a: ["var(--color-accent-100)", "var(--color-accent-900)"], b: ["var(--color-accent-2-100)", "var(--color-accent-2-900)"] } as const;
  const log = LG.slice(0, Math.max(dn, step === "race" ? 4 : dn));

  const common = { step, svc, sty, when, p, groups, setSvc, setSty, setWhen, goTimes: () => setStep("times"), back: () => { if (step === "times") setStep("taps"); else if (step === "details") setStep("times"); }, pickTime: (t: string, w: string, i: number) => { setP({ time: t, who: w, day: dayShort(i), i }); setStep("details"); }, confirm: race };

  return (
    <section className="clash4a" aria-label="Booking clash demonstration">
      <div ref={wrap} className="clash4a-wrap" style={{ height: stageHeight || undefined }}>
        <div ref={stage} className="clash4a-stage" style={{ transform: `translateX(-50%) scale(${fit})` }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, padding: "0 8px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Clash demo</div>
              <h2 style={{ fontSize: 34, margin: "6px 0 0", lineHeight: 1.05 }}>Two clients, one slot</h2>
              <div style={{ fontSize: 16, color: "var(--color-neutral-800)", marginTop: 8 }}>Your choices mirror on both phones. Confirm and Chris gets there first.</div>
            </div>
            <button type="button" className="c4-btn c4-ghost" style={{ fontSize: 15, minHeight: 44, padding: "0 18px" }} onClick={onClose}>Dashboard</button>
            <button type="button" className="c4-btn c4-ghost" style={{ fontSize: 15, minHeight: 44, padding: "0 18px" }} onClick={reset}>Replay</button>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            <Phone {...common} interactive order={0} label="You" initial="J" tint="var(--color-accent-200)" owner="Jo Adeyemi" pet="Luna" breed="Cockapoo" phone="07700 900418" out={a} alts={altsA} onAlt={pickAlt} final={fa} disc={!!aFinal} />
            <div style={{ order: 1, width: 300, alignSelf: "center", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, color: "var(--color-accent-700)" }}>What the system sees</div>
              {log.map(([t, text, k]) => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--color-neutral-700)", minWidth: 64, paddingTop: 3 }}>{t}</span>
                  <div style={{ flex: 1, background: lc[k][0], borderRadius: 20, padding: "10px 14px", fontSize: 14, lineHeight: 1.4, color: lc[k][1] }}>{text}</div>
                </div>
              ))}
            </div>
            <Phone {...common} order={2} label="Other customer" initial="C" tint="var(--color-accent-2-300)" owner="Chris Moreno" pet="Pepper" breed="Poodle" phone="07700 900731" out={b} alts={[]} onAlt={() => {}} final={p} disc={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

type PhoneProps = {
  interactive?: boolean; order: number; label: string; initial: string; tint: string; owner: string; pet: string; breed: string; phone: string;
  out: Out; alts: { time: string; who: string; day: string }[]; onAlt: (x: { time: string; who: string; day: string }) => void; final: { time: string; who: string; day: string }; disc: boolean;
  step: Step; svc: string; sty: string; when: string; p: Pick; groups: { label: string; count: string; times: { t: string; w: string; i: number; on: boolean }[] }[];
  setSvc: (v: string) => void; setSty: (v: string) => void; setWhen: (v: string) => void; goTimes: () => void; back: () => void; pickTime: (t: string, w: string, i: number) => void; confirm: () => void;
};

function Phone(x: PhoneProps) {
  const racing = x.step === "race";
  const status = !racing ? "Choosing" : x.out === "checking" ? "Securing…" : x.out === "clash" ? "Clash" : "Booked";
  const statusBg = !racing ? "var(--color-neutral-200)" : x.out === "done" ? "var(--color-accent-2-200)" : x.out === "clash" ? "var(--color-accent-200)" : "var(--color-accent-100)";
  const statusFg = !racing ? "var(--color-neutral-800)" : x.out === "done" ? "var(--color-accent-2-900)" : x.out === "clash" ? "var(--color-accent-900)" : "var(--color-accent-800)";
  const act = <T extends unknown[]>(fn: (...a: T) => void) => (...a: T) => { if (x.interactive) fn(...a); };
  const chips = (vals: string[], cur: string, set: (v: string) => void) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{vals.map((l) => <button key={l} type="button" style={chipStyle(l === cur)} onClick={act(() => set(l))}>{l}</button>)}</div>
  );
  const row = (k: string, v: string) => <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-neutral-700)" }}>{k}</span><b>{v}</b></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, order: x.order }} data-readonly={!x.interactive || undefined} className="c4-client">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
        <span style={{ width: 34, height: 34, borderRadius: "50%", background: x.tint, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>{x.initial}</span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 16 }}>{x.label}</div><div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{x.owner} · {x.pet}</div></div>
        <span className="c4-tag" style={{ whiteSpace: "nowrap", background: statusBg, color: statusFg }}>{status}</span>
      </div>
      <div style={{ width: 390, height: 844, background: "var(--color-text)", borderRadius: 52, padding: 12, boxSizing: "border-box", boxShadow: "var(--shadow-md)", overflow: "hidden", position: "relative" }}>
        <div style={{ background: "var(--color-accent-2-100)", borderRadius: 42, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          {x.step === "taps" && <>
            <div style={{ padding: "54px 26px 0", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-2-700)", display: "grid", placeItems: "center" }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-accent-2-100)" }} /></div>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--color-accent-2-900)" }}>Whisker &amp; Co.</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 52, lineHeight: 0.96, margin: "40px 0 0", color: "var(--color-accent-2-900)" }}>Good<br />dog days.</h1>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ background: "var(--color-accent)", color: "var(--color-bg)", borderRadius: "34px 34px 0 0", padding: "26px 24px 30px", display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: 26, margin: 0, lineHeight: 1.05, color: "var(--color-bg)" }}>Book a visit</h2>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Service</div>{chips(["Full style", "Bath & tidy", "Nail trim", "Puppy intro"], x.svc, x.setSvc)}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Pet stylist</div>{chips(["Any available", "Maya", "Tom", "Priya", "Sam"], x.sty, x.setSty)}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>When</div>{chips(["Earliest", "Morning", "Afternoon"], x.when, x.setWhen)}</div>
              <button type="button" className="c4-btn" style={{ minHeight: 56, fontSize: 17, background: "var(--color-bg)", color: "var(--color-accent-800)", marginTop: 4 }} onClick={act(x.goTimes)}>Show times</button>
            </div>
          </>}
          {x.step !== "taps" && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 48, bottom: 0, background: "var(--color-neutral-100)", borderRadius: "34px 34px 0 0", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px 4px" }}>
                <button type="button" aria-label="Back" className="c4-back" onClick={act(x.back)}><Svg size={20}><path d="m15 18-6-6 6-6" /></Svg></button>
                <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, color: "var(--color-neutral-800)" }}>{x.svc} · {x.sty}</div>
                <div style={{ width: 44 }} />
              </div>
              <div className="c4-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 22px 28px", display: "flex", flexDirection: "column" }}>
                {x.step === "times" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="c4-eyebrow">Step 1 of 2</div>
                    <h2 style={{ fontSize: 28, margin: "-6px 0 0", lineHeight: 1.1 }}>Pick a time</h2>
                    {x.groups.map((g) => (
                      <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 0" }}><span style={{ fontSize: 16, fontWeight: 700 }}>{g.label}</span><span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{g.count}</span></div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                          {g.times.map((s) => (
                            <button key={s.t + s.w} type="button" className="c4-slot" style={{ background: s.on ? "var(--color-accent-100)" : "var(--color-bg)", borderColor: s.on ? "var(--color-accent)" : "transparent" }} onClick={act(() => x.pickTime(s.t, s.w, s.i))}>
                              <span style={{ fontSize: 17, fontWeight: 700 }}>{s.t}</span><span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{s.w}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {x.step === "details" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--color-accent-100)", borderRadius: 24, padding: "12px 12px 12px 16px" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-accent-2)", flex: "none" }} />
                      <div style={{ flex: 1, fontSize: 15, lineHeight: 1.35, color: "var(--color-accent-800)" }}>You are reserving <b>{x.p.time}, {x.p.day}</b> with <b>{x.p.who}</b></div>
                    </div>
                    <div className="c4-eyebrow" style={{ marginTop: 4 }}>Step 2 of 2</div>
                    <div style={{ fontSize: 15, color: "var(--color-neutral-800)" }}>Your appointment will last about <b>{ABOUT[x.svc]}</b>.</div>
                    {[["Full name", x.owner], ["Mobile", x.phone], ["Pet's name", x.pet]].map(([l, v]) => (
                      <div key={l} className="c4-field"><label>{l}</label><input className="c4-input" style={{ minHeight: 48, fontSize: 16 }} value={v} readOnly /></div>
                    ))}
                    <div className="c4-field"><label>Breed</label>
                      <div style={{ boxSizing: "border-box", minHeight: 48, padding: "0 12px 0 18px", borderRadius: 999, background: "var(--color-bg)", display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
                        <span style={{ flex: 1 }}>{x.breed}</span>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-100)", color: "var(--color-accent-800)", display: "grid", placeItems: "center" }}><Svg size={14}><path d="m6 9 6 6 6-6" /></Svg></span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <button type="button" className="c4-btn c4-primary" style={{ minHeight: 56, fontSize: 17 }} onClick={act(x.confirm)}>Confirm booking</button>
                  </div>
                )}
                {racing && x.out === "checking" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, textAlign: "center" }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-accent-2-200)", display: "grid", placeItems: "center" }}><div className="c4-pulse" /></div>
                    <h2 style={{ fontSize: 24, margin: 0 }}>Fluffing the towels for {x.pet}…</h2>
                    <p style={{ margin: "-8px 0 0", fontSize: 15, color: "var(--color-neutral-700)" }}>Securing your time…</p>
                  </div>
                )}
                {racing && x.out === "clash" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--color-accent-200)", display: "grid", placeItems: "center", color: "var(--color-accent-800)" }}>
                      <Svg size={26}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m14 14-4 4" /><path d="m10 14 4 4" /></Svg>
                    </div>
                    <h2 style={{ fontSize: 24, margin: 0, lineHeight: 1.1, textWrap: "balance" }}>We're sorry, we couldn't confirm your booking</h2>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--color-neutral-800)" }}>Someone else booked that time just moments before you.</p>
                    <h3 style={{ fontSize: 18, margin: "4px 0 0" }}>The closest times we have</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {x.alts.map((al) => (
                        <div key={al.time + al.day + al.who} style={{ background: "var(--color-bg)", borderRadius: 28, padding: "10px 10px 10px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 1 }}><span style={{ fontSize: 17, fontWeight: 700 }}>{al.time}</span><span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{al.day} · with {al.who}</span></div>
                          <button type="button" className="c4-btn c4-primary" style={{ fontSize: 14, padding: "0 18px", minHeight: 44 }} onClick={act(() => x.onAlt(al))}>Book this time</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "var(--color-accent-2-100)", borderRadius: 22, padding: "12px 16px", fontSize: 14, lineHeight: 1.45, color: "var(--color-accent-2-900)" }}>As a thank-you for your patience, we've taken {GOODWILL} off this booking.</div>
                  </div>
                )}
                {racing && x.out === "done" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-accent-2)", display: "grid", placeItems: "center", color: "var(--color-bg)" }}><Svg size={28}><path d="M20 6 9 17l-5-5" /></Svg></div>
                    <h2 style={{ fontSize: 30, margin: 0, lineHeight: 1.1 }}>{x.pet} is booked in</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--color-bg)", borderRadius: 24, padding: "18px 20px", fontSize: 15 }}>
                      {row("When", `${x.final.day}, ${x.final.time}`)}{row("Service", x.svc)}{row("Lasts about", ABOUT[x.svc] ?? "")}{row("Pet stylist", x.final.who)}{row("Booked by", x.owner)}
                      {x.disc && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-accent-2-800)" }}><span>Thank-you discount</span><b>−{GOODWILL}</b></div>}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-neutral-700)", lineHeight: 1.5 }}>A confirmation and calendar invite are on their way to your email and mobile.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
