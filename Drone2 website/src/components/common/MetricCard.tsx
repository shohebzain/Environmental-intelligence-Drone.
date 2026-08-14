import React from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  humanStatus?: string;
  statusColor?: "green" | "yellow" | "orange" | "red" | "gray";
  trend?: "up" | "down" | "stable";
  trendText?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  humanStatus,
  statusColor = "green",
  trend,
  trendText,
  subtitle,
  icon: Icon,
}) => {
  const getStatusStyle = () => {
    switch (statusColor) {
      case "red":
        return "bg-red-50 text-red-700 border-red-200 font-bold";
      case "orange":
        return "bg-orange-50 text-orange-800 border-orange-200 font-bold";
      case "yellow":
        return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      case "gray":
        return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      case "green":
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Value + Unit */}
        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
      </div>

      {/* Footer Info / Human Status */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {humanStatus ? (
          <span className={`px-2 py-0.5 rounded-md text-[11px] border ${getStatusStyle()}`}>
            {humanStatus}
          </span>
        ) : subtitle ? (
          <span className="text-slate-500 text-xs font-medium">{subtitle}</span>
        ) : (
          <span />
        )}

        {trendText && (
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-orange-600" />}
            {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
            {trend === "stable" && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span>{trendText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
