import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { SensorHardware } from "../types";
import { SensorCard } from "../components/common/SensorCard";
import { Cpu, Wind, Flame, Compass } from "lucide-react";

export const SensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<SensorHardware[]>([]);

  useEffect(() => {
    fetch("/api/sensors/latest")
      .then((r) => r.json())
      .then(setSensors)
      .catch(console.error);
  }, []);

  const gasSensors = sensors.filter(
    (s) => s.type?.includes("MQ") || s.name?.includes("Methane") || s.name?.includes("Air Quality")
  );
  const weatherSensors = sensors.filter(
    (s) => s.type?.includes("DHT") || s.type?.includes("BMP") || s.name?.includes("Temp") || s.name?.includes("Barometer")
  );
  const navSensors = sensors.filter(
    (s) => !gasSensors.includes(s) && !weatherSensors.includes(s)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Sensor Hardware Diagnostic Registry</h1>
                <p className="text-xs text-slate-500 font-medium">
                  On-board sensor payload health, calibration history, and signal precision parameters.
                </p>
              </div>
            </div>
          </div>

          {/* Group 1: Gas Monitoring */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-700" /> Gas Monitoring Payload
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gasSensors.length > 0
                ? gasSensors.map((s) => <SensorCard key={s.id} sensor={s} />)
                : sensors.slice(0, 2).map((s) => <SensorCard key={s.id} sensor={s} />)}
            </div>
          </div>

          {/* Group 2: Weather & Climate Payload */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-700" /> Weather & Atmospheric Payload
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherSensors.length > 0
                ? weatherSensors.map((s) => <SensorCard key={s.id} sensor={s} />)
                : sensors.slice(2, 4).map((s) => <SensorCard key={s.id} sensor={s} />)}
            </div>
          </div>

          {/* Group 3: Navigation & Telemetry Payload */}
          {navSensors.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-700" /> Navigation & Position Telemetry
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {navSensors.map((s) => (
                  <SensorCard key={s.id} sensor={s} />
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};
