import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardStaffData = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [staffResult, rotaResult, exceptionsResult, shiftsResult, servicesResult, sopResult, inventoryResult, serviceStaffResult, breedsResult] = await Promise.all([
    supabaseAdmin.from("staff").select("*").order("staff_id"),
    supabaseAdmin.from("rota").select("*").order("staff_id").order("weekday"),
    supabaseAdmin.from("rota_exceptions").select("*").order("date", { ascending: false }).limit(100),
    supabaseAdmin.from("staff_shifts").select("*").order("date", { ascending: false }).limit(600),
    supabaseAdmin.from("services").select("service_id,name,standard_min,client_about,species,rule,visit_count,display_order").not("service_id", "is", null).order("display_order"),
    supabaseAdmin.from("service_sop").select("*").order("service_id").order("step"),
    supabaseAdmin.from("service_inventory").select("*").order("service_id").order("item"),
    supabaseAdmin.from("service_staff").select("*").order("service_id").order("staff_id"),
    supabaseAdmin.from("breeds").select("*").order("breed_id"),
  ]);

  const error = staffResult.error ?? rotaResult.error ?? exceptionsResult.error ?? shiftsResult.error ?? servicesResult.error ?? sopResult.error ?? inventoryResult.error ?? serviceStaffResult.error ?? breedsResult.error;
  if (error) throw new Error("Could not load Dashboard data");

  return {
    staff: staffResult.data ?? [],
    rota: rotaResult.data ?? [],
    exceptions: exceptionsResult.data ?? [],
    shifts: shiftsResult.data ?? [],
    services: servicesResult.data ?? [],
    serviceSop: sopResult.data ?? [],
    serviceInventory: inventoryResult.data ?? [],
    serviceStaff: serviceStaffResult.data ?? [],
    breeds: breedsResult.data ?? [],
  };
});

const serviceInput = z.object({
  originalServiceId: z.string().trim().min(1).nullable(),
  serviceId: z.string().trim().min(1).max(24),
  name: z.string().trim().min(1).max(120),
  standardMin: z.number().int().positive().max(1440),
  clientAbout: z.string().trim().min(1).max(120),
  species: z.array(z.enum(["Dog", "Cat"])).min(1),
  rule: z.string().trim().max(500),
  sop: z.array(z.string().trim().min(1).max(500)).max(50),
  inventory: z.array(z.object({ item: z.string().trim().min(1).max(120), qty: z.string().trim().min(1).max(80) })).max(50),
  qualifications: z.array(z.object({ staffId: z.string().trim().min(1), qualified: z.enum(["Y", "N"]) })).max(100),
});

export const saveDashboardService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => serviceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !isAdmin) throw new Error("Only an administrator can save services");

    const isNew = data.originalServiceId === null;
    if (!isNew && data.originalServiceId !== data.serviceId) throw new Error("Service ID cannot be changed");
    const serviceRow = {
      service_id: data.serviceId,
      name: data.name,
      standard_min: data.standardMin,
      duration_minutes: data.standardMin,
      client_about: data.clientAbout,
      species: data.species.map((item) => item.toLowerCase()).join("|"),
      rule: data.rule || null,
      active: true,
    };
    const serviceQuery = isNew
      ? context.supabase.from("services").insert(serviceRow)
      : context.supabase.from("services").update(serviceRow).eq("service_id", data.serviceId);
    const { error: serviceError } = await serviceQuery;
    if (serviceError) throw new Error("Could not save service");

    const childTables = ["service_sop", "service_inventory", "service_staff"] as const;
    for (const table of childTables) {
      const { error } = await context.supabase.from(table).delete().eq("service_id", data.serviceId);
      if (error) throw new Error("Could not replace related service rows");
    }
    if (data.sop.length) {
      const { error } = await context.supabase.from("service_sop").insert(data.sop.map((instruction, index) => ({ service_id: data.serviceId, step: index + 1, instruction })));
      if (error) throw new Error("Could not save service steps");
    }
    if (data.inventory.length) {
      const { error } = await context.supabase.from("service_inventory").insert(data.inventory.map((item) => ({ service_id: data.serviceId, item: item.item, qty_per_visit: item.qty })));
      if (error) throw new Error("Could not save service inventory");
    }
    if (data.qualifications.length) {
      const { error } = await context.supabase.from("service_staff").insert(data.qualifications.map((item) => ({ service_id: data.serviceId, staff_id: item.staffId, qualified: item.qualified })));
      if (error) throw new Error("Could not save service qualifications");
    }
    return { ok: true as const, serviceId: data.serviceId };
  });