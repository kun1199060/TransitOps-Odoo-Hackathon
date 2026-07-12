import { useCollection } from "../lib/useCollection";
import { calcFleetUtilization } from "../lib/rules";
import StatusPill from "../components/StatusPill";
import { Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge } from "lucide-react";

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${accent || "text-signal-amber"}`} />
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      <p className="text-[11px] font-mono text-console-muted uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: vehicles } = useCollection("vehicles");
  const { data: drivers } = useCollection("drivers");
  const { data: trips } = useCollection("trips");

  const active = vehicles.filter((v) => v.status !== "Retired").length;
  const available = vehicles.filter((v) => v.status === "Available").length;
  const inMaintenance = vehicles.filter((v) => v.status === "In Shop").length;
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const onDuty = drivers.filter((d) => d.status !== "Off Duty" && d.status !== "Suspended").length;
  const utilization = calcFleetUtilization(vehicles);

  const recentTrips = [...trips].slice(-5).reverse();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-console-muted mb-6">Real-time fleet operations snapshot</p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <KpiCard icon={Truck} label="Active Vehicles" value={active} />
        <KpiCard icon={CheckCircle2} label="Available" value={available} accent="text-status-available" />
        <KpiCard icon={Wrench} label="In Maintenance" value={inMaintenance} accent="text-status-shop" />
        <KpiCard icon={Route} label="Active Trips" value={activeTrips} accent="text-status-onTrip" />
        <KpiCard icon={Clock} label="Pending Trips" value={pendingTrips} />
        <KpiCard icon={Users} label="Drivers On Duty" value={onDuty} />
        <KpiCard icon={Gauge} label="Fleet Utilization" value={`${utilization}%`} accent="text-signal-amber" />
      </div>

      <div className="panel p-5">
        <h2 className="font-display font-semibold text-white mb-4">Recent Trips</h2>
        {recentTrips.length === 0 ? (
          <p className="text-sm text-console-muted">No trips yet. Create one from the Trips page.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
                <th className="pb-2">Trip</th>
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Driver</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="border-b border-console-border/50 last:border-0">
                  <td className="py-2 font-mono text-xs">{t.id.slice(0, 6).toUpperCase()}</td>
                  <td className="py-2">{t.vehicleRegNo}</td>
                  <td className="py-2">{t.driverName}</td>
                  <td className="py-2"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
