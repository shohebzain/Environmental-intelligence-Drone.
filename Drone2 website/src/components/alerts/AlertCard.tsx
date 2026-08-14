import React, { useState } from "react";
import { Alert } from "../../types";
import { RiskBadge } from "../common/RiskBadge";
import { Eye, CheckCircle, CheckCircle2, ShieldCheck, FileText, X, AlertTriangle, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => Promise<void> | void;
  onResolve: (id: string, note: string, operator: string) => Promise<void> | void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onResolve }) => {
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [operatorName, setOperatorName] = useState("Dr. Aris Thorne (Environmental Desk)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickTemplates = [
    "Containment berm seal inspected & repaired.",
    "Landfill flare re-ignited; methane PPM stabilized.",
    "Natural atmospheric ventilation dispersed plume.",
    "Sensor node calibrated & threshold verified normal.",
  ];

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onResolve(alert.id, resolutionNote, operatorName);
      setIsResolveModalOpen(false);
      setResolutionNote("");
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResolved = alert.status === "RESOLVED";
  const isAcknowledged = alert.status === "ACKNOWLEDGED";

  return (
    <div className={`bg-white border rounded-2xl p-4 md:p-5 shadow-xs transition-all space-y-3 ${
      isResolved
        ? "border-emerald-200/90 bg-emerald-50/20"
        : isAcknowledged
        ? "border-amber-200/90 bg-amber-50/20"
        : "border-slate-200/90"
    }`}>
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={alert.severity as any} size="sm" />
            <span className="text-slate-400 font-medium text-xs">
              {new Date(alert.timestamp).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
              {alert.parameter}: {alert.value} {alert.unit}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm mt-0.5">{alert.message}</h3>
          
          <div className="text-slate-500 font-medium text-xs flex items-center gap-2">
            <span>Zone: Jawaharnagar Solid Waste & ORR Corridor, Hyderabad</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">ID: {alert.alert_id || alert.id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            to="/map"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" /> Map View
          </Link>

          {!isAcknowledged && !isResolved && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
            </button>
          )}

          {!isResolved && (
            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Resolve Incident
            </button>
          )}

          {isResolved && (
            <span className="text-emerald-800 font-bold flex items-center gap-1.5 text-xs bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Incident Resolved
            </span>
          )}
        </div>
      </div>

      {/* Timestamped Resolution Audit Note Box */}
      {isResolved && alert.resolution_note && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px] border-b border-emerald-200/60 pb-1">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-700" /> Timestamped Resolution Record
            </span>
            <span className="font-mono text-[10px] text-emerald-700">
              {alert.resolved_at ? new Date(alert.resolved_at).toLocaleString("en-IN") : "Just now"}
            </span>
          </div>

          <p className="text-emerald-950 font-medium leading-relaxed italic">
            "{alert.resolution_note}"
          </p>

          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
            <span>Resolved By:</span>
            <strong className="text-emerald-900">{alert.resolved_by || "Environmental Desk Operator"}</strong>
          </div>
        </div>
      )}

      {/* Resolve Incident Dialog / Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 font-sans text-slate-800 animate-fadeIn">
            <button
              onClick={() => setIsResolveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-xl bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Resolve Environmental Incident</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Provide a timestamped resolution note for GHMC incident compliance logs.
                </p>
              </div>
            </div>

            {/* Alert Summary Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{alert.message}</div>
              <div className="text-slate-500 text-[11px]">
                {alert.parameter}: {alert.value} {alert.unit} • Alert ID: {alert.alert_id || alert.id}
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Incident Resolution Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Inspected landfill Sector 3. Containment seal repaired and flare re-ignited. Methane level returned to 38 PPM."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Quick Resolution Templates:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setResolutionNote(template)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg font-medium transition-colors text-left"
                    >
                      + {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Resolving Officer / Operator
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !resolutionNote.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Saving..." : "Confirm & Resolve Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
