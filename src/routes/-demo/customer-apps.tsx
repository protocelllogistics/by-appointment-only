import { useEffect, useRef, useState } from "react";
import { CalendarPlus, CreditCard, Download, Lock, Phone, PhoneCall, PhoneOff } from "lucide-react";
import { toTime } from "@/lib/demo-rota";
import { REPLY_PRESETS, TEST_CARDS, cycle } from "@/lib/demo-presets";
import type { CallLog } from "./types";
import type { Appt, Checkout, LinkAction, Msg } from "./types";

export const SHOP_PHONE = "020 7946 0123";

export const ACTION_LABEL: Record<LinkAction, string> = {
  reschedule: "Change time",
  cancel: "Cancel",
  rebook: "Book again",
  ics: "Add to calendar (.ics)",
  "pay-late": "Pay late fee",
  "pay-noshow": "Pay no-show fee",
  "pay-advance": "Pay now · fast check-out",
  call: `Call ${SHOP_PHONE}`,
};

function QuickReplies({ onSend }: { onSend: (t: string) => void }) {
  return (
    <div className="dm-quick" aria-label="Pre-written replies">
      {REPLY_PRESETS.map((r) => (
        <button key={r} type="button" onClick={() => onSend(r)}>
          {r}
        </button>
      ))}
    </div>
  );
}

function Actions({ m, onAction }: { m: Msg; onAction: (a: LinkAction, id?: number) => void }) {
  if (!m.actions?.length) return null;
  return (
    <div className="dm-links">
      {m.actions.map((a) => (
        <button key={a} data-kind={a} onClick={() => onAction(a, m.apptId)}>
          {ACTION_LABEL[a]}
        </button>
      ))}
    </div>
  );
}

export function MessagesApp({
  list,
  onAction,
  onSend,
}: {
  list: Msg[];
  onAction: (a: LinkAction, id?: number) => void;
  onSend: (text: string) => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [list.length]);
  return (
    <div className="dm-thread">
      <div className="dm-thread-who">
        <i>BA</i>
        <b>By Appointment Only</b>
        <small>{SHOP_PHONE}</small>
      </div>
      <div className="dm-bubbles">
        {list.length === 0 && <div className="dm-empty">No messages yet.</div>}
        {list.map((m) => (
          <div key={m.id} className="dm-bubble" data-from={m.from}>
            <small>{m.time}</small>
            <p>{m.text}</p>
            <Actions m={m} onAction={onAction} />
          </div>
        ))}
        <div ref={end} />
      </div>
      <QuickReplies onSend={onSend} />
    </div>
  );
}

// Demo-only inbox filler: the phone has ordinary email from other senders.
const FILLER_MAIL = [
  { id: -1, from: "Parcel Tracking", time: "Yesterday", subject: "Your parcel has been delivered", text: "Your parcel was left in your safe place at 14:12. Thanks for shopping with us." },
  { id: -2, from: "City Library", time: "Yesterday", subject: "Items due back soon", text: "Two items on your account are due back on Friday. Renew online to keep them longer." },
  { id: -3, from: "Weekend Market", time: "Sunday", subject: "This week's stalls", text: "Fresh bread, local honey and a new coffee cart this Saturday from 9am." },
  { id: -4, from: "Energy Account", time: "Friday", subject: "Your monthly statement is ready", text: "Your latest statement is available to view in your account." },
];

