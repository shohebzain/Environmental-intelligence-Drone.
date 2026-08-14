import React from "react";
import { RiskLevel } from "../../types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = "md", showDot = true }) => {
  const getStyle = () => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "bg-red-50 border-red-200 text-red-700 font-bold",
          dot: "bg-red-600",
          label: "Critical Risk",
        };
      case "HIGH":
        return {
          bg: "bg-orange-50 border-orange-200 text-orange-800 font-bold",
          dot: "bg-orange-500",
          label: "High Risk",
        };
      case "MODERATE":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800 font-bold",
          dot: "bg-amber-500",
          label: "Moderate Risk",
        };
      case "NORMAL":
      default:
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold",
          dot: "bg-emerald-600",
          label: "Normal",
        };
    }
  };

  const config = getStyle();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.bg} ${sizeClasses} shadow-2xs`}>
      {showDot && <span className={`w-2 h-2 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
