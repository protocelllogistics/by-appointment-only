import type { Index } from "@/lib/demo-allocation";

export type Status = "Confirmed" | "Checked in" | "In progress" | "Checked out" | "Cancelled" | "No-show";
export const ACTIVE: Status[] = ["Confirmed", "Checked in", "In progress"];
export type Size = { minutes: number; index: Index; tellClient: number };
export type Appt = {
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
  standard: number;
  minutes: number;
  index: Index;
  tell: number;
  status: Status;
  source: "Online" | "Phone" | "Google Calendar" | "Walk-in";
  lateBy?: number;
  overrun?: number;
  calendarMinutes?: number;
  mine: boolean;
  notes: string;
  flags?: string[];
  inCalendar?: boolean;
  paid?: string[];
};
export type LinkAction =
  | "reschedule"
  | "cancel"
  | "rebook"
  | "ics"
  | "pay-late"
  | "pay-noshow"
  | "pay-advance"
  | "call";
export type Channel = "Messages" | "Email";
export type Msg = {
  id: number;
  channel: Channel;
  from: "shop" | "me";
  time: string;
  subject?: string | undefined;
  text: string;
  apptId?: number;
  actions?: LinkAction[];
  call?: boolean;
  calendar?: boolean;
};
export type CallLog = { id: number; time: string; subject: string; lines: { who: "shop" | "me"; text: string }[] };
export type Checkout = { kind: "pay-late" | "pay-noshow" | "pay-advance"; apptId: number; amount: number; label: string };
