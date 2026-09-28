import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./handheld.css";

type Screen = "Today" | "Tasks" | "Pets" | "Shifts";
type Visit = { pet: string; service: string; stylist: string; start: string; end: string; state: string; action?: string; note?: string; tone?: string };

const initialVisits: Visit[] = [
  { pet: "Biscuit", service: "Nail trim", stylist: "Tom", start: "08:58", end: "09:40", state: "Checked out", action: "Out 09:40" },
  { pet: "Miso", service: "Full style", stylist: "Priya", start: "09:12", end: "10:14", state: "Checked out", action: "Out 10:14" },
  { pet: "Kobe", service: "Full style", stylist: "Sam", start: "09:31", end: "11:44", state: "Checked out · note due", action: "Note", note: "Add a visit note" },
  { pet: "Luna", service: "Full style", stylist: "Maya", start: "11:02", end: "12:37", state: "Still going · +20", action: "Done", note: "Nervous of the dryer", tone: "active" },
  { pet: "Nova", service: "Full style", stylist: "Priya", start: "11:21", end: "13:06", state: "In progress", action: "Done", tone: "active" },
  { pet: "Rex", service: "Bath & tidy", stylist: "Sam", start: "11:50", end: "12:50", state: "No-show? · 28 min", action: "No-show", tone: "attention" },
  { pet: "Pip", service: "Full style", stylist: "Tom", start: "12:10", end: "13:40", state: "Late · 8 min", action: "Check in", tone: "attention" },
];

const tasks = [
  { title: "Clean and oil clipper blades", detail: "Equipment · Your set", time: "10 min" },
  { title: "Count shampoo and conditioner", detail: "Inventory · Oatmeal shampoo running low", time: "10 min" },
  { title: "Descale the hydrobath", detail: "Equipment · Due this week", time: "20 min" },
  { title: "Hand scissoring practice", detail: "Grooming skills · On your plan", time: "25 min" },
];
const pets = [
  { name: "Luna", detail: "Nervous of the dryer", time: "11:00" },
  { name: "Pepper", detail: "Fidgets when her face is dried", time: "13:30" },
];
const shifts = [
  { day: "Mon", hours: "08:30–17:30", breakTime: "Break 12:00" },
  { day: "Tue", hours: "08:30–17:30", breakTime: "Break 12:00" },
  { day: "Wed", hours: "Off", breakTime: "" },
  { day: "Thu", hours: "08:30–17:30", breakTime: "Break 12:00" },
  { day: "Fri", hours: "08:30–17:30", breakTime: "Break 12:00" },
  { day: "Sat", hours: "09:00–14:00", breakTime: "" },
];
const people = [
  { name: "Maya", detail: "Senior · large breeds" },
  { name: "Tom", detail: "Pet stylist" },
  { name: "Priya", detail: "Pet stylist · cats too" },
  { name: "Sam", detail: "Collection & drop-off" },
];

