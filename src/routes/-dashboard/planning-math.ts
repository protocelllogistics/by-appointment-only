import type { getDashboardStaffData } from "@/lib/dashboard-data.functions";
import type { SeedRow } from "@/lib/dashboard-history.functions";
import { average, duration, median, type HistoryData } from "./history-math";
export type PlanningData=Awaited<ReturnType<typeof getDashboardStaffData>>;
export const round10=(n:number)=>Math.round(n/10)*10;
export const round5=(n:number)=>Math.round(n/5)*5;
export function planningMetrics(data:PlanningData,history:HistoryData,includeGuests:boolean){
 const petMap=new Map(history.pets.map(p=>[p["pet_id"],p]));const breedMap=new Map(data.breeds.map(b=>[b.breed_id,b.name]));
 const all=history.bookings.filter(b=>b["checked_in"]&&b["checked_out"]&&(b["date"]??"")<"2026-09-25"&&(includeGuests||petMap.get(b["pet_id"])?.["special_guest"]!=="Y"));
 const prior=all.filter(b=>(b["date"]??"")<"2026-08-25");
 const overrun=(visits:SeedRow[])=>{const over=visits.filter(b=>+(b["ran_past_booked_min"]??0)>0);return {rate:visits.length?Math.round(over.length/visits.length*100):0,avg:over.length?Math.round(average(over.map(b=>+(b["ran_past_booked_min"]??0)))):0}};
 const metrics=(records:SeedRow[])=>{
  const services=new Map(data.services.map(s=>{const visits=records.filter(b=>b["service_id"]===s.service_id),med=median(visits.map(duration).filter((n):n is number=>n!==null)),over=overrun(visits);return [s.service_id,{visits,med,over,std:med!=null?Math.max(10,round10(med)):s.standard_min??0,buffer:over.rate>=35?20:over.rate>=20?15:10}] as const}));
  const pace=(sid:string)=>{const rates=records.filter(b=>b["staff_id"]===sid).map(b=>{const m=services.get(b["service_id"]??"")?.med;const d=duration(b);return m&&d!==null?d/m-1:null}).filter((n):n is number=>n!==null);const med=median(rates);return rates.length>=10&&med!=null?round5(med*100):0};
  const extra=(pid:string)=>{const visits=records.filter(b=>b["pet_id"]===pid),adds=history.behaviour.filter(n=>n["pet_id"]===pid).reduce((a,n)=>a+(+(n["adds_min"]??0)),0),o=overrun(visits);return round10(adds+(o.rate>=30?o.avg:0))};
  const breedExtra=(breed:string,id:string)=>{const service=services.get(id),visits=service?.visits.filter(b=>breedMap.get(petMap.get(b["pet_id"])?.["breed_id"]??"")===breed)??[],med=median(visits.map(duration).filter((n):n is number=>n!==null));return visits.length>=5&&med!=null&&service?.med!==null&&service?.med!==undefined?round10(med-service.med):0};
  return {services,pace,extra,breedExtra};
 };
 return {current:metrics(all),previous:metrics(prior),all,overrun,petMap,breedMap};
}