export function MailApp({
  list,
  onAction,
  onSend,
}: {
  list: Msg[];
  onAction: (a: LinkAction, id?: number) => void;
  onSend: (text: string) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const m = list.find((x) => x.id === open);
  if (m)
    return (
      <div className="dm-mail-open">
        <button className="dm-mail-back" onClick={() => setOpen(null)}>
          ‹ Inbox
        </button>
        <h3>{m.subject ?? "Message"}</h3>
        <small>
          {m.from === "me" ? "You" : "By Appointment Only <hello@byappointmentonly.test>"} · {m.time}
        </small>
        <p>{m.text}</p>
        <Actions m={m} onAction={onAction} />
        {m.from === "shop" && (
          <QuickReplies onSend={(t) => { onSend(t); setOpen(null); }} />
        )}
      </div>
    );
  const filler = FILLER_MAIL.find((x) => x.id === open);
  if (filler)
    return (
      <div className="dm-mail-open">
        <button className="dm-mail-back" onClick={() => setOpen(null)}>‹ Inbox</button>
        <h3>{filler.subject}</h3>
        <small>{filler.from} · {filler.time}</small>
        <p>{filler.text}</p>
      </div>
    );
  return (
    <div className="dm-inbox">
      {[...list].reverse().map((x) => (
        <button key={x.id} onClick={() => setOpen(x.id)}>
          <b>{x.from === "me" ? "You" : "By Appointment Only"}</b>
          <small>{x.time}</small>
          <span>{x.subject ?? x.text.split("\n")[0]}</span>
          <em>{x.text.replace(/\n/g, " ").slice(0, 70)}…</em>
        </button>
      ))}
      {FILLER_MAIL.map((x) => (
        <button key={x.id} onClick={() => setOpen(x.id)} data-filler="true">
          <b>{x.from}</b>
          <small>{x.time}</small>
          <span>{x.subject}</span>
          <em>{x.text.slice(0, 70)}…</em>
        </button>
      ))}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
function icsStamp(date: string, min: number) {
  return `${date.replace(/-/g, "")}T${pad(Math.floor(min / 60))}${pad(min % 60)}00`;
}
export function downloadIcs(a: Appt) {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//By Appointment Only//Demo//EN",
    "BEGIN:VEVENT",
    `UID:demo-${a.id}@byappointmentonly.test`,
    `DTSTART;TZID=Europe/London:${icsStamp(a.date, a.start)}`,
    `DTEND;TZID=Europe/London:${icsStamp(a.date, a.start + a.tell)}`,
    `SUMMARY:${a.pet} · ${a.service} (By Appointment Only)`,
    `DESCRIPTION:With ${a.stylist}. Confirmation ${a.code || "—"}. Demo event.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.pet}-appointment.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CalendarApp({ events, dayLabel }: { events: Appt[]; dayLabel: (d: string) => string }) {
  return (
    <div className="dm-cal-app">
      <h3>September 2026</h3>
      {events.length === 0 ? (
        <div className="dm-empty">
          <CalendarPlus />
          <p>No events yet. Tap “Add to calendar” in a booking message or email.</p>
        </div>
      ) : (
        [...events]
          .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
          .map((a) => (
            <article key={a.id} data-s={a.status}>
              <span>{dayLabel(a.date)}</span>
              <b>
                {toTime(a.start)}–{toTime(a.start + a.tell)} · {a.pet}
              </b>
              <small>
                {a.service} with {a.stylist}
                {a.status !== "Confirmed" ? ` · ${a.status}` : ""}
              </small>
              <button onClick={() => downloadIcs(a)}>
                <Download size={14} /> Download .ics
              </button>
            </article>
          ))
      )}
    </div>
  );
}

export function CheckoutApp({
  checkout,
  email,
  name,
  onPaid,
}: {
  checkout: Checkout;
  email: string;
  name: string;
  onPaid: (c: Checkout) => void;
}) {
  const [state, setState] = useState<"form" | "paying" | "paid">("form");
  const [card] = useState(() => ({ name, number: cycle(TEST_CARDS) }));
  return (
    <div className="dm-checkout">
      {state === "paid" ? (
        <div className="dm-paid">
          <i>✓</i>
          <h3>Payment successful</h3>
          <p>£{checkout.amount.toFixed(2)} paid · receipt sent</p>
        </div>
      ) : (
        <>
          <div className="dm-co-merchant">
            <i>BA</i>
            <div>
              <small>By Appointment Only</small>
              <b>£{checkout.amount.toFixed(2)}</b>
              <span>{checkout.label}</span>
            </div>
          </div>
          <label>
            Email
            <input readOnly value={email} />
          </label>
          <label>
            Card information
            <input readOnly value={card.number} />
            <div className="dm-co-row">
              <input readOnly value="12 / 34" />
              <input readOnly value="123" />
            </div>
          </label>
          <label>
            Name on card
            <input readOnly value={card.name} />
          </label>
          <button
            className="dm-co-pay"
            disabled={state === "paying"}
            onClick={() => {
              setState("paying");
              window.setTimeout(() => {
                setState("paid");
                onPaid(checkout);
              }, 1200);
            }}
          >
            <CreditCard size={16} />
            {state === "paying" ? "Processing…" : `Pay £${checkout.amount.toFixed(2)}`}
          </button>
          <small className="dm-co-note">
            <Lock size={11} /> Simulated checkout with prefilled test details — not a real transaction, no card is charged.
          </small>
        </>
      )}
    </div>
  );
}

function LiveCall({
  call,
  onEnd,
  onReturn,
}: {
  call: CallLog;
  onEnd: () => void;
  onReturn?: (() => void) | undefined;
}) {
  const [shown, setShown] = useState(1);
  const [secs, setSecs] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setShown(1);
    setSecs(0);
  }, [call.id]);
  useEffect(() => {
    if (shown >= call.lines.length) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 2200);
    return () => window.clearTimeout(t);
  }, [shown, call.lines.length]);
  useEffect(() => {
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [call.id]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [shown]);
  const finished = shown >= call.lines.length;
  // A call the customer never answered is not one they can hang up on: the
  // screen ends on the missed call, with a return-call affordance instead.
  if (call.missed)
    return (
      <div className="dm-native dm-live" data-call="true" data-missed="true">
        <span>{finished ? "Missed call" : "Incoming call"}</span>
        <h2>By Appointment Only</h2>
        <p>{finished ? "No answer · voicemail left" : `Ringing · Voicemail transcription`}</p>
        <div className="dm-transcript" aria-live="polite">
          {call.lines.slice(0, shown).map((l, i) =>
            l.who === "note" ? (
              <small key={i} className="dm-tx-note">{l.text}</small>
            ) : (
              <p key={i} data-who={l.who}>
                <em>{l.who === "shop" ? "BAO" : "You"}</em>“{l.text}”
              </p>
            ),
          )}
          <div ref={endRef} />
        </div>
        {finished && onReturn && (
          <>
            <button className="dm-call dm-callback" onClick={onReturn} aria-label="Return missed call">
              <PhoneCall />
            </button>
            <small className="dm-call-cap">Return missed call</small>
          </>
        )}
      </div>
    );
  return (
    <div className="dm-native dm-live" data-call="true">
      <span>{call.incoming ? "Incoming call" : "Calling"}</span>
      <h2>By Appointment Only</h2>
      <p>{finished ? "Call ended" : `${Math.floor(secs / 60)}:${pad(secs % 60)} · Live transcription`}</p>
      <div className="dm-transcript" aria-live="polite">
        {call.lines.slice(0, shown).map((l, i) =>
          l.who === "note" ? (
            <small key={i} className="dm-tx-note">{l.text}</small>
          ) : (
            <p key={i} data-who={l.who}>
              <em>{l.who === "shop" ? "BAO" : "You"}</em>“{l.text}”
            </p>
          ),
        )}
        <div ref={endRef} />
      </div>
      <button className="dm-call dm-hangup" onClick={onEnd} aria-label={finished ? "Close" : "End call"}>
        <PhoneOff />
      </button>
    </div>
  );
}

export function DialerApp({
  onCall,
  calls = [],
  live,
  onEndLive,
  onReturn,
}: {
  onCall: () => void;
  calls?: CallLog[];
  live?: CallLog;
  onEndLive?: () => void;
  onReturn?: () => void;
}) {
  if (live) return <LiveCall call={live} onEnd={() => { onEndLive?.(); }} onReturn={onReturn} />;
  return <Dialer onCall={onCall} calls={calls} onReturn={onReturn} />;
}

// Demo-only recents so the Phone app looks like a real, lived-in phone.
const FILLER_CALLS = [
  { name: "Alex (mobile)", time: "Yesterday", dir: "Outgoing" },
  { name: "Dentist", time: "Yesterday", dir: "Incoming" },
  { name: "Jordan", time: "Sunday", dir: "Missed" },
  { name: "Parcel delivery", time: "Saturday", dir: "Incoming" },
  { name: "Mum", time: "Friday", dir: "Outgoing" },
];

function Dialer({ onCall, calls = [], onReturn }: { onCall: () => void; calls?: CallLog[]; onReturn?: (() => void) | undefined }) {
  const [inCall, setInCall] = useState(false);
  const [secs, setSecs] = useState(0);
  const [vm, setVm] = useState<CallLog | null>(null);
  useEffect(() => {
    if (!inCall) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [inCall]);
  const call = () => {
    setSecs(0);
    setInCall(true);
    onCall();
  };
  if (inCall)
    return (
      <div className="dm-native" data-call="true">
        <span>By Appointment Only</span>
        <h2>{SHOP_PHONE}</h2>
        <p>{`Connected · ${Math.floor(secs / 60)}:${pad(secs % 60)}`}</p>
        <button className="dm-call dm-hangup" onClick={() => setInCall(false)} aria-label="End call">
          <PhoneOff />
        </button>
      </div>
    );
  if (vm)
    return (
      <div className="dm-recents">
        <button className="dm-mail-back" onClick={() => setVm(null)}>‹ Recents</button>
        <h3>Voicemail</h3>
        <small>By Appointment Only · {vm.time}</small>
        {vm.lines.filter((l) => l.who === "shop").map((l, i) => (
          <p key={i} className="dm-vm-text">“{l.text}”</p>
        ))}
        {vm.missed && onReturn && (
          <button className="dm-recents-return" onClick={() => { setVm(null); onReturn(); }}>
            <PhoneCall size={15} /> Call back
          </button>
        )}
      </div>
    );
  return (
    <div className="dm-recents">
      <h3>Recents</h3>
      {[...calls].reverse().map((c) => (
        <div key={c.id} className="dm-recent" data-missed={c.missed ? "true" : undefined}>
          <button className="dm-recent-main" onClick={() => (c.missed ? onReturn?.() : call())} aria-label={c.missed ? "Return missed call" : "Call By Appointment Only"}>
            <b>By Appointment Only</b>
            <small>{c.missed ? "Missed · voicemail" : c.incoming === false ? "Outgoing" : "Incoming"}</small>
          </button>
          <span className="dm-recent-time">{c.time}</span>
          {c.missed && (
            <button className="dm-recent-vm" onClick={() => setVm(c)}>Voicemail</button>
          )}
        </div>
      ))}
      {FILLER_CALLS.map((f) => (
        <div key={f.name} className="dm-recent" data-missed={f.dir === "Missed" ? "true" : undefined} data-filler="true">
          <div className="dm-recent-main">
            <b>{f.name}</b>
            <small>{f.dir}</small>
          </div>
          <span className="dm-recent-time">{f.time}</span>
        </div>
      ))}
      <button className="dm-recents-return" onClick={call}>
        <Phone size={15} /> Call By Appointment Only · {SHOP_PHONE}
      </button>
    </div>
  );
}

export function BrowserBar({ url }: { url: string }) {
  return (
    <div className="dm-urlbar">
      <Lock size={11} />
      <span>{url}</span>
    </div>
  );
}
