// Demo-only allocation maths. Staff see a buffered allocation derived from the
// risk Index; customers are told a clean figure that is the allocation or
// exactly ±15 / ±30 minutes from it.
export type Index = 1 | 2 | 3 | 4 | 5;

export const STANDARD_MIN: Record<string, number> = {
  "Full style": 120,
  "Bath & tidy": 60,
  "Nail trim": 30,
  "Puppy intro": 45,
};
// Demo prices used for fee / pay-in-advance links (illustrative only).
export const PRICE_GBP: Record<string, number> = {
  "Full style": 65,
  "Bath & tidy": 40,
  "Nail trim": 15,
  "Puppy intro": 30,
};
export const LATE_FEE_GBP = 10;
export const NO_SHOW_FEE_GBP = 25;

// Lower Index = higher risk = larger operational margin.
const FACTOR: Record<Index, number> = { 1: 1.6, 2: 1.35, 3: 1.15, 4: 1, 5: 0.9 };
// What the customer hears relative to the allocation.
const TELL_OFFSET: Record<Index, -30 | -15 | 0 | 15 | 30> = { 1: -30, 2: -15, 3: 0, 4: 0, 5: 15 };

const round15 = (m: number) => Math.max(15, Math.round(m / 15) * 15);
export const clampIndex = (n: number): Index => Math.min(5, Math.max(1, Math.round(n))) as Index;

export type Allocation = {
  index: Index;
  standard: number;
  minutes: number; // allocated in the diary
  buffer: number; // minutes vs standard (can be negative)
  tell: number; // told to the customer
  offset: -30 | -15 | 0 | 15 | 30;
};

export function allocate(service: string, index: number): Allocation {
  const i = clampIndex(index);
  const standard = STANDARD_MIN[service] ?? 60;
  const minutes = round15(standard * FACTOR[i]);
  const offset = TELL_OFFSET[i];
  return { index: i, standard, minutes, buffer: minutes - standard, tell: Math.max(15, minutes + offset), offset };
}

export const offsetLabel = (o: number) =>
  o === 0 ? "same as allocated" : `${o > 0 ? "+" : "−"}${Math.abs(o)} min vs allocated`;
