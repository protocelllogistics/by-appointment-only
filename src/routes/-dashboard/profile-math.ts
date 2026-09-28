import type { SeedRow } from "@/lib/dashboard-history.functions";
import type { HistoryData } from "./history-math";
import { isConfirmedNoShow, isLateCancel, isOnTime, isVisit } from "./history-math";

/**
 * Client and pet profile figures, derived from bookings_history and
 * behaviour_notes only. Rule 1 of the seed README: derive, never store.
 * Validated against derived_client_profiles.csv (all 12 named pets).
 *   visit          = the booking has a check-in time
 *   on time        = late_min <= 5
 *   no-show        = status no_show_confirmed
 *   late cancel    = status late_cancel
 *   extra time     = sum of behaviour_notes.adds_min for the pet
 */
export type Reliability = "Reliable" | "Mostly reliable" | "Unreliable" | "New";

export type PetProfile = {
  petId: string;
  petName: string;
  species: string;
  breedId: string;
  specialGuest: boolean;
  requiredStaffId: string;
  clientId: string;
  clientName: string;
  phone: string;
  email: string;
  preferredContact: string;
  named: boolean;
  firstVisit: string | null;
  lastVisit: string | null;
  visits: number;
  onTimePct: number | null;
  noShows: number;
  lateCancels: number;
  lastMinute: number;
  reliability: Reliability;
  extraTimeMin: number;
  notes: SeedRow[];
  bookings: SeedRow[];
};

export function reliabilityOf(visits: number, onTimePct: number | null, noShows: number, lateCancels: number): Reliability {
  if (visits < 3) return "New";
  if (noShows >= 2 || (onTimePct !== null && onTimePct < 60)) return "Unreliable";
  if (onTimePct !== null && onTimePct >= 90 && noShows === 0 && lateCancels <= 1) return "Reliable";
  return "Mostly reliable";
}

function groupBy(rows: SeedRow[], key: string) {
  const map = new Map<string, SeedRow[]>();
  for (const row of rows) {
    const id = row[key] ?? "";
    const list = map.get(id);
    if (list) list.push(row);
    else map.set(id, [row]);
  }
  return map;
}

export function buildPetProfiles(history: HistoryData): PetProfile[] {
  const clients = new Map(history.clients.map((c) => [c["client_id"], c]));
  const byPet = groupBy(history.bookings, "pet_id");
  const notesByPet = groupBy(history.behaviour, "pet_id");

  return history.pets.map((pet) => {
    const petId = pet["pet_id"] ?? "";
    const client = clients.get(pet["client_id"] ?? "");
    const bookings = (byPet.get(petId) ?? []).sort((a, b) =>
      `${a["date"]}${a["start"]}`.localeCompare(`${b["date"]}${b["start"]}`),
    );
    const businessFailureIds=new Set(history.failures.filter(row=>row["counts_against_client"]!=="Y").map(row=>row["booking_id"]));
    const accountable=bookings.filter(row=>!businessFailureIds.has(row["booking_id"])&&!row["delay_cause"]);
    const visited = accountable.filter(isVisit);
    const onTime = visited.filter(isOnTime).length;
    const onTimePct = visited.length ? Math.round((onTime / visited.length) * 100) : null;
    const noShows = accountable.filter(isConfirmedNoShow).length;
    const lateCancels = accountable.filter(isLateCancel).length;
    const notes = notesByPet.get(petId) ?? [];

    return {
      petId,
      petName: pet["name"] ?? petId,
      species: pet["species"] ?? "",
      breedId: pet["breed_id"] ?? "",
      specialGuest: pet["special_guest"] === "Y",
      requiredStaffId: pet["required_staff_id"] ?? "",
      clientId: pet["client_id"] ?? "",
      clientName: client?.["name"] ?? pet["client_id"] ?? "",
      phone: client?.["phone"] ?? "",
      email: client?.["email"] ?? "",
      preferredContact: client?.["preferred_contact"] ?? "",
      named: client?.["named"] === "Y",
      firstVisit: visited[0]?.["date"] ?? null,
      lastVisit: visited[visited.length - 1]?.["date"] ?? null,
      visits: visited.length,
      onTimePct,
      noShows,
      lateCancels,
      lastMinute: bookings.filter((b) => Number(b["lead_hours"] ?? Infinity) < 24).length,
      reliability: reliabilityOf(visited.length, onTimePct, noShows, lateCancels),
      extraTimeMin: notes.reduce((total, note) => total + +(note["adds_min"] ?? 0), 0),
      notes,
      bookings,
    };
  });
}
