import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Alert } from "../types";
import { Bell, ShieldCheck, Check } from "lucide-react";
import { AlertCard } from "../components/alerts/AlertCard";

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAlerts = () => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAck = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST" });
      setToastMessage("Alert acknowledged by operator.");
      fetchAlerts();
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a))
      );
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolve = async (id: string, note: string, operator: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution_note: note, user: operator }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a.id === id || a.alert_id === id ? updated : a))
        );
      } else {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id || a.alert_id === id
              ? {
                  ...a,
                  status: "RESOLVED",
                  resolved_at: new Date().toISOString(),
                  resolved_by: operator,
                  resolution_note: note,
                }
              : a
          )
        );
      }
      setToastMessage(`Incident resolved with timestamped audit note.`);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id || a.alert_id === id
            ? {
                ...a,
                status: "RESOLVED",
                resolved_at: new Date().toISOString(),
                resolved_by: operator,
                resolution_note: note,
              }
            : a
        )
      );
      setToastMessage(`Incident resolved with timestamped audit note.`);
    }

    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== "ALL" && a.severity !== filterSeverity) return false;
    if (filterStatus === "ACTIVE" && a.status === "RESOLVED") return false;
    if (filterStatus === "RESOLVED" && a.status !== "RESOLVED") return false;
    return true;
  });

  const activeAlertsCount = alerts.filter((a) => a.status !== "RESOLVED").length;
  const resolvedAlertsCount = alerts.filter((a) => a.status === "RESOLVED").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs border border-emerald-700 animate-fadeIn">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300" /> {toastMessage}
              </span>
              <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white text-xs">
                Dismiss
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Hyderabad Early-Warning Alerts & Incidents</h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>Environmental threshold warnings & human-managed incident resolutions.</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {activeAlertsCount} Active
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {resolvedAlertsCount} Resolved
                  </span>
                </p>
              </div>
            </div>

            {/* Severity & Status Filters */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    filterStatus === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({alerts.length})
                </button>
                <button
                  onClick={() => setFilterStatus("ACTIVE")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    filterStatus === "ACTIVE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active ({activeAlertsCount})
                </button>
                <button
                  onClick={() => setFilterStatus("RESOLVED")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    filterStatus === "RESOLVED" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Resolved ({resolvedAlertsCount})
                </button>
              </div>

              <div className="flex items-center gap-1">
                {["ALL", "CRITICAL", "HIGH", "MODERATE"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                      filterSeverity === s
                        ? "bg-emerald-700 text-white font-bold shadow-2xs"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium space-y-1">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-800 text-sm">No active alerts matching criteria</div>
                <p>All monitored Hyderabad zones are operating within safe environmental thresholds.</p>
              </div>
            ) : (
              filteredAlerts.map((a) => (
                <AlertCard
                  key={a.id || a.alert_id}
                  alert={a}
                  onAcknowledge={handleAck}
                  onResolve={handleResolve}
                />
              ))
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
