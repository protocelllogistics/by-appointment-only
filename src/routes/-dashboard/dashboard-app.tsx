import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { getDashboardStaffData } from "@/lib/dashboard-data.functions";
import type { HistoryData } from "./history-math";
import { BookingsScreen } from "./bookings-screen";
import { ClientsScreen } from "./clients-screen";
import { HistoryScreen } from "./history-screen";
import { PlanningScreen } from "./planning-screen";
import { RiskScreen } from "./risk-screen";
import { RotaScreen } from "./rota-screen";
import { ServicesScreen } from "./services-screen";
import { SettingsScreen } from "./settings-screen";
import { SlasScreen } from "./slas-screen";
import { TasksScreen } from "./tasks-screen";
import { TodayScreen } from "./today-screen";
import "./dashboard.css";

type DashboardData=Awaited<ReturnType<typeof getDashboardStaffData>>;
type PageName="Today"|"Tasks"|"Bookings"|"Staff rota"|"Clients & pets"|"Planning"|"Risk assessments"|"SLAs & performance"|"Services"|"History"|"Settings";
const NAV:PageName[]=["Today","Tasks","Bookings","Staff rota","Clients & pets","Planning","Risk assessments","SLAs & performance","Services","History","Settings"];
export function DashboardApp({data,history}:{data:DashboardData;history:HistoryData}){const [page,setPage]=useState<PageName>("Today");return <div className="dashboard-root"><aside className="dash-sidebar"><div className="dash-brand">By Appointment Only</div><nav className="dash-nav">{NAV.map(item=><Button key={item} variant="ghost" data-active={page===item} onClick={()=>setPage(item)}><span>{item}</span>{item==="Tasks"&&<span className="dash-badge">3</span>}</Button>)}</nav><div className="dash-sync"><i/>Synced with Google Calendar at 12:24</div></aside><main className="dash-main">{page==="Today"&&<TodayScreen/>}{page==="Tasks"&&<TasksScreen/>}{page==="Bookings"&&<BookingsScreen/>}{page==="Staff rota"&&<RotaScreen data={data}/>}{page==="Clients & pets"&&<ClientsScreen data={data} history={history} onNavigate={setPage}/>}{page==="Planning"&&<PlanningScreen data={data} history={history}/>}{page==="Risk assessments"&&<RiskScreen data={data} history={history}/>}{page==="SLAs & performance"&&<SlasScreen data={data} history={history}/>}{page==="Services"&&<ServicesScreen data={data}/>}{page==="History"&&<HistoryScreen data={data} history={history}/>}{page==="Settings"&&<SettingsScreen/>}</main></div>}
