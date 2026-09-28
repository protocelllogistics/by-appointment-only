import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { CalendarDays, Mail, MessageCircle, Phone, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sizeDemoAppointment } from "@/lib/demo.functions";
import { validateDemoEditable } from "@/lib/demo-validation";
import { createFictionalContact } from "@/lib/fictional-contact";
import { DEMO_ROTA, STYLISTS, addDays, freeStarts, isoWeekday, toMin, toTime, type Busy } from "@/lib/demo-rota";
import "./-demo/demo.css";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live workflow demo — By Appointment Only" },
      { name: "description", content: "Interactive customer and staff appointment workflow prototype." },
      { property: "og:title", content: "Live workflow demo — By Appointment Only" },
      { property: "og:description", content: "Interactive customer and staff appointment workflow prototype." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoRoute,
});

const TODAY = "2026-09-25",
  NOW = toMin("10:15"),
  DAYS = [TODAY, addDays(TODAY, 1), addDays(TODAY, 3)];
const SERVICES = ["Full style", "Bath & tidy", "Nail trim", "Puppy intro"];
const BREEDS = ["Cockapoo", "Poodle", "Spaniel", "Shih Tzu", "Siberian Husky", "Labrador"];
const CUSTOMER = createFictionalContact();
type Status = "Confirmed" | "Cancelled" | "No-show";
type Size = { minutes: number; index: 1 | 2 | 3 | 4 | 5; tellClient: number };
type Appt = {
  id: number;
  code: string;
  customer: string;
  mobile: string;
  email: string;
  pet: string;
  breed: string;
  service: string;
  stylist: string;
  date: string;
  start: number;
  minutes: number;
  index: Size["index"];
  tell: number;
  status: Status;
  source: "Online" | "Phone" | "Google Calendar";
  calendarMinutes?: number;
  mine: boolean;
  notes: string;
  flags?: string[];
};
type Msg = {
  id: number;
  channel: "WhatsApp" | "SMS" | "Email";
  text: string;
  apptId?: number;
  actions?: ("reschedule" | "cancel" | "rebook")[];
};
type PhoneView = "home" | "app" | "browser" | "times" | "details" | "checking" | "done" | "reschedule" | "cancel";
type AdminPanel = { kind: "appointment"; id: number } | { kind: "new"; fromCall?: boolean } | null;

