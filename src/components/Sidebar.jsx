import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, Radio, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fleet", label: "Fleet", icon: Truck },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/trips", label: "Trips", icon: Route },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/fuel", label: "Fuel & Expenses", icon: Fuel },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open = false, onClose }) {
  const { profile, logout } = useAuth();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 h-screen bg-console-panel border-r border-console-border flex flex-col transform transition-transform duration-200 md:static md:w-60 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-console-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-signal-amber" />
            <div>
              <h1 className="font-display font-bold text-lg leading-none text-white">TransitOps</h1>
              <p className="text-[10px] font-mono text-console-muted tracking-wider mt-0.5">FLEET CONSOLE</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-console-muted hover:text-signal-amber md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-signal-amber/10 text-signal-amber border border-signal-amber/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-console-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-200 font-medium">{profile?.name || "—"}</p>
              <p className="text-[11px] font-mono text-signal-amber">{profile?.role || "—"}</p>
            </div>
            <button
              onClick={() => {
                onClose?.();
                logout();
              }}
              className="text-xs text-console-muted hover:text-signal-amber transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
