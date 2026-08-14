import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { BarChart3, Calendar } from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"methane" | "aqi" | "weather" | "risk">("methane");
  const [areaFilter, setAreaFilter] = useState("Jawaharnagar Solid Waste Facility (Hyderabad)");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Hyderabad Environmental Analytics</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Historical drone telemetry trends, atmospheric gas profiles, and risk distribution analysis.
                </p>
              </div>
            </div>

            {/* Top Filters: Area | Drone | Date */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="Jawaharnagar Solid Waste Facility (Hyderabad)">Jawaharnagar Waste Facility</option>
                <option value="Patancheru Industrial Corridor (Hyderabad)">Patancheru Industrial Corridor</option>
                <option value="HITEC City Corridor Buffer (Hyderabad)">HITEC City Corridor Buffer</option>
              </select>

              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Today (Last 24 Hours)
              </button>
            </div>
          </div>

          {/* Parameter Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
            {[
              { id: "methane", label: "Methane Gas (MQ-4)" },
              { id: "aqi", label: "Air Quality Index (AQI)" },
              { id: "weather", label: "Atmospheric Weather" },
              { id: "risk", label: "Risk Trend Distribution" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Analytics Charts Area */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {activeTab === "methane"
                    ? "24-Hour Methane Concentration Profile (PPM)"
                    : activeTab === "aqi"
                    ? "Ambient Air Quality Index (AQI) Timeline"
                    : activeTab === "weather"
                    ? "Temperature & Wind Speed Variations"
                    : "Risk Assessment Frequency Breakdown"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Zone: {areaFilter}</p>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Sampling Rate: 2s
              </span>
            </div>

            <div className="h-72 w-full font-sans text-xs pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === "risk" ? (
                  <BarChart data={data?.riskBreakdown || [
                    { risk: "Normal", count: 420 },
                    { risk: "Moderate", count: 180 },
                    { risk: "High", count: 45 },
                    { risk: "Critical", count: 12 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="risk" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                    <Bar dataKey="count" fill="#047857" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={data?.hourlyTrend || [
                    { time: "00:00", methane: 45, aqi: 52, temp: 24, wind: 3.2 },
                    { time: "04:00", methane: 42, aqi: 50, temp: 23, wind: 2.8 },
                    { time: "08:00", methane: 85, aqi: 92, temp: 28, wind: 4.1 },
                    { time: "12:00", methane: 128, aqi: 118, temp: 32, wind: 4.8 },
                    { time: "16:00", methane: 110, aqi: 105, temp: 31, wind: 4.5 },
                    { time: "20:00", methane: 68, aqi: 75, temp: 27, wind: 3.5 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                    <Line
                      type="monotone"
                      dataKey={activeTab === "methane" ? "methane" : activeTab === "aqi" ? "aqi" : "temp"}
                      stroke="#047857"
                      strokeWidth={3}
                      dot={{ fill: "#047857", r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
