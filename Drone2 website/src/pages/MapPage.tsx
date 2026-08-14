import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PollutionMap } from "../components/map/PollutionMap";
import { Measurement, Drone, Prediction } from "../types";
import { Map as MapIcon, Filter } from "lucide-react";

export const MapPage: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [drone, setDrone] = useState<Drone | null>(null);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [prediction, setPrediction] = useState<Prediction | undefined>(undefined);
  const [timeFilter, setTimeFilter] = useState<"15m" | "1h" | "all">("15m");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mapRes, droneRes, dronesListRes, predRes] = await Promise.all([
          fetch("/api/map/measurements"),
          fetch("/api/drones/drone-01"),
          fetch("/api/drones"),
          fetch("/api/predictions"),
        ]);
        const mapData = mapRes.ok ? await mapRes.json() : { measurements: [] };
        const droneData = droneRes.ok ? await droneRes.json() : null;
        const dronesListData = dronesListRes.ok ? await dronesListRes.json() : [];
        const predData = predRes.ok ? await predRes.json() : null;

        if (mapData?.measurements) setMeasurements(mapData.measurements || []);
        if (droneData) setDrone(droneData);
        if (Array.isArray(dronesListData)) setDrones(dronesListData);
        if (predData?.horizon?.[1] && droneData) {
          setPrediction({
            id: "p1",
            latitude: droneData.latitude + 0.002,
            longitude: droneData.longitude + 0.003,
            predicted_risk: predData.horizon[1]?.risk_level || "HIGH",
            confidence: predData.horizon[1]?.confidence || 0.81,
            time_horizon_minutes: 20,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredMeasurements = measurements.filter((m) => {
    if (timeFilter === "15m") {
      return Date.now() - new Date(m.timestamp).getTime() <= 15 * 60 * 1000;
    }
    if (timeFilter === "1h") {
      return Date.now() - new Date(m.timestamp).getTime() <= 60 * 60 * 1000;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header drone={drone || undefined} />

        <main className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full flex-1">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MapIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Live Environmental GIS Map — Hyderabad</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Interactive GPS-tagged pollution heatmaps, drone flight paths, and plume prediction overlays.
                </p>
              </div>
            </div>

            {/* Time Filter Controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Filter className="w-3.5 h-3.5" /> Time Window:
              </span>
              {(["15m", "1h", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    timeFilter === t
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900"
                  }`}
                >
                  {t === "15m" ? "Last 15m" : t === "1h" ? "Last 1h" : "All Telemetry"}
                </button>
              ))}
            </div>
          </div>

          {/* Full Screen Pollution Map */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <PollutionMap
              measurements={filteredMeasurements}
              drone={drone || undefined}
              drones={drones}
              prediction={prediction}
              height="calc(100vh - 220px)"
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
