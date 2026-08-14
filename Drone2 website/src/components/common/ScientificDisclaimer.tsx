import React from "react";
import { Info } from "lucide-react";

export const ScientificDisclaimer: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
      <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-300">Prototype Research & Scientific Note:</span>{" "}
        EID sensor readings are generated for research, prototype, and demonstration workflows. Low-cost electrochemical gas sensors (MQ-4, MQ-135) require field calibration and are not substitutes for certified EPA regulatory instruments. AI predictions reflect estimated pollution trends based on available telemetry.
      </div>
    </div>
  );
};