const seed: Appt[] = [
  {
    id: 1,
    code: "",
    customer: "Chris Moreno",
    mobile: "",
    email: "",
    pet: "Pepper",
    breed: "Poodle",
    service: "Full style",
    stylist: "Maya",
    date: TODAY,
    start: toMin("09:00"),
    minutes: 135,
    index: 3,
    tell: 120,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Keep the face round. Sensitive around front paws.",
    flags: ["Sensitive around front paws"],
  },
  {
    id: 2,
    code: "",
    customer: "Amir Haddad",
    mobile: "",
    email: "",
    pet: "Bella",
    breed: "Spaniel",
    service: "Bath & tidy",
    stylist: "Tom",
    date: TODAY,
    start: toMin("11:00"),
    minutes: 75,
    index: 4,
    tell: 60,
    status: "Confirmed",
    source: "Phone",
    mine: false,
    notes: "Customer will collect after lunch.",
    flags: ["Customer prefers phone"],
  },
  {
    id: 3,
    code: "",
    customer: "Lena Brooks",
    mobile: "",
    email: "",
    pet: "Otis",
    breed: "Cockapoo",
    service: "Full style",
    stylist: "Priya",
    date: TODAY,
    start: toMin("14:00"),
    minutes: 120,
    index: 5,
    tell: 120,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Usual short body, longer ears.",
  },
  {
    id: 4,
    code: "",
    customer: "Hana Sato",
    mobile: "",
    email: "",
    pet: "Miso",
    breed: "Shih Tzu",
    service: "Full style",
    stylist: "Maya",
    date: DAYS[1]!,
    start: toMin("10:30"),
    minutes: 135,
    index: 3,
    tell: 120,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Daily note: coat needed extra preparation last visit.",
    flags: ["Sensitive to blow dryer"],
  },
];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d: string) => {
  const x = new Date(`${d}T12:00:00Z`),
    s = `${WD[x.getUTCDay()]} ${x.getUTCDate()} ${MO[x.getUTCMonth()]}`;
  return d === TODAY ? `Today, ${s}` : d === DAYS[1] ? `Tomorrow, ${s}` : s;
};
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m} min`);
const about = (m: number) => (m >= 60 ? `about ${m / 60 === 1 ? "1 hour" : `${m / 60} hours`}` : `about ${m} minutes`);
const newCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");

function DemoRoute() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="dm-mobile-loading">Opening demo…</div>;
  const phone =
    /Android|iPhone|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width:767px)").matches;
  return phone ? <MobileDemo /> : <DemoPage />;
}
function MobileDemo() {
  const [stay, setStay] = useState(false);
  if (stay)
    return (
      <div className="dm-mobile-terminal">
        <div className="dm-mobile-banner">
          <b>Stylist terminal</b>
          <span>The full two-screen demo works best in a desktop browser.</span>
        </div>
        <iframe src="/dashboard/mobile.html" title="Stylist terminal" />
      </div>
    );
  return (
    <main className="dm-mobile-choice">
      <div>
        <span>Interactive demo</span>
        <h1>Best viewed on a full browser</h1>
        <p>
          The complete demonstration places the staff diary beside the customer’s phone. On this phone you can continue
          into the simplified stylist terminal.
        </p>
        <Button onClick={() => setStay(true)}>Open stylist terminal</Button>
      </div>
    </main>
  );
}

function DemoPage() {
  const size = useServerFn(sizeDemoAppointment);
  const [appts, setAppts] = useState(seed),
    [messages, setMessages] = useState<Msg[]>([]),
    [log, setLog] = useState(["10:15 · Diary opened. Calendar is up to date."]),
    [day, setDay] = useState(TODAY),
    [adminTab, setAdminTab] = useState("Today"),
    [panel, setPanel] = useState<AdminPanel>(null);
  const [phoneView, setPhoneView] = useState<PhoneView>("home"),
    [phoneApp, setPhoneApp] = useState<"browser" | "messages" | "email" | "phone">("browser"),
    [phoneAppt, setPhoneAppt] = useState<number>(),
    [sizes, setSizes] = useState<Record<string, Size> | null>(null),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [codeInput, setCodeInput] = useState("");
  const [pending, setPending] = useState<{ date: string; option: { stylist: string; start: number; size: Size } }>();
  const [form, setForm] = useState({
    petName: "Luna",
    breed: "Cockapoo",
    service: "Full style",
    stylist: "Any available",
    notes: "",
  });
  const send = (next: Omit<Msg, "id">[]) =>
    setMessages((all) => [...all, ...next.map((x, i) => ({ ...x, id: Date.now() + i }))]);
  const addLog = (text: string) => setLog((all) => [`${toTime(NOW)} · ${text}`, ...all]);
  const live = appts.filter((a) => a.status === "Confirmed"),
    current = phoneAppt ? appts.find((a) => a.id === phoneAppt) : undefined;
  const busyFor = (except?: number): Busy[] =>
    live
      .filter((a) => a.id !== except)
      .map((a) => ({ stylist: a.stylist, date: a.date, start: a.start, end: a.start + a.minutes }));
  const slotsFor = (map: Record<string, Size>, except?: number) =>
    DAYS.map((date) => {
      const opts: { stylist: string; start: number; size: Size }[] = [];
      for (const stylist of STYLISTS) {
        if (form.stylist !== "Any available" && form.stylist !== stylist) continue;
        const z = map[stylist];
        if (!z) continue;
        freeStarts(stylist, date, z.minutes, busyFor(except), 15, date === TODAY ? NOW + 30 : 0)
          .filter((t) => t % 45 === 0)
          .slice(0, 3)
          .forEach((start) => opts.push({ stylist, start, size: z }));
      }
      return { date, opts: opts.sort((a, b) => a.start - b.start).slice(0, 6) };
    });
  async function prepareTimes(reschedule?: Appt) {
    const valid = validateDemoEditable({
      petName: reschedule?.pet ?? form.petName,
      notes: reschedule?.notes ?? form.notes,
    });
    if (!valid.ok) {
      setErrors(valid.errors);
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const z = await size({
        data: { service: reschedule?.service ?? form.service, breed: reschedule?.breed ?? form.breed, newClient: true },
      });
      setSizes(z as Record<string, Size>);
      setPhoneView(reschedule ? "reschedule" : "times");
    } finally {
      setBusy(false);
    }
  }
  async function prepareAdminTimes() {
    const valid = validateDemoEditable({ petName: form.petName, notes: form.notes });
    if (!valid.ok) {
      setErrors(valid.errors);
      return;
    }
    const z = await size({ data: { service: form.service, breed: form.breed, newClient: true } });
    setSizes(z as Record<string, Size>);
  }
  function createBooking(
    o: { stylist: string; start: number; size: Size },
    date: string,
    source: Appt["source"] = "Online",
  ) {
    const id = Date.now(),
      code = newCode(),
      a: Appt = {
        id,
        code,
        customer: CUSTOMER.name,
        mobile: CUSTOMER.mobile,
        email: CUSTOMER.email,
        pet: form.petName.trim(),
        breed: form.breed,
        service: form.service,
        stylist: o.stylist,
        date,
        start: o.start,
        minutes: o.size.minutes,
        index: o.size.index,
        tell: o.size.tellClient,
        status: "Confirmed",
        source,
        mine: true,
        notes: form.notes.trim() || "No extra notes.",
        flags:
          source === "Phone"
            ? ["Prefers phone calls", "Sensitive to blow dryer"]
            : form.notes.toLowerCase().includes("blow dryer")
              ? ["Sensitive to blow dryer"]
              : [],
      };
    setAppts((all) => [...all, a]);
    setDay(date);
    setPhoneAppt(id);
    addLog(
      `${source} booking added: ${a.pet}, ${a.service} with ${a.stylist}. ${dur(a.minutes)} protected in the diary.`,
    );
    send([
      {
        channel: "WhatsApp",
        apptId: id,
        text: `${a.pet} is booked for ${dayLabel(date)} at ${toTime(o.start)} with ${a.stylist}. Confirmation: ${code}`,
        actions: ["reschedule", "cancel"],
      },
      {
        channel: "Email",
        apptId: id,
        text: `Booking confirmed\n${a.pet} · ${a.service}\n${dayLabel(date)}, ${toTime(o.start)}\nConfirmation: ${code}`,
      },
    ]);
    if (source === "Phone") {
      setPanel({ kind: "appointment", id });
      return;
    }
    setPhoneView("checking");
    window.setTimeout(() => setPhoneView("done"), 1100);
  }
  function changeAppointment(a: Appt, o: { stylist: string; start: number; size: Size }, date: string) {
    setAppts((all) =>
      all.map((x) =>
        x.id === a.id
          ? {
              ...x,
              date,
              start: o.start,
              stylist: o.stylist,
              minutes: o.size.minutes,
              index: o.size.index,
              tell: o.size.tellClient,
            }
          : x,
      ),
    );
    addLog(`${a.pet} moved to ${dayLabel(date)} at ${toTime(o.start)}. Calendar entry updated.`);
    send([
      {
        channel: "WhatsApp",
        apptId: a.id,
        text: `${a.pet}'s new time is ${dayLabel(date)} at ${toTime(o.start)} with ${o.stylist}.`,
        actions: ["reschedule", "cancel"],
      },
    ]);
    setDay(date);
    setPhoneView("done");
  }
  function cancel(a: Appt, staff = false) {
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "Cancelled" } : x)));
    addLog(
      `${staff ? "Staff" : "Customer"} cancelled ${a.pet}. ${dur(a.minutes)} released and calendar entry removed.`,
    );
    send([
      { channel: "WhatsApp", apptId: a.id, text: `${a.pet}'s ${a.service} has been cancelled.`, actions: ["rebook"] },
    ]);
    setPanel(null);
  }
  function noShow(a: Appt) {
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "No-show" } : x)));
    addLog(`No-show confirmed for ${a.pet}. Appointment released and follow-up queued.`);
    setPanel(null);
  }
  function staffReschedule(a: Appt) {
    const start = a.start + 30;
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, start } : x)));
    addLog(`${a.pet} moved to ${toTime(start)} by staff. Calendar and customer message updated.`);
    send([
      {
        channel: "WhatsApp",
        apptId: a.id,
        text: `${a.pet}'s appointment has moved to ${toTime(start)} with ${a.stylist}.`,
        actions: ["reschedule", "cancel"],
      },
    ]);
  }
  async function simulateCalendar() {
    const z = (await size({ data: { service: "Full style", breed: "Siberian Husky", newClient: false } })) as Record<
      string,
      Size
    >;
    for (const date of [DAYS[1]!, DAYS[2]!])
      for (const stylist of STYLISTS) {
        const s = z[stylist],
          start = s && freeStarts(stylist, date, s.minutes, busyFor())[0];
        if (s && start != null) {
          const a: Appt = {
            id: Date.now(),
            code: "",
            customer: "Dev Patel",
            mobile: "",
            email: "",
            pet: "Nova",
            breed: "Siberian Husky",
            service: "Full style",
            stylist,
            date,
            start,
            minutes: s.minutes,
            index: s.index,
            tell: s.tellClient,
            status: "Confirmed",
            source: "Google Calendar",
            calendarMinutes: 60,
            mine: false,
            notes: "Calendar note: first full style with the salon.",
          };
          setAppts((all) => [...all, a]);
          setDay(date);
          addLog(
            `Calendar booking interpreted and resized from 60 min to ${dur(s.minutes)} before protecting the next appointment.`,
          );
          return;
        }
      }
  }
  const recs = useMemo(
    () => appts.filter((a) => a.status === "Confirmed" && (a.index <= 2 || Boolean(a.calendarMinutes))),
    [appts],
  );
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i),
    pct = (m: number) => `${((m - 540) / 540) * 100}%`;
  const selectAction = (act: "reschedule" | "cancel" | "rebook", id?: number) => {
    const a = appts.find((x) => x.id === id);
    setPhoneApp("browser");
    if (act === "rebook" || !a) {
      setPhoneView("browser");
      return;
    }
    setPhoneAppt(a.id);
    setCodeInput("");
    setPhoneView(act === "cancel" ? "cancel" : "reschedule");
    setSizes(null);
  };
  const reset = () => {
    setAppts(seed);
    setMessages([]);
    setLog(["10:15 · Demo reset."]);
    setDay(TODAY);
    setPanel(null);
    setPhoneView("home");
    setPhoneAppt(undefined);
    setSizes(null);
    setForm({ petName: "Luna", breed: "Cockapoo", service: "Full style", stylist: "Any available", notes: "" });
  };
  return (
    <div className="dm">
      <header className="dm-top">
        <div>
          <h1>By Appointment Only</h1>
          <small>Public workflow prototype · nothing is saved</small>
        </div>
        <span className="sp" />
        <span className="dm-pill">Fri 25 Sep · 10:15</span>
        <Button className="dm-pill" onClick={simulateCalendar}>
          <CalendarDays size={15} />
          Add calendar booking
        </Button>
        <Button className="dm-pill" onClick={reset}>
          <RotateCcw size={15} />
          Reset
        </Button>
      </header>
      <div className="dm-stage">
        <section className="dm-admin" aria-label="Staff dashboard">
          <nav className="dm-admin-tabs">
            {["Today", "Bookings", "Customers & pets", "Staff rota"].map((t) => (
              <Button key={t} data-on={adminTab === t} onClick={() => setAdminTab(t)}>
                {t}
              </Button>
            ))}
            <span />
            <Button className="dm-new" onClick={() => setPanel({ kind: "new" })}>
              + New booking
            </Button>
          </nav>
          {adminTab === "Customers & pets" ? (
            <SimplePanel
              title="Customers & pets"
              body="Open a customer to see their pets, upcoming visits and daily notes. This prototype follows the same appointment state without loading historical records."
            />
          ) : adminTab === "Staff rota" ? (
            <RotaPanel />
          ) : (
            <>
              <div className="dm-daybar">
                {DAYS.map((d) => (
                  <Button key={d} data-on={day === d} onClick={() => setDay(d)}>
                    {dayLabel(d)}
                  </Button>
                ))}
              </div>
              {recs.length > 0 && (
                <div className="dm-recs">
                  {recs.map((a) => (
                    <button key={a.id} onClick={() => setPanel({ kind: "appointment", id: a.id })}>
                      <b>{a.calendarMinutes ? "Calendar duration checked" : `Index ${a.index} · extra care`}</b>
                      <span>
                        {a.pet}: {dur(a.minutes)} protected. Open to see why.
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="dm-lanes">
                <div className="dm-hours" style={{ gridTemplateColumns: `repeat(${hours.length},1fr)` }}>
                  {hours.map((h) => (
                    <span key={h}>{h}:00</span>
                  ))}
                </div>
                {STYLISTS.map((stylist) => {
                  const sh = DEMO_ROTA[stylist]?.[isoWeekday(day)];
                  return (
                    <div className="dm-lane" key={stylist}>
                      <b>{stylist}</b>
                      <div className="dm-track">
                        {!sh ? (
                          <i className="dm-off" style={{ left: 0, right: 0 }} />
                        ) : (
                          <>
                            {<i className="dm-off" style={{ left: 0, width: pct(toMin(sh.start)) }} />}
                            <i className="dm-off" style={{ left: pct(toMin(sh.end)), right: 0 }} />
                            {sh.breakStart && (
                              <i
                                className="dm-off"
                                style={{
                                  left: pct(toMin(sh.breakStart)),
                                  width: `${((sh.breakMin ?? 0) / 540) * 100}%`,
                                }}
                              />
                            )}
                          </>
                        )}
                        {live
                          .filter((a) => a.date === day && a.stylist === stylist)
                          .map((a) => (
                            <button
                              key={a.id}
                              className="dm-block"
                              data-mine={a.mine}
                              data-cal={a.source === "Google Calendar"}
                              style={{ left: pct(a.start), width: `${(a.minutes / 540) * 100}%` }}
                              onClick={() => setPanel({ kind: "appointment", id: a.id })}
                            >
                              {a.calendarMinutes && (
                                <i className="raw" style={{ width: `${(a.calendarMinutes / a.minutes) * 100}%` }} />
                              )}
                              {toTime(a.start)} {a.pet}
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="dm-list">
                {appts
                  .filter((a) => a.date === day)
                  .sort((a, b) => a.start - b.start)
                  .map((a) => (
                    <button
                      className="dm-row"
                      key={a.id}
                      data-mine={a.mine}
                      onClick={() => setPanel({ kind: "appointment", id: a.id })}
                    >
                      <b>
                        {toTime(a.start)}–{toTime(a.start + a.minutes)}
                      </b>
                      <span>
                        <b>{a.pet}</b>
                        <small>
                          {a.breed} · {a.customer}
                        </small>
                      </span>
                      <span>
                        {a.service}
                        <small>{a.source}</small>
                      </span>
                      <span>
                        {a.stylist}
                        <small>{dur(a.minutes)} allocated</small>
                      </span>
                      <i>Index {a.index}</i>
                      <em data-s={a.status}>{a.status}</em>
                    </button>
                  ))}
              </div>
              <div className="dm-log">
                {log.map((x, i) => (
                  <div key={i}>{x}</div>
                ))}
              </div>
            </>
          )}
          {panel && (
            <AdminDrawer
              panel={panel}
              appts={appts}
              sizes={sizes}
              form={form}
              setForm={setForm}
              prepareTimes={prepareAdminTimes}
              slotsFor={slotsFor}
              setPanel={setPanel}
              cancel={cancel}
              noShow={noShow}
              reschedule={staffReschedule}
              createBooking={createBooking}
            />
          )}
        </section>
        <PhoneShell
          app={phoneApp}
          setApp={setPhoneApp}
          view={phoneView}
          setView={setPhoneView}
          messages={messages}
          form={form}
          setForm={setForm}
          errors={errors}
          busy={busy}
          sizes={sizes}
          slotsFor={slotsFor}
          createBooking={createBooking}
          current={current}
          prepareTimes={prepareTimes}
          selectAction={selectAction}
          codeInput={codeInput}
          setCodeInput={setCodeInput}
          changeAppointment={changeAppointment}
          cancel={cancel}
          pending={pending}
          setPending={setPending}
          onCall={() => {
            setPanel({ kind: "new", fromCall: true });
            setAdminTab("Bookings");
            addLog(`Incoming call from ${CUSTOMER.name}. Phone-booking recommendations opened for staff.`);
          }}
        />
      </div>
    </div>
  );
}

function SimplePanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="dm-simple">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
function RotaPanel() {
  return (
    <div className="dm-simple">
      <h2>Staff rota</h2>
      <div className="dm-rota">
        {STYLISTS.map((s) => (
          <div key={s}>
            <b>{s}</b>
            <span>
              {DEMO_ROTA[s]?.[5]?.start ?? "Off"}–{DEMO_ROTA[s]?.[5]?.end ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminDrawer({
  panel,
  appts,
  sizes,
  form,
  setForm,
  prepareTimes,
  slotsFor,
  setPanel,
  cancel,
  noShow,
  reschedule,
  createBooking,
}: {
  panel: AdminPanel;
  appts: Appt[];
  sizes: Record<string, Size> | null;
  form: any;
  setForm: (x: any) => void;
  prepareTimes: () => Promise<void>;
  slotsFor: (
    x: Record<string, Size>,
    id?: number,
  ) => { date: string; opts: { stylist: string; start: number; size: Size }[] }[];
  setPanel: (x: AdminPanel) => void;
  cancel: (a: Appt, staff?: boolean) => void;
  noShow: (a: Appt) => void;
  reschedule: (a: Appt) => void;
  createBooking: (o: { stylist: string; start: number; size: Size }, d: string, s?: Appt["source"]) => void;
}) {
  const a = panel?.kind === "appointment" ? appts.find((x) => x.id === panel.id) : undefined;
  return (
    <aside className="dm-drawer">
      <Button size="icon" variant="ghost" aria-label="Close details" onClick={() => setPanel(null)}>
        <X size={18} />
      </Button>
      {a ? (
        <>
          <span className="dm-kick">Appointment details</span>
          <h2>{a.pet}</h2>
          <p>
            {a.breed} · {a.customer}
          </p>
          <div className="dm-facts">
            <div>
              <span>When</span>
              <b>
                {dayLabel(a.date)}, {toTime(a.start)}
              </b>
            </div>
            <div>
              <span>Pet stylist</span>
              <b>{a.stylist}</b>
            </div>
            <div>
              <span>Source</span>
              <b>{a.source}</b>
            </div>
            <div>
              <span>Status</span>
              <b>{a.status}</b>
            </div>
          </div>
          <div className="dm-index">
            <span>Index {a.index}</span>
            <b>{dur(a.minutes)} allocated</b>
            <p>
              Historical data indicates an increase in standard time with an Index of +1. The customer is recommended “
              {about(a.tell)}”.
            </p>
            {a.flags?.length ? (
              <div className="dm-behaviour-flags">
                {a.flags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <h3>Appointment notes</h3>
          <p className="dm-note-card">{a.notes}</p>
          <div className="dm-actions">
            <Button disabled={a.status !== "Confirmed"} onClick={() => reschedule(a)}>
              Move 30 min later
            </Button>
            <Button disabled={a.status !== "Confirmed"} onClick={() => cancel(a, true)}>
              Cancel booking
            </Button>
            <Button disabled={a.status !== "Confirmed" || a.date !== TODAY} onClick={() => noShow(a)}>
              No-show
            </Button>
          </div>
        </>
      ) : (
        <StaffBooking
          fromCall={Boolean(panel?.kind === "new" && panel.fromCall)}
          form={form}
          setForm={setForm}
          sizes={sizes}
          prepareTimes={prepareTimes}
          slotsFor={slotsFor}
          createBooking={createBooking}
        />
      )}
    </aside>
  );
}
function StaffBooking({
  fromCall,
  form,
  setForm,
  sizes,
  prepareTimes,
  slotsFor,
  createBooking,
}: {
  fromCall: boolean;
  form: any;
  setForm: (x: any) => void;
  sizes: Record<string, Size> | null;
  prepareTimes: () => Promise<void>;
  slotsFor: (x: Record<string, Size>) => { date: string; opts: { stylist: string; start: number; size: Size }[] }[];
  createBooking: (o: { stylist: string; start: number; size: Size }, d: string, s?: Appt["source"]) => void;
}) {
  const [showCal, setShowCal] = useState(false);
  const [calDay, setCalDay] = useState<string | null>(null);
  const allSlots = sizes ? slotsFor(sizes) : [];
  const recommended = sizes
    ? allSlots
        .flatMap((group) => group.opts.map((option) => ({ date: group.date, option })))
        .sort((a, b) => (a.date + a.option.start).localeCompare(b.date + b.option.start))
        .slice(0, 4)
    : [];
  const allocation = recommended[0]?.option.size;
  const daysWithTimes = new Set(allSlots.map((g) => g.date));
  const calDaySlots = calDay ? (allSlots.find((g) => g.date === calDay)?.opts ?? []) : [];
  return (
    <>
      <span className="dm-kick">{fromCall ? "Incoming call" : "Bookings"}</span>
      <h2>New booking</h2>
      {fromCall && (
        <div className="dm-call-summary">
          <b>
            {CUSTOMER.name} is asking for {form.petName}’s {form.service.toLowerCase()}
          </b>
          <p>
            Prefers the earliest time with {form.stylist.toLowerCase()}. {form.breed};{" "}
            {form.notes.trim() || "known to be sensitive to the blow dryer"}.
          </p>
        </div>
      )}
      <div className="dm-fixed-contact">
        <b>{CUSTOMER.name}</b>
        <span>{CUSTOMER.mobile}</span>
        <span>{CUSTOMER.email}</span>
        <small>Automatically generated fictional contact</small>
      </div>
      <label className="dm-field">
        <span>Pet name</span>
        <input value={form.petName} maxLength={30} onChange={(e) => setForm({ ...form, petName: e.target.value })} />
      </label>
      <label className="dm-field">
        <span>Service</span>
        <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          {SERVICES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Breed</span>
        <select value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}>
          {BREEDS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Pet stylist</span>
        <select value={form.stylist} onChange={(e) => setForm({ ...form, stylist: e.target.value })}>
          {["Any available", ...STYLISTS].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Notes</span>
        <textarea value={form.notes} maxLength={300} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <Button className="dm-cta" onClick={() => prepareTimes()}>
        Show recommendations
      </Button>
      {allocation && (
        <div className="dm-admin-recommendation">
          <div className="dm-allocation">
            <div className="dm-allocation-head">
              <b>Allocated time</b>
              <span>Recommended {dur(allocation.minutes)} × (Index 2)</span>
            </div>
            <div className="dm-allocation-value">
              <strong>{dur(allocation.minutes)}</strong>
              <span>blocks the diary and the bay</span>
            </div>
            <div className="dm-customer-time">
              Tell the customer: <b>{about(allocation.tellClient)}</b>
            </div>
            <div className="dm-stylist-match" aria-label="Recommended pet stylist">
              <b>Best stylist: Maya</b>
              <span>{form.petName || "This pet"} is comfortable with Maya — booked with her the last 3 visits</span>
            </div>
            <div className="dm-behaviour-flags" aria-label="Customer preferences and pet handling notes">
              <span>Customer prefers phone</span>
              <span>Pet sensitive to blow dryer</span>
            </div>
          </div>
          <h3>Next times that fit {dur(allocation.minutes)}</h3>
          <div className="dm-admin-slots">
            {recommended.map(({ date, option }) => (
              <Button
                key={date + option.stylist + option.start}
                variant="ghost"
                onClick={() => createBooking(option, date, "Phone")}
              >
                <b>{toTime(option.start)}</b>
                <span>
                  {dayLabel(date).split(", ")[0]} · {option.stylist}
                </span>
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="dm-more-dates"
            onClick={() => {
              setShowCal(!showCal);
              setCalDay(null);
            }}
          >
            <CalendarDays size={17} />
            {showCal ? "Hide calendar" : "More dates"}
          </Button>
          {showCal && (
            <div className="dm-calendar">
              <div className="dm-cal-head">
                <b>September 2026</b>
              </div>
              <div className="dm-cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="dm-cal-dow">
                    {d}
                  </span>
                ))}
                <span className="dm-cal-blank" />
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const iso = `2026-09-${String(day).padStart(2, "0")}`;
                  const weekday = (day + 1) % 7; // Sep 1 2026 is a Tuesday
                  const isSunday = weekday === 0;
                  const hasTimes = daysWithTimes.has(iso);
                  const selectable = hasTimes && !isSunday;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!selectable}
                      data-on={calDay === iso}
                      className={isSunday ? "dm-cal-sun" : undefined}
                      onClick={() => setCalDay(iso)}
                    >
                      {day}
                      {hasTimes && !isSunday && <i />}
                    </button>
                  );
                })}
              </div>
              <small>Dots show days with times that fit. Sundays closed.</small>
              {calDay && calDaySlots.length > 0 && (
                <div className="dm-admin-slots">
                  {calDaySlots.map((option) => (
                    <Button
                      key={calDay + option.stylist + option.start}
                      variant="ghost"
                      onClick={() => createBooking(option, calDay, "Phone")}
                    >
                      <b>{toTime(option.start)}</b>
                      <span>
                        {dayLabel(calDay).split(", ")[0]} · {option.stylist}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          <small className="dm-hold-note">
            Nothing is held while you’re on the phone. The first confirmed booking, from any channel, gets the time.
          </small>
        </div>
      )}
    </>
  );
}

function PhoneShell({
  app,
  setApp,
  view,
  setView,
  messages,
  form,
  setForm,
  errors,
  busy,
  sizes,
  slotsFor,
  createBooking,
  current,
  prepareTimes,
  selectAction,
  codeInput,
  setCodeInput,
  changeAppointment,
  cancel,
  pending,
  setPending,
  onCall,
}: any) {
  const apps = [
    { id: "phone", label: "Phone", icon: Phone },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "email", label: "Email", icon: Mail },
    { id: "browser", label: "Book online", icon: CalendarDays },
  ];
  return (
    <aside className="dm-phone" aria-label="Customer phone">
      <div className="dm-screen">
        <div className="dm-status">
          <b>10:15</b>
          <span>5G ▮▮▮</span>
        </div>
        {view === "home" ? (
          <div className="dm-home">
            <div className="dm-home-date">Friday 25</div>
            <div className="dm-appgrid">
              {apps.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setApp(id);
                    setView(id === "browser" ? "browser" : "app");
                  }}
                >
                  <i data-app={id}>
                    <Icon />
                  </i>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {view !== "home" && (
          <PhoneHeader
            title={
              app === "browser"
                ? `${form.service} · ${form.stylist}`
                : app === "messages"
                  ? "Messages"
                  : app === "email"
                    ? "Mail"
                    : "Phone"
            }
            onBack={() => setView("home")}
          />
        )}
        <div className="dm-phone-body">
          {view === "app" && app === "phone" ? (
            <PhoneApp onCall={onCall} />
          ) : view === "app" && app === "messages" ? (
            <MessageApp list={messages.filter((m: Msg) => m.channel !== "Email")} onAction={selectAction} />
          ) : view === "app" && app === "email" ? (
            <MessageApp list={messages.filter((m: Msg) => m.channel === "Email")} onAction={selectAction} email />
          ) : view === "browser" ? (
            <BookingStart form={form} setForm={setForm} errors={errors} busy={busy} prepareTimes={prepareTimes} />
          ) : view === "times" || view === "reschedule" ? (
            <Times
              view={view}
              sizes={sizes}
              slotsFor={slotsFor}
              current={current}
              createBooking={createBooking}
              changeAppointment={changeAppointment}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              prepareTimes={prepareTimes}
              setView={setView}
              setPending={setPending}
            />
          ) : view === "details" && pending ? (
            <BookingReview form={form} pending={pending} createBooking={createBooking} />
          ) : view === "checking" ? (
            <div className="dm-checking">
              <div className="dm-pulse" />
              <h2>Fluffing the towels for {form.petName}…</h2>
              <p>Securing your time…</p>
            </div>
          ) : view === "done" && current ? (
            <Done a={current} setView={setView} />
          ) : view === "cancel" && current ? (
            <Cancel a={current} codeInput={codeInput} setCodeInput={setCodeInput} cancel={cancel} setView={setView} />
          ) : null}
        </div>
        {view !== "home" && <button className="dm-homebar" aria-label="Home" onClick={() => setView("home")} />}
      </div>
    </aside>
  );
}
function PhoneHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="dm-phone-head">
      <button onClick={onBack} aria-label="Back">
        ‹
      </button>
      <b>{title}</b>
      <span />
    </div>
  );
}
function PhoneApp({ onCall }: { onCall: () => void }) {
  return (
    <div className="dm-native">
      <span>By Appointment Only</span>
      <h2>020 7946 0123</h2>
      <p>Hypothetical demo number</p>
      <button className="dm-call" onClick={onCall}>
        <Phone />
        Call
      </button>
      <small>Calling opens a matching phone-booking recommendation for staff.</small>
    </div>
  );
}
function MessageApp({
  list,
  onAction,
  email = false,
}: {
  list: Msg[];
  onAction: (a: any, id?: number) => void;
  email?: boolean;
}) {
  return (
    <div className={email ? "dm-mail" : "dm-msgs"}>
      {list.length ? (
        list.map((m) => (
          <article key={m.id}>
            <small>{email ? "By Appointment Only · Booking update" : `${m.channel} · By Appointment Only`}</small>
            <p>{m.text}</p>
            {m.actions && (
              <div>
                {m.actions.map((a) => (
                  <button key={a} onClick={() => onAction(a, m.apptId)}>
                    {a === "reschedule" ? "Change time" : a === "cancel" ? "Cancel" : "Book again"}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))
      ) : (
        <div className="dm-empty">
          {email ? "Booking emails appear here." : "WhatsApp and SMS updates appear here."}
        </div>
      )}
    </div>
  );
}
function BookingStart({ form, setForm, errors, busy, prepareTimes }: any) {
  return (
    <div className="dm-book">
      <span className="dm-kick">By Appointment Only</span>
      <h2>Book a visit</h2>
      <div className="dm-fixed-contact">
        <b>{CUSTOMER.name}</b>
        <span>{CUSTOMER.mobile}</span>
        <span>{CUSTOMER.email}</span>
        <small>Automatically generated fictional contact — no personal details collected</small>
      </div>
      <label className="dm-field">
        <span>Pet’s name</span>
        <input value={form.petName} maxLength={30} onChange={(e) => setForm({ ...form, petName: e.target.value })} />
        {errors.petName && <em>{errors.petName}</em>}
      </label>
      <label className="dm-field">
        <span>Breed</span>
        <select value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}>
          {BREEDS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Service</span>
        <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          {SERVICES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Pet stylist</span>
        <select value={form.stylist} onChange={(e) => setForm({ ...form, stylist: e.target.value })}>
          {["Any available", ...STYLISTS].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="dm-field">
        <span>Anything we should know?</span>
        <textarea value={form.notes} maxLength={300} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        {errors.notes && <em>{errors.notes}</em>}
      </label>
      <button className="dm-cta" disabled={busy} onClick={() => prepareTimes()}>
        {busy ? "Checking…" : "Show times"}
      </button>
    </div>
  );
}
function Times({
  view,
  sizes,
  slotsFor,
  current,
  changeAppointment,
  codeInput,
  setCodeInput,
  prepareTimes,
  setView,
  setPending,
}: any) {
  if (view === "reschedule" && !sizes)
    return (
      <div className="dm-book">
        <span className="dm-kick">Change appointment</span>
        <h2>Confirm it’s you</h2>
        <label className="dm-field">
          <span>Confirmation code</span>
          <input value={codeInput} maxLength={6} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} />
        </label>
        <button
          className="dm-cta"
          onClick={() => {
            if (current && codeInput === current.code) prepareTimes(current);
          }}
        >
          Show new times
        </button>
      </div>
    );
  return (
    <div className="dm-book">
      <span className="dm-kick">Step 1 of 2</span>
      <h2>Pick a time</h2>
      {sizes &&
        slotsFor(sizes, current?.id).map((g: any) => (
          <section className="dm-day" key={g.date}>
            <h3>
              {dayLabel(g.date)} <small>{g.opts.length} free</small>
            </h3>
            <div>
              {g.opts.map((o: any) => (
                <button
                  key={o.stylist + o.start}
                  onClick={() => {
                    if (view === "reschedule" && current) changeAppointment(current, o, g.date);
                    else {
                      setPending({ date: g.date, option: o });
                      setView("details");
                    }
                  }}
                >
                  <b>{toTime(o.start)}</b>
                  <span>{o.stylist}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
function BookingReview({ form, pending, createBooking }: any) {
  return (
    <div className="dm-book">
      <span className="dm-kick">Step 2 of 2</span>
      <h2>Check your visit</h2>
      <div className="dm-facts">
        <div>
          <span>Pet</span>
          <b>{form.petName}</b>
        </div>
        <div>
          <span>When</span>
          <b>
            {dayLabel(pending.date)}, {toTime(pending.option.start)}
          </b>
        </div>
        <div>
          <span>Service</span>
          <b>{form.service}</b>
        </div>
        <div>
          <span>Pet stylist</span>
          <b>{pending.option.stylist}</b>
        </div>
        <div>
          <span>Lasts</span>
          <b>{about(pending.option.size.tellClient)}</b>
        </div>
      </div>
      <p className="dm-note-card">Demo only. Nothing will be sent to or saved in the backend.</p>
      <button className="dm-cta" onClick={() => createBooking(pending.option, pending.date)}>
        Confirm booking
      </button>
    </div>
  );
}
function Done({ a, setView }: { a: Appt; setView: (v: PhoneView) => void }) {
  return (
    <div className="dm-done">
      <i>✓</i>
      <h2>{a.pet} is booked in</h2>
      <div className="dm-facts">
        <div>
          <span>When</span>
          <b>
            {dayLabel(a.date)}, {toTime(a.start)}
          </b>
        </div>
        <div>
          <span>Service</span>
          <b>{a.service}</b>
        </div>
        <div>
          <span>Lasts</span>
          <b>{about(a.tell)}</b>
        </div>
        <div>
          <span>Pet stylist</span>
          <b>{a.stylist}</b>
        </div>
      </div>
      <p>Your confirmation is in Messages and Mail.</p>
      <button className="dm-cta" onClick={() => setView("home")}>
        Done
      </button>
    </div>
  );
}
function Cancel({ a, codeInput, setCodeInput, cancel, setView }: any) {
  return (
    <div className="dm-book">
      <h2>Cancel {a.pet}’s visit?</h2>
      <p>
        {dayLabel(a.date)} at {toTime(a.start)}
      </p>
      <label className="dm-field">
        <span>Confirmation code</span>
        <input value={codeInput} maxLength={6} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} />
      </label>
      <button
        className="dm-cta"
        onClick={() => {
          if (codeInput === a.code) {
            cancel(a);
            setView("home");
          }
        }}
      >
        Cancel booking
      </button>
    </div>
  );
}
