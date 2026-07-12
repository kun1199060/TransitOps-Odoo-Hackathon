import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/useCollection";
import { calcOperationalCost } from "../lib/rules";

const EMPTY_FUEL = { vehicleId: "", liters: "", cost: "", date: "" };
const EMPTY_EXPENSE = { vehicleId: "", tripId: "", toll: "", other: "" };

export default function Fuel() {
  const { data: fuelLogs } = useCollection("fuel");
  const { data: vehicles } = useCollection("vehicles");
  const { data: maintenance } = useCollection("maintenance");
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL);
  const [showFuelForm, setShowFuelForm] = useState(false);

  const vehicleName = (id) => vehicles.find((v) => v.id === id)?.regNo || "—";

  const handleLogFuel = async (e) => {
    e.preventDefault();
    const v = vehicles.find((v) => v.id === fuelForm.vehicleId);
    await addDoc(collection(db, "fuel"), {
      vehicleId: fuelForm.vehicleId,
      vehicleRegNo: v?.regNo || "",
      liters: Number(fuelForm.liters),
      cost: Number(fuelForm.cost),
      date: fuelForm.date,
    });
    setFuelForm(EMPTY_FUEL);
    setShowFuelForm(false);
  };

  const totalOperationalCost = vehicles.reduce(
    (sum, v) => sum + calcOperationalCost(fuelLogs, maintenance, v.regNo), 0
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Fuel & Expense Management</h1>
          <p className="text-sm text-console-muted">Track consumption and operational cost</p>
        </div>
        <button onClick={() => setShowFuelForm(!showFuelForm)} className="btn-primary">
          {showFuelForm ? "Cancel" : "+ Log Fuel"}
        </button>
      </div>

      {showFuelForm && (
        <form onSubmit={handleLogFuel} className="panel p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">Vehicle</label>
            <select required className="input-field" value={fuelForm.vehicleId}
              onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
              <option value="">Select…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Liters</label>
            <input required type="number" className="input-field" value={fuelForm.liters}
              onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Cost</label>
            <input required type="number" className="input-field" value={fuelForm.cost}
              onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Date</label>
            <input required type="date" className="input-field" value={fuelForm.date}
              onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
          </div>
          <div className="col-span-full">
            <button type="submit" className="btn-primary">Save Fuel Log</button>
          </div>
        </form>
      )}

      <div className="panel p-5 mb-6">
        <h2 className="font-display font-semibold text-white mb-4">Fuel Logs</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
              <th className="pb-2">Vehicle</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Liters</th>
              <th className="pb-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((f) => (
              <tr key={f.id} className="border-b border-console-border/50 last:border-0">
                <td className="py-2 font-mono">{f.vehicleRegNo}</td>
                <td className="py-2">{f.date}</td>
                <td className="py-2">{f.liters} L</td>
                <td className="py-2">₹{Number(f.cost).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel p-5">
        <p className="text-sm text-console-muted">Total Operational Cost (Fuel + Maintenance)</p>
        <p className="text-3xl font-display font-bold text-signal-amber mt-1">
          ₹{totalOperationalCost.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
