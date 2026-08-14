import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Settings, Shield, Save, Check } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [methaneThreshold, setMethaneThreshold] = useState("120");
  const [aqiThreshold, setAqiThreshold] = useState("150");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">System Configuration</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Configure risk threshold parameters, telemetry polling intervals, and alert notifications.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700" /> Hazard Threshold Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Methane Critical Threshold (PPM)
                  </label>
                  <input
                    type="number"
                    value={methaneThreshold}
                    onChange={(e) => setMethaneThreshold(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Readings above this level trigger Critical priority alerts.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Air Quality Critical Threshold (AQI)
                  </label>
                  <input
                    type="number"
                    value={aqiThreshold}
                    onChange={(e) => setAqiThreshold(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Readings above this level notify environmental compliance officers.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {saved ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Threshold Configuration Saved!
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">EPA India Default Parameters</span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </div>
  );
};
