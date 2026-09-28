import { Link, createFileRoute, useHydrated } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, LogOut, CalendarDays, CalendarPlus, Globe, Mail, MessageCircle, Phone, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Handheld } from "./-dashboard/handheld";
import { usePhoneViewport } from "@/lib/use-phone-viewport";
import { sizeDemoAppointment } from "@/lib/demo.functions";
import { validateDemoEditable } from "@/lib/demo-validation";
import { createFictionalContact } from "@/lib/fictional-contact";
import { DEMO_ROTA, STYLISTS, addDays, freeStarts, isoWeekday, toMin, toTime, type Busy } from "@/lib/demo-rota";
import {
  LATE_FEE_GBP,
  NO_SHOW_FEE_GBP,
  PRICE_GBP,
  allocate,
  clampIndex,
  offsetLabel,
  type Index,
} from "@/lib/demo-allocation";
import { ACTIVE } from "./-demo/types";
import type { CallLog } from "./-demo/types";
import type { Appt, Channel, Checkout, LinkAction, Msg, Size } from "./-demo/types";
import {
  BrowserBar,
  CalendarApp,
  CheckoutApp,
  ACTION_LABEL,
  DialerApp,
  MailApp,
  MessagesApp,
  SHOP_PHONE,
} from "./-demo/customer-apps";
import "./-demo/demo.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NOTE_PRESETS, PET_NAMES, hexCode, icsHref, toggleNote } from "@/lib/demo-presets";

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
type PhoneApp = "browser" | "messages" | "email" | "phone" | "calendar";
type PhoneView =
  | "home"
  | "app"
  | "browser"
  | "times"
  | "details"
  | "checking"
  | "done"
  | "reschedule"
  | "cancel"
  | "checkout";
type AdminPanel = { kind: "appointment"; id: number } | { kind: "new"; fromCall?: boolean } | null;
type Automation = "confirm" | "tomorrow" | "today" | "2h" | "late" | "latefee" | "noshow" | "advance";
const LATE_GRACE = 15,
  NO_SHOW_AFTER = 25,
  LATE_ROTATION = [8, 14, 22, 30];
// Demo pacing (real ms): a quiet intro, then a generous window for the visitor to act as the customer.
const INTRO_MS = 12000,
  OVERRUN_BUFFER = 20,
  STILL_GOING_LEAD = 10,
  SIM_MIN_MS = 1500,
  ENGAGE_WINDOW_MS = 30000;
const isActive = (a: Appt) => ACTIVE.includes(a.status);

// Booked days ago: its confirmation is already in the thread and already read.
function pastConfirmation(): Msg {
  const a = seed.find((x) => x.id === MY_SEED_ID)!;
  return {
    id: 1,
    channel: "Messages",
    from: "shop",
    time: "Tue 09:12",
    apptId: a.id,
    subject: `Booking confirmed · ${a.pet}`,
    text: `${a.pet} is booked for Fri 25 Sep at ${toTime(a.start)} with ${a.stylist} — ${a.service}, ${about(a.tell)}.\nConfirmation: ${a.code}`,
    actions: ["ics", "pay-advance", "reschedule", "cancel"],
  };
}
function mk(
  a: Omit<Appt, "standard" | "minutes" | "tell" | "code" | "mobile" | "email" | "index"> & { index: Index },
): Appt {
  const z = allocate(a.service, a.index);
  return { code: "", mobile: "", email: "", ...a, standard: z.standard, minutes: z.minutes, tell: z.tell };
}
const MY_SEED_ID = 5;
type RecoveredTask = { id: number; time: string; minutes: number; stylist: string; kind: "Task" | "Walk-in"; text: string };
const seed: Appt[] = [
  mk({
    id: 1,
    customer: "Chris Moreno",
    pet: "Pepper",
    breed: "Poodle",
    service: "Full style",
    stylist: "Maya",
    date: TODAY,
    start: toMin("09:00"),
    index: 3,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Keep the face round. Sensitive around front paws.",
    flags: ["Sensitive around front paws"],
  }),
  mk({
    id: 2,
    customer: "Amir Haddad",
    pet: "Bella",
    breed: "Spaniel",
    service: "Bath & tidy",
    stylist: "Tom",
    date: TODAY,
    start: toMin("11:30"),
    index: 4,
    status: "Confirmed",
    source: "Phone",
    mine: false,
    notes: "Customer will collect after lunch.",
    flags: ["Customer prefers phone"],
  }),
  mk({
    id: 3,
    customer: "Lena Brooks",
    pet: "Otis",
    breed: "Cockapoo",
    service: "Full style",
    stylist: "Priya",
    date: TODAY,
    start: toMin("14:00"),
    index: 5,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Usual short body, longer ears.",
  }),
  mk({
    id: 4,
    customer: "Hana Sato",
    pet: "Miso",
    breed: "Shih Tzu",
    service: "Full style",
    stylist: "Maya",
    date: DAYS[1]!,
    start: toMin("10:30"),
    index: 2,
    status: "Confirmed",
    source: "Online",
    mine: false,
    notes: "Daily note: coat needed extra preparation last visit.",
    flags: ["Sensitive to blow dryer"],
  }),
  {
    ...mk({
      id: MY_SEED_ID,
      customer: CUSTOMER.name,
      pet: "Biscuit",
      breed: "Labrador",
      service: "Bath & tidy",
      stylist: "Tom",
      date: TODAY,
      start: toMin("10:00"),
      index: 4,
      status: "Confirmed",
      source: "Online",
      mine: true,
      notes: "Booked last week online.",
    }),
    code: "B5C4E7",
    mobile: CUSTOMER.mobile,
    email: CUSTOMER.email,
    inCalendar: true,
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
const about = (m: number) => {
  const h = Math.floor(m / 60),
    r = m % 60;
  if (!h) return `about ${r} minutes`;
  return `about ${h} hour${h > 1 ? "s" : ""}${r ? ` ${r} minutes` : ""}`;
};
const signed = (m: number) => (m === 0 ? "±0 min" : `${m > 0 ? "+" : "−"}${dur(Math.abs(m))}`);
const newCode = hexCode;

export const AUTOMATIONS: { kind: Automation; title: string; when: string }[] = [
  { kind: "tomorrow", title: "Appointment tomorrow", when: "Day before, 17:00" },
  { kind: "today", title: "Today reminder", when: "Morning of the visit, 07:30" },
  { kind: "2h", title: "In 2 hours we expect you", when: "2 hours before start" },
  { kind: "late", title: "Running late — give us a call", when: "5 minutes after start, not checked in" },
  { kind: "latefee", title: "Late arrival fee", when: `Arrival more than ${LATE_GRACE} min late` },
  { kind: "noshow", title: "You didn’t show up (no-show fee)", when: `${NO_SHOW_AFTER} minutes after start, not checked in` },
  { kind: "advance", title: "Pay in advance for fast check-out", when: "With confirmation and reminders" },
];

function DemoRoute() {
  const hydrated = useHydrated();
  const phone = usePhoneViewport();
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (!phone) setOpened(true);
  }, [phone]);
  if (!hydrated) return <div className="dm-mobile-loading">Opening demo…</div>;
  return phone && !opened ? <MobileDemo onOpen={() => setOpened(true)} /> : <DemoPage mobile={phone} />;
}
function MobileDemo({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="dm-mobile-choice">
      <div>
        <span>Interactive demo</span>
        <h1>Best viewed on a full browser</h1>
        <p>
          The complete demonstration places the staff diary beside the customer’s phone. On this phone you can switch
          between the stylist’s Hand-Held App and the customer’s phone.
        </p>
        <Button onClick={onOpen}>Open Hand-Held App</Button>
      </div>
    </main>
  );
}

const emptyForm = {
  petName: "Luna",
  breed: "Cockapoo",
  service: "Full style",
  stylist: "Any available",
  notes: "",
  contact: "Messages" as Channel | "Phone",
};
const deliver = (c: Channel | "Phone"): Channel => (c === "Email" ? "Email" : "Messages");

