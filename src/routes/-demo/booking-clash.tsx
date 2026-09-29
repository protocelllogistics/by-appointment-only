import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./booking-clash.css";

type Step = "start" | "times" | "details" | "race";
type Outcome = "choosing" | "securing" | "booked" | "clash";
type Choice = { time: string; day: string; stylist: string };

const services = ["Full style", "Bath & tidy", "Nail trim", "Puppy intro"];
const stylists = ["Any available", "Maya", "Tom", "Priya", "Sam"];
const whens = ["Morning", "Afternoon", "Evening"];
const times: Choice[] = [
  { time: "13:30", day: "Fri 25 Sep", stylist: "Maya" },
  { time: "14:15", day: "Fri 25 Sep", stylist: "Tom" },
  { time: "15:00", day: "Fri 25 Sep", stylist: "Priya" },
  { time: "09:15", day: "Sat 26 Sep", stylist: "Maya" },
  { time: "10:30", day: "Sat 26 Sep", stylist: "Priya" },
  { time: "11:00", day: "Sat 26 Sep", stylist: "Sam" },
];
const alternatives: Choice[] = [times[1], times[2], times[3]].filter((item): item is Choice => Boolean(item));

type Person = { side: "a" | "b"; label: string; owner: string; pet: string; breed: string; mobile: string };
const people: Person[] = [
  { side: "a", label: "You", owner: "Jo Adeyemi", pet: "Luna", breed: "Cockapoo", mobile: "07700 900418" },
  { side: "b", label: "Other customer", owner: "Chris Moreno", pet: "Pepper", breed: "Poodle", mobile: "07700 900731" },
];

export function BookingClash({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("start");
  const [service, setService] = useState("Full style");
  const [stylist, setStylist] = useState("Any available");
  const [when, setWhen] = useState("Afternoon");
  const [picked, setPicked] = useState<Choice>(times[0] as Choice);
  const [a, setA] = useState<Outcome>("choosing");
  const [b, setB] = useState<Outcome>("choosing");
  const [discounted, setDiscounted] = useState(false);
  const [logCount, setLogCount] = useState(1);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const reset = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setStep("start"); setService("Full style"); setStylist("Any available"); setWhen("Afternoon");
    setPicked(times[0] as Choice); setA("choosing"); setB("choosing"); setDiscounted(false); setLogCount(1);
  };
  const showTimes = () => { setStep("times"); setLogCount(2); };
  const chooseTime = (choice: Choice) => { setPicked(choice); setStep("details"); setLogCount(3); };
  const confirm = () => {
    setStep("race"); setA("securing"); setB("securing"); setLogCount(4);
    later(() => { setB("booked"); setLogCount(5); }, 900);
    later(() => { setA("clash"); setLogCount(6); }, 1900);
  };
  const rebook = (choice: Choice) => {
    setPicked(choice); setA("securing"); setLogCount(7);
    later(() => { setA("booked"); setDiscounted(true); setLogCount(8); }, 900);
  };
  const logs = [
    ["10:41:52", "You and another customer open the same live booking page.", "neutral"],
    ["10:42:01", "Both see the same free times. Nothing is held while browsing.", "neutral"],
    ["10:42:05", `Both choose ${picked.time}, ${picked.day} with ${picked.stylist}.`, "neutral"],
    ["10:42:07", "Both confirmations reach the booking service.", "neutral"],
    ["10:42:07.3", `${picked.time} commits first for Pepper.`, "other"],
    ["10:42:07.8", "The slot is no longer available. Luna receives three live alternatives.", "you"],
    ["10:42:15", `You choose ${picked.time} with ${picked.stylist}.`, "you"],
    ["10:42:16", "Luna is booked with £5 off. The clash is logged as a service failure, never against the customer.", "other"],
  ];
  return (
    <section className="clash" aria-label="Booking clash demonstration">
      <header className="clash-head">
        <div><span>Clash demo</span><h2>Two clients, one slot</h2><p>Your choices mirror on both phones. The first confirmed booking gets the time.</p></div>
        <div><Button variant="outline" onClick={onClose}><ArrowLeft /> Dashboard</Button><Button variant="outline" onClick={reset}><RotateCcw /> Replay</Button></div>
      </header>
      <div className="clash-grid">
        <ClashPhone person={people[0] as Person} interactive step={step} outcome={a} service={service} stylist={stylist} when={when} picked={picked} discounted={discounted} onService={setService} onStylist={setStylist} onWhen={setWhen} onShowTimes={showTimes} onPick={chooseTime} onBack={() => setStep(step === "details" ? "times" : "start")} onConfirm={confirm} onRebook={rebook} />
        <aside className="clash-log"><span>What the system sees</span>{logs.slice(0, logCount).map(([time, text, kind]) => <div key={time} data-kind={kind}><time>{time}</time><p>{text}</p></div>)}</aside>
        <ClashPhone person={people[1] as Person} step={step} outcome={b} service={service} stylist={stylist} when={when} picked={picked} discounted={false} onService={() => {}} onStylist={() => {}} onWhen={() => {}} onShowTimes={() => {}} onPick={() => {}} onBack={() => {}} onConfirm={() => {}} onRebook={() => {}} />
      </div>
    </section>
  );
}

