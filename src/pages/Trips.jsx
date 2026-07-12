import { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/useCollection";
import { validateTripDispatch, isVehicleDispatchable, isDriverAssignable } from "../lib/rules";
import StatusPill from "../components/StatusPill";
import { AlertCircle } from "lucide-react";

const EMPTY = { source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", distance: "" };

export default function Trips() {
  const { data: trips } = useCollection("trips");
  const { data: vehicles } = useCollection("vehicles");
  const { data: drivers } = useCollection("drivers");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);

  const dispatchableVehicles = vehicles.filter(isVehicleDispatchable);
  const assignableDrivers = drivers.filter(isDriverAssignable);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === form.driverId);

  const liveValidation = validateTripDispatch({
    vehicle: selectedVehicle,
    driver: selectedDriver,
    cargoWeight: form.cargoWeight,
  });

  const handleCreateDraft = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "trips"), {
      source: form.source,
      destination: form.destination,
      vehicleId: form.vehicleId,
      vehicleRegNo: selectedVehicle?.regNo || "",
      driverId: form.driverId,
      driverName: selectedDriver?.name || "",
      cargoWeight: Number(form.cargoWeight),
      distance: Number(form.distance),
      status: "Draft",
      createdAt: Date.now(),
    });
    setForm(EMPTY);
  };

  const handleDispatch = async (trip) => {
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);
    const check = validateTripDispatch({ vehicle, driver, cargoWeight: trip.cargoWeight });
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    // Dispatching automatically flips vehicle + driver to On Trip
    await updateDoc(doc(db, "trips", trip.id), { status: "Dispatched" });
    await updateDoc(doc(db, "vehicles", vehicle.id), { status: "On Trip" });
    await updateDoc(doc(db, "drivers", driver.id), { status: "On Trip" });
  };

  const handleComplete = async (trip) => {
    await updateDoc(doc(db, "trips", trip.id), { status: "Completed" });
    // Completing restores both to Available
    if (trip.vehicleId) await updateDoc(doc(db, "vehicles", trip.vehicleId), { status: "Available" });
    if (trip.driverId) await updateDoc(doc(db, "drivers", trip.driverId), { status: "Available" });
  };

  const handleCancel = async (trip) => {
    await updateDoc(doc(db, "trips", trip.id), { status: "Cancelled" });
    // Cancelling a dispatched trip restores vehicle + driver to Available
    if (trip.status === "Dispatched") {
      if (trip.vehicleId) await updateDoc(doc(db, "vehicles", trip.vehicleId), { status: "Available" });
      if (trip.driverId) await updateDoc(doc(db, "drivers", trip.driverId), { status: "Available" });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Trip Dispatcher</h1>
      <p className="text-sm text-console-muted mb-6">Draft → Dispatched → Completed / Cancelled</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create trip form */}
        <form onSubmit={handleCreateDraft} className="panel p-5 space-y-4">
          <h2 className="font-display font-semibold text-white">Create Trip</h2>

          <div>
            <label className="label-text">Source</label>
            <input required className="input-field" value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Destination</label>
            <input required className="input-field" value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Vehicle (available only)</label>
            <select required className="input-field" value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {dispatchableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.regNo} — {v.capacity}kg capacity</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Driver (available only)</label>
            <select required className="input-field" value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">Select driver…</option>
              {assignableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Cargo Weight (kg)</label>
            <input required type="number" className="input-field" value={form.cargoWeight}
              onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Planned Distance (km)</label>
            <input required type="number" className="input-field" value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          </div>

          {!liveValidation.valid && form.vehicleId && (
            <div className="bg-status-retired/10 border border-status-retired/30 rounded-md p-3 text-xs text-status-retired space-y-1">
              {liveValidation.errors.map((e, i) => <p key={i} className="flex gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{e}</p>)}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">Save as Draft</button>
        </form>

        {/* Live board */}
        <div className="panel p-5">
          <h2 className="font-display font-semibold text-white mb-4">Live Board</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {trips.length === 0 && <p className="text-sm text-console-muted">No trips yet.</p>}
            {[...trips].reverse().map((t) => (
              <div key={t.id} className="border border-console-border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs text-console-muted">{t.id.slice(0, 6).toUpperCase()}</p>
                  <StatusPill status={t.status} />
                </div>
                <p className="text-sm text-slate-200">{t.source} → {t.destination}</p>
                <p className="text-xs text-console-muted mt-1">{t.vehicleRegNo} / {t.driverName} · {t.cargoWeight}kg · {t.distance}km</p>

                {t.status === "Draft" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleDispatch(t)} className="btn-primary text-xs px-3 py-1.5">Dispatch</button>
                    <button onClick={() => handleCancel(t)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  </div>
                )}
                {t.status === "Dispatched" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleComplete(t)} className="btn-primary text-xs px-3 py-1.5">Complete</button>
                    <button onClick={() => handleCancel(t)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-status-retired/10 border border-status-retired/30 rounded-md p-4 max-w-sm">
          {errors.map((e, i) => <p key={i} className="text-xs text-status-retired">{e}</p>)}
          <button onClick={() => setErrors([])} className="text-xs text-console-muted mt-2 underline">Dismiss</button>
        </div>
      )}
    </div>
  );
}
