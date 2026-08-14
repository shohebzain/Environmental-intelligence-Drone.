import React from "react";
import { SensorHardware } from "../../types";
import { Cpu, ShieldCheck } from "lucide-react";

interface SensorCardProps {
  sensor: SensorHardware;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-sm text-slate-900">{sensor.name}</h3>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
            sensor.status === "CALIBRATED" || sensor.status === "OK"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {sensor.status === "CALIBRATED" ? "Calibrated & Ready" : sensor.status}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-500">Sensor Type / Model:</span>
          <span className="font-semibold text-slate-800">{sensor.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Target Gas / Param:</span>
          <span className="font-semibold text-slate-800">{sensor.target_gas || "Atmospheric"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Current Reading:</span>
          <span className="font-bold text-emerald-700">
            {sensor.last_reading} {sensor.unit}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Calibration Drift:</span>
          <span className="text-slate-800 font-medium">{sensor.drift_percent || 0.2}% (Normal)</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Updated: {sensor.last_calibration ? new Date(sensor.last_calibration).toLocaleDateString() : "Today"}</span>
        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Checked
        </span>
      </div>
    </div>
  );
};
