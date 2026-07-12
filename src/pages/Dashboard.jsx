import { useMemo, useState } from "react";
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
  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All Regions");

  const safeVehicles = vehicles || [];
  const safeDrivers = drivers || [];
  const safeTrips = trips || [];

  const vehicleTypeOptions = useMemo(() => {
    const types = Array.from(new Set(safeVehicles.map((v) => v.type).filter(Boolean)));
    return ["All", ...types];
  }, [safeVehicles]);

  const filteredVehicles = useMemo(() => {
    return safeVehicles.filter((v) => {
      const matchesType = vehicleType === "All" || v.type === vehicleType;
      const matchesStatus = status === "All" || v.status === status;
      return matchesType && matchesStatus;
    });
  }, [safeVehicles, vehicleType, status]);

  const active = filteredVehicles.filter((v) => v.status !== "Retired").length;
  const available = filteredVehicles.filter((v) => v.status === "Available").length;
  const inMaintenance = filteredVehicles.filter((v) => v.status === "In Shop").length;
  const activeTrips = safeTrips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = safeTrips.filter((t) => t.status === "Draft").length;
  const onDuty = safeDrivers.filter((d) => d.status !== "Off Duty" && d.status !== "Suspended").length;
  const utilization = calcFleetUtilization(filteredVehicles);

  const recentTrips = [...safeTrips].slice(-5).reverse();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-console-muted mb-6">Real-time fleet operations snapshot</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input-field">
          {vehicleTypeOptions.map((type) => (
            <option key={type} value={type}>{type === "All" ? "All Vehicles" : type}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field">
          <option value="All Regions">All Regions</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
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
          </div>
        )}
      </div>
    </div>
  );
}
