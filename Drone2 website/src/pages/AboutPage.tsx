import React from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { HelpCircle, Cpu, Radio, Database, BrainCircuit, Map } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100">About EID Platform</h1>
                <p className="text-xs text-slate-400">
                  Environmental Intelligence Drone (EID) Core End-to-End System Architecture.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-100">Core Mission & Tagline</h2>
              <div className="text-emerald-400 font-semibold italic text-sm">
                "Sense. Locate. Map. Predict. Warn."
              </div>
              <p>
                The EID platform equips environmental researchers and municipal officers with real-time aerial sensor intelligence to monitor fugitive methane leaks, atmospheric pollution hotspots, and climate conditions in vulnerable zones.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                System Data Flow Architecture
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <Cpu className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-100 text-xs">1. ESP32 Sensors</div>
                  <div className="text-[10px] text-slate-400">MQ-4, MQ-135, DHT22</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <Radio className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-100 text-xs">2. LoRa Gateway</div>
                  <div className="text-[10px] text-slate-400">915 MHz Data Link</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <Database className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-100 text-xs">3. Backend Ingestion</div>
                  <div className="text-[10px] text-slate-400">Express + PostgreSQL</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <Map className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-100 text-xs">4. Live GIS Map</div>
                  <div className="text-[10px] text-slate-400">Heatmaps & Trajectories</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <BrainCircuit className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-100 text-xs">5. AI Risk & Warning</div>
                  <div className="text-[10px] text-slate-400">Plume Dispersal Model</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
