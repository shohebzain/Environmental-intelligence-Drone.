import React, { useState } from "react";
import {
  Play,
  Pause,
  Sliders,
  Info,
  Radio,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Activity,
} from "lucide-react";
import { SimulationState } from "../../types";
import { useSimulation } from "../../context/SimulationContext";

interface SimulationBannerProps {
  state?: SimulationState;
  onUpdateState?: (newState: Partial<SimulationState>) => void;
  className?: string;
  isFixedTop?: boolean;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({
  state: propsState,
  onUpdateState: propsOnUpdate,
  className = "",
  isFixedTop = false,
}) => {
  const {
    simulationState: ctxState,
    updateSimulationState: ctxUpdate,
    toggleSimulationMode,
    toggleActive,
    setSpeed,
    setScenario,
  } = useSimulation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const state = propsState || ctxState;

  // Do not render if simulation mode is disabled
  if (state?.is_simulation_mode === false) {
    return null;
  }

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const intensity = e.target.value as SimulationState["pollution_intensity"];
    if (propsOnUpdate) {
      propsOnUpdate({ pollution_intensity: intensity });
    } else {
      setScenario(intensity);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (propsOnUpdate) {
      propsOnUpdate({ speed });
    } else {
      setSpeed(speed);
    }
  };

  const handlePauseToggle = () => {
    if (propsOnUpdate) {
      propsOnUpdate({ active: !state?.active });
    } else {
      toggleActive();
    }
  };

  const handleLiveToggle = () => {
    if (propsOnUpdate) {
      propsOnUpdate({ is_simulation_mode: false });
    } else {
      toggleSimulationMode();
    }
  };

  const positioningClass = isFixedTop
    ? "fixed top-0 left-0 right-0 z-50"
    : "relative z-30";

  return (
    <div
      className={`${positioningClass} bg-amber-50/95 border-b border-amber-200/90 text-amber-950 backdrop-blur-md transition-all duration-200 select-none shadow-2xs font-sans text-xs ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Side: Simulation Badge & Disclosure Statement */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 text-amber-900 border border-amber-300 rounded-lg font-bold text-[11px] shadow-2xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
              <span>SIMULATION MODE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
            </div>

            {!isCollapsed && (
              <p className="text-amber-900 font-medium text-xs truncate hidden sm:block">
                Environmental telemetry, methane readings, and plume forecasts are synthetically generated for demonstration purposes.
              </p>
            )}
          </div>

          {/* Right Side: Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCollapsed && (
              <>
                {/* Scenario Selector */}
                <div className="flex items-center gap-1.5 bg-white/90 border border-amber-300/80 rounded-lg px-2 py-1 shadow-2xs">
                  <Sliders className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="text-slate-600 font-medium text-[11px] hidden lg:inline">
                    Scenario:
                  </span>
                  <select
                    value={state?.pollution_intensity || "High Hotspot"}
                    onChange={handleScenarioChange}
                    className="bg-transparent text-emerald-800 font-bold focus:outline-none cursor-pointer text-xs"
                    aria-label="Simulation Scenario"
                  >
                    <option value="Normal">Normal Area</option>
                    <option value="Moderate Hotspot">Moderate Hotspot</option>
                    <option value="High Hotspot">High Pollution Zone</option>
                    <option value="Critical Leak">Critical Methane Leak</option>
                  </select>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center bg-white/90 border border-amber-300/80 rounded-lg p-0.5 shadow-2xs">
                  {[1, 2, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        state?.speed === s
                          ? "bg-emerald-700 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      title={`Run simulation at ${s}x speed`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Play / Pause Toggle */}
                <button
                  onClick={handlePauseToggle}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border transition-all cursor-pointer shadow-2xs ${
                    state?.active
                      ? "bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-100"
                      : "bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800"
                  }`}
                  title={state?.active ? "Pause simulation engine" : "Resume simulation engine"}
                >
                  {state?.active ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                {/* Live Telemetry Mode Switcher */}
                <button
                  onClick={handleLiveToggle}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 transition-all text-xs font-bold shadow-2xs cursor-pointer"
                  title="Switch to Live Telemetry Mode"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden md:inline">Switch to Live Mode</span>
                </button>
              </>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
              title={isCollapsed ? "Expand simulation controls" : "Minimize simulation banner"}
              aria-label="Toggle simulation banner collapse"
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