function DemoPage({ mobile = false }: { mobile?: boolean }) {
  const [mTab, setMTab] = useState<"app" | "phone">("app");
  const size = useServerFn(sizeDemoAppointment);
  const [appts, setAppts] = useState(seed),
    [messages, setMessages] = useState<Msg[]>(() => [pastConfirmation()]),
    [guide, setGuide] = useState<{ title: string; body: string; time: string }>(),
    [clock, setClock] = useState(NOW),
    [log, setLog] = useState(["10:15 · Diary opened. Calendar is up to date."]),
    [day, setDay] = useState(TODAY),
    [adminTab, setAdminTab] = useState("Today"),
    [panel, setPanel] = useState<AdminPanel>(null);
  const [phoneView, setPhoneView] = useState<PhoneView>("home"),
    [phoneApp, setPhoneApp] = useState<PhoneApp>("browser"),
    [phoneAppt, setPhoneAppt] = useState<number>(),
    [rawSizes, setRawSizes] = useState<Record<string, Size> | null>(null),
    [shift, setShift] = useState(0),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [codeInput, setCodeInput] = useState(""),
    [checkout, setCheckout] = useState<Checkout>(),
    [unread, setUnread] = useState<Record<Channel, number>>({ Messages: 0, Email: 0 }),
    [notif, setNotif] = useState<Msg>(),
    [calls, setCalls] = useState<CallLog[]>([]),
    [runId, setRunId] = useState(0),
    [tasks, setTasks] = useState<RecoveredTask[]>([]);
  const scenarioTurn = useRef(0);
  // Late-arrival window: set when the calendar nudges the customer; cleared once they respond.
  const awaiting = useRef<{ id: number; timer: number } | null>(null);
  const [pending, setPending] = useState<{ date: string; option: { stylist: string; start: number; size: Size } }>();
  const [form, setForm] = useState(emptyForm);
  const [prepay, setPrepay] = useState(false);
  const prefer = useRef<Channel>("Messages");
  prefer.current = deliver(form.contact);
  const byCall = useRef(false);
  byCall.current = form.contact === "Phone";
  const notifTimer = useRef<number | undefined>(undefined);
  const apptsRef = useRef(appts);
  apptsRef.current = appts;

  const current = phoneAppt ? appts.find((a) => a.id === phoneAppt) : undefined;
  const sizingService = phoneView === "reschedule" && current ? current.service : form.service;
  const sizes = useMemo(() => {
    if (!rawSizes) return null;
    return Object.fromEntries(
      Object.entries(rawSizes).map(([s, z]) => {
        const x = allocate(sizingService, z.index + shift);
        return [s, { minutes: x.minutes, index: x.index, tellClient: x.tell }];
      }),
    ) as Record<string, Size>;
  }, [rawSizes, shift, sizingService]);

  const phoneViewRef = useRef(phoneView);
  phoneViewRef.current = phoneView;
  const queued = useRef<Omit<Msg, "id">[]>([]);
  useEffect(() => {
    if (phoneView !== "home" || !queued.current.length) return;
    const t = window.setTimeout(() => {
      if (phoneViewRef.current !== "home") return;
      const q = queued.current;
      queued.current = [];
      deliverNow(q);
    }, 2500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneView, messages.length]);
  // Shop messages only arrive while the phone rests on its home screen.
  const send = (next: Omit<Msg, "id">[]) => {
    if (next.some((m) => m.from === "shop") && phoneViewRef.current !== "home") {
      queued.current.push(...next);
      return;
    }
    deliverNow(next);
  };
  const deliverNow = (next: Omit<Msg, "id">[]) => {
    const stamped = next.map((x, i) => ({ ...x, id: Date.now() + Math.random() + i }));
    setMessages((all) => [...all, ...stamped]);
    const fromShop = stamped.filter((m) => m.from === "shop");
    if (fromShop.length) {
      setUnread((u) => {
        const n = { ...u };
        fromShop.forEach((m) => (n[m.channel] = 1));
        return n;
      });
      setNotif(fromShop[fromShop.length - 1]);
      window.clearTimeout(notifTimer.current);
      notifTimer.current = window.setTimeout(() => setNotif(undefined), 3500);
    }
  };
  const notify = (m: Omit<Msg, "id" | "channel" | "from">, channel?: Channel) => {
    if (!channel && byCall.current) return placeCall(m);
    send([{ ...m, channel: channel ?? prefer.current, from: "shop" }]);
  };
  // Customers who prefer phone get a real conversation, not a transaction:
  // staff call, and the system's flags for that pet are spoken on the call.
  function placeCall(m: Omit<Msg, "id" | "channel" | "from">) {
    const a = apptsRef.current.find((x) => x.id === m.apptId);
    const first = CUSTOMER.name.split(" ")[0];
    const links = (m.actions ?? []).filter((x) => x !== "call" && x !== "reschedule" && x !== "cancel" && x !== "rebook");
    const subj = m.subject ?? "Call";
    const lines: CallLog["lines"] = [
      { who: "shop", text: `Hi ${first}, it's ${a?.stylist ?? "the front desk"} from By Appointment Only — have you got a minute?` },
      { who: "me", text: "Yes, of course." },
      { who: "shop", text: m.text.split("\n")[0]! },
    ];
    if (a?.flags?.length)
      lines.push({
        who: "shop",
        text: `Just so you know, we've noted ${a.pet} is ${a.flags.map((f) => f.toLowerCase()).join(" and ")}, so we've set aside a bit of extra time and ${a.stylist} is aware.`,
      });
    lines.push({
      who: "me",
      text: /fee|missed|cancellation/i.test(subj) ? "Ah, sorry about that — thanks for letting me know." : /late/i.test(subj) ? "Sorry, we're nearly there!" : "Lovely, thank you.",
    });
    lines.push({
      who: "shop",
      text: links.length ? `No problem at all. I'll text you the ${links.map((l) => ACTION_LABEL[l].toLowerCase()).join(" and ")} link now.` : "Perfect — see you then!",
    });
    const call = { id: Date.now() + Math.random(), time: m.time, subject: subj, lines };
    setCalls((all) => [...all, call]);
    setNotif({ id: call.id, channel: "Messages", from: "shop", time: m.time, subject: subj, text: `Call · ${subj}`, call: true });
    window.clearTimeout(notifTimer.current);
    notifTimer.current = window.setTimeout(() => setNotif(undefined), 3500);
    addLog(`${a?.stylist ?? "Staff"} called ${CUSTOMER.name} (prefers phone): “${subj}”${a?.flags?.length ? ", pet flags mentioned" : ""}.`, m.time);
    if (links.length)
      send([{ channel: "Messages", from: "shop", time: m.time, ...(m.apptId != null ? { apptId: m.apptId } : {}), subject: subj, text: `As mentioned on the phone, here are your links.`, actions: links }]);
  }
  const addLog = (text: string, time = toTime(NOW)) => setLog((all) => [`${time} · ${text}`, ...all]);
  const live = appts.filter(isActive);
  const shown = appts.filter((a) => isActive(a) || a.status === "Done" || a.status === "Checked out");
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

  function automate(kind: Automation, a: Appt, time = toTime(NOW)) {
    const when = `${dayLabel(a.date)} at ${toTime(a.start)}`;
    const price = PRICE_GBP[a.service] ?? 40;
    const msgs: Record<Automation, { subject: string; text: string; actions: LinkAction[] }> = {
      confirm: {
        subject: `Booking confirmed · ${a.pet}`,
        text: `${a.pet} is booked for ${when} with ${a.stylist} — ${a.service}, ${about(a.tell)}.\nConfirmation: ${a.code}\nAdd it to your calendar, or pay £${price} now for fast check-out.`,
        actions: ["ics", "pay-advance", "reschedule", "cancel"],
      },
      tomorrow: {
        subject: `Reminder: ${a.pet}'s appointment is tomorrow`,
        text: `Reminder: ${a.pet}'s ${a.service} is tomorrow at ${toTime(a.start)} with ${a.stylist}. Please allow ${about(a.tell)}.`,
        actions: ["ics", "pay-advance", "reschedule", "cancel"],
      },
      today: {
        subject: `Today: ${a.pet} at ${toTime(a.start)}`,
        text: `Good morning! ${a.pet}'s ${a.service} is today at ${toTime(a.start)} with ${a.stylist}.`,
        actions: ["pay-advance", "reschedule"],
      },
      "2h": {
        subject: `In 2 hours we expect you`,
        text: `In 2 hours we expect you and ${a.pet} at ${toTime(a.start)}. See you soon!`,
        actions: ["call", "reschedule"],
      },
      late: {
        subject: `Late show reminder · ${a.pet}`,
        text: `Running late? ${a.pet} was due at ${toTime(a.start)}. Give us a call on ${SHOP_PHONE} — we hold your slot for ${NO_SHOW_AFTER} minutes. The first ${LATE_GRACE} minutes are included; after that a £${LATE_FEE_GBP} late fee applies.`,
        actions: ["call"],
      },
      latefee: {
        subject: `Late arrival fee · ${a.pet}`,
        text: `Thanks for letting ${a.pet} join us. You arrived more than ${LATE_GRACE} minutes late, so a £${LATE_FEE_GBP} late fee applies. Pay now to keep check-out quick.`,
        actions: ["pay-late"],
      },
      noshow: {
        subject: `You missed ${a.pet}'s appointment`,
        text: `You didn't show up to ${a.pet}'s ${toTime(a.start)} appointment, so the slot has been released. A £${NO_SHOW_FEE_GBP} no-show fee applies under our no-show policy.`,
        actions: ["pay-noshow", "rebook"],
      },
      advance: {
        subject: `Pay in advance · ${a.pet}`,
        text: `Skip the queue at collection: pay £${price} now for ${a.pet}'s ${a.service} and just pick up.`,
        actions: ["pay-advance"],
      },
    };
    const m = msgs[kind];
    notify({ ...m, time, apptId: a.id });
    if (kind === "noshow") {
      setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "No-show" } : x)));
      addLog(`No-show confirmed for ${a.pet}. ${dur(a.minutes)} released; no-show fee link sent by ${prefer.current}.`, time);
    } else if (kind !== "confirm") {
      addLog(`Automation “${m.subject}” sent to ${a.customer} by ${prefer.current}.`, time);
    }
  }

  // Real-time automations: a quiet intro, the day's single reminder, then the
  // customer's own calendar nudges them and the demo waits for them to respond.
  useEffect(() => {
    const me = seed.find((a) => a.id === MY_SEED_ID)!;
    const mine = () => {
      const a = apptsRef.current.find((x) => x.id === me.id);
      return a && a.status === "Confirmed" && !a.lateBy ? a : undefined;
    };
    const reminder: [Automation, string] =
      me.start - 120 <= toMin("07:30") + 60 ? ["2h", toTime(me.start - 120)] : ["today", "07:30"];
    const timers = [
      window.setTimeout(() => {
        const a = mine();
        if (a) automate(reminder[0], a, reminder[1]);
      }, INTRO_MS),
    ];
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      awaiting.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  useEffect(() => {
    setClock(NOW);
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setClock((c) => Math.min(c + 1, toMin("18:00"))), SIM_MIN_MS);
    }, INTRO_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [runId]);
  // Customer responded during the late window: no fee, arrives inside the included 15 minutes.
  function customerEngaged(how: string) {
    const w = awaiting.current;
    if (!w) return;
    window.clearTimeout(w.timer);
    awaiting.current = null;
    setGuide(undefined);
    const a = apptsRef.current.find((x) => x.id === w.id);
    if (!a) return;
    addLog(`${a.customer} ${how} to say they're running late — slot held, stylist told.`, toTime(a.start + 3));
    window.setTimeout(() => {
      const b = apptsRef.current.find((x) => x.id === w.id);
      if (b && b.status === "Confirmed" && !b.lateBy) simulateLate(b, 12);
    }, 4000);
  }

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
      setRawSizes(z as Record<string, Size>);
      setShift(0);
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
    setRawSizes(z as Record<string, Size>);
    setShift(0);
  }
  function createBooking(
    o: { stylist: string; start: number; size: Size },
    date: string,
    source: Appt["source"] = "Online",
  ) {
    const id = Date.now(),
      z = allocate(form.service, o.size.index),
      a: Appt = {
        id,
        code: newCode(),
        customer: CUSTOMER.name,
        mobile: CUSTOMER.mobile,
        email: CUSTOMER.email,
        pet: form.petName.trim(),
        breed: form.breed,
        service: form.service,
        stylist: o.stylist,
        date,
        start: o.start,
        standard: z.standard,
        minutes: z.minutes,
        index: z.index,
        tell: z.tell,
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
      `${source} booking added: ${a.pet}, ${a.service} with ${a.stylist}. ${dur(a.minutes)} protected (Index ${a.index}); customer told ${about(a.tell)}.`,
    );
    // Delay the confirmation a few simulated seconds so it doesn't read as instant.
    window.setTimeout(() => automate("confirm", a), 3500);
    if (source === "Phone") {
      setPanel({ kind: "appointment", id });
      return;
    }
    setPhoneView("checking");
    if (prepay && source === "Online") {
      window.setTimeout(() => {
        setCheckout({ kind: "pay-advance", apptId: id, amount: PRICE_GBP[a.service] ?? 40, label: `${a.service} — paid in advance`, thenDone: true });
        setPhoneView("checkout");
      }, 1100);
      return;
    }
    window.setTimeout(() => setPhoneView("done"), 1100);
  }
  function changeAppointment(a: Appt, o: { stylist: string; start: number; size: Size }, date: string) {
    const z = allocate(a.service, o.size.index);
    const lead = (Date.parse(`${a.date}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 60000 + a.start - NOW;
    if (lead < 1440) {
      addLog(`${a.pet} changed with under 24h notice → £${NO_SHOW_FEE_GBP} no-show fee applied automatically.`);
      window.setTimeout(
        () =>
          notify({
            subject: `Late change · ${a.pet}`,
            time: toTime(NOW),
            apptId: a.id,
            text: `${a.pet}'s visit was changed less than 24 hours before the start, so the £${NO_SHOW_FEE_GBP} no-show fee applies.`,
            actions: ["pay-noshow"],
          }),
        2500,
      );
    }
    const moved = { ...a, date, start: o.start, stylist: o.stylist, minutes: z.minutes, index: z.index, tell: z.tell };
    setAppts((all) => all.map((x) => (x.id === a.id ? moved : x)));
    addLog(`${a.pet} moved to ${dayLabel(date)} at ${toTime(o.start)}. Calendar entry updated.`);
    notify({
      subject: `New time for ${a.pet}`,
      time: toTime(NOW),
      apptId: a.id,
      text: `${a.pet}'s new time is ${dayLabel(date)} at ${toTime(o.start)} with ${o.stylist}. Update your calendar with the new event.`,
      actions: ["ics", "reschedule", "cancel"],
    });
    setDay(date);
    setPhoneView("done");
  }
  function cancel(a: Appt, staff = false) {
    const lead = (Date.parse(`${a.date}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 60000 + a.start - NOW;
    if (!staff && lead < 1440) {
      addLog(`${a.pet} cancelled with ${dur(Math.max(0, Math.round(lead)))} notice (under 24h) → £${NO_SHOW_FEE_GBP} no-show fee applies automatically.`);
      window.setTimeout(
        () =>
          notify({
            subject: `Late cancellation · ${a.pet}`,
            time: toTime(NOW),
            apptId: a.id,
            text: `${a.pet}'s visit was cancelled less than 24 hours before the start, so the £${NO_SHOW_FEE_GBP} no-show fee applies.`,
            actions: ["pay-noshow", "rebook"],
          }),
        2500,
      );
    }
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "Cancelled" } : x)));
    addLog(
      `${staff ? "Staff" : "Customer"} cancelled ${a.pet}. ${dur(a.minutes)} released and calendar entry removed.`,
    );
    notify({
      subject: `Cancelled · ${a.pet}`,
      time: toTime(NOW),
      apptId: a.id,
      text: `${a.pet}'s ${a.service} has been cancelled.`,
      actions: ["rebook"],
    });
    setPanel(null);
  }
  function noShow(a: Appt) {
    simulateNoShow(a);
    setPanel(null);
  }
  const addTasks = (list: Omit<RecoveredTask, "id">[]) =>
    setTasks((all) => [...list.map((t, i) => ({ ...t, id: Date.now() + i + Math.random() })), ...all]);
  // Next scenario target: rotate through today's confirmed, non-walk-in appointments.
  function nextTarget(skip: (a: Appt) => boolean) {
    const pool = apptsRef.current
      .filter((a) => a.date === TODAY && a.status === "Confirmed" && a.source !== "Walk-in" && !skip(a))
      .sort((a, b) => a.start - b.start);
    if (!pool.length) return undefined;
    return pool[scenarioTurn.current++ % pool.length];
  }
  function simulateLate(a: Appt, lateBy = LATE_ROTATION[scenarioTurn.current % LATE_ROTATION.length]!) {
    // Not checked in 5 min after start → automatic "running late" message.
    if (a.mine) automate("late", a, toTime(a.start + 5));
    else addLog(`Not checked in at ${toTime(a.start + 5)} → Late show reminder sent to ${a.customer} automatically.`, toTime(a.start + 5));
    if (lateBy > NO_SHOW_AFTER) {
      addLog(`${a.pet} still not here after ${NO_SHOW_AFTER} min → system marks no-show automatically.`, toTime(a.start + NO_SHOW_AFTER));
      return simulateNoShow(a);
    }
    const fee = lateBy > LATE_GRACE;
    const z = allocate(a.service, fee ? clampIndex(a.index - 1) : a.index);
    setAppts((all) =>
      all.map((x) =>
        x.id === a.id
          ? { ...x, status: "In progress", lateBy, index: z.index, minutes: z.minutes, tell: z.tell, flags: [...(x.flags ?? []), `Arrived ${lateBy} min late`] }
          : x,
      ),
    );
    const t = toTime(a.start + lateBy);
    if (fee) {
      if (a.mine) automate("latefee", a, t);
      else addLog(`Late fee link (£${LATE_FEE_GBP}) sent to ${a.customer} automatically.`, t);
    }
    addLog(
      fee
        ? `${a.pet} checked in ${lateBy} min late (over ${LATE_GRACE}-min grace). Index ${a.index}→${z.index} automatically: future visits get ${dur(z.minutes)} instead of ${dur(a.minutes)}.`
        : `${a.pet} checked in ${lateBy} min late — inside the ${LATE_GRACE}-min grace, no fee and Index stays ${a.index}.`,
      t,
    );
    addTasks([
      {
        time: toTime(a.start),
        minutes: lateBy,
        stylist: a.stylist,
        kind: "Task",
        text: lateBy >= 15 ? "Restock shampoo station and log towel stock" : "Prep station and confirm this afternoon's notes",
      },
    ]);
  }
  // Customer turns up after the system already released the slot.
  function simulateLateShow() {
    const a = [...apptsRef.current].reverse().find((x) => x.date === TODAY && x.status === "No-show");
    if (!a) return addLog("No no-show to recover yet — simulate a no-show first.");
    setDay(TODAY);
    setAdminTab("Today");
    const arrive = a.start + NO_SHOW_AFTER + 10;
    const busy = busyFor(a.id);
    const fits = (stylist: string) =>
      freeStarts(stylist, a.date, a.minutes, busy, 5, arrive).find((t) => t <= arrive + 15);
    const order = [a.stylist, ...STYLISTS.filter((s) => s !== a.stylist)];
    const stylist = order.find((s) => fits(s) != null);
    const t = toTime(arrive);
    if (stylist) {
      const start = fits(stylist)!;
      setAppts((all) =>
        all.map((x) =>
          x.id === a.id ? { ...x, status: "In progress", start, stylist, lateBy: arrive - a.start, flags: [...(x.flags ?? []), "Arrived after no-show"] } : x,
        ),
      );
      setTasks((all) => all.filter((k) => !(k.kind === "Task" && k.stylist === stylist && toMin(k.time) >= a.start)));
      addLog(
        `${a.pet} arrived ${arrive - a.start} min late, after the no-show. System found ${dur(a.minutes)} with ${stylist} at ${toTime(start)}${stylist !== a.stylist ? " (walk-in kept with " + a.stylist + ")" : ""}; flexible tasks pushed back. No-show fee swapped for £${LATE_FEE_GBP} late fee.`,
        t,
      );
      if (a.mine) automate("latefee", a, t);
    } else {
      const next = STYLISTS.flatMap((s) =>
        DAYS.flatMap((d) => freeStarts(s, d, a.minutes, busy, 15, d === TODAY ? arrive + 30 : 0).slice(0, 1).map((st) => ({ s, d, st }))),
      ).sort((x, y) => x.d.localeCompare(y.d) || x.st - y.st)[0];
      if (!next) return addLog(`${a.pet} arrived after the no-show; no capacity left — front desk to rebook.`, t);
      const id = Date.now();
      setAppts((all) => [...all, { ...a, id, status: "Confirmed", date: next.d, start: next.st, stylist: next.s, notes: `Rebooked after late arrival. ${a.notes}` }]);
      addLog(`${a.pet} arrived after the no-show but today's bays are committed. Next safe slot offered automatically: ${dayLabel(next.d)} ${toTime(next.st)} with ${next.s}.`, t);
    }
  }
  const dueOut = (a: Appt) => a.start + (a.lateBy ?? 0) + a.minutes;
  function checkIn(a: Appt) {
    const lateBy = Math.max(0, clock - a.start);
    if (a.date === TODAY && lateBy > LATE_GRACE && a.start < clock) return simulateLate(a, lateBy);
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "In progress", lateBy: x.lateBy ?? lateBy } : x)));
    addLog(`${a.pet} checked in. Due out ${toTime(a.start + lateBy + a.minutes)}.`, toTime(clock));
  }
  // One click. Only offered once the system sees the visit is within 10 min of due-out.
  function stillGoing(a: Appt) {
    const minutes = a.minutes + OVERRUN_BUFFER;
    const end = a.start + (a.lateBy ?? 0) + minutes;
    setAppts((all) =>
      all.map((x) => (x.id === a.id ? { ...x, minutes, overrun: (x.overrun ?? 0) + OVERRUN_BUFFER, stillGoing: (x.stillGoing ?? 0) + 1 } : x)),
    );
    const t = toTime(clock);
    const clash = apptsRef.current.find(
      (x) => x.id !== a.id && isActive(x) && x.date === a.date && x.stylist === a.stylist && x.start < end && x.start >= a.start,
    );
    if (!clash) return addLog(`${a.pet} still going +${OVERRUN_BUFFER} min. New due-out ${toTime(end)} — nothing affected.`, t);
    const busy = busyFor(clash.id).concat({ stylist: a.stylist, date: a.date, start: a.start, end });
    const other = STYLISTS.find((s) => s !== a.stylist && freeStarts(s, clash.date, clash.minutes, busy, 5, clash.start).includes(clash.start));
    if (other) {
      setAppts((all) => all.map((x) => (x.id === clash.id ? { ...x, stylist: other } : x)));
      addLog(`${a.pet} still going +${OVERRUN_BUFFER} min. ${clash.pet} moved to ${other} at the same time — customer's time unchanged.`, t);
    } else {
      setAppts((all) => all.map((x) => (x.id === clash.id ? { ...x, start: end } : x)));
      addLog(`${a.pet} still going +${OVERRUN_BUFFER} min. ${clash.pet} shifted to ${toTime(end)}; ${clash.customer} messaged automatically.`, t);
      if (clash.mine)
        notify({ subject: `Small delay · ${clash.pet}`, time: t, apptId: clash.id, text: `We're running a little behind — ${clash.pet}'s new time is ${toTime(end)}.`, actions: ["ics", "call"] });
    }
  }
  // Done = service finished (actual time measured). Pet waits for collection.
  function markDone(a: Appt) {
    const actual = Math.max(5, clock - a.start - (a.lateBy ?? 0));
    const planned = a.minutes;
    const diff = actual - planned;
    const next = clampIndex(a.index + (diff > 5 ? -1 : diff < -10 ? 1 : 0));
    const z = allocate(a.service, next);
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "Done", doneAt: clock, index: z.index, tell: z.tell } : x)));
    const t = toTime(clock);
    if (diff < -5)
      addTasks([{ time: t, minutes: -diff, stylist: a.stylist, kind: "Task", text: "Finished early — clean bay and prep next station" }]);
    addLog(
      `${a.pet} done: ${dur(actual)} actual vs ${dur(planned)} allocated${a.stillGoing ? ` (still going ×${a.stillGoing})` : ""}. ${
        next !== a.index ? `Index ${a.index}→${z.index} automatically.` : `Index holds at ${a.index}.`
      } Waiting for collection.`,
      t,
    );
    if (a.mine) notify({ subject: `${a.pet} is ready`, time: t, apptId: a.id, text: `${a.pet} is ready for collection!${a.paid?.length ? " You've already paid — just pick up." : ` Pay £${PRICE_GBP[a.service] ?? 40} now for a quick check-out.`}`, actions: a.paid?.length ? [] : ["pay-advance"] });
  }
  // Check out = payment confirmed and pet collected. Separate from Done.
  function checkOut(a: Appt) {
    const paid = a.paid?.length ? a.paid : [...(a.paid ?? []), `${a.service} — paid at desk`];
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, status: "Checked out", paid } : x)));
    addLog(`${a.pet} checked out: payment confirmed${a.paid?.length ? " (paid in advance)" : " at desk"}, collected by ${a.customer}.`, toTime(clock));
  }
  function simulateNoShow(a: Appt) {
    const next = clampIndex(a.index - 2);
    const z = allocate(a.service, next);
    setAppts((all) =>
      all.map((x) => (x.id === a.id ? { ...x, status: "No-show", index: z.index, minutes: z.minutes, tell: z.tell } : x)),
    );
    const t = toTime(a.start + NO_SHOW_AFTER);
    if (a.mine) automate("noshow", a, t);
    else addLog(`No-show fee link (£${NO_SHOW_FEE_GBP}) sent to ${a.customer} by SMS.`, t);
    addLog(`${a.pet} did not arrive. Index ${a.index}→${z.index}; next booking will need a deposit and ${dur(z.minutes)}.`, t);
    let free = a.minutes - NO_SHOW_AFTER;
    const recovered: Omit<RecoveredTask, "id">[] = [
      { time: toTime(a.start), minutes: NO_SHOW_AFTER, stylist: a.stylist, kind: "Task", text: "Grace period: call customer, update notes" },
    ];
    const walk = allocate("Nail trim", 4);
    if (free >= walk.minutes + 10) {
      const start = a.start + NO_SHOW_AFTER;
      setAppts((all) => [
        ...all,
        mk({
          id: Date.now(),
          customer: "Walk-in customer",
          pet: ["Rolo", "Nala", "Juno", "Pip"][scenarioTurn.current % 4]!,
          breed: "Jack Russell",
          service: "Nail trim",
          stylist: a.stylist,
          date: a.date,
          start,
          index: 4,
          status: "Confirmed",
          source: "Walk-in",
          mine: false,
          notes: `Walk-in captured in ${a.pet}'s released slot.`,
        }),
      ]);
      recovered.push({ time: toTime(start), minutes: walk.minutes, stylist: a.stylist, kind: "Walk-in", text: `Walk-in nail trim booked (£${PRICE_GBP["Nail trim"] ?? 15})` });
      addLog(`Walk-in captured at ${toTime(start)} with ${a.stylist} in the released slot.`, toTime(start));
      free -= walk.minutes;
      if (free > 0)
        recovered.push({ time: toTime(start + walk.minutes), minutes: free, stylist: a.stylist, kind: "Task", text: "Inventory count: clippers, blades and shampoo" });
    } else if (free > 0) {
      recovered.push({ time: toTime(a.start + NO_SHOW_AFTER), minutes: free, stylist: a.stylist, kind: "Task", text: "Inventory count and supplier reorder" });
    }
    addTasks(recovered);
  }
  function runScenario(kind: "late" | "noshow") {
    const a = nextTarget((x) => (kind === "late" ? !!x.lateBy : false));
    if (!a) return addLog("No confirmed appointments left today to simulate.");
    setDay(TODAY);
    setAdminTab("Today");
    kind === "late" ? simulateLate(a) : simulateNoShow(a);
  }
  function staffReschedule(a: Appt) {
    const start = a.start + 30;
    setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, start } : x)));
    addLog(`${a.pet} moved to ${toTime(start)} by staff. Calendar and customer message updated.`);
    notify({
      subject: `New time for ${a.pet}`,
      time: toTime(NOW),
      apptId: a.id,
      text: `${a.pet}'s appointment has moved to ${toTime(start)} with ${a.stylist}.`,
      actions: ["ics", "reschedule", "cancel"],
    });
  }
  async function simulateCalendar() {
    const z = (await size({ data: { service: "Full style", breed: "Siberian Husky", newClient: false } })) as Record<
      string,
      Size
    >;
    for (const date of [DAYS[1]!, DAYS[2]!])
      for (const stylist of STYLISTS) {
        const s = z[stylist];
        const x = s && allocate("Full style", s.index);
        const start = x && freeStarts(stylist, date, x.minutes, busyFor())[0];
        if (x && start != null) {
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
            standard: x.standard,
            minutes: x.minutes,
            index: x.index,
            tell: x.tell,
            status: "Confirmed",
            source: "Google Calendar",
            calendarMinutes: 60,
            mine: false,
            notes: "Calendar note: first full style with the salon.",
          };
          setAppts((all) => [...all, a]);
          setDay(date);
          addLog(
            `Calendar booking interpreted and resized from 60 min to ${dur(x.minutes)} before protecting the next appointment.`,
          );
          return;
        }
      }
  }
  function customerSays(text: string, channel: Channel) {
    customerEngaged(channel === "Email" ? "emailed" : "messaged");
    send([{ channel, from: "me", time: toTime(NOW), text, subject: channel === "Email" ? "Re: booking" : undefined }]);
    addLog(`New ${channel === "Email" ? "email" : "message"} from ${CUSTOMER.name}: “${text}”`);
    window.setTimeout(
      () =>
        send([
          {
            channel,
            from: "shop",
            time: toTime(NOW),
            subject: channel === "Email" ? "Re: booking" : undefined,
            text: `Thanks ${CUSTOMER.name.split(" ")[0]}! The front desk has your message and will reply shortly. You can also call us on ${SHOP_PHONE}.`,
          },
        ]),
      1300,
    );
  }
  function onPaid(c: Checkout) {
    const a = appts.find((x) => x.id === c.apptId);
    setAppts((all) => all.map((x) => (x.id === c.apptId ? { ...x, paid: [...(x.paid ?? []), c.label] } : x)));
    addLog(`Payment received: £${c.amount.toFixed(2)} — ${c.label}${a ? ` (${a.pet})` : ""}.`);
    if (c.kind === "pay-advance") addLog(`Fast check-out applied${a ? ` for ${a.pet}` : ""}: prepaid, desk only confirms collection.`);
    if (c.thenDone) window.setTimeout(() => setPhoneView("done"), 1400);
    notify({
      subject: "Payment receipt",
      time: toTime(NOW),
      apptId: c.apptId,
      text: `Receipt #${newCode()}\n£${c.amount.toFixed(2)} · ${c.label}${c.kind === "pay-advance" ? "\nFast check-out is on — just collect." : ""}`,
    });
  }
  const recs = useMemo(
    () => appts.filter((a) => a.status === "Confirmed" && (a.index <= 2 || Boolean(a.calendarMinutes))),
    [appts],
  );
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i),
    pct = (m: number) => `${((m - 540) / 540) * 100}%`;
  const openApp = (app: PhoneApp) => {
    setPhoneApp(app);
    setPhoneView(app === "browser" ? "browser" : "app");
    if (app === "messages") setUnread((u) => ({ ...u, Messages: 0 }));
    if (app === "email") setUnread((u) => ({ ...u, Email: 0 }));
  };
  const selectAction = (act: LinkAction, id?: number) => {
    const a = appts.find((x) => x.id === id);
    if (act === "call") return openApp("phone");
    if (act === "ics" && a) {
      setAppts((all) => all.map((x) => (x.id === a.id ? { ...x, inCalendar: true } : x)));
      addLog(`${CUSTOMER.name} added ${a.pet}'s appointment to their calendar.`);
      return openApp("calendar");
    }
    if ((act === "pay-late" || act === "pay-noshow" || act === "pay-advance") && a) {
      const amount = act === "pay-late" ? LATE_FEE_GBP : act === "pay-noshow" ? NO_SHOW_FEE_GBP : (PRICE_GBP[a.service] ?? 40);
      const label =
        act === "pay-late" ? "Late arrival fee" : act === "pay-noshow" ? "No-show fee" : `${a.service} — paid in advance`;
      setCheckout({ kind: act, apptId: a.id, amount, label });
      setPhoneApp("browser");
      setPhoneView("checkout");
      return;
    }
    setPhoneApp("browser");
    if (act === "rebook" || !a) {
      setPhoneView("browser");
      return;
    }
    setPhoneAppt(a.id);
    setCodeInput("");
    setPhoneView(act === "cancel" ? "cancel" : "reschedule");
    setRawSizes(null);
  };
  const reset = () => {
    setAppts(seed);
    setMessages([pastConfirmation()]);
    setGuide(undefined);
    queued.current = [];
    setCalls([]);
    setUnread({ Messages: 0, Email: 0 });
    setNotif(undefined);
    setLog(["10:15 · Demo reset."]);
    setDay(TODAY);
    setPanel(null);
    setPhoneView("home");
    setPhoneAppt(undefined);
    setRawSizes(null);
    setShift(0);
    setCheckout(undefined);
    setForm(emptyForm);
    setTasks([]);
    scenarioTurn.current = 0;
    setRunId((n) => n + 1);
  };
  const target =
    [...appts].reverse().find((a) => a.mine && a.status === "Confirmed") ?? appts.find((a) => a.id === MY_SEED_ID)!;
  return (
    <div className="dm" data-mobile={mobile || undefined} data-tab={mobile ? mTab : undefined}>
      <header className="dm-top">
        <div>
          <h1>By Appointment Only</h1>
          <small>Public workflow prototype · nothing is saved</small>
        </div>
        <span className="sp" />
        <span className="dm-pill">Fri 25 Sep · {toTime(clock)}</span>
        <Button className="dm-pill" onClick={() => runScenario("late")}>
          Simulate late arrival
        </Button>
        <Button className="dm-pill" onClick={() => runScenario("noshow")}>
          Simulate no-show
        </Button>
        <Button className="dm-pill" onClick={simulateLateShow}>
          Simulate late show after no-show
        </Button>
        <Button className="dm-pill" onClick={simulateCalendar}>
          <CalendarDays size={15} />
          Add calendar booking
        </Button>
        <Button asChild className="dm-pill">
          <Link to="/">
            <LogOut size={15} />
            Exit demo
          </Link>
        </Button>
        <Button className="dm-pill" onClick={reset}>
          <RotateCcw size={15} />
          Reset
        </Button>
      </header>
      {mobile && (
        <nav className="dm-mtabs" role="tablist" aria-label="Demo view">
          <button role="tab" aria-selected={mTab === "app"} onClick={() => setMTab("app")}>
            Hand-Held App
          </button>
          <button role="tab" aria-selected={mTab === "phone"} onClick={() => setMTab("phone")}>
            Customer phone
          </button>
        </nav>
      )}
      <div className="dm-stage">
        {mobile && (
          <section className="dm-handheld" aria-label="Hand-Held App">
            <Handheld />
          </section>
        )}
        <section className="dm-admin" aria-label="Staff dashboard">
          <nav className="dm-admin-tabs">
            {["Today", "Bookings", "Automations", "Customers & pets", "Staff rota"].map((t) => (
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
          ) : adminTab === "Automations" ? (
            <AutomationsPanel
              target={target}
              messages={messages}
              channel={deliver(form.contact)}
              run={(k) => automate(k, target)}
            />
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
                        {a.pet}: {dur(a.minutes)} protected ({signed(a.minutes - a.standard)} buffer). Open to see why.
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {tasks.length > 0 && (
                <div className="dm-recovered">
                  <b>
                    {dur(tasks.reduce((n, t) => n + t.minutes, 0))} converted to tasks
                  </b>
                  {tasks.map((t) => (
                    <div key={t.id} data-kind={t.kind}>
                      <span>{t.time}</span>
                      <em>{t.kind}</em>
                      <p>
                        {t.stylist}: {t.text}
                      </p>
                      <small>{dur(t.minutes)}</small>
                    </div>
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
                        {shown
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
                              <i className="tell" style={{ width: `${(Math.min(a.tell, a.minutes) / a.minutes) * 100}%` }} />
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
                        <small>
                          {dur(a.minutes)} allocated · told {dur(a.tell)}
                        </small>
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
              shift={shift}
              setShift={setShift}
              form={form}
              setForm={setForm}
              prepareTimes={prepareAdminTimes}
              slotsFor={slotsFor}
              setPanel={setPanel}
              cancel={cancel}
              noShow={noShow}
              reschedule={staffReschedule}
              flow={{ checkIn, stillGoing, markDone, checkOut, lateShow: simulateLateShow }}
              clock={clock}
              dueOut={dueOut}
              log={log}
              createBooking={createBooking}
            />
          )}
        </section>
        <PhoneShell
          app={phoneApp}
          openApp={openApp}
          view={phoneView}
          setView={setPhoneView}
          messages={messages}
          unread={unread}
          notif={notif}
          guide={guide}
          clock={clock}
          onAlert={(how: "messages" | "phone") => { setGuide(undefined); openApp(how); }}
          calls={calls}
          appts={appts}
          checkout={checkout}
          onPaid={onPaid}
          customerSays={customerSays}
          form={form}
          setForm={setForm}
          prepay={prepay}
          setPrepay={setPrepay}
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
            if (awaiting.current) return customerEngaged("called");
            setPanel({ kind: "new", fromCall: true });
            setAdminTab("Bookings");
            addLog(`Incoming call from ${CUSTOMER.name}. Phone-booking recommendations opened for staff.`);
          }}
        />
      </div>
      <div className="dm-disclaimer">
        <p>
          This is a prototype of BAOWOW, an application prototype for automated appointment-based businesses
          developed by{" "}
          <a href="https://protocell.io" target="_blank" rel="noopener noreferrer">
            PROTOCELL IO
          </a>
          , intended for demonstration purposes only.
        </p>
        <nav aria-label="Legal">
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          <span aria-hidden="true">·</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </nav>
      </div>
    </div>
  );
}

function AutomationsPanel({
  target,
  messages,
  channel,
  run,
}: {
  target: Appt;
  messages: Msg[];
  channel: Channel;
  run: (k: Automation) => void;
}) {
  const inbound = messages.filter((m) => m.from === "me");
  return (
    <div className="dm-simple dm-auto">
      <h2>Automated messages</h2>
      <p>
        Sent by the customer’s preferred contact method (<b>{channel}</b>) with calendar, payment and fee links.
        Target: <b>{target.pet}</b> · {dayLabel(target.date)} {toTime(target.start)} · {target.status}
      </p>
      <div className="dm-auto-list">
        {AUTOMATIONS.map((x) => {
          const sent = messages.some((m) => m.from === "shop" && m.apptId === target.id && m.subject?.startsWith(subjectKey(x.kind)));
          return (
            <div key={x.kind}>
              <BellRing size={16} />
              <span>
                <b>{x.title}</b>
                <small>{x.when}</small>
              </span>
              {sent && <em>Sent</em>}
              <Button
                variant="ghost"
                disabled={target.status !== "Confirmed" && x.kind !== "noshow"}
                onClick={() => run(x.kind)}
              >
                Send now
              </Button>
            </div>
          );
        })}
      </div>
      <h3>Customer conversation</h3>
      {inbound.length === 0 ? (
        <p className="dm-muted">No customer replies yet — try messaging the shop from the phone.</p>
      ) : (
        inbound.map((m) => (
          <p key={m.id} className="dm-note-card">
            <b>{m.channel}</b> · {m.time} — {m.text}
          </p>
        ))
      )}
    </div>
  );
}
const subjectKey = (k: Automation) =>
  ({
    confirm: "Booking confirmed",
    tomorrow: "Reminder:",
    today: "Today:",
    "2h": "In 2 hours",
    late: "Running late",
    latefee: "Late arrival fee",
    noshow: "You missed",
    advance: "Pay in advance",
  })[k];

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
function IndexBreakdown({
  standard,
  minutes,
  tell,
  service,
}: {
  standard: number;
  minutes: number;
  tell: number;
  service: string;
}) {
  return (
    <div className="dm-breakdown">
      <div>
        <span>Standard {service.toLowerCase()}</span>
        <b>{dur(standard)}</b>
      </div>
      <div>
        <span>Risk buffer from Index</span>
        <b>{signed(minutes - standard)}</b>
      </div>
      <div data-strong>
        <span>Allocated (staff diary)</span>
        <b>{dur(minutes)}</b>
      </div>
      <div>
        <span>Told to customer</span>
        <b>
          {about(tell)} <small>({offsetLabel(tell - minutes)})</small>
        </b>
      </div>
    </div>
  );
}
function AdminDrawer({
  panel,
  appts,
  sizes,
  shift,
  setShift,
  form,
  setForm,
  prepareTimes,
  slotsFor,
  setPanel,
  cancel,
  noShow,
  reschedule,
  flow,
  clock,
  dueOut,
  log,
  createBooking,
}: {
  clock: number;
  dueOut: (a: Appt) => number;
  panel: AdminPanel;
  appts: Appt[];
  sizes: Record<string, Size> | null;
  shift: number;
  setShift: (n: number) => void;
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
  flow: Record<"checkIn" | "stillGoing" | "markDone" | "checkOut", (a: Appt) => void> & { lateShow: () => void };
  log: string[];
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
            <IndexBreakdown standard={a.standard} minutes={a.minutes} tell={a.tell} service={a.service} />
            <small className="dm-auto-note">Index updates automatically from check-ins, check-outs, lateness and no-shows.</small>
            {a.flags?.length ? (
              <div className="dm-behaviour-flags">
                {a.flags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
            ) : null}
            {a.paid?.length ? (
              <div className="dm-behaviour-flags">
                {a.paid.map((p) => (
                  <span key={p}>Paid · {p}</span>
                ))}
                {a.paid.some((p) => p.includes("paid in advance")) && <span>Fast check-out</span>}
              </div>
            ) : null}
          </div>
          <h3>Appointment notes</h3>
          <p className="dm-note-card">{a.notes}</p>
          <div className="dm-actions">
            {a.status === "Confirmed" && a.date === TODAY && <Button onClick={() => flow.checkIn(a)}>Check in</Button>}
            {(a.status === "Checked in" || a.status === "In progress") && (
              <>
                {clock >= dueOut(a) - STILL_GOING_LEAD && <Button onClick={() => flow.stillGoing(a)}>Still going</Button>}
                <Button onClick={() => flow.markDone(a)}>Done</Button>
              </>
            )}
            {a.status === "Done" && <Button onClick={() => flow.checkOut(a)}>Check out</Button>}
            {a.status === "No-show" && <Button onClick={() => flow.lateShow()}>Customer arrived — override</Button>}
          </div>
          <h3>System log</h3>
          <ul className="dm-note-card dm-auto-log">
            {log.filter((l) => l.includes(a.pet)).length ? (
              log.filter((l) => l.includes(a.pet)).map((l, i) => <li key={i}>{l}</li>)
            ) : (
              <li>No automated events yet.</li>
            )}
          </ul>
        </>
      ) : (
        <StaffBooking
          fromCall={Boolean(panel?.kind === "new" && panel.fromCall)}
          form={form}
          setForm={setForm}
          sizes={sizes}
          shift={shift}
          setShift={setShift}
          prepareTimes={prepareTimes}
          slotsFor={slotsFor}
          createBooking={createBooking}
        />
      )}
    </aside>
  );
}
function ContactChoice({ form, setForm }: { form: any; setForm: (x: any) => void }) {
  return (
    <div className="dm-field">
      <span>Send me updates by</span>
      <div className="dm-seg dm-seg-icons" role="radiogroup" aria-label="Send me updates by">
        {(
          [
            ["Phone", Phone, "Phone"],
            ["Messages", MessageCircle, "Text message"],
            ["Email", Mail, "Email"],
          ] as const
        ).map(([c, Icon, label]) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={form.contact === c}
            aria-label={label}
            title={label}
            data-on={form.contact === c}
            onClick={() => setForm({ ...form, contact: c })}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
function StaffBooking({
  fromCall,
  form,
  setForm,
  sizes,
  shift,
  setShift,
  prepareTimes,
  slotsFor,
  createBooking,
}: {
  fromCall: boolean;
  form: any;
  setForm: (x: any) => void;
  sizes: Record<string, Size> | null;
  shift: number;
  setShift: (n: number) => void;
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
        <DmSelect value={form.petName} options={PET_NAMES.includes(form.petName) ? PET_NAMES : [form.petName, ...PET_NAMES]} onChange={(v) => setForm({ ...form, petName: v })} />
      </label>
      <label className="dm-field">
        <span>Service</span>
        <DmSelect value={form.service} options={SERVICES} onChange={(v) => setForm({ ...form, service: v })} />
      </label>
      <label className="dm-field">
        <span>Breed</span>
        <DmSelect value={form.breed} options={BREEDS} onChange={(v) => setForm({ ...form, breed: v })} />
      </label>
      <label className="dm-field">
        <span>Pet stylist</span>
        <DmSelect value={form.stylist} options={["Any available", ...STYLISTS]} onChange={(v) => setForm({ ...form, stylist: v })} />
      </label>
      <label className="dm-field">
        <span>Notes</span>
        <NoteChips value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </label>
      <ContactChoice form={form} setForm={setForm} />
      <Button className="dm-cta" onClick={() => prepareTimes()}>
        Show recommendations
      </Button>
      {allocation && (
        <div className="dm-admin-recommendation">
          <div className="dm-allocation">
            <div className="dm-allocation-head">
              <b>Allocated time</b>
              <span>
                Index {allocation.index}
              </span>
            </div>
            <div className="dm-allocation-value">
              <strong>{dur(allocation.minutes)}</strong>
              <span>blocks the diary and the bay</span>
            </div>
            <IndexBreakdown
              standard={allocate(form.service, allocation.index).standard}
              minutes={allocation.minutes}
              tell={allocation.tellClient}
              service={form.service}
            />
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
  openApp,
  view,
  setView,
  messages,
  unread,
  notif,
  guide,
  clock,
  onAlert,
  calls,
  appts,
  checkout,
  onPaid,
  customerSays,
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
  prepay,
  setPrepay,
}: any) {
  const apps = [
    { id: "phone", label: "Phone", icon: Phone },
    { id: "messages", label: "Messages", icon: MessageCircle, badge: unread.Messages },
    { id: "email", label: "Mail", icon: Mail, badge: unread.Email },
    { id: "browser", label: "Browser", icon: Globe },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];
  const inBrowser = view !== "home" && view !== "app";
  const url =
    view === "checkout"
      ? "checkout.pay.test/c/byappointmentonly"
      : `byappointmentonly.test/${view === "cancel" ? "manage" : view === "reschedule" ? "change" : "book"}`;
  return (
    <aside className="dm-phone" aria-label="Customer phone">
      <div className="dm-screen">
        <div className="dm-status">
          <b>{toTime(clock)}</b>
          <span>5G ▮▮▮</span>
        </div>
        {notif && (
          <button
            className="dm-notif"
            onClick={() => openApp(notif.calendar ? "calendar" : notif.call ? "phone" : notif.channel === "Email" ? "email" : "messages")}
          >
            <i data-app={notif.calendar ? "calendar" : notif.call ? "phone" : notif.channel === "Email" ? "email" : "messages"}>
              {notif.calendar ? <CalendarDays size={14} /> : notif.call ? <Phone size={14} /> : notif.channel === "Email" ? <Mail size={14} /> : <MessageCircle size={14} />}
            </i>
            <span>
              <b>{notif.calendar ? "Calendar" : notif.call ? "Call · By Appointment Only" : notif.channel === "Email" ? notif.subject : "By Appointment Only"}</b>
              <small>{notif.text.split("\n")[0]}</small>
            </span>
          </button>
        )}
        {guide && (
          <div className="dm-calalert" role="alert">
            <header>
              <i><CalendarDays size={12} /></i>
              <span>CALENDAR</span>
              <small>{guide.time}</small>
            </header>
            <b>{guide.title}</b>
            <p>{guide.body}</p>
            <div>
              <button onClick={() => onAlert("messages")}>Message</button>
              <button onClick={() => onAlert("phone")}>Call</button>
            </div>
          </div>
        )}
        {view === "home" ? (
          <div className="dm-home">
            <div className="dm-home-date">Friday 25</div>
            <div className="dm-appgrid">
              {apps.map(({ id, label, icon: Icon, badge }) => (
                <button key={id} onClick={() => openApp(id)}>
                  <i data-app={id}>
                    <Icon />
                    {badge ? <em>{badge}</em> : null}
                  </i>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="dm-home-hint">
              This phone is the customer. Messages, Mail, Calendar and payments update live.
            </p>
          </div>
        ) : null}
        {view !== "home" && (
          <PhoneHeader
            title={
              inBrowser
                ? "Browser"
                : app === "messages"
                  ? "Messages"
                  : app === "email"
                    ? "Mail"
                    : app === "calendar"
                      ? "Calendar"
                      : app === "browser"
                        ? "Browser"
                        : "Phone"
            }
            onBack={() => setView("home")}
          />
        )}
        {inBrowser && <BrowserBar url={url} />}
        <div className="dm-phone-body">
          {view === "app" && app === "phone" ? (
            <DialerApp onCall={onCall} calls={calls} />
          ) : view === "app" && app === "messages" ? (
            <MessagesApp
              list={messages.filter((m: Msg) => m.channel === "Messages")}
              onAction={selectAction}
              onSend={(t) => customerSays(t, "Messages")}
            />
          ) : view === "app" && app === "email" ? (
            <MailApp
              list={messages.filter((m: Msg) => m.channel === "Email")}
              onAction={selectAction}
              onSend={(t) => customerSays(t, "Email")}
            />
          ) : view === "app" && app === "calendar" ? (
            <CalendarApp events={appts.filter((a: Appt) => a.mine && a.inCalendar)} dayLabel={dayLabel} />
          ) : view === "checkout" && checkout ? (
            <CheckoutApp key={checkout.apptId + checkout.kind} checkout={checkout} email={CUSTOMER.email} onPaid={onPaid} />
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
            <BookingReview form={form} setForm={setForm} prepay={prepay} setPrepay={setPrepay} pending={pending} createBooking={createBooking} setView={setView} />
          ) : view === "checking" ? (
            <div className="dm-checking">
              <div className="dm-pulse" />
              <h2>Fluffing the towels for {form.petName}…</h2>
              <p>Securing your time…</p>
            </div>
          ) : view === "done" && current ? (
            <Done a={current} setView={setView} contact={deliver(form.contact)} onCalendar={() => selectAction("ics", current.id)} />
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
        <DmSelect value={form.petName} options={PET_NAMES.includes(form.petName) ? PET_NAMES : [form.petName, ...PET_NAMES]} onChange={(v) => setForm({ ...form, petName: v })} />
        {errors.petName && <em>{errors.petName}</em>}
      </label>
      <label className="dm-field">
        <span>Breed</span>
        <DmSelect value={form.breed} options={BREEDS} onChange={(v) => setForm({ ...form, breed: v })} />
      </label>
      <label className="dm-field">
        <span>Service</span>
        <DmSelect value={form.service} options={SERVICES} onChange={(v) => setForm({ ...form, service: v })} />
      </label>
      <label className="dm-field">
        <span>Pet stylist</span>
        <DmSelect value={form.stylist} options={["Any available", ...STYLISTS]} onChange={(v) => setForm({ ...form, stylist: v })} />
      </label>
      <label className="dm-field">
        <span>Anything we should know?</span>
        <NoteChips value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
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
          <CodeFill value={codeInput} code={current?.code ?? ""} onFill={setCodeInput} />
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
function BookingReview({ form, setForm, prepay, setPrepay, pending, createBooking, setView }: any) {
  return (
    <div className="dm-book">
      <div className="dm-reserving">
        <span>
          You are reserving{" "}
          <b>
            {toTime(pending.option.start)}, {dayLabel(pending.date)}
          </b>{" "}
          with <b>{pending.option.stylist}</b>
        </span>
        <button type="button" onClick={() => setView("times")}>
          Change
        </button>
      </div>
      <span className="dm-kick">Step 2 of 2</span>
      <h2>Check your visit</h2>
      <p className="dm-lasts">
        Your appointment will last <b>{about(pending.option.size.tellClient)}</b> and costs{" "}
        <b>£{PRICE_GBP[form.service] ?? 40}</b>.
      </p>
      <div className="dm-facts">
        <div>
          <span>Pet</span>
          <b>{form.petName}</b>
        </div>
        <div>
          <span>Service</span>
          <b>{form.service}</b>
        </div>
      </div>
      <ContactChoice form={form} setForm={setForm} />
      <label className="dm-prepay">
        <input type="checkbox" checked={prepay} onChange={(e) => setPrepay(e.target.checked)} />
        <span>
          <b>Pay now for fast check-out · £{PRICE_GBP[form.service] ?? 40}</b>
          <small>Skip paying at collection. Simulated checkout, no real transaction.</small>
        </span>
      </label>
      <p className="dm-note-card">Demo only. Nothing will be sent to or saved in the backend.</p>
      <button className="dm-cta" onClick={() => createBooking(pending.option, pending.date)}>
        {prepay ? "Confirm and pay" : "Confirm booking"}
      </button>
    </div>
  );
}
function Done({
  a,
  setView,
  contact,
  onCalendar,
}: {
  a: Appt;
  setView: (v: PhoneView) => void;
  contact: Channel;
  onCalendar: () => void;
}) {
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
        <div>
          <span>Cost</span>
          <b>£{PRICE_GBP[a.service] ?? 40}</b>
        </div>
        <div>
          <span>Confirmation number</span>
          <b className="dm-code">{a.code}</b>
        </div>
        <div>
          <span>Fast check-out</span>
          <b>{a.paid?.some((p) => p.includes("paid in advance")) ? "Applied · prepaid" : "Not applied"}</b>
        </div>
      </div>
      <a
        className="dm-cta dm-ics"
        download={`appointment-${a.code}.ics`}
        href={icsHref({ title: `${a.service} · ${a.pet}`, date: a.date, start: toTime(a.start), minutes: a.tell, code: a.code, who: a.stylist })}
        onClick={onCalendar}
      >
        <CalendarPlus size={16} /> Add to calendar (.ics)
      </a>
      <p>Your confirmation will arrive shortly in {contact === "Email" ? "Mail" : "Messages"}, with calendar and pay-in-advance links.</p>
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
        <CodeFill value={codeInput} code={a.code} onFill={setCodeInput} />
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

function DmSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="dm-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="dm-select-menu">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function NoteChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const on = value ? value.split(" · ") : [];
  return (
    <div className="dm-note-chips">
      {NOTE_PRESETS.map((n) => (
        <button key={n} type="button" aria-pressed={on.includes(n)} onClick={() => onChange(toggleNote(value, n))}>
          {n}
        </button>
      ))}
    </div>
  );
}
function CodeFill({ value, code, onFill }: { value: string; code: string; onFill: (v: string) => void }) {
  return (
    <div className="dm-codefill">
      <b>{value || "——————"}</b>
      <button type="button" onClick={() => onFill(code)}>
        Paste from confirmation
      </button>
    </div>
  );
}
