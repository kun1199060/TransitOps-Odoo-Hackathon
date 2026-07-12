import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/useCollection";
import { VEHICLE_STATUSES } from "../lib/rules";
import StatusPill from "../components/StatusPill";
import { Plus, X, Trash2 } from "lucide-react";

const EMPTY = { regNo: "", name: "", type: "Van", capacity: "", odometer: 0, acquisitionCost: "", status: "Available" };

export default function Fleet() {
  const { data: vehicles, loading } = useCollection("vehicles");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedRegNo = form.regNo.trim().toLowerCase();
    const dupe = (vehicles || []).some((v) => (v.regNo || "").trim().toLowerCase() === normalizedRegNo);

    if (dupe) {
      setError("Registration number already exists. Please use a unique registration number.");
      return;
    }

    await addDoc(collection(db, "vehicles"), {
      ...form,
      regNo: form.regNo.trim(),
      capacity: Number(form.capacity),
      odometer: Number(form.odometer),
      acquisitionCost: Number(form.acquisitionCost),
    });
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this vehicle from the registry?")) {
      await deleteDoc(doc(db, "vehicles", id));
    }
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, "vehicles", id), { status });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Vehicle Registry</h1>
          <p className="text-sm text-console-muted">Master list of fleet vehicles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Vehicle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="panel p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">Reg. No. (unique)</label>
            <input required className="input-field" value={form.regNo}
              onChange={(e) => {
                setError("");
                setForm({ ...form, regNo: e.target.value });
              }} />
          </div>
          <div>
            <label className="label-text">Name / Model</label>
            <input required className="input-field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Type</label>
            <select className="input-field" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["Van", "Truck", "Mini", "Bike"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Max Capacity (kg)</label>
            <input required type="number" className="input-field" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Odometer</label>
            <input type="number" className="input-field" value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Acquisition Cost</label>
            <input required type="number" className="input-field" value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Status</label>
            <select className="input-field" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {VEHICLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">Save Vehicle</button>
          </div>
          {error && (
            <p className="col-span-full text-status-retired text-sm">{error}</p>
          )}
        </form>
      )}

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
              <th className="p-4">Reg. No.</th>
              <th className="p-4">Name/Model</th>
              <th className="p-4">Type</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Odometer</th>
              <th className="p-4">Acq. Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4 text-console-muted" colSpan={8}>Loading…</td></tr>}
            {!loading && vehicles.length === 0 && (
              <tr><td className="p-4 text-console-muted" colSpan={8}>No vehicles registered yet.</td></tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-console-border/50 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4 font-mono">{v.regNo}</td>
                <td className="p-4">{v.name}</td>
                <td className="p-4">{v.type}</td>
                <td className="p-4">{v.capacity} kg</td>
                <td className="p-4 font-mono text-console-muted">{v.odometer}</td>
                <td className="p-4">₹{Number(v.acquisitionCost).toLocaleString()}</td>
                <td className="p-4">
                  <select
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    className="bg-transparent text-xs"
                  >
                    {VEHICLE_STATUSES.map((s) => <option key={s} value={s} className="bg-console-panel">{s}</option>)}
                  </select>
                  <StatusPill status={v.status} />
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(v.id)} className="text-console-muted hover:text-status-retired">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-console-muted mt-3 font-mono">
        Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p>
    </div>
  );
}
