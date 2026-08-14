import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  FileCode,
  Check,
  Activity,
} from "lucide-react";
import { exportService } from "../services/exportService";
import { AnalyticsSummary, ReportData } from "../types";

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<"jawaharnagar" | "patancheru" | "hussainsagar">("jawaharnagar");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to load current analytics for report page:", err);
      }
    }
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [reportType]);

  const reportsData: Record<string, Omit<ReportData, "reportType">> = {
    jawaharnagar: {
      title: "Jawaharnagar Solid Waste Dump Yard Audit",
      zone: "Jawaharnagar Solid Waste Facility, Hyderabad",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      surveyId: "SRV-HYD-2026-9042",
      riskLevel: "MODERATE (MONITORED)",
      peakMethane: "128 PPM",
      avgAqi: "114 AQI",
      temp: "31.2 °C",
      wind: "4.8 m/s (South-West)",
      coverage: "5.4 km²",
      droneNode: "EID Jawaharnagar Sentinel Alpha (EID-HYD-01)",
      summary:
        "An autonomous aerial drone survey was conducted across the Jawaharnagar Solid Waste Dump Yard and Outer Ring Road buffer corridor. Telemetry samples were collected using EID Drone Node EID-HYD-01. The survey evaluated landfill fugitive methane gas migration and ambient AQI parameters.",
      hotspot:
        "A localized methane gas accumulation (MQ-4 sensor peak reading at 128 PPM) was detected near Sector 3 Containment Berm (Lat: 17.5028, Lng: 78.5842). Atmospheric dispersion remains within the designated safety buffer.",
      recommendations: [
        "Schedule follow-up aerial survey in 2 hours to track plume migration along ORR corridor.",
        "Notify GHMC waste management team regarding Sector 3 containment berm inspection.",
        "Maintain continuous LoRa gateway telemetry stream across Jawaharnagar monitoring stations.",
      ],
    },
    patancheru: {
      title: "Patancheru Industrial Estate Emissions Report",
      zone: "Patancheru Industrial Corridor, Hyderabad",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      surveyId: "SRV-HYD-2026-8810",
      riskLevel: "HIGH (ACTION REQUIRED)",
      peakMethane: "185 PPM",
      avgAqi: "142 AQI",
      temp: "32.8 °C",
      wind: "3.2 m/s (West)",
      coverage: "3.2 km²",
      droneNode: "EID Patancheru Scout Beta (EID-HYD-02)",
      summary:
        "A targeted industrial stack and perimeter survey was executed over Patancheru Industrial Estate. Telemetry samples monitored volatile organic compounds, particulate matter, and combustible gas levels.",
      hotspot:
        "Elevated chemical emissions detected along Sector 4 industrial effluent channel (Lat: 17.5285, Lng: 78.2680). Readings exceeded municipal standard threshold by 28%.",
      recommendations: [
        "Issue warning notice to regional industrial unit 4-B.",
        "Deploy ground sensor nodes along residential boundary wall.",
        "Perform automated secondary drone flight at 18:00 IST.",
      ],
    },
    hussainsagar: {
      title: "Hussain Sagar Lake Buffer Zone AQI Assessment",
      zone: "Hussain Sagar Eco Zone, Central Hyderabad",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      surveyId: "SRV-HYD-2026-7201",
      riskLevel: "NORMAL (STABLE)",
      peakMethane: "42 PPM",
      avgAqi: "78 AQI",
      temp: "29.5 °C",
      wind: "5.1 m/s (South)",
      coverage: "4.1 km²",
      droneNode: "EID Central Eco Sentinel (EID-HYD-03)",
      summary:
        "Routine environmental health assessment across Tank Bund and Hussain Sagar Lake perimeter. Drone telemetry confirmed healthy urban green belt ventilation and stable atmospheric indices.",
      hotspot: "No critical hotspots detected. Urban park ventilation remains optimal with normal atmospheric parameters.",
      recommendations: [
        "Continue routine bi-weekly environmental drone surveillance.",
        "Archive baseline data into Telangana EPA environmental repository.",
      ],
    },
  };

  const baseData = reportsData[reportType];

  // Merge baseline report schema with live analytics telemetry if available
  const currentData: ReportData = {
    ...baseData,
    reportType,
    peakMethane: analytics?.summary?.max_methane ? `${analytics.summary.max_methane} PPM` : baseData.peakMethane,
    avgAqi: analytics?.summary?.avg_aqi ? `${analytics.summary.avg_aqi} AQI` : baseData.avgAqi,
    analytics: analytics || undefined,
    timeSeries: analytics?.time_series || undefined,
  };

  const showNotification = (msg: string) => {
    setExportMessage(msg);
    setTimeout(() => {
      setExportMessage(null);
    }, 4500);
  };

  const handleDownloadCsv = () => {
    try {
      exportService.exportToCsv(currentData);
      showNotification("CSV export generated and browser download triggered successfully.");
    } catch (err) {
      console.error("CSV Export failed:", err);
      showNotification("Failed to generate CSV export.");
    }
  };

  const handleDownloadPdf = () => {
    try {
      exportService.exportToPdf(currentData);
      showNotification("PDF report document generated and download triggered.");
    } catch (err) {
      console.error("PDF Export failed:", err);
      showNotification("Failed to generate PDF report.");
    }
  };

  const handleDownloadJson = () => {
    try {
      exportService.exportToJson(currentData);
      showNotification("JSON data serialization exported successfully.");
    } catch (err) {
      console.error("JSON Export failed:", err);
      showNotification("Failed to generate JSON export.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      {/* Print Specific CSS to ensure clean A4 output without sidebars or headers */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, footer, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          #printable-report {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            background: #f8fafc !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <Header />
        </div>

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Notification Banner */}
          {exportMessage && (
            <div className="bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs border border-emerald-700 animate-fadeIn no-print">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300" /> {exportMessage}
              </span>
              <button onClick={() => setExportMessage(null)} className="text-emerald-200 hover:text-white text-xs">
                Dismiss
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs no-print">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Environmental Incident & Audit Reports</h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>GHMC & EPA Telangana compliant environmental drone survey summaries.</span>
                  {analytics && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 text-[10px]">
                      <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Telemetry Synced ({analytics.summary.total_measurements} samples)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Selector & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="jawaharnagar">Jawaharnagar Solid Waste Dump Yard</option>
                <option value="patancheru">Patancheru Industrial Corridor</option>
                <option value="hussainsagar">Hussain Sagar Lake Eco Zone</option>
              </select>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" /> Export CSV
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-700" /> Export JSON
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF Export
              </button>
            </div>
          </div>

          {/* Printable Report Card */}
          <div
            id="printable-report"
            className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 text-xs leading-relaxed font-sans text-slate-800"
          >
            {/* Title / Header of Document */}
            <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-emerald-700 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Hyderabad Environmental Intelligence Survey
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{currentData.title}</h2>
                <div className="text-slate-500 text-xs font-medium flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Generated: {currentData.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {currentData.zone}
                  </span>
                  <span>•</span>
                  <span>Survey ID: {currentData.surveyId}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0 print-card">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Overall Zone Risk</span>
                <span className="text-sm font-bold text-emerald-700">{currentData.riskLevel}</span>
              </div>
            </div>

            {/* Section 1: Monitoring Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-l-3 border-emerald-700 pl-2.5">
                1. Executive Monitoring Summary
              </h3>
              <p className="text-slate-700 font-normal">{currentData.summary}</p>
              <div className="text-slate-500 text-[11px] font-medium">
                Deployed Node: <span className="text-slate-800 font-semibold">{currentData.droneNode}</span> • Total Survey Area:{" "}
                <span className="text-slate-800 font-semibold">{currentData.coverage}</span>
              </div>
            </div>

            {/* Section 2: Environmental Conditions Grid */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-l-3 border-emerald-700 pl-2.5">
                2. Key Measured Telemetry Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 print-card">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Peak Methane</span>
                  <span className="font-bold text-slate-900 text-sm">{currentData.peakMethane}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 print-card">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Average AQI</span>
                  <span className="font-bold text-slate-900 text-sm">{currentData.avgAqi}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 print-card">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Ambient Temp</span>
                  <span className="font-bold text-slate-900 text-sm">{currentData.temp}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 print-card">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Wind Vector</span>
                  <span className="font-bold text-slate-900 text-sm">{currentData.wind}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Pollution Hotspot Analysis */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-l-3 border-emerald-700 pl-2.5">
                3. Isolated Pollution Hotspots & Methane Migration
              </h3>
              <p className="text-slate-700">{currentData.hotspot}</p>
            </div>

            {/* Section 4: Actionable Recommendations */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-l-3 border-emerald-700 pl-2.5">
                4. Actionable Protocols & Municipal Directives
              </h3>
              <ul className="space-y-1.5 text-slate-700">
                {currentData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 5: Telemetry Time-Series Preview if available */}
            {currentData.timeSeries && currentData.timeSeries.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-slate-900 border-l-3 border-emerald-700 pl-2.5">
                  5. Live Serialized Telemetry Log
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Methane</th>
                        <th className="p-2.5">AQI</th>
                        <th className="p-2.5">Temp</th>
                        <th className="p-2.5">Humidity</th>
                        <th className="p-2.5">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentData.timeSeries.slice(0, 6).map((sample, i) => (
                        <tr key={i} className="hover:bg-slate-50 font-medium">
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">{sample.timestamp}</td>
                          <td className="p-2.5 font-bold text-slate-900">{sample.methane} PPM</td>
                          <td className="p-2.5 font-bold text-slate-900">{sample.air_quality}</td>
                          <td className="p-2.5">{sample.temperature}°C</td>
                          <td className="p-2.5">{sample.humidity}%</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sample.risk === "HIGH" || sample.risk === "CRITICAL"
                                  ? "bg-rose-100 text-rose-800"
                                  : sample.risk === "MODERATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {sample.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Verification Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-slate-500 text-[11px] font-medium gap-2">
              <span>Sign-off: Greater Hyderabad Municipal Corporation (GHMC) Environmental Desk</span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Digitally Verified & Archived
              </span>
            </div>
          </div>
        </main>

        <div className="no-print">
          <Footer />
        </div>
      </div>
    </div>
  );
};
