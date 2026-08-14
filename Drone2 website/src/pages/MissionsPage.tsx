import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Mission } from "../types";
import { Compass, Plus, MapPin, Play, Check } from "lucide-react";

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [step, setStep] = useState(1);

  // Stepper state
  const [selectedArea, setSelectedArea] = useState("Jawaharnagar Solid Waste Facility (Hyderabad)");
  const [surveyPattern, setSurveyPattern] = useState("Grid Lawnmover");
  const [altitude, setAltitude] = useState(45);

  useEffect(() => {
    fetch("/api/missions")
      .then((r) => r.json())
      .then(setMissions)
      .catch(console.error);
  }, []);

  const handleCreateMission = () => {
    const newMission: Mission = {
      id: `m-${Date.now()}`,
      mission_id: `MSN-HYD-00${missions.length + 1}`,
      name: `${selectedArea.split(" ")[0]} ${surveyPattern} Survey`,
      area: selectedArea,
      drone_id: "EID-HYD-01",
      status: "ACTIVE",
      start_time: new Date().toISOString(),
      coverage_sq_km: 4.5,
      total_measurements: 0,
      notes: `Autonomous Hyderabad environmental survey over ${selectedArea} utilizing ${surveyPattern} pattern at ${altitude}m altitude.`,
      waypoints: [],
    };
    setMissions([newMission, ...missions]);
    setShowCreator(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Page Header */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Survey Missions — Hyderabad</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Plan autonomous drone flight routes, coverage boundaries, and waypoint environmental surveys.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreator(!showCreator)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> {showCreator ? "Close Creator" : "New Survey Mission"}
            </button>
          </div>

          {/* 4-Step Mission Creator Stepper */}
          {showCreator && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">4-Step Hyderabad Mission Planner</h3>
                <span className="text-xs font-semibold text-slate-500">Step {step} of 4</span>
              </div>

              {/* Progress Steps Header */}
              <div className="grid grid-cols-4 gap-2 text-xs font-medium">
                {[
                  { num: 1, title: "1. Select Area" },
                  { num: 2, title: "2. Survey Pattern" },
                  { num: 3, title: "3. Review Route" },
                  { num: 4, title: "4. Launch Mission" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      step === s.num
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs"
                        : step > s.num
                        ? "bg-slate-50 text-slate-700 border-slate-200 font-medium"
                        : "bg-slate-50 text-slate-400 border-slate-200/60"
                    }`}
                  >
                    {s.title}
                  </div>
                ))}
              </div>

              {/* Step 1: Choose Area */}
              {step === 1 && (
                <div className="space-y-3 text-xs">
                  <label className="block text-slate-800 font-bold">Choose Hyderabad Monitoring Zone</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Jawaharnagar Solid Waste Facility (Hyderabad)",
                      "Patancheru Industrial Corridor (Hyderabad)",
                      "HITEC City & Gachibowli Buffer (Hyderabad)",
                      "Hussain Sagar Lake Zone (Hyderabad)",
                    ].map((area) => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selectedArea === area
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="truncate">{area}</span>
                        </div>
                        {selectedArea === area && <Check className="w-4 h-4 text-emerald-700 shrink-0 font-bold" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                    >
                      Next: Survey Pattern →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Survey Pattern */}
              {step === 2 && (
                <div className="space-y-3 text-xs">
                  <label className="block text-slate-800 font-bold">Choose Survey Pattern</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Grid Lawnmover", desc: "Dense systematic coverage for precise methane mapping." },
                      { name: "Perimeter Boundary", desc: "Monitors edge containment around dump yard berms." },
                      { name: "Spiral Outward", desc: "Rapid hotspot investigation starting from plume epicenter." },
                    ].map((pat) => (
                      <button
                        key={pat.name}
                        onClick={() => setSurveyPattern(pat.name)}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                          surveyPattern === pat.name
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-bold text-slate-900">{pat.name}</div>
                        <p className="text-[11px] text-slate-500 font-medium">{pat.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-slate-800 font-bold mb-1">Target Flight Altitude: {altitude} meters</label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={altitude}
                      onChange={(e) => setAltitude(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                    >
                      Next: Review Route →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Route */}
              {step === 3 && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
                    <div className="font-bold text-slate-900">Hyderabad Mission Summary Review</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                      <div>Zone: <strong className="text-emerald-800">{selectedArea}</strong></div>
                      <div>Pattern: <strong className="text-emerald-800">{surveyPattern}</strong></div>
                      <div>Altitude: <strong className="text-emerald-800">{altitude}m</strong></div>
                      <div>Assigned Node: <strong className="text-emerald-800">EID-HYD-01</strong></div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                    >
                      Next: Final Launch Check →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Start Monitoring */}
              {step === 4 && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                    <div className="font-bold text-sm">Ready to Launch Autonomous Survey Flight</div>
                    <p className="text-xs text-emerald-800 font-medium">
                      Drone Node EID-HYD-01 pre-flight telemetry checks confirmed. LoRa telemetry signal locked.
                    </p>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleCreateMission}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Monitoring Mission
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active & Past Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {missions.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">{m.mission_id}</span>
                    <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.area}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      m.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {m.status === "ACTIVE" ? "In Flight" : "Completed"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">DRONE</span>
                    <span className="font-bold text-slate-800">{m.drone_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">COVERAGE</span>
                    <span className="font-bold text-slate-800">{m.coverage_sq_km} km²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">WAYPOINTS</span>
                    <span className="font-bold text-slate-800">6 Survey Points</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {m.notes}
                </p>

                <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Start: {new Date(m.start_time).toLocaleTimeString()}</span>
                  <span className="text-emerald-700 font-bold">Monitoring Active</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
