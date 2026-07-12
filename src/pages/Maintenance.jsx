import { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/useCollection";
import StatusPill from "../components/StatusPill";

const EMPTY = { vehicleId: "", serviceType: "", cost: "", date: "", status: "Active" };

export default function Maintenance() {
  const { data: logs } = useCollection("maintenance");
  const { data: vehicles } = useCollection("vehicles");
  const [form, setForm] = useState(EMPTY);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const handleSave = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "maintenance"), {
      vehicleId: form.vehicleId,
      vehicleRegNo: selectedVehicle?.regNo || "",
      serviceType: form.serviceType,
      cost: Number(form.cost),
      date: form.date,
      status: "In Shop",
      createdAt: Date.now(),
    });
    // Rule: creating an active maintenance record → vehicle status becomes In Shop
    await updateDoc(doc(db, "vehicles", form.vehicleId), { status: "In Shop" });
    setForm(EMPTY);
  };

  const handleCloseLog = async (log) => {
    await updateDoc(doc(db, "maintenance", log.id), { status: "Completed" });
    // Rule: closing maintenance restores vehicle to Available (unless retired)
    const vehicle = vehicles.find((v) => v.id === log.vehicleId);
    if (vehicle && vehicle.status !== "Retired") {
      await updateDoc(doc(db, "vehicles", log.vehicleId), { status: "Available" });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Maintenance</h1>
      <p className="text-sm text-console-muted mb-6">Log service records and manage repair status</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="panel p-5 space-y-4">
          <h2 className="font-display font-semibold text-white">Log Service Record</h2>
          <div>
            <label className="label-text">Vehicle</label>
            <select required className="input-field" value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Service Type</label>
            <input required className="input-field" placeholder="e.g. Oil Change" value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Cost</label>
            <input required type="number" className="input-field" value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Date</label>
            <input required type="date" className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>

        <div className="panel p-5">
          <h2 className="font-display font-semibold text-white mb-4">Service Log</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Cost</th>
                <th className="pb-2">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-console-border/50 last:border-0">
                  <td className="py-2 font-mono">{l.vehicleRegNo}</td>
                  <td className="py-2">{l.serviceType}</td>
                  <td className="py-2">₹{Number(l.cost).toLocaleString()}</td>
                  <td className="py-2"><StatusPill status={l.status === "In Shop" ? "In Shop" : "Completed"} /></td>
                  <td className="py-2">
                    {l.status === "In Shop" && (
                      <button onClick={() => handleCloseLog(l)} className="text-xs text-signal-amber underline">
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-console-muted mt-3 font-mono">
        Note: In Shop vehicles are removed from the dispatch pool.
      </p>
    </div>
  );
}
