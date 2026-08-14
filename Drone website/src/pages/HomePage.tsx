import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Map,
  BrainCircuit,
  Bell,
  Radio,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Compass,
  Zap,
} from "lucide-react";
import { ScientificDisclaimer } from "../components/common/ScientificDisclaimer";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                Environmental Intelligence Drone
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  EID v2.4
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            Sense. Locate. Map. Predict. Warn.
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Environmental Intelligence Drone <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Spatial Pollution Mapping & AI Warning
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Transform mobile drone sensor data into real-time environmental intelligence through spatial mapping, predictive analytics, and early-warning insights.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              Open Live Dashboard <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Explore Hardware & Architecture
            </Link>
          </div>
        </div>

        {/* Core Architecture Flow Visual */}
        <div className="mt-16 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          <div className="text-xs font-mono uppercase text-slate-400 text-center font-bold mb-6">
            EID End-to-End Operational Pipeline
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Cpu className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">ESP32 + Sensors</div>
              <div className="text-[10px] text-slate-500">MQ-4, MQ-135, DHT22</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Compass className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">GPS Tagging</div>
              <div className="text-[10px] text-slate-500">Lat/Lng/Alt Stamps</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Radio className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">LoRa Link</div>
              <div className="text-[10px] text-slate-500">915 MHz Ground Recv</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Map className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">Spatial Map</div>
              <div className="text-[10px] text-slate-500">Pollution Heatmap</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <BrainCircuit className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">AI Engine</div>
              <div className="text-[10px] text-slate-500">Plume Forecast</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">Risk Assessment</div>
              <div className="text-[10px] text-slate-500">Normal to Critical</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Bell className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">Early Warning</div>
              <div className="text-[10px] text-slate-500">Dashboard & Email</div>
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer */}
        <div className="mt-8">
          <ScientificDisclaimer />
        </div>
      </section>
    </div>
  );
};
