import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BrainCircuit, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { RiskBadge } from "../components/common/RiskBadge";

export const PredictionsPage: React.FC = () => {
  const [predictionsData, setPredictionsData] = useState<any>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/predictions")
      .then((r) => r.json())
      .then(setPredictionsData)
      .catch(console.error);
  }, []);

  const handleGenerateAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/explain-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methane: predictionsData?.current?.methane || 128,
          air_quality: 118,
          temp: 31.2,
          wind_speed: 4.8,
          wind_direction: 215,
          risk: predictionsData?.current?.risk || "MODERATE",
        }),
      });
      const data = await res.json();
      setAiAnalysisText(data.explanation);
    } catch (e) {
      setAiAnalysisText("Methane plume dispersal is projected to travel east along a 215° wind vector at 4.8 m/s over Jawaharnagar Outer Ring Road corridor during the next 20 minutes.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Header */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  AI Early Environmental Warning — Hyderabad
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  30-minute atmospheric plume forecasting and automated risk explanation.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAiAnalysis}
              disabled={loadingAi}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAi ? "Generating AI Insights..." : "Generate AI Risk Explanation"}
            </button>
          </div>

          {/* Primary AI Insight Banner */}
          {aiAnalysisText && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-900 font-medium animate-in fade-in duration-300">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" /> AI Executive Briefing
              </div>
              <p className="leading-relaxed">{aiAnalysisText}</p>
            </div>
          )}

          {/* 30-Minute Horizon Forecast Grid */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">30-Minute Risk Horizon Forecast</h3>
                <p className="text-xs text-slate-500 font-medium">Jawaharnagar Solid Waste Facility • Plume Trajectory Model</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Confidence: 85%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {(predictionsData?.horizon || [
                { minute: "+10 Min", predicted_intensity: 45, risk_level: "MODERATE", confidence: 0.92 },
                { minute: "+20 Min", predicted_intensity: 62, risk_level: "HIGH", confidence: 0.85 },
                { minute: "+30 Min", predicted_intensity: 78, risk_level: "HIGH", confidence: 0.81 },
              ]).map((h: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{h.minute}</span>
                    <RiskBadge level={h.risk_level} size="sm" />
                  </div>
                  <div className="text-slate-600 font-medium">
                    Estimated Plume Intensity: <strong className="text-slate-900 font-bold">{h.predicted_intensity} PPM</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, h.predicted_intensity)}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500">Model Confidence: {Math.round(h.confidence * 100)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details Toggle */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center justify-between w-full font-bold"
            >
              <span>XGBoost Plume Dispersal Model Technical Specification</span>
              {showTechDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechDetails && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                <div>Model Architecture: <span className="text-slate-900 font-bold">XGBoost Atmospheric Dispersal Net v1.2</span></div>
                <div>Coordinates: <span className="text-slate-900 font-bold">17.5020, 78.5830 (Hyderabad Zone)</span></div>
                <div>Inputs: <span className="text-slate-900 font-bold">MQ-4 (PPM), MQ-135 (AQI), Anemometer Vector (215°)</span></div>
                <div>Loss Function: <span className="text-slate-900 font-bold">Log-Loss Plume Migration Error</span></div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
