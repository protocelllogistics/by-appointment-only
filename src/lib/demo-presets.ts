// Pre-written demo content: visitors pick, never type, so no real details are collected.
export const NOTE_PRESETS = [
  "First visit with you",
  "Nervous with strangers",
  "Sensitive to the blow dryer",
  "Sensitive paws",
  "Matted coat",
  "Older pet, needs breaks",
  "Short cut please",
  "Keep the length",
];
export const PET_NAMES = ["Biscuit", "Maple", "Pickle", "Bramble", "Nugget", "Olive", "Pip", "Rolo"];
export const REPLY_PRESETS = [
  "Thanks, see you then!",
  "Could we come 15 minutes earlier?",
  "Running a few minutes late, sorry!",
  "Is parking available nearby?",
  "Can we add a nail trim?",
];
export const CARDHOLDERS = ["Alex Morgan", "Jordan Ellis", "Casey Reed", "Riley Lane", "Quinn Gray", "Robin Shaw"];
export const TEST_CARDS = ["4242 4242 4242 4242", "5555 5555 5555 4444", "4000 0566 5566 5556"];
export const PRICE_GBP_PUBLIC: Record<string, number> = {
  "Full style": 65,
  "Bath & tidy": 40,
  "Nail trim": 15,
  "Puppy intro": 30,
};
let turn = 0;
/** Returns the next item of a list, cycling so each visitor sees varied mock details. */
export const cycle = <T,>(list: T[]): T => list[turn++ % list.length]!;
/** Random 6-character uppercase hex confirmation number. */
export const hexCode = () =>
  Array.from({ length: 6 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");
export const toggleNote = (notes: string, n: string) => {
  const set = notes ? notes.split(" · ") : [];
  const next = set.includes(n) ? set.filter((x) => x !== n) : [...set, n];
  return next.join(" · ");
};
/** Builds a downloadable .ics data URL for a booked visit. */
export function icsHref(o: { title: string; date: string; start: string; minutes: number; code: string; who: string }) {
  const [h, m] = o.start.split(":").map(Number) as [number, number];
  const d = o.date.replace(/-/g, "");
  const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}${String(min % 60).padStart(2, "0")}00`;
  const s = h * 60 + m;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//By Appointment Only//Demo//EN",
    "BEGIN:VEVENT",
    `UID:${o.code}@byappointmentonly.test`,
    `DTSTART:${d}T${fmt(s)}`,
    `DTEND:${d}T${fmt(s + o.minutes)}`,
    `SUMMARY:${o.title}`,
    `DESCRIPTION:With ${o.who}. Confirmation ${o.code}. Demo event.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}
