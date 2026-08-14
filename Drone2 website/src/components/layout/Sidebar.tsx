import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Compass,
  BarChart3,
  BrainCircuit,
  Bell,
  Radio,
  Cpu,
  FileSpreadsheet,
  Settings,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ alertCount = 0 }) => {
  const location = useLocation();

  const navigationGroups = [
    {
      group: "Main",
      items: [
        { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { label: "Live Map", path: "/map", icon: Map },
        { label: "Missions", path: "/missions", icon: Compass },
        { label: "Alerts", path: "/alerts", icon: Bell, badgeCount: alertCount },
      ],
    },
    {
      group: "Analysis",
      items: [
        { label: "Analytics", path: "/analytics", icon: BarChart3 },
        { label: "AI Predictions", path: "/predictions", icon: BrainCircuit },
        { label: "Reports", path: "/reports", icon: FileSpreadsheet },
      ],
    },
    {
      group: "System",
      items: [
        { label: "Drones", path: "/drones", icon: Radio },
        { label: "Sensors", path: "/sensors", icon: Cpu },
        { label: "Settings", path: "/settings", icon: Settings },
      ],
    },
    {
      group: "About",
      items: [{ label: "About EID", path: "/about", icon: HelpCircle }],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex select-none shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            {/* Minimal Logo: Drone + Leaf + Marker */}
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-emerald-50"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 2 6.5 5 8" />
                <path d="M12 18s-4-3.5-4-6.5a4 4 0 1 1 8 0c0 3-4 6.5-4 6.5z" />
                <circle cx="12" cy="11.5" r="1.5" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                EID Platform
                <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                  HYD v2.4
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Environmental Intelligence
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/90 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-emerald-700" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badgeCount ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold shadow-xs">
                        {item.badgeCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Tagline & Zone */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/50">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-800">
            Jawaharnagar Zone, Hyderabad
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Telemetry Active
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center py-0.5 italic">
          "Sense. Locate. Map. Predict. Warn."
        </div>
      </div>
    </aside>
  );
};
