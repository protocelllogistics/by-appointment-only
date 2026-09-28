import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Exact CSV resources embedded in the supplied dashboard HTML. Read-only design data;
// no records are inserted into the database until the canonical migration is requested.
const files = {
  bookings: "bookings_history", clients: "clients", pets: "pets", behaviour: "behaviour_notes",
  events: "booking_events", notes: "health_style_log", failures: "service_failures",
} as const;
export type SeedRow = Record<string, string>;
function csv(text:string):SeedRow[]{
 const lines:string[][]=[];let row:string[]=[],cell="",quoted=false;
 for(let i=0;i<text.length;i++){
  const char=text[i];if(quoted){if(char==='"'){if(text[i+1]==='"'){cell+='"';i++}else quoted=false}else cell+=char}
  else if(char==='"')quoted=true;else if(char===','){row.push(cell);cell=""}else if(char==='\n'){row.push(cell);lines.push(row);row=[];cell=""}else if(char!=='\r')cell+=char;
 }
 if(cell||row.length){row.push(cell);lines.push(row)}
 const [header=[],...data]=lines;return data.filter(r=>r.length>1).map(r=>Object.fromEntries(header.map((key,i)=>[key,r[i]??""])));
}
// Tables already seeded from the canonical CSVs; read from the database and
// keep the file as the fallback until every table has been loaded.
const seededTables={clients:"clients",pets:"pets",behaviour:"behaviour_notes"} as const;
const stringify=(rows:Record<string,unknown>[]):SeedRow[]=>rows.map(row=>
 Object.fromEntries(Object.entries(row).map(([key,value])=>[key,value===null||value===undefined?"":String(value)])));

export const getDashboardHistory = createServerFn({method:"GET"}).handler(async()=>{
 // Seeding happens one table at a time, so a file or table that has not arrived
 // yet reads as an empty set instead of breaking the Dashboard.
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const pairs=await Promise.all(Object.entries(files).map(async ([key,file])=>{
  const table=seededTables[key as keyof typeof seededTables];
  if(table){
   const { data, error } = await supabaseAdmin.from(table).select("*");
   if(!error&&data&&data.length) return [key,stringify(data as Record<string,unknown>[])] as const;
  }
  const path=fileURLToPath(new URL(`../data/dashboard-seed/${file}.csv`,import.meta.url));
  try{const content=await readFile(path,"utf8");return [key,csv(content)] as const}
  catch{return [key,[] as SeedRow[]] as const}
 }));
 return Object.fromEntries(pairs) as { [K in keyof typeof files]:SeedRow[] };
});
