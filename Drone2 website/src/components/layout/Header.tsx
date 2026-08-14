import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Menu,
  X,
  MapPin,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Radio,
  Sliders,
} from "lucide-react";
import { Drone, RiskLevel } from "../../types";
import { SimulationBanner } from "../common/SimulationBanner";
import { useSimulation } from "../../context/SimulationContext";

interface HeaderProps {
  drone?: Drone;
  currentRisk?: RiskLevel;
  activeArea?: string;
  unreadAlerts?: number;
  onAreaChange?: (area: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  drone,
  currentRisk = "NORMAL",
  activeArea = "Jawaharnagar Solid Waste Facility",
  unreadAlerts = 2,
  onAreaChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [areaDropdown, setAreaDropdown] = useState(false);
  const { simulationState, toggleSimulationMode } = useSimulation();

  const availableAreas = [
    "Jawaharnagar Solid Waste Facility",
    "Patancheru Industrial Corridor",
    "HITEC City & Gachibowli Buffer",
    "Hussain Sagar Lake Zone",
    "Balanagar Industrial Belt",
  ];

  const getRiskIndicator = () => {
    switch (currentRisk) {
      case "CRITICAL":
        return {
          label: "Immediate attention required",
          badge: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-600",
        };
      case "HIGH":
        return {
          label: "Elevated risk detected",
          badge: "bg-orange-50 text-orange-800 border-orange-200",
          dot: "bg-orange-500",
        };
      case "MODERATE":
        return {
          label: "Moderate risk detected",
          badge: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
      case "NORMAL":
      default:
        return {
          label: "Monitoring looks stable",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-600",
        };
    }
  };

  const riskInfo = getRiskIndicator();

  return (
    <div className="sticky top-0 z-40 flex flex-col w-full">
      {/* Global Simulation Banner rendered conditionally when in simulation mode */}
      <SimulationBanner />

      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none text-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left: Mobile Toggle + Monitoring Area Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Area Selector */}
            <div className="relative">
              <button
                onClick={() => setAreaDropdown(!areaDropdown)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-xs">{activeArea}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {areaDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Select Hyderabad Monitoring Zone
                  </div>
                  {availableAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        if (onAreaChange) onAreaChange(area);
                        setAreaDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between ${
                        area === activeArea ? "font-bold text-emerald-700 bg-emerald-50/60" : ""
                      }`}
                    >
                      <span className="truncate">{area}</span>
                      {area === activeArea && <span className="text-xs text-emerald-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Calm Status Indicator & Simulation Toggle if off */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-700">
              <span className={`w-2 h-2 rounded-full ${riskInfo.dot} animate-pulse`} />
              <span className="text-slate-800 font-medium">{riskInfo.label}</span>
            </div>

            {drone && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-200 pl-3">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" /> Drone Connected
                </span>
                <span>• Battery {drone.battery}%</span>
              </div>
            )}

            {simulationState.is_simulation_mode === false && (
              <button
                onClick={toggleSimulationMode}
                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Enable Simulation Mode"
              >
                <Sliders className="w-3 h-3" /> Enable Simulation
              </button>
            )}
          </div>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center gap-3">
            <Link
              to="/alerts"
              className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition-colors"
              title="Alert Center"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {unreadAlerts}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 p-1.5 pr-2.5 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                  GH
                </div>
                <span className="hidden sm:inline font-semibold text-slate-800">GHMC Officer</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs text-slate-800">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-slate-900">Hyderabad Environmental Officer</div>
                    <div className="text-slate-500 text-[11px]">ghmc.officer@hyderabad.gov.in</div>
                  </div>
                  <button
                    onClick={() => {
                      toggleSimulationMode();
                      setUserDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-amber-800 hover:bg-amber-50 flex items-center gap-2 font-medium"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    {simulationState.is_simulation_mode === false ? "Enable Simulation Mode" : "Disable Simulation Mode"}
                  </button>
                  <Link
                    to="/settings"
                    className="px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    onClick={() => setUserDropdown(false)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> System Settings
                  </Link>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 font-medium"
                    onClick={() => setUserDropdown(false)}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl z-50 space-y-1.5 text-xs font-medium text-slate-700">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Overview</Link>
            <Link to="/map" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Live Map</Link>
            <Link to="/missions" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Missions</Link>
            <Link to="/alerts" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Alerts</Link>
            <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Analytics</Link>
            <Link to="/predictions" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">AI Predictions</Link>
            <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Reports</Link>
            <Link to="/drones" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Drones</Link>
            <Link to="/sensors" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Sensors</Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-800">Settings</Link>
          </div>
        )}
      </header>
    </div>
  );
};
