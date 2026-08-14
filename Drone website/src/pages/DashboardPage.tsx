import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { MetricCard } from "../components/common/MetricCard";
import { RiskBadge } from "../components/common/RiskBadge";
import { PollutionMap } from "../components/map/PollutionMap";
import { QuickAlertsPanel } from "../components/dashboard/QuickAlertsPanel";
import { AiForecastWidget } from "../components/dashboard/AiForecastWidget";
import { DroneStatusPanel } from "../components/dashboard/DroneStatusPanel";
import { Measurement, Drone, Alert, SimulationState, Prediction } from "../types";
import { Flame, Wind, Thermometer, Radio, Activity, RefreshCw } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    active: true,
    speed: 1,
    pollution_intensity: "Normal",
    step_count: 0,
  });

  const [telemetry, setTelemetry] = useState<Measurement | null>(null);
  const [drone, setDrone] = useState<Drone | null>(null);
  const [mapMeasurements, setMapMeasurements] = useState<Measurement[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [prediction, setPrediction] = useState<Prediction | undefined>(undefined);
  const [lastUpdatedSec, setLastUpdatedSec] = useState(0);

  // Fetch live telemetry from server
  const fetchDashboardData = async () => {
    try {
      const [telRes, droneRes, mapRes, alertRes, predRes] = await Promise.all([
        fetch("/api/telemetry/latest"),
        fetch("/api/drones/drone-01"),
        fetch("/api/map/measurements"),
        fetch("/api/alerts"),
        fetch("/api/predictions"),
      ]);

      const telData = telRes.ok ? await telRes.json() : null;
      const droneData = droneRes.ok ? await droneRes.json() : null;
      const mapData = mapRes.ok ? await mapRes.json() : { measurements: [] };
      const alertData = alertRes.ok ? await alertRes.json() : [];
      const predData = predRes.ok ? await predRes.json() : null;

      if (telData) setTelemetry(telData);
      if (droneData) setDrone(droneData);
      if (mapData?.measurements) setMapMeasurements(mapData.measurements || []);
      if (Array.isArray(alertData)) {
        setAlerts(alertData.filter((a: Alert) => a.status !== "ACKNOWLEDGED" && a.status !== "RESOLVED"));
      }
      if (predData?.horizon?.[0] && droneData) {
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
      setLastUpdatedSec(0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
      setSimulationState((prev) => ({ ...prev, step_count: prev.step_count + 1 }));
    }, 2000);

    const timer = setInterval(() => {
      setLastUpdatedSec((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar alertCount={alerts.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          drone={drone || undefined}
          currentRisk={telemetry?.risk_level || "NORMAL"}
          activeArea="Jawaharnagar Solid Waste Facility"
          unreadAlerts={alerts.length}
        />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Primary Status Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hyderabad Monitoring Zone
                </span>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Telemetry Live
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Jawaharnagar Environmental Overview
                </h1>
                <RiskBadge level={telemetry?.risk_level || "NORMAL"} size="md" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Updated {lastUpdatedSec}s ago</span>
              </div>
            </div>
          </div>

          {/* Key Environmental Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Methane Gas (MQ-4)"
              value={telemetry?.methane ? `${telemetry.methane}` : "124"}
              unit="PPM"
              humanStatus={
                (telemetry?.methane || 124) > 100
                  ? "Elevated Methane"
                  : "Normal Concentration"
              }
              statusColor={
                (telemetry?.methane || 124) > 150
                  ? "red"
                  : (telemetry?.methane || 124) > 100
                  ? "orange"
                  : "green"
              }
              trend={(telemetry?.methane || 124) > 100 ? "up" : "stable"}
              trendText="Rising 15m trend"
              icon={Flame}
            />

            <MetricCard
              title="Air Quality Index (MQ-135)"
              value={telemetry?.air_quality ? `${telemetry.air_quality}` : "118"}
              unit="AQI"
              humanStatus={
                (telemetry?.air_quality || 118) > 150
                  ? "Unhealthy for Sensitive"
                  : "Moderate AQI"
              }
              statusColor={
                (telemetry?.air_quality || 118) > 150
                  ? "red"
                  : (telemetry?.air_quality || 118) > 100
                  ? "yellow"
                  : "green"
              }
              trend="stable"
              trendText="Sustained ventilation"
              icon={Activity}
            />

            <MetricCard
              title="Ambient Climate"
              value={telemetry?.temperature ? `${telemetry.temperature}°C` : "31.2°C"}
              subtitle={`Humidity ${telemetry?.humidity || 58}% • ${telemetry?.pressure || 1012} hPa`}
              humanStatus="Stable Thermal"
              statusColor="green"
              icon={Thermometer}
            />

            <MetricCard
              title="Wind Vector (Anemometer)"
              value={telemetry?.wind_speed ? `${telemetry.wind_speed}` : "4.8"}
              unit="m/s"
              subtitle={`Direction ${telemetry?.wind_direction || 215}° (South-West)`}
              humanStatus="Plume Moving East"
              statusColor="green"
              icon={Wind}
            />
          </div>

          {/* Map + AI Forecast Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PollutionMap
                measurements={mapMeasurements}
                drone={drone || undefined}
                prediction={prediction}
                height="500px"
              />
            </div>

            <div className="space-y-6">
              <AiForecastWidget
                currentMethane={telemetry?.methane || 124}
                currentRisk={telemetry?.risk_level || "MODERATE"}
              />

              <QuickAlertsPanel
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
              />
            </div>
          </div>

          {/* Drone Telemetry Status Bottom Card */}
          {drone && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Active Aerial Drone Telemetry
              </div>
              <DroneStatusPanel drone={drone} />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};
