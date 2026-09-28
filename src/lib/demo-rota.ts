// Demo staff rota (ISO weekday 1=Mon … 7=Sun). Used until the real rota is loaded.
export type RotaShift = { start: string; end: string; breakStart?: string; breakMin?: number };
export const DEMO_ROTA: Record<string, Partial<Record<number, RotaShift>>> = {
  Maya: { 1: { start: "09:00", end: "17:00", breakStart: "12:30", breakMin: 30 }, 2: { start: "09:00", end: "17:00", breakStart: "12:30", breakMin: 30 }, 3: { start: "09:00", end: "17:00", breakStart: "12:30", breakMin: 30 }, 5: { start: "09:00", end: "17:00", breakStart: "12:30", breakMin: 30 }, 6: { start: "09:00", end: "15:00" } },
  Tom: { 1: { start: "09:30", end: "17:30", breakStart: "13:00", breakMin: 30 }, 2: { start: "09:30", end: "17:30", breakStart: "13:00", breakMin: 30 }, 4: { start: "09:30", end: "17:30", breakStart: "13:00", breakMin: 30 }, 5: { start: "09:30", end: "17:30", breakStart: "13:00", breakMin: 30 }, 6: { start: "09:30", end: "15:30" } },
  Priya: { 2: { start: "10:00", end: "18:00", breakStart: "13:30", breakMin: 30 }, 3: { start: "10:00", end: "18:00", breakStart: "13:30", breakMin: 30 }, 4: { start: "10:00", end: "18:00", breakStart: "13:30", breakMin: 30 }, 5: { start: "10:00", end: "18:00", breakStart: "13:30", breakMin: 30 } },
  Sam: { 1: { start: "09:00", end: "16:30", breakStart: "12:00", breakMin: 30 }, 3: { start: "09:00", end: "16:30", breakStart: "12:00", breakMin: 30 }, 4: { start: "09:00", end: "16:30", breakStart: "12:00", breakMin: 30 }, 5: { start: "09:00", end: "16:30", breakStart: "12:00", breakMin: 30 } },
};
export const STYLISTS = Object.keys(DEMO_ROTA);

export const toMin = (t: string) => { const [h = 0, m = 0] = t.split(":").map(Number); return h * 60 + m; };
export const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const isoWeekday = (date: string) => { const d = new Date(`${date}T12:00:00Z`).getUTCDay(); return d === 0 ? 7 : d; };
export const addDays = (date: string, n: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export type Busy = { stylist: string; date: string; start: number; end: number };

/** Free start times for one stylist on one date, given a required length and existing bookings. */
export function freeStarts(stylist: string, date: string, minutes: number, busy: Busy[], step = 15, after = 0) {
  const shift = DEMO_ROTA[stylist]?.[isoWeekday(date)];
  if (!shift) return [];
  const s = toMin(shift.start), e = toMin(shift.end);
  const bs = shift.breakStart ? toMin(shift.breakStart) : -1, be = bs + (shift.breakMin ?? 0);
  const out: number[] = [];
  for (let t = Math.max(s, after); t + minutes <= e; t += step) {
    if (bs >= 0 && t < be && t + minutes > bs) continue;
    if (busy.some((b) => b.stylist === stylist && b.date === date && t < b.end && t + minutes > b.start)) continue;
    out.push(t);
  }
  return out;
}

/** Rows in the public availability shape, thinned to a readable handful per stylist per day. */
export function demoPublicSlots(from: string, days: number, minutes: number, stylist: string | null) {
  const rows: { slot_date: string; starts_at: string; staff_name: string }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);
    for (const name of STYLISTS) {
      if (stylist && stylist !== "Any available" && stylist !== name) continue;
      freeStarts(name, date, minutes, [], 15).filter((_, idx) => idx % 8 === (STYLISTS.indexOf(name) * 3) % 8)
        .forEach((t) => rows.push({ slot_date: date, starts_at: `${toTime(t)}:00`, staff_name: name }));
    }
  }
  return rows.sort((a, b) => (a.slot_date + a.starts_at).localeCompare(b.slot_date + b.starts_at));
}