function ClashPhone(props: { person: Person; interactive?: boolean; step: Step; outcome: Outcome; service: string; stylist: string; when: string; picked: Choice; discounted: boolean; onService: (v: string) => void; onStylist: (v: string) => void; onWhen: (v: string) => void; onShowTimes: () => void; onPick: (v: Choice) => void; onBack: () => void; onConfirm: () => void; onRebook: (v: Choice) => void }) {
  const { person, interactive, step, outcome, service, stylist, when, picked, discounted } = props;
  const status = step !== "race" ? "Browsing" : outcome === "securing" ? "Securing…" : outcome === "booked" ? "Booked" : "Clash";
  return <article className="clash-client" data-side={person.side} data-readonly={!interactive || undefined}>
    <header><i>{person.owner[0]}</i><div><b>{person.label}</b><small>{person.owner} · {person.pet}</small></div><em data-status={status}>{status}</em></header>
    <div className="clash-phone"><div className="clash-screen"><div className="clash-status"><span>10:42</span><span>● ◒ ▰</span></div>
      {step === "start" && <div className="clash-start"><small>WHISKER & CO.</small><h3>Good dog days.</h3><div className="clash-bookbox"><b>Book a visit</b><ChipGroup label="Service" values={services} value={service} set={props.onService} disabled={!interactive}/><ChipGroup label="Pet stylist" values={stylists} value={stylist} set={props.onStylist} disabled={!interactive}/><ChipGroup label="When" values={whens} value={when} set={props.onWhen} disabled={!interactive}/><Button onClick={props.onShowTimes} disabled={!interactive}>Show times</Button></div></div>}
      {step === "times" && <div className="clash-sheet"><Button variant="ghost" size="icon" aria-label="Back" onClick={props.onBack} disabled={!interactive}><ArrowLeft /></Button><small>Step 1 of 2</small><h3>Pick a time</h3><p>{service} · {stylist}</p>{["Fri 25 Sep", "Sat 26 Sep"].map(day => <section key={day}><b>{day === "Fri 25 Sep" ? "Today" : "Tomorrow"}, {day}</b><div>{times.filter(x => x.day === day).map(x => <Button variant="outline" key={x.time} onClick={() => props.onPick(x)} disabled={!interactive}><strong>{x.time}</strong><small>{x.stylist}</small></Button>)}</div></section>)}</div>}
      {step === "details" && <div className="clash-sheet"><Button variant="ghost" size="icon" aria-label="Back" onClick={props.onBack} disabled={!interactive}><ArrowLeft /></Button><small>Step 2 of 2</small><h3>Your details</h3><div className="clash-reserve">You are reserving <b>{picked.time}, {picked.day.slice(0,3)} with {picked.stylist}</b></div><p>Your appointment will last about 2 hours.</p>{[["Full name",person.owner],["Mobile",person.mobile],["Pet’s name",person.pet],["Breed",person.breed]].map(([label,value]) => <label key={label}><span>{label}</span><input value={value} readOnly /></label>)}<Button className="clash-primary" onClick={props.onConfirm} disabled={!interactive}>Confirm booking</Button></div>}
      {step === "race" && outcome === "securing" && <div className="clash-centre"><i><Sparkles /></i><h3>Fluffing the towels for {person.pet}…</h3><p>Securing your time…</p></div>}
      {step === "race" && outcome === "booked" && <div className="clash-result"><i><Check /></i><h3>{person.pet} is booked in</h3><p>Your appointment is confirmed.</p><dl><div><dt>When</dt><dd>{picked.time}, {picked.day}</dd></div><div><dt>Service</dt><dd>{service}</dd></div><div><dt>Lasts about</dt><dd>2 hours</dd></div><div><dt>Pet stylist</dt><dd>{picked.stylist}</dd></div><div><dt>Booked by</dt><dd>{person.owner}</dd></div>{discounted && <div className="clash-discount"><dt>Thank-you discount</dt><dd>−£5</dd></div>}</dl><small>A confirmation and calendar invite are on their way.</small></div>}
      {step === "race" && outcome === "clash" && <div className="clash-result clash-sorry"><h3>We’re sorry, we couldn’t confirm your booking</h3><p>Someone else booked that time just moments before you.</p><b>The closest times we have</b>{alternatives.map(x => <div className="clash-alt" key={x.time}><span><strong>{x.time} · {x.day}</strong><small>{x.stylist}</small></span><Button onClick={() => props.onRebook(x)} disabled={!interactive}>Book this time</Button></div>)}<p className="clash-thanks">We’ll take £5 off as a thank-you for choosing another time.</p></div>}
    </div></div>
  </article>;
}

function ChipGroup({ label, values, value, set, disabled }: { label: string; values: string[]; value: string; set: (v: string) => void; disabled: boolean }) {
  return <div className="clash-chips"><span>{label}</span><div>{values.map(v => <Button variant="outline" key={v} data-on={v === value} onClick={() => set(v)} disabled={disabled}>{v}</Button>)}</div></div>;
}
