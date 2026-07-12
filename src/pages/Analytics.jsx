import { useCollection } from "../lib/useCollection";
import { calcFleetUtilization, calcOperationalCost, calcVehicleROI, calcFuelEfficiency } from "../lib/rules";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export default function Analytics() {
  const { data: vehicles } = useCollection("vehicles");
  const { data: fuelLogs } = useCollection("fuel");
  const { data: maintenance } = useCollection("maintenance");
  const { data: trips } = useCollection("trips");

  const utilization = calcFleetUtilization(vehicles);
  const totalDistance = trips.filter((t) => t.status === "Completed").reduce((s, t) => s + Number(t.distance || 0), 0);
  const totalLiters = fuelLogs.reduce((s, f) => s + Number(f.liters || 0), 0);
  const fuelEfficiency = calcFuelEfficiency(totalDistance, totalLiters);

  const vehicleCosts = vehicles.map((v) => ({
    name: v.regNo,
    cost: calcOperationalCost(fuelLogs, maintenance, v.regNo),
  })).sort((a, b) => b.cost - a.cost);

  const totalOperationalCost = vehicleCosts.reduce((s, v) => s + v.cost, 0);

  // Simplified ROI assumption: revenue estimated as ₹15/km per completed trip (adjust as needed for your demo data)
  const revenue = totalDistance * 15;
  const totalAcquisition = vehicles.reduce((s, v) => s + Number(v.acquisitionCost || 0), 0);
  const roi = calcVehicleROI({
    revenue,
    maintenanceCost: maintenance.reduce((s, m) => s + Number(m.cost || 0), 0),
    fuelCost: fuelLogs.reduce((s, f) => s + Number(f.cost || 0), 0),
    acquisitionCost: totalAcquisition,
  });

  const escapeCsv = (value) => {
    const stringValue = String(value ?? "");
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCsv = () => {
    const rows = [
      ["Vehicle Registration No.", "Fuel Efficiency (km/L)", "Fleet Utilization (%)", "Operational Cost", "Vehicle ROI (%)"],
      ["Fleet Summary", fuelEfficiency, utilization, totalOperationalCost, roi],
      ...vehicles.map((v) => [
        v.regNo,
        fuelEfficiency,
        utilization,
        calcOperationalCost(fuelLogs, maintenance, v.regNo),
        roi,
      ]),
    ];

    const csvContent = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analytics-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Reports & Analytics</h1>
          <p className="text-sm text-console-muted">Operational performance at a glance</p>
        </div>
        <button type="button" onClick={handleExportCsv} className="btn-secondary text-xs px-3 py-2">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="panel p-4">
          <p className="text-[11px] font-mono text-console-muted uppercase">Fuel Efficiency</p>
          <p className="text-2xl font-display font-bold text-status-onTrip mt-1">{fuelEfficiency} km/L</p>
        </div>
        <div className="panel p-4">
          <p className="text-[11px] font-mono text-console-muted uppercase">Fleet Utilization</p>
          <p className="text-2xl font-display font-bold text-status-available mt-1">{utilization}%</p>
        </div>
        <div className="panel p-4">
          <p className="text-[11px] font-mono text-console-muted uppercase">Operational Cost</p>
          <p className="text-2xl font-display font-bold text-signal-amber mt-1">₹{totalOperationalCost.toLocaleString()}</p>
        </div>
        <div className="panel p-4">
          <p className="text-[11px] font-mono text-console-muted uppercase">Vehicle ROI</p>
          <p className="text-2xl font-display font-bold text-status-available mt-1">{roi}%</p>
        </div>
      </div>
      <p className="text-xs text-console-muted font-mono mb-6">
        ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
      </p>

      <div className="panel p-5">
        <h2 className="font-display font-semibold text-white mb-4">Top Costliest Vehicles</h2>
        {vehicleCosts.length === 0 ? (
          <p className="text-sm text-console-muted">No cost data yet — log fuel or maintenance entries.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vehicleCosts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2530" horizontal={false} />
              <XAxis type="number" stroke="#5B6472" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#5B6472" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: "#12161F", border: "1px solid #1F2530", borderRadius: 8 }} />
              <Bar dataKey="cost" fill="#FF9B3D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
