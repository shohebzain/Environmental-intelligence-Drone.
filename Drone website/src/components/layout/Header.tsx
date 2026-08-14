import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  User,
} from "lucide-react";
import { Drone, RiskLevel } from "../../types";
import { SimulationBanner } from "../common/SimulationBanner";
import { useSimulation } from "../../context/SimulationContext";
import { useAuth } from "../../context/AuthContext";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          label: "Moderate hotspot area",
          badge: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
      default:
        return {
          label: "Ambient environmental status",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
    }
  };

  const riskInfo = getRiskIndicator();

  const handleSignOut = async () => {
    setUserDropdown(false);
    await logout();
    navigate("/login");
  };

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
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Monitoring Area Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAreaDropdown(!areaDropdown)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[220px]">{activeArea}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {areaDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs text-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Hyderabad Monitoring Zone
                  </div>
                  {availableAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        if (onAreaChange) onAreaChange(area);
                        setAreaDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                        area === activeArea ? "font-bold text-emerald-800 bg-emerald-50/50" : "text-slate-700"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Telemetry Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {simulationState.is_simulation_mode ? "SIMULATED TELEMETRY" : "LIVE 5G TELEMETRY"}
              </span>
            </div>
          </div>

          {/* Right: Risk Badge, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            {/* Risk Indicator Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${riskInfo.badge}`}
              title={riskInfo.label}
            >
              <span className={`w-2 h-2 rounded-full ${riskInfo.dot}`} />
              <span>{currentRisk} RISK</span>
            </div>

            {/* Notifications Button */}
            <Link
              to="/alerts"
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="View Active Environmental Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 p-1.5 pr-2.5 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-6 h-6 rounded-md object-cover border border-emerald-600"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                    {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "GH"}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-slate-800 max-w-[120px] truncate">
                  {user?.displayName || "GHMC Officer"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50 text-xs text-slate-800">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-slate-900 truncate">
                      {user?.displayName || "Hyderabad Environmental Officer"}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {user?.email || "ghmc.officer@hyderabad.gov.in"}
                    </div>
                    {user && (
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Google Authenticated (Firebase)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      toggleSimulationMode();
                      setUserDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-amber-800 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer"
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

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
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