/** Presentation-only stylist work surface, shared by the actual dashboard and mobile demo. */
export function Handheld() {
  const [screen, setScreen] = useState<Screen>("Today");
  const [person, setPerson] = useState("Maya");
  const [picker, setPicker] = useState(false);
  const [scope, setScope] = useState<"Mine" | "All">("All");
  const [visits, setVisits] = useState(initialVisits);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [showNote, setShowNote] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [stillGoing, setStillGoing] = useState(false);
  const [clock, setClock] = useState("12:18");

  const current = visits.find((v) => v.pet === detail);
  const activeTasks = tasks.length - checkedTasks.length;
  const updateVisit = (pet: string, state: string, action?: string) => {
    setVisits((rows) => rows.map((v) => v.pet === pet ? { ...v, state, action, tone: state === "Checked out" ? undefined : "active" } : v));
    if (state === "Checked in" || state === "Done" || state === "Checked out") setDetail(pet);
  };

  return (
    <div className="hh" aria-label="Stylist handheld app">
      <header className="hh-top">
        <span>{clock} · {person}</span>
        <div className="hh-top-right"><span className="hh-synced"><i /> Synced</span><Button variant="ghost" className="hh-avatar" aria-label="Choose stylist" onClick={() => setPicker(true)}>{person[0]}</Button></div>
      </header>

      <main className="hh-content">
        {screen === "Today" && <>
          <div className="hh-heading"><div><span>Friday 25 September</span><h1>Today</h1></div><div className="hh-switch" aria-label="Appointments to show">{(["Mine", "All"] as const).map((s) => <Button key={s} variant="ghost" aria-pressed={scope === s} onClick={() => setScope(s)}>{s}</Button>)}</div></div>
          <div className="hh-visits">
            {visits.filter((v) => scope === "All" || v.stylist === person).map((v) => <div className="hh-visit" data-tone={v.tone || undefined} key={v.pet}>
              <Button variant="ghost" className="hh-visit-main" onClick={() => setDetail(v.pet)} aria-label={`${v.pet}, ${v.state}, appointment details`}>
                <span className="hh-visit-time"><strong>{v.start}</strong><span>{v.end}</span></span>
                <span className="hh-visit-info"><span><strong>{v.pet}</strong> <small>{v.service} · {v.stylist}</small></span><em data-state={v.state}>{v.state}</em></span>
              </Button>
              {v.action && <Button variant="ghost" className={`hh-visit-action ${v.action === "Done" ? "hh-action-teal" : v.action === "Check in" ? "hh-action-coral" : ""}`} onClick={() => v.action === "Note" ? setShowNote(v.pet) : v.action === "Out 09:40" || v.action === "Out 10:14" ? setDetail(v.pet) : v.action === "Done" ? updateVisit(v.pet, "Done", "Check out") : v.action === "Check out" ? updateVisit(v.pet, "Checked out") : v.action === "Check in" ? updateVisit(v.pet, "Checked in", "Done") : v.action === "No-show" ? updateVisit(v.pet, "No-show") : undefined}>{v.action}</Button>}
            </div>)}
          </div>
        </>}
        {screen === "Tasks" && <>
          <div className="hh-title"><span>Busy until 12:37</span><h1>Tasks</h1></div>
          <div className="hh-tasklist">{tasks.map((task) => <Button variant="ghost" className="hh-task" key={task.title} aria-pressed={checkedTasks.includes(task.title)} onClick={() => setCheckedTasks((old) => old.includes(task.title) ? old.filter((t) => t !== task.title) : [...old, task.title])}><span className="hh-check" aria-hidden="true">{checkedTasks.includes(task.title) ? "✓" : ""}</span><span className="hh-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span><b>{task.time}</b></Button>)}</div>
        </>}
        {screen === "Pets" && <>
          <div className="hh-title"><span>Your pets today · {person}</span><h1>Pets</h1></div>
          <div className="hh-petlist">{pets.map((pet) => <Button variant="ghost" className="hh-pet" key={pet.name} onClick={() => setDetail(pet.name)}><span className="hh-pet-avatar">{pet.name[0]}</span><span><strong>{pet.name}</strong><small>{pet.detail}</small></span><time>{pet.time}</time></Button>)}</div>
        </>}
        {screen === "Shifts" && <>
          <div className="hh-title"><span>Week of 28 September · {person}</span><h1>My shifts</h1></div>
          <div className="hh-shifts">{shifts.map((s) => <div key={s.day} className="hh-shift" data-off={s.hours === "Off"}><b>{s.day}</b><strong>{s.hours}</strong><span>{s.breakTime}</span></div>)}</div>
          <p className="hh-shift-note">Changes go through the front desk.</p>
        </>}
      </main>

      <nav className="hh-nav" aria-label="Handheld navigation">{(["Today", "Tasks", "Pets", "Shifts"] as Screen[]).map((s) => <Button key={s} variant="ghost" aria-current={screen === s ? "page" : undefined} onClick={() => { setScreen(s); setDetail(null); }}>{s}{s === "Tasks" && activeTasks > 0 ? <b> {activeTasks}</b> : null}</Button>)}</nav>

      {picker && <div className="hh-overlay" role="dialog" aria-modal="true" aria-label="Choose stylist"><div className="hh-overlay-content"><h2>Who’s using this terminal?</h2><p>Today, Tasks and shifts follow the stylist.</p><div className="hh-people">{people.map((p) => <Button variant="ghost" key={p.name} aria-pressed={person === p.name} onClick={() => { setPerson(p.name); setPicker(false); setScope("Mine"); }}><span className="hh-person-avatar">{p.name[0]}</span><span><strong>{p.name}</strong><small>{p.detail}</small></span></Button>)}</div><Button variant="ghost" className="hh-close" onClick={() => setPicker(false)}>Cancel</Button></div></div>}

      {current && <div className="hh-overlay" role="dialog" aria-modal="true" aria-label={`${current.pet} appointment`}><div className="hh-overlay-content hh-appointment"><div className="hh-modal-overline">{clock} · {person}</div><span className="hh-big-avatar">{current.pet[0]}</span><h2>{current.pet} {current.state === "Done" ? "is ready" : current.state.includes("Still going") ? `was due out at ${current.end}` : current.state === "Checked out" ? "checked out" : current.state}</h2><p>{current.service} · {current.stylist} · {current.state === "Checked out" ? "checked out" : `due out ${current.end}`}</p>{current.note && <p className="hh-detail-note">{current.note}</p>}
        <div className="hh-modal-actions">{current.state.includes("Still going") && <Button variant="outline" onClick={() => { setStillGoing(true); setClock("12:18"); updateVisit(current.pet, "Still going · +20", "Done"); }}>Still going{stillGoing ? " · +20" : ""}</Button>}{current.action && !current.action.startsWith("Out") && current.action !== "Note" && <Button onClick={() => current.action === "Done" ? updateVisit(current.pet, "Done", "Check out") : current.action === "Check out" ? updateVisit(current.pet, "Checked out") : current.action === "Check in" ? updateVisit(current.pet, "Checked in", "Done") : current.action === "No-show" ? updateVisit(current.pet, "No-show") : undefined}>{current.action}</Button>}{current.state === "Done" && <p>Payment and collection are confirmed separately at check out.</p>}</div><Button variant="ghost" className="hh-close" onClick={() => setDetail(null)}>Back to {screen}</Button>
      </div></div>}

      {showNote && <div className="hh-overlay" role="dialog" aria-modal="true" aria-label={`${showNote} visit note`}><div className="hh-overlay-content"><h2>{showNote} · visit note</h2><p>Choose a note for the front desk.</p><div className="hh-note-options">{["Coat care discussed", "Comfort break needed", "Follow-up recommended"].map((text) => <Button key={text} variant="ghost" aria-pressed={note === text} onClick={() => setNote(text)}>{text}</Button>)}</div><Button disabled={!note} onClick={() => { setVisits((old) => old.map((v) => v.pet === showNote ? { ...v, state: "Checked out", action: undefined, note: note ?? undefined } : v)); setNote(null); setShowNote(null); }}>Save note</Button><Button variant="ghost" className="hh-close" onClick={() => { setShowNote(null); setNote(null); }}>Cancel</Button></div></div>}
    </div>
  );
}