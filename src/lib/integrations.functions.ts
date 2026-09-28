import { createServerFn } from "@tanstack/react-start";

export type ConnectionStatus = { name: string; note: string; state: "connected" | "ready" | "not_connected" };

// Reports real working conditions instead of a static "Connected" label.
export const getConnectionStatus = createServerFn({ method: "GET" }).handler(async (): Promise<ConnectionStatus[]> => {
  const { calendarCredentials } = await import("./calendar-sync.server");
  const calendarLinked = calendarCredentials() !== null;
  return [
    {
      name: "Google Calendar",
      note: calendarLinked ? "Linked. New appointments only; sync not switched on yet" : "Sync is set up but not linked to a calendar yet",
      state: calendarLinked ? "ready" : "not_connected",
    },
    { name: "Accounting", note: "Daily summary with invoices, VAT and commission. Not set up", state: "not_connected" },
    { name: "WhatsApp Business", note: "Chase, clash and collection messages. Not set up", state: "not_connected" },
  ];
});
