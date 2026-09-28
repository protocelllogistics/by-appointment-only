// Google Calendar sync infrastructure (not yet activated).
// Only NEW appointments are routed: callers pass a cursor (last synced
// created_at) and only bookings created after it are pushed.
export const CALENDAR_GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

export type CalendarAppointment = {
  bookingId: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  petName: string;
  serviceName: string;
  stylistName: string;
};

export function calendarCredentials() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  return lovableKey && connectionKey ? { lovableKey, connectionKey } : null;
}

export function selectNewAppointments(rows: CalendarAppointment[], since: string | null) {
  return rows.filter((row) => !since || row.createdAt > since).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function toCalendarEvent(row: CalendarAppointment, timeZone = "Europe/London") {
  return {
    summary: `${row.petName} · ${row.serviceName}`,
    description: `Pet stylist: ${row.stylistName}\nBooking: ${row.bookingId}`,
    start: { dateTime: `${row.date}T${row.start}:00`, timeZone },
    end: { dateTime: `${row.date}T${row.end}:00`, timeZone },
    extendedProperties: { private: { bookingId: row.bookingId } },
  };
}

export async function pushAppointment(row: CalendarAppointment, calendarId = "primary") {
  const creds = calendarCredentials();
  if (!creds) throw new Error("Google Calendar is not connected");
  const res = await fetch(`${CALENDAR_GATEWAY_URL}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.lovableKey}`,
      "X-Connection-Api-Key": creds.connectionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toCalendarEvent(row)),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Calendar push failed [${res.status}]: ${body}`);
    throw new Error(`Calendar push failed [${res.status}]: ${body}`);
  }
  return (await res.json()) as { id: string };
}
