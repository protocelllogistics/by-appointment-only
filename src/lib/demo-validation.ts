import { z } from "zod";

// Only name, email and phone (plus the pet's name) may be captured.
// Anything that looks like a secret, password, profanity or unreadable text is refused.
const PROFANITY = ["fuck", "shit", "cunt", "bitch", "bastard", "wanker", "twat", "dick", "piss", "arse", "slut", "whore", "nigg", "fag", "retard"];
const SECRET_HINTS = /(pass(word)?|pwd|secret|token|api[_-]?key|sk_|pk_|bearer|pin\b|cvv|iban|sort\s?code|ssn|nino|login)/i;
const UNREADABLE = /[^\p{L}\p{M}\p{N}\p{Zs}.,'’@+()\-_]/u;
const CARD = /\b(?:\d[ -]?){13,19}\b/;

function looksLikeSecret(value: string) {
  if (SECRET_HINTS.test(value)) return true;
  const compact = value.replace(/\s/g, "");
  // Random-looking token: long, no spaces, mixes letters with digits/symbols.
  return compact.length >= 12 && !/\s/.test(value.trim()) && /\d/.test(compact) && /[a-z]/i.test(compact) && !compact.includes("@");
}
function hasProfanity(value: string) {
  const v = value.toLowerCase().replace(/[^a-z]/g, "");
  return PROFANITY.some((w) => v.includes(w));
}
function safeText(label: string, max: number, pattern: RegExp, hint: string) {
  return z.string().trim().min(1, `${label} is needed`).max(max, `${label} is too long`)
    .refine((v) => !UNREADABLE.test(v), `${label} has characters we can't read`)
    .refine((v) => !hasProfanity(v), `Please keep ${label.toLowerCase()} polite`)
    .refine((v) => !looksLikeSecret(v) && !CARD.test(v), `Don't enter passwords, codes or card numbers`)
    .refine((v) => pattern.test(v), hint);
}

const NAME = /^[\p{L}][\p{L}\p{M}' .\-]*$/u;
export const demoContactSchema = z.object({
  clientName: safeText("Your name", 60, NAME, "Use letters only"),
  petName: safeText("Pet's name", 30, NAME, "Use letters only"),
  mobile: z.string().trim().refine((v) => /^\+?[\d ()-]{10,16}$/.test(v) && v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 13, "Enter a valid mobile number"),
  email: z.string().trim().max(120).email("Enter a valid email")
    .refine((v) => !UNREADABLE.test(v) && !hasProfanity(v.split("@")[0] ?? "") && !SECRET_HINTS.test(v), "Use a normal email address"),
});
export type DemoContact = z.infer<typeof demoContactSchema>;

export const demoEditableSchema = z.object({
  petName: safeText("Pet's name", 30, NAME, "Use letters only"),
  notes: z.string().trim().max(300, "Notes are too long")
    .refine((v) => !UNREADABLE.test(v), "Notes have characters we can't read")
    .refine((v) => !hasProfanity(v), "Please keep notes polite")
    .refine((v) => !looksLikeSecret(v) && !CARD.test(v), "Don't enter passwords, codes or card numbers"),
});

export function validateContact(input: unknown) {
  const r = demoContactSchema.safeParse(input);
  if (r.success) return { ok: true as const, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) { const k = String(issue.path[0]); errors[k] ??= issue.message; }
  return { ok: false as const, errors };
}

export function validateDemoEditable(input: unknown) {
  const result = demoEditableSchema.safeParse(input);
  if (result.success) return { ok: true as const, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) errors[String(issue.path[0])] ??= issue.message;
  return { ok: false as const, errors };
}
