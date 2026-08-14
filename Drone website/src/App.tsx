import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";
import { AuthProvider } from "./context/AuthContext";
import { GeminiCopilotChat } from "./components/chat/GeminiCopilotChat";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MapPage } from "./pages/MapPage";
import { MissionsPage } from "./pages/MissionsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { DronesPage } from "./pages/DronesPage";
import { SensorsPage } from "./pages/SensorsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AboutPage } from "./pages/AboutPage";

export default function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/drones" element={<DronesPage />} />
            <Route path="/sensors" element={<SensorsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
          {/* Global Gemini Copilot Floating Chatbot */}
          <GeminiCopilotChat />
        </BrowserRouter>
      </SimulationProvider>
    </AuthProvider>
  );
}
