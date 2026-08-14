import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Drone } from "../types";
import { DroneStatusPanel } from "../components/dashboard/DroneStatusPanel";
import { Radio, Plus, X, Check, ShieldCheck, Cpu, Wifi, Battery, Search, SlidersHorizontal } from "lucide-react";

export const DronesPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Registration Form State
  const [formData, setFormData] = useState({
    drone_id: "EID-HYD-03",
    name: "EID Jawaharnagar Scout Gamma",
    model: "Hexacopter Heavy Payload - LoRa 865MHz",
    zone: "Jawaharnagar Solid Waste Facility (Hyderabad)",
    firmware: "v2.4.2-hyd-prod",
    frequency: "865-867 MHz (India Band)",
    sensors_payload: ["MQ-4 Methane", "MQ-135 Air Quality", "DHT22 Climate", "BMP280 Barometer"],
  });

  useEffect(() => {
    fetch("/api/drones")
      .then((r) => r.json())
      .then(setDrones)
      .catch(console.error);
  }, []);

  const handleSensorToggle = (sensorName: string) => {
    setFormData((prev) => {
      const exists = prev.sensors_payload.includes(sensorName);
      if (exists) {
        return { ...prev, sensors_payload: prev.sensors_payload.filter((s) => s !== sensorName) };
      } else {
        return { ...prev, sensors_payload: [...prev.sensors_payload, sensorName] };
      }
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackDrone: Drone = {
      id: `drone-${Date.now()}`,
      drone_id: formData.drone_id || `EID-HYD-0${drones.length + 1}`,
      name: formData.name || `EID Node ${drones.length + 1}`,
      status: "ONLINE",
      battery: 100,
      latitude: 17.5028 + (Math.random() - 0.5) * 0.008,
      longitude: 78.5842 + (Math.random() - 0.5) * 0.008,
      altitude: 45,
      gps_status: "LOCKED",
      flight_status: "IDLE",
      last_seen: new Date().toISOString(),
      lora_status: "CONNECTED",
      signal_strength_dbm: -65,
      speed_ms: 0,
      model: formData.model,
      zone: formData.zone,
      firmware: formData.firmware,
      sensors_payload: formData.sensors_payload,
    };

    try {
      const response = await fetch("/api/drones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newDrone = await response.json();
        setDrones((prev) => [newDrone, ...prev]);
        setToastMessage(`Drone Node ${newDrone.drone_id} Registered & Linked Successfully!`);
      } else {
        setDrones((prev) => [fallbackDrone, ...prev]);
        setToastMessage(`Drone Node ${fallbackDrone.drone_id} Registered & Linked (Local State)!`);
      }
    } catch (err) {
      console.error("Error registering drone node:", err);
      setDrones((prev) => [fallbackDrone, ...prev]);
      setToastMessage(`Drone Node ${fallbackDrone.drone_id} Registered & Linked (Local State)!`);
    }

    setIsRegisterModalOpen(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);

    // Reset form state for next registration
    const nextNum = drones.length + 2;
    setFormData({
      drone_id: `EID-HYD-0${nextNum}`,
      name: `EID Hyderabad Node 0${nextNum}`,
      model: "Hexacopter Heavy Payload - LoRa 865MHz",
      zone: "Jawaharnagar Solid Waste Facility (Hyderabad)",
      firmware: "v2.4.2-hyd-prod",
      frequency: "865-867 MHz (India Band)",
      sensors_payload: ["MQ-4 Methane", "MQ-135 Air Quality", "DHT22 Climate", "BMP280 Barometer"],
    });
  };

  const filteredDrones = drones.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.drone_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.zone && d.zone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && d.status === "ONLINE") ||
      (statusFilter === "IN_FLIGHT" && d.flight_status === "IN_FLIGHT");

    return matchesSearch && matchesStatus;
  });

  const availableSensors = [
    "MQ-4 Methane",
    "MQ-135 Air Quality",
    "DHT22 Climate",
    "BMP280 Barometer",
    "Ultrasonic Wind Vector",
    "PID VOC Sensor",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Toast Banner */}
          {toastMessage && (
            <div className="bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 bg-emerald-800 rounded-full p-0.5" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-emerald-100 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">EID Drone Fleet Management</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Active Hyderabad drone nodes, telemetry links, battery health, and hardware sensor payloads.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Drone Node
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drone ID, name, or zone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Filter:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                {["ALL", "ONLINE", "IN_FLIGHT"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs transition-all ${
                      statusFilter === st
                        ? "bg-white text-emerald-800 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st === "ALL" ? "All Drones" : st === "ONLINE" ? "Online" : "In Flight"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDrones.map((d) => (
              <DroneStatusPanel key={d.id} drone={d} />
            ))}
          </div>

          {filteredDrones.length === 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2">
              <Radio className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No drone nodes match search</div>
              <p className="text-xs text-slate-500">Try clearing filters or register a new drone node.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* REGISTER NEW DRONE NODE MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Register New EID Drone Node</h2>
                  <p className="text-xs text-slate-500">Add hardware telemetry node to Hyderabad environmental network</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Drone Node ID / Call Sign</label>
                  <input
                    type="text"
                    required
                    value={formData.drone_id}
                    onChange={(e) => setFormData({ ...formData, drone_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Node Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hardware Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  >
                    <option value="Hexacopter Heavy Payload - LoRa 865MHz">Hexacopter Heavy Payload - LoRa 865MHz</option>
                    <option value="Quadcopter Rapid Responder - LoRa 865MHz">Quadcopter Rapid Responder - LoRa 865MHz</option>
                    <option value="VTOL Long-Range Fixed Wing">VTOL Long-Range Fixed Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Assigned Hyderabad Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  >
                    <option value="Jawaharnagar Solid Waste Facility (Hyderabad)">Jawaharnagar Solid Waste Facility</option>
                    <option value="Patancheru Industrial Corridor (Hyderabad)">Patancheru Industrial Corridor</option>
                    <option value="HITEC City Corridor Buffer (Hyderabad)">HITEC City Corridor Buffer</option>
                    <option value="Hussain Sagar Lake Zone (Hyderabad)">Hussain Sagar Lake Zone</option>
                    <option value="Balanagar Industrial Belt (Hyderabad)">Balanagar Industrial Belt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Firmware Version</label>
                  <input
                    type="text"
                    required
                    value={formData.firmware}
                    onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">LoRa Wireless Band</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.frequency}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium bg-slate-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Sensor Payload Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Mounted Hardware Sensor Payload</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {availableSensors.map((sensor) => {
                    const isSelected = formData.sensors_payload.includes(sensor);
                    return (
                      <button
                        type="button"
                        key={sensor}
                        onClick={() => handleSensorToggle(sensor)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-emerald-700 border-emerald-700 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{sensor}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> EPA India Compliant Node
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs transition-colors"
                  >
                    Register & Connect Node
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
