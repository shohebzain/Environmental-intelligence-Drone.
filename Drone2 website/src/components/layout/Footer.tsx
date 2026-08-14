import React from "react";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 px-6 select-none mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">EID Hyderabad</span>
          <span>• Environmental Intelligence Drone Platform</span>
        </div>

        {/* Center Tagline */}
        <div className="text-slate-400 italic font-medium text-center">
          "Sense. Locate. Map. Predict. Warn."
        </div>

        {/* Right Status / Compliance */}
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> GHMC / EPA Telangana Compliant
          </span>
          <span>Build 2.4.0-HYD</span>
        </div>
      </div>
    </footer>
  );
};
