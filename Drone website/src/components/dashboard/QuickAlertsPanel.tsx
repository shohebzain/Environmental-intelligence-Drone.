import React from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../types";
import { RiskBadge } from "../common/RiskBadge";
import { Bell, ArrowRight, CheckCircle, Eye } from "lucide-react";

interface QuickAlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

export const QuickAlertsPanel: React.FC<QuickAlertsPanelProps> = ({ alerts, onAcknowledge }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-600" />
          <h3 className="font-bold text-sm text-slate-900">Important Alerts</h3>
        </div>
        <Link
          to="/alerts"
          className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
        >
          All Alerts <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-medium">
          No active environmental alerts right now. All parameters are normal.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <RiskBadge level={alert.severity as any} size="sm" />
                <span className="text-slate-500 text-[11px] font-medium">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="font-semibold text-slate-900 leading-snug">
                {alert.message}
              </div>

              <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-500 border-t border-slate-200/60 font-medium">
                <span>Jawaharnagar Zone</span>

                <div className="flex items-center gap-2">
                  <Link
                    to="/map"
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View on Map
                  </Link>

                  {alert.status !== "ACKNOWLEDGED" && alert.status !== "RESOLVED" ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold shadow-2xs"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
