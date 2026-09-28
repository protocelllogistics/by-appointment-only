import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Booking service is unavailable");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const availabilityInput = z.object({
  from: z.string().date(),
  service: z.enum(["Full style", "Bath & tidy", "Nail trim", "Puppy intro"]),
  stylist: z.string().max(80),
  when: z.enum(["Earliest", "Morning", "Afternoon"]),
});

export const getPublicAvailability = createServerFn({ method: "GET" })
  .inputValidator((data) => availabilityInput.parse(data))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("list_public_slots", {
      _from: data.from,
      _days: 18,
      _service: data.service,
      _stylist: data.stylist,
    });
    if (error) console.error("Availability lookup failed, using demo rota:", error.message);
    let list = error ? [] : rows ?? [];
    if (!list.length) {
      // Real rota not loaded yet: show times from the demo staff rota.
      const { demoPublicSlots } = await import("./demo-rota");
      const minutes = { "Full style": 120, "Bath & tidy": 60, "Nail trim": 30, "Puppy intro": 45 }[data.service];
      list = demoPublicSlots(data.from, 18, minutes, data.stylist || null);
    }
    return list.filter((row) => data.when === "Earliest" || (data.when === "Morning" ? row.starts_at < "12:00:00" : row.starts_at >= "12:00:00"));
  });

const bookingInput = z.object({
  service: z.string().min(1), staff: z.string().min(1), date: z.string().date(), starts: z.string().min(5),
  clientName: z.string().trim().min(1), mobile: z.string().trim().min(1), email: z.string().email(),
  petName: z.string().trim().min(1), breed: z.string().min(1), notes: z.string().max(1000),
});

export const createPublicBooking = createServerFn({ method: "POST" })
  .inputValidator((data) => bookingInput.parse(data))
  .handler(async ({ data }) => {
    const { data: id, error } = await publicClient().rpc("create_public_booking", {
      _service: data.service, _staff: data.staff, _date: data.date, _starts: data.starts,
      _client_name: data.clientName, _mobile: data.mobile, _email: data.email,
      _pet_name: data.petName, _breed: data.breed, _notes: data.notes,
    });
    if (error) {
      if (error.message.includes("SLOT_TAKEN")) return { ok: false as const, reason: "taken" as const };
      throw new Error("Could not confirm booking");
    }
    return { ok: true as const, id };
  });
