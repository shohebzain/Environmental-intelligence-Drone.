import React from "react";
import { Drone } from "../../types";
import { Radio, Battery, Wifi, Compass, AlertCircle } from "lucide-react";

interface DroneStatusPanelProps {
  drone: Drone;
}

export const DroneStatusPanel: React.FC<DroneStatusPanelProps> = ({ drone }) => {
  const isOnline = drone.status === "ONLINE";

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{drone.name}</h3>
            <div className="text-xs text-slate-500 font-medium">{drone.drone_id} • {drone.model || "LoRa Node"}</div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded text-xs font-bold border ${
            isOnline
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {isOnline ? "Online" : "Connection Lost"}
        </span>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Drone Connection Lost
          </div>
          <p className="text-amber-800 font-medium">
            Last data received 38 seconds ago. The live map is displaying the last known telemetry position.
          </p>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
          <div className="text-slate-500 flex items-center gap-1 font-semibold">
            <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery
          </div>
          <div className="text-lg font-bold text-slate-900">{drone.battery}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${drone.battery}%` }} />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
          <div className="text-slate-500 flex items-center gap-1 font-semibold">
            <Compass className="w-3.5 h-3.5 text-emerald-600" /> GPS Status
          </div>
          <div className="text-sm font-bold text-slate-800">
            {drone.gps_status === "LOCKED" ? "GPS Connected" : "Searching GPS"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Altitude: {drone.altitude} m</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
          <div className="text-slate-500 flex items-center gap-1 font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Signal Link
          </div>
          <div className="text-sm font-bold text-slate-800">
            {drone.lora_status === "CONNECTED" ? "LoRa Connected" : "Link Degraded"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">{drone.signal_strength_dbm} dBm</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
          <div className="text-slate-500 font-semibold">Flight Mode</div>
          <div className="text-sm font-bold text-slate-800">
            {drone.flight_status === "IN_FLIGHT" ? "Survey Flight" : "Idle / Standby"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">{drone.speed_ms} m/s</div>
        </div>
      </div>

      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between font-medium">
        <span>Position: {drone.latitude.toFixed(4)}, {drone.longitude.toFixed(4)}</span>
        <span className="text-slate-500">Zone: {drone.zone || "Hyderabad"}</span>
      </div>
    </div>
  );
};
