// Proprietary appointment sizing. Server-only: never shipped to the browser.
const BASE: Record<string, number> = { "Full style": 120, "Bath & tidy": 60, "Nail trim": 20, "Puppy intro": 45 };
const BREED: Record<string, number> = { Cockapoo: 0.1, Poodle: 0.15, Spaniel: 0.05, "Shih Tzu": 0.1, "Siberian Husky": 0.35, Labrador: 0, "Domestic cat": 0.2 };
const STYLIST: Record<string, number> = { Maya: 0, Tom: 0.05, Priya: -0.05, Sam: 0.1 };

export function sizeFor(service: string, breed: string, stylist: string, newClient: boolean) {
  const base = BASE[service] ?? 60;
  const modifier = (BREED[breed] ?? 0.1) + (STYLIST[stylist] ?? 0) + (newClient ? 0.1 : 0);
  const minutes = Math.ceil((base * (1 + modifier)) / 15) * 15;
  // Index 1 needs the most allowance; Index 5 needs the least.
  const index = modifier >= 0.4 ? 1 : modifier >= 0.3 ? 2 : modifier >= 0.18 ? 3 : modifier >= 0.08 ? 4 : 5;
  return { minutes, index: index as 1 | 2 | 3 | 4 | 5, tellClient: Math.max(30, Math.round((base * (1 + modifier)) / 30) * 30) };
}
