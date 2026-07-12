const COLOR_MAP = {
  Available: "bg-status-available/15 text-status-available border border-status-available/30",
  "On Trip": "bg-status-onTrip/15 text-status-onTrip border border-status-onTrip/30",
  "In Shop": "bg-status-shop/15 text-status-shop border border-status-shop/30",
  Retired: "bg-status-retired/15 text-status-retired border border-status-retired/30",
  "Off Duty": "bg-console-muted/15 text-console-muted border border-console-muted/30",
  Suspended: "bg-status-suspended/15 text-status-suspended border border-status-suspended/30",
  Draft: "bg-console-muted/15 text-console-muted border border-console-muted/30",
  Dispatched: "bg-status-onTrip/15 text-status-onTrip border border-status-onTrip/30",
  Completed: "bg-status-available/15 text-status-available border border-status-available/30",
  Cancelled: "bg-status-retired/15 text-status-retired border border-status-retired/30",
};

export default function StatusPill({ status }) {
  return (
    <span className={`status-pill ${COLOR_MAP[status] || "bg-white/10 text-slate-300"}`}>
      {status}
    </span>
  );
}
