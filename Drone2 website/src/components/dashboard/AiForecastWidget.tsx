import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { RiskBadge } from "../common/RiskBadge";
import { RiskLevel } from "../../types";

interface AiForecastWidgetProps {
  currentMethane?: number;
  currentRisk?: RiskLevel;
}

export const AiForecastWidget: React.FC<AiForecastWidgetProps> = ({
  currentMethane = 65,
  currentRisk = "MODERATE",
}) => {
  const [showTechDetails, setShowTechDetails] = useState(false);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-sm text-slate-900">
            AI Environmental Forecast
          </h3>
        </div>

        <Link
          to="/predictions"
          className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
        >
          Detailed Forecast <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Human Prediction Headline */}
      <div className="space-y-1">
        <div className="text-sm font-bold text-slate-900">
          Risk may increase in eastern Jawaharnagar sector over next 20 mins.
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Estimated plume movement based on current wind vector and rising methane readings.
        </p>
      </div>

      {/* Why? Section */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
        <span className="font-bold text-slate-800 block">Key Indicators:</span>
        <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
          <li>Methane levels elevated (currently {currentMethane} PPM)</li>
          <li>Wind moving East at 4.8 m/s along ORR buffer</li>
          <li>Recent telemetry shows rising 15-min trend</li>
        </ul>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">Prediction Confidence</span>
          <span className="font-bold text-slate-900">81%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div className="bg-emerald-600 h-full rounded-full" style={{ width: "81%" }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1.5 pt-1">
        <span className="text-xs font-bold text-slate-500 block">30-Minute Estimated Trend</span>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Now</span>
            <RiskBadge level={currentRisk} size="sm" />
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">+10 min</span>
            <RiskBadge level="MODERATE" size="sm" />
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">+20 min</span>
            <RiskBadge level="HIGH" size="sm" />
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">+30 min</span>
            <RiskBadge level="HIGH" size="sm" />
          </div>
        </div>
      </div>

      {/* Progressive Disclosure: Technical Details */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-between w-full font-bold"
        >
          <span>Technical model details</span>
          {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechDetails && (
          <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
            <div>Model: <span className="text-slate-900 font-bold">XGBoost Plume Dispersal v1.2</span></div>
            <div>Inputs: <span className="text-slate-900 font-bold">MQ-4 (PPM), MQ-135 (AQI), Vector (215°)</span></div>
            <div>Prediction Horizon: <span className="text-slate-900 font-bold">30 minutes</span></div>
            <div>Last Evaluated: <span className="text-slate-900 font-bold">12 seconds ago</span></div>
          </div>
        )}
      </div>
    </div>
  );
};
