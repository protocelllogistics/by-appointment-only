import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStaffData } from "@/lib/dashboard-data.functions";
import { getDashboardHistory } from "@/lib/dashboard-history.functions";
import { DashboardApp } from "../-dashboard/dashboard-app";
import { Handheld } from "../-dashboard/handheld";
import { usePhoneViewport } from "@/lib/use-phone-viewport";
import type { HistoryData } from "../-dashboard/history-math";

const historyQuery = { queryKey: ["dashboard-seed-history"], queryFn: () => getDashboardHistory() };

const dashboardQuery = {
  queryKey: ["dashboard-staff-data"],
  queryFn: () => getDashboardStaffData(),
};
type DashboardData = Awaited<ReturnType<typeof getDashboardStaffData>>;
const emptyDashboard: DashboardData = { staff: [], rota: [], exceptions: [], shifts: [], services: [], serviceSop: [], serviceInventory: [], serviceStaff: [], breeds: [] };
const emptyHistory: HistoryData = { bookings: [], clients: [], pets: [], behaviour: [], events: [], notes: [], failures: [] };

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Dashboard — By Appointment Only" },
      { name: "description", content: "By Appointment Only staff dashboard: today's appointments, tasks, bookings and team." },
      { property: "og:title", content: "Dashboard — By Appointment Only" },
      { property: "og:description", content: "By Appointment Only staff dashboard: today's appointments, tasks, bookings and team." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baowow.xyz/dashboard" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

// Select the operational handheld before mounting the full desktop Dashboard.
function Dashboard() {
  const hydrated = useHydrated();
  const isPhone = usePhoneViewport();
  if (!hydrated) return <div className="dash-loading">Loading Dashboard…</div>;
  if (isPhone) return <Handheld />;
  return <DesktopDashboard/>;
}

function DesktopDashboard() {
  const { data = emptyDashboard } = useQuery(dashboardQuery);
  const { data: history = emptyHistory } = useQuery(historyQuery);
  return <DashboardApp data={data} history={history}/>;
}
