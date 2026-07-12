import { ROLE_ACCESS } from "../context/AuthContext";

export default function Settings() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Settings & RBAC</h1>
      <p className="text-sm text-console-muted mb-6">General configuration and role-based access matrix</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel p-5 space-y-4">
          <h2 className="font-display font-semibold text-white">General</h2>
          <div>
            <label className="label-text">Depot Name</label>
            <input className="input-field" defaultValue="Gandhinagar Depot GJ4" />
          </div>
          <div>
            <label className="label-text">Currency</label>
            <input className="input-field" defaultValue="INR (₹)" />
          </div>
          <div>
            <label className="label-text">Distance Unit</label>
            <input className="input-field" defaultValue="Kilometers" />
          </div>
          <button className="btn-primary">Save changes</button>
        </div>

        <div className="panel p-5">
          <h2 className="font-display font-semibold text-white mb-4">Role-Based Access (RBAC)</h2>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-mono text-console-muted uppercase border-b border-console-border">
                <th className="pb-2">Role</th>
                <th className="pb-2">Fleet</th>
                <th className="pb-2">Drivers</th>
                <th className="pb-2">Trips</th>
                <th className="pb-2">Fuel/Exp.</th>
                <th className="pb-2">Analytics</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROLE_ACCESS).map(([role, access]) => (
                <tr key={role} className="border-b border-console-border/50 last:border-0">
                  <td className="py-2">{role}</td>
                  {["fleet", "drivers", "trips", "fuel", "analytics"].map((mod) => (
                    <td key={mod} className="py-2 font-mono text-xs">
                      {access[mod] === "edit" ? "✓" : access[mod] === "view" ? "view" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
