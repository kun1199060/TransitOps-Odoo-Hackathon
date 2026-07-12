import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/useCollection";
import { DRIVER_STATUSES } from "../lib/rules";
import StatusPill from "../components/StatusPill";
import { Plus, X, Trash2, AlertTriangle } from "lucide-react";

const EMPTY = { name: "", licenseNo: "", licenseCategory: "LMV", licenseExpiry: "", contact: "", safetyScore: 100, status: "Available" };

export default function Drivers() {
  const { data: drivers, loading } = useCollection("drivers");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "drivers"), { ...form, safetyScore: Number(form.safetyScore) });
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this driver?")) await deleteDoc(doc(db, "drivers", id));
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, "drivers", id), { status });
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Drivers & Safety Profiles</h1>
          <p className="text-sm text-console-muted">Manage driver roster and compliance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Driver"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="panel p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">Name</label>
            <input required className="input-field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">License No.</label>
            <input required className="input-field" value={form.licenseNo}
              onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" value={form.licenseCategory}
              onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
              {["LMV", "HMV"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">License Expiry</label>
            <input required type="date" className="input-field" value={form.licenseExpiry}
              onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Contact</label>
            <input required className="input-field" value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Safety Score (%)</label>
            <input type="number" min="0" max="100" className="input-field" value={form.safetyScore}
              onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Status</label>
            <select className="input-field" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {DRIVER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">Save Driver</button>
          </div>
        </form>
      )}

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
              <th className="p-4">Driver</th>
              <th className="p-4">License No.</th>
              <th className="p-4">Category</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Safety</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4 text-console-muted" colSpan={8}>Loading…</td></tr>}
            {drivers.map((d) => (
              <tr key={d.id} className="border-b border-console-border/50 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4">{d.name}</td>
                <td className="p-4 font-mono">{d.licenseNo}</td>
                <td className="p-4">{d.licenseCategory}</td>
                <td className="p-4 font-mono flex items-center gap-1">
                  {d.licenseExpiry}
                  {isExpired(d.licenseExpiry) && <AlertTriangle className="w-3.5 h-3.5 text-status-retired" />}
                </td>
                <td className="p-4 font-mono text-console-muted">{d.contact}</td>
                <td className="p-4">{d.safetyScore}%</td>
                <td className="p-4">
                  <select
                    value={d.status}
                    onChange={(e) => handleStatusChange(d.id, e.target.value)}
                    className="bg-transparent text-xs mb-1"
                  >
                    {DRIVER_STATUSES.map((s) => <option key={s} value={s} className="bg-console-panel">{s}</option>)}
                  </select>
                  <StatusPill status={d.status} />
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(d.id)} className="text-console-muted hover:text-status-retired">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-console-muted mt-3 font-mono">
        Rule: Expired license or Suspended status → blocked from trip assignment
      </p>
    </div>
  );
}
