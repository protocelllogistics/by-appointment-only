export type FictionalContact = { name: string; mobile: string; email: string };

const GIVEN_NAMES = ["Alex", "Ari", "Casey", "Jamie", "Jordan", "Morgan", "Quinn", "Riley", "Robin", "Taylor"];
const FAMILY_NAMES = ["Bell", "Clarke", "Ellis", "Gray", "Lane", "Morgan", "Reed", "Shaw", "Taylor", "Wood"];

function randomIndex(length: number) {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return (value[0] ?? 0) % length;
  }
  return Math.floor(Math.random() * length);
}

export function createFictionalContact(): FictionalContact {
  const given = GIVEN_NAMES[randomIndex(GIVEN_NAMES.length)] ?? "Alex";
  const family = FAMILY_NAMES[randomIndex(FAMILY_NAMES.length)] ?? "Morgan";
  const suffix = String(100 + randomIndex(900));
  return {
    name: `${given} ${family}`,
    mobile: `07700 900${suffix}`,
    email: `${given}.${family}.${suffix}@example.com`.toLowerCase(),
  };
}