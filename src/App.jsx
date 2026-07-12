import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Fuel from "./pages/Fuel";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-console-bg flex items-center justify-center">
        <p className="text-console-muted font-mono text-sm">Loading console…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-console-bg">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 md:hidden inline-flex items-center gap-2 rounded-md border border-console-border bg-console-panel px-3 py-2 text-sm text-slate-200"
      >
        <Menu className="w-4 h-4" />
        Menu
      </button>

      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
          <div className="h-14 md:hidden" />
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/fleet" element={<ProtectedLayout><Fleet /></ProtectedLayout>} />
      <Route path="/drivers" element={<ProtectedLayout><Drivers /></ProtectedLayout>} />
      <Route path="/trips" element={<ProtectedLayout><Trips /></ProtectedLayout>} />
      <Route path="/maintenance" element={<ProtectedLayout><Maintenance /></ProtectedLayout>} />
      <Route path="/fuel" element={<ProtectedLayout><Fuel /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
