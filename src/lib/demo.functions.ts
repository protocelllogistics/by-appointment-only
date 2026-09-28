import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { demoContactSchema, demoEditableSchema } from "./demo-validation";

const STYLISTS = ["Maya", "Tom", "Priya", "Sam"] as const;

// Returns only the sized result per stylist; the model itself stays on the server. No data is stored.
export const sizeDemoAppointment = createServerFn({ method: "POST" })
  .validator((d) => z.object({ service: z.string().max(40), breed: z.string().max(40), newClient: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const { sizeFor } = await import("./demo-model.server");
    return Object.fromEntries(STYLISTS.map((s) => [s, sizeFor(data.service, data.breed, s, data.newClient)]));
  });

// Server-side re-check of contact details (nothing is saved).
export const checkDemoContact = createServerFn({ method: "POST" })
  .validator((d) => demoContactSchema.parse(d))
  .handler(async () => ({ ok: true as const }));

export const checkDemoEditable = createServerFn({ method: "POST" })
  .validator((data) => demoEditableSchema.parse(data))
  .handler(async () => ({ ok: true as const }));
