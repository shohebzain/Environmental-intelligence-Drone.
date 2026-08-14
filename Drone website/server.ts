import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// -------------------------------------------------------------
// IN-MEMORY DATABASE & INITIAL DATA (HYDERABAD, INDIA REGION)
// -------------------------------------------------------------

// Base Coordinates: Jawaharnagar Waste Management & Environmental Protection Zone, Hyderabad, India
const CENTER_LAT = 17.5020;
const CENTER_LNG = 78.5830;

const WAYPOINTS = [
  { id: "wp-1", sequence: 1, latitude: CENTER_LAT + 0.003, longitude: CENTER_LNG - 0.004, altitude: 45, status: "REACHED" as const },
  { id: "wp-2", sequence: 2, latitude: CENTER_LAT + 0.006, longitude: CENTER_LNG - 0.001, altitude: 50, status: "REACHED" as const },
  { id: "wp-3", sequence: 3, latitude: CENTER_LAT + 0.007, longitude: CENTER_LNG + 0.003, altitude: 52, status: "CURRENT" as const },
  { id: "wp-4", sequence: 4, latitude: CENTER_LAT + 0.002, longitude: CENTER_LNG + 0.005, altitude: 50, status: "PENDING" as const },
  { id: "wp-5", sequence: 5, latitude: CENTER_LAT - 0.003, longitude: CENTER_LNG + 0.002, altitude: 48, status: "PENDING" as const },
  { id: "wp-6", sequence: 6, latitude: CENTER_LAT - 0.004, longitude: CENTER_LNG - 0.002, altitude: 45, status: "PENDING" as const },
];

let drones: any[] = [
  {
    id: "drone-01",
    drone_id: "EID-HYD-01",
    name: "EID Jawaharnagar Sentinel Alpha",
    status: "ONLINE" as const,
    battery: 92,
    latitude: WAYPOINTS[2].latitude,
    longitude: WAYPOINTS[2].longitude,
    altitude: 52,
    gps_status: "LOCKED" as const,
    flight_status: "IN_FLIGHT" as const,
    current_mission_id: "msn-2026-001",
    last_seen: new Date().toISOString(),
    lora_status: "CONNECTED" as const,
    signal_strength_dbm: -68,
    speed_ms: 6.8,
    model: "Hexacopter Heavy Payload - LoRa 865MHz",
    zone: "Jawaharnagar Solid Waste Facility (Hyderabad)",
    firmware: "v2.4.2-hyd-prod",
    sensors_payload: ["MQ-4 Methane", "MQ-135 Air Quality", "DHT22 Climate", "BMP280 Barometer", "Ultrasonic Wind"],
  },
  {
    id: "drone-02",
    drone_id: "EID-HYD-02",
    name: "EID Patancheru Scout Beta",
    status: "ONLINE" as const,
    battery: 64,
    latitude: 17.5280,
    longitude: 78.2670,
    altitude: 0,
    gps_status: "LOCKED" as const,
    flight_status: "CHARGING" as const,
    current_mission_id: undefined,
    last_seen: new Date(Date.now() - 45000).toISOString(),
    lora_status: "CONNECTED" as const,
    signal_strength_dbm: -82,
    speed_ms: 0,
    model: "Quadcopter Rapid Responder - LoRa 865MHz",
    zone: "Patancheru Industrial Corridor (Hyderabad)",
    firmware: "v2.4.0-hyd",
    sensors_payload: ["MQ-4 Methane", "MQ-135 Air Quality", "DHT22 Climate"],
  },
];

let missions = [
  {
    id: "msn-2026-001",
    mission_id: "MSN-HYD-2026-001",
    drone_id: "EID-HYD-01",
    name: "Jawaharnagar Dump Yard Methane & Air Quality Survey",
    area: "Jawaharnagar Solid Waste Facility (Hyderabad)",
    status: "ACTIVE" as const,
    start_time: new Date(Date.now() - 3600000).toISOString(),
    waypoints: WAYPOINTS,
    coverage_sq_km: 5.4,
    total_measurements: 210,
    notes: "Monitoring landfill methane gas migration and ambient AQI along the Outer Ring Road corridor.",
  },
  {
    id: "msn-2026-002",
    mission_id: "MSN-HYD-2026-002",
    drone_id: "EID-HYD-02",
    name: "Patancheru Industrial Estate VOC Barrier Check",
    area: "Patancheru Industrial Corridor (Hyderabad)",
    status: "PLANNED" as const,
    start_time: new Date(Date.now() + 86400000).toISOString(),
    waypoints: WAYPOINTS.slice(0, 4),
    coverage_sq_km: 3.2,
    total_measurements: 0,
    notes: "Routine quarterly emission assessment for Hyderabad urban development authority.",
  },
];

let sensors = [
  { id: "sns-1", code: "MQ-4", name: "MQ-4 Methane Sensor", parameter: "Methane Gas (CH4)", status: "Online", calibration_status: "Valid", last_reading: "68 PPM", unit: "PPM", drone_id: "EID-ALPHA-01" },
  { id: "sns-2", code: "MQ-135", name: "MQ-135 Air Quality Sensor", parameter: "AQI (CO2, NH3, Smoke)", status: "Online", calibration_status: "Valid", last_reading: "112 AQI", unit: "AQI", drone_id: "EID-ALPHA-01" },
  { id: "sns-3", code: "DHT22", name: "DHT22 Climate Sensor", parameter: "Temp & Humidity", status: "Online", calibration_status: "Valid", last_reading: "28.4 °C / 58%", unit: "°C / %", drone_id: "EID-ALPHA-01" },
  { id: "sns-4", code: "BMP280", name: "BMP280 Barometer", parameter: "Atmospheric Pressure", status: "Online", calibration_status: "Valid", last_reading: "1013.25 hPa", unit: "hPa", drone_id: "EID-ALPHA-01" },
  { id: "sns-5", code: "ANEMOMETER", name: "Ultrasonic Wind Sensor", parameter: "Wind Speed & Vector", status: "Online", calibration_status: "Valid", last_reading: "4.8 m/s (210° SW)", unit: "m/s", drone_id: "EID-ALPHA-01" },
];

function calculateRisk(methane: number, aqi: number): "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (methane >= 220 || aqi >= 210) return "CRITICAL";
  if (methane >= 120 || aqi >= 150) return "HIGH";
  if (methane >= 45 || aqi >= 95) return "MODERATE";
  return "NORMAL";
}

// Generate historical seed measurements along realistic flight path
let measurements: any[] = [];
const now = Date.now();
for (let i = 50; i >= 0; i--) {
  const timeOffset = i * 60000; // past 50 mins
  const progress = (50 - i) / 50;
  // Arc path
  const angle = progress * Math.PI * 2;
  const lat = CENTER_LAT + Math.sin(angle) * 0.007 + (Math.random() - 0.5) * 0.001;
  const lng = CENTER_LNG + Math.cos(angle) * 0.008 + (Math.random() - 0.5) * 0.001;
  
  // Create a hotspot around step 20-35
  let methaneBase = 22;
  let aqiBase = 45;
  if (i >= 15 && i <= 35) {
    // Hotspot region
    methaneBase = 140 + Math.sin((i - 15) / 20 * Math.PI) * 110;
    aqiBase = 120 + Math.sin((i - 15) / 20 * Math.PI) * 80;
  }

  const methane = Math.round(methaneBase + (Math.random() - 0.5) * 15);
  const aqi = Math.round(aqiBase + (Math.random() - 0.5) * 10);
  const risk = calculateRisk(methane, aqi);

  measurements.push({
    id: `meas-${1000 + (50 - i)}`,
    measurement_id: `#EID-${1000 + (50 - i)}`,
    drone_id: "EID-ALPHA-01",
    timestamp: new Date(now - timeOffset).toISOString(),
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    methane,
    air_quality: aqi,
    temperature: Number((26 + Math.random() * 3).toFixed(1)),
    humidity: Math.round(52 + Math.random() * 10),
    pressure: Number((1012 + Math.random() * 2).toFixed(2)),
    wind_speed: Number((3.5 + Math.random() * 2.5).toFixed(1)),
    wind_direction: Math.round(190 + Math.random() * 40),
    data_source: "SIMULATION",
    risk_level: risk,
  });
}

let alerts: any[] = [
  {
    id: "alt-01",
    alert_id: "ALT-2026-8801",
    timestamp: new Date(now - 1200000).toISOString(),
    latitude: CENTER_LAT + 0.004,
    longitude: CENTER_LNG + 0.002,
    severity: "CRITICAL",
    parameter: "Methane",
    value: 242,
    unit: "PPM",
    message: "Critical Methane Leak Detected at Landfill Boundary Sector B. Value exceeded 220 PPM threshold.",
    status: "DISPLAYED",
  },
  {
    id: "alt-02",
    alert_id: "ALT-2026-8802",
    timestamp: new Date(now - 2800000).toISOString(),
    latitude: CENTER_LAT + 0.002,
    longitude: CENTER_LNG - 0.003,
    severity: "HIGH",
    parameter: "Air Quality",
    value: 168,
    unit: "AQI",
    message: "Elevated particulate and volatile organic compound concentration detected near Industrial Processing Unit 2.",
    status: "ACKNOWLEDGED",
    acknowledged_by: "Dr. Aris Thorne (Environmental Analyst)",
    acknowledged_at: new Date(now - 2400000).toISOString(),
  },
];

let predictions: any[] = [
  {
    id: "pred-01",
    timestamp: new Date(now).toISOString(),
    latitude: CENTER_LAT + 0.006,
    longitude: CENTER_LNG + 0.003,
    predicted_intensity: 85,
    risk_level: "HIGH",
    model_name: "EID-XGBoost-Plume-V1.2",
    model_version: "1.2.0-prototype",
    confidence: 0.88,
    prediction_horizon_min: 30,
    influencing_factors: [
      "Sustained Methane spike (242 PPM)",
      "South-Southwest wind vector (215° at 4.8 m/s)",
      "Thermal boundary layer inversion (+2.1°C)",
    ],
    reasoning: "Methane plume is dispersing northeast toward the residential perimeter buffer. High risk anticipated within 15-30 minutes if emission rate continues.",
  },
];

// Simulator control state
let simulationState: {
  active: boolean;
  speed: number;
  area: string;
  pollution_intensity: 'Normal' | 'Moderate Hotspot' | 'High Hotspot' | 'Critical Leak';
  wind_speed: number;
  wind_direction: number;
  step_count: number;
} = {
  active: true,
  speed: 1,
  area: "Industrial Waste Processing Sector 4",
  pollution_intensity: "High Hotspot",
  wind_speed: 4.8,
  wind_direction: 215,
  step_count: 50,
};

// -------------------------------------------------------------
// SIMULATION ENGINE (DRONE MOVEMENT & TELEMETRY GENERATOR)
// -------------------------------------------------------------
let simInterval: NodeJS.Timeout | null = null;
let currentWaypointIndex = 2;
let stepSubIndex = 0;

function runSimulationStep() {
  if (!simulationState.active) return;

  const currentWp = WAYPOINTS[currentWaypointIndex];
  const nextWpIndex = (currentWaypointIndex + 1) % WAYPOINTS.length;
  const nextWp = WAYPOINTS[nextWpIndex];

  // Interpolate position between current and next waypoint
  stepSubIndex += 0.1 * simulationState.speed;
  if (stepSubIndex >= 1.0) {
    stepSubIndex = 0;
    WAYPOINTS[currentWaypointIndex].status = "REACHED";
    currentWaypointIndex = nextWpIndex;
    WAYPOINTS[currentWaypointIndex].status = "CURRENT";
  }

  const startWp = WAYPOINTS[currentWaypointIndex];
  const targetWp = WAYPOINTS[(currentWaypointIndex + 1) % WAYPOINTS.length];

  const lat = startWp.latitude + (targetWp.latitude - startWp.latitude) * stepSubIndex;
  const lng = startWp.longitude + (targetWp.longitude - startWp.longitude) * stepSubIndex;

  // Update Drone Alpha state
  drones[0].latitude = Number(lat.toFixed(6));
  drones[0].longitude = Number(lng.toFixed(6));
  drones[0].battery = Math.max(10, Number((drones[0].battery - 0.05 * simulationState.speed).toFixed(1)));
  drones[0].last_seen = new Date().toISOString();

  // Generate new sensor reading with realistic pollution curves
  simulationState.step_count++;
  
  let multiplier = 1;
  if (simulationState.pollution_intensity === "Normal") multiplier = 0.2;
  if (simulationState.pollution_intensity === "Moderate Hotspot") multiplier = 0.6;
  if (simulationState.pollution_intensity === "High Hotspot") multiplier = 1.2;
  if (simulationState.pollution_intensity === "Critical Leak") multiplier = 2.2;

  // Spatial distance from hotspot center
  const hotspotLat = CENTER_LAT + 0.005;
  const hotspotLng = CENTER_LNG + 0.002;
  const distSq = Math.pow(lat - hotspotLat, 2) + Math.pow(lng - hotspotLng, 2);
  const proximityFactor = Math.max(0.1, 1.0 - Math.min(1.0, Math.sqrt(distSq) / 0.01));

  const methaneVal = Math.round((20 + 200 * proximityFactor * multiplier) + (Math.random() - 0.5) * 12);
  const aqiVal = Math.round((35 + 150 * proximityFactor * multiplier) + (Math.random() - 0.5) * 10);
  const tempVal = Number((28.0 + (Math.random() - 0.5) * 1.2).toFixed(1));
  const humidityVal = Math.round(56 + (Math.random() - 0.5) * 4);
  const pressureVal = Number((1012.5 + (Math.random() - 0.5) * 0.8).toFixed(2));
  const windSpd = Number((simulationState.wind_speed + (Math.random() - 0.5) * 0.6).toFixed(1));
  const windDir = Math.round((simulationState.wind_direction + (Math.random() - 0.5) * 10) % 360);

  const risk = calculateRisk(methaneVal, aqiVal);

  const newMeas = {
    id: `meas-${Date.now()}`,
    measurement_id: `#EID-${simulationState.step_count}`,
    drone_id: "EID-ALPHA-01",
    timestamp: new Date().toISOString(),
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    methane: methaneVal,
    air_quality: aqiVal,
    temperature: tempVal,
    humidity: humidityVal,
    pressure: pressureVal,
    wind_speed: windSpd,
    wind_direction: windDir,
    data_source: "SIMULATION",
    risk_level: risk,
  };

  measurements.push(newMeas);
  if (measurements.length > 200) measurements.shift();

  // Update sensor display values
  sensors[0].last_reading = `${methaneVal} PPM`;
  sensors[1].last_reading = `${aqiVal} AQI`;
  sensors[2].last_reading = `${tempVal} °C / ${humidityVal}%`;
  sensors[3].last_reading = `${pressureVal} hPa`;
  sensors[4].last_reading = `${windSpd} m/s (${windDir}°)`;

  // Check auto-alert generation
  if ((risk === "HIGH" || risk === "CRITICAL") && Math.random() < 0.25) {
    const existingActive = alerts.find(a => a.severity === risk && a.status === "DISPLAYED");
    if (!existingActive) {
      const newAlert = {
        id: `alt-${Date.now()}`,
        alert_id: `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        severity: risk,
        parameter: methaneVal > 150 ? "Methane" : "Air Quality",
        value: methaneVal > 150 ? methaneVal : aqiVal,
        unit: methaneVal > 150 ? "PPM" : "AQI",
        message: `${risk} environmental risk detected by EID Sentinel Alpha. ${methaneVal > 150 ? `Methane peaked at ${methaneVal} PPM` : `Air Quality index reached ${aqiVal} AQI`}.`,
        status: "DISPLAYED",
      };
      alerts.unshift(newAlert);
      if (alerts.length > 30) alerts.pop();
    }
  }
}

// Start simulation ticker (updates every 2 seconds)
simInterval = setInterval(runSimulationStep, 2000);

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// System Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: "SIMULATION MODE ACTIVE",
    timestamp: new Date().toISOString(),
    active_drones: drones.filter(d => d.status === "ONLINE").length,
  });
});

// Authentication demo
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Demo user accounts
  let role = "ANALYST";
  if (email.includes("admin")) role = "ADMIN";
  if (email.includes("viewer")) role = "VIEWER";

  res.json({
    token: "eid-jwt-token-demo-2026",
    user: {
      id: "usr-001",
      name: role === "ADMIN" ? "Commander Alex Vance" : "Dr. Aris Thorne",
      email,
      role,
      organization: "Environmental Protection Agency - Region 9",
    },
  });
});

app.get("/api/auth/me", (req, res) => {
  res.json({
    user: {
      id: "usr-001",
      name: "Dr. Aris Thorne",
      email: "analyst@eid-platform.gov",
      role: "ANALYST",
      organization: "Environmental Protection Agency - Region 9",
    },
  });
});

// Drones API
app.get("/api/drones", (req, res) => {
  res.json(drones);
});

app.get("/api/drones/:id", (req, res) => {
  const drone = drones.find(d => d.id === req.params.id || d.drone_id === req.params.id);
  if (!drone) return res.status(404).json({ error: "Drone not found" });
  res.json(drone);
});

app.post("/api/drones", (req, res) => {
  const { drone_id, name, model, zone, firmware, sensors_payload } = req.body;
  
  const newDrone = {
    id: `drone-${Date.now()}`,
    drone_id: drone_id || `EID-HYD-0${drones.length + 1}`,
    name: name || `EID Node ${drones.length + 1}`,
    status: "ONLINE" as const,
    battery: 100,
    latitude: CENTER_LAT + (Math.random() - 0.5) * 0.008,
    longitude: CENTER_LNG + (Math.random() - 0.5) * 0.008,
    altitude: 45,
    gps_status: "LOCKED" as const,
    flight_status: "IDLE" as const,
    current_mission_id: undefined,
    last_seen: new Date().toISOString(),
    lora_status: "CONNECTED" as const,
    signal_strength_dbm: -65,
    speed_ms: 0,
    model: model || "Hexacopter Heavy Payload - LoRa 865MHz",
    zone: zone || "Jawaharnagar Solid Waste Facility (Hyderabad)",
    firmware: firmware || "v2.4.2-hyd-prod",
    sensors_payload: sensors_payload || ["MQ-4 Methane", "MQ-135 Air Quality", "DHT22 Climate"],
  };

  drones.unshift(newDrone);
  res.status(201).json(newDrone);
});

// Sensors API
app.get("/api/sensors/latest", (req, res) => {
  res.json(sensors);
});

app.get("/api/sensors/history", (req, res) => {
  res.json(measurements.slice(-30));
});

// Telemetry API
app.get("/api/telemetry/latest", (req, res) => {
  res.json(measurements[measurements.length - 1] || null);
});

app.get("/api/telemetry", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  res.json({
    latest: measurements[measurements.length - 1],
    history: measurements.slice(-limit),
  });
});

app.post("/api/telemetry", (req, res) => {
  const telemetry = req.body;
  if (!telemetry.drone_id || !telemetry.latitude || !telemetry.longitude) {
    return res.status(400).json({ error: "Invalid telemetry payload" });
  }

  const newMeas = {
    id: `meas-${Date.now()}`,
    measurement_id: `#EID-REAL-${Date.now().toString().slice(-4)}`,
    drone_id: telemetry.drone_id,
    timestamp: new Date().toISOString(),
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    methane: telemetry.methane || 20,
    air_quality: telemetry.air_quality || 40,
    temperature: telemetry.temperature || 25,
    humidity: telemetry.humidity || 50,
    pressure: telemetry.pressure || 1013,
    wind_speed: telemetry.wind_speed || 3.0,
    wind_direction: telemetry.wind_direction || 180,
    data_source: "REAL",
    risk_level: calculateRisk(telemetry.methane || 20, telemetry.air_quality || 40),
  };

  measurements.push(newMeas);
  res.status(201).json({ status: "received", measurement: newMeas });
});

// Missions API
app.get("/api/missions", (req, res) => {
  res.json(missions);
});

app.get("/api/missions/:id", (req, res) => {
  const msn = missions.find(m => m.id === req.params.id || m.mission_id === req.params.id);
  if (!msn) return res.status(404).json({ error: "Mission not found" });
  res.json(msn);
});

app.post("/api/missions", (req, res) => {
  const { name, area, drone_id, waypoints } = req.body;
  const newMission = {
    id: `msn-${Date.now()}`,
    mission_id: `MSN-2026-${Math.floor(100 + Math.random() * 900)}`,
    drone_id: drone_id || "EID-ALPHA-01",
    name: name || "Custom Survey Area",
    area: area || "Monitored Zone",
    status: "PLANNED" as const,
    start_time: new Date().toISOString(),
    waypoints: waypoints || WAYPOINTS,
    coverage_sq_km: 3.5,
    total_measurements: 0,
    notes: "Created via EID Mission Planner",
  };
  missions.unshift(newMission);
  res.status(201).json(newMission);
});

// Map API
app.get("/api/map/measurements", (req, res) => {
  res.json({
    measurements,
    drone: drones[0],
    waypoints: WAYPOINTS,
  });
});

app.get("/api/map/heatmap", (req, res) => {
  const heatmapData = measurements.map(m => ({
    lat: m.latitude,
    lng: m.longitude,
    methane: m.methane,
    air_quality: m.air_quality,
    weight: Math.min(1.0, (m.methane + m.air_quality) / 300),
    risk: m.risk_level,
  }));
  res.json(heatmapData);
});

// Predictions API
app.get("/api/predictions", (req, res) => {
  const latestMeas = measurements[measurements.length - 1];
  const pred10MinRisk = calculateRisk((latestMeas?.methane || 50) * 1.1, (latestMeas?.air_quality || 50) * 1.1);
  const pred20MinRisk = calculateRisk((latestMeas?.methane || 50) * 1.25, (latestMeas?.air_quality || 50) * 1.2);
  const pred30MinRisk = calculateRisk((latestMeas?.methane || 50) * 1.35, (latestMeas?.air_quality || 50) * 1.3);

  res.json({
    current: {
      timestamp: new Date().toISOString(),
      risk: latestMeas?.risk_level || "NORMAL",
      methane: latestMeas?.methane || 40,
      aqi: latestMeas?.air_quality || 50,
    },
    horizon: [
      { minute: "+10 Min", predicted_intensity: Math.min(100, Math.round((latestMeas?.methane || 40) * 0.4)), risk_level: pred10MinRisk, confidence: 0.92 },
      { minute: "+20 Min", predicted_intensity: Math.min(100, Math.round((latestMeas?.methane || 40) * 0.48)), risk_level: pred20MinRisk, confidence: 0.85 },
      { minute: "+30 Min", predicted_intensity: Math.min(100, Math.round((latestMeas?.methane || 40) * 0.55)), risk_level: pred30MinRisk, confidence: 0.78 },
    ],
    details: predictions,
    status_label: "PROTOTYPE PREDICTION",
  });
});

// Gemini AI Explanation API
app.post("/api/ai/explain-risk", async (req, res) => {
  try {
    const { methane, air_quality, temp, wind_speed, wind_direction, risk } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        explanation: `Automated Rule Analysis: Current methane at ${methane || 60} PPM combined with SW wind (${wind_speed || 4.8} m/s at ${wind_direction || 215}°) drives a ${risk || 'MODERATE'} risk rating. Plume migration is projected downwind.`,
        source: "Rule-Based Expert System",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an Environmental Intelligence AI safety expert. Analyze this real-time drone telemetry:
      - Methane (MQ-4): ${methane} PPM
      - Air Quality (MQ-135): ${air_quality} AQI
      - Temperature: ${temp} °C
      - Wind: ${wind_speed} m/s from ${wind_direction}°
      - Current Risk Rating: ${risk}

      Provide a concise 3-sentence expert environmental assessment covering:
      1. What is happening downwind?
      2. Key chemical/atmospheric driver?
      3. Actionable recommendation for emergency environmental responders.`,
    });

    res.json({
      explanation: response.text,
      source: "Gemini 2.5 Environmental Intelligence Model",
    });
  } catch (err: any) {
    res.json({
      explanation: `EID Risk Analytics: Elevated gas concentration detected. Wind vectors suggest spatial dispersion towards adjacent buffer areas.`,
      source: "EID Fallback Analytics Engine",
    });
  }
});

// Alerts API
app.get("/api/alerts", (req, res) => {
  res.json(alerts);
});

app.post("/api/alerts/:id/acknowledge", (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id || a.alert_id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.status = "ACKNOWLEDGED";
  alert.acknowledged_by = req.body.user || "Dr. Aris Thorne";
  alert.acknowledged_at = new Date().toISOString();
  res.json(alert);
});

app.post("/api/alerts/:id/resolve", (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id || a.alert_id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.status = "RESOLVED";
  alert.resolved_at = new Date().toISOString();
  alert.resolved_by = req.body.user || req.body.operator || "Environmental Desk Operator";
  alert.resolution_note = req.body.resolution_note || req.body.note || "Incident inspected and verified resolved by field team.";
  res.json(alert);
});

// Simulation Control API
app.get("/api/simulation/state", (req, res) => {
  res.json(simulationState);
});

app.post("/api/simulation/state", (req, res) => {
  const { active, speed, pollution_intensity, area, wind_speed, wind_direction } = req.body;
  if (typeof active === "boolean") simulationState.active = active;
  if (typeof speed === "number") simulationState.speed = speed;
  if (pollution_intensity) simulationState.pollution_intensity = pollution_intensity;
  if (area) simulationState.area = area;
  if (typeof wind_speed === "number") simulationState.wind_speed = wind_speed;
  if (typeof wind_direction === "number") simulationState.wind_direction = wind_direction;

  res.json({ status: "updated", state: simulationState });
});

app.post("/api/simulation/control", (req, res) => {
  const { active, speed, pollution_intensity, area, wind_speed, wind_direction } = req.body;
  if (typeof active === "boolean") simulationState.active = active;
  if (typeof speed === "number") simulationState.speed = speed;
  if (pollution_intensity) simulationState.pollution_intensity = pollution_intensity;
  if (area) simulationState.area = area;
  if (typeof wind_speed === "number") simulationState.wind_speed = wind_speed;
  if (typeof wind_direction === "number") simulationState.wind_direction = wind_direction;

  res.json({ status: "updated", state: simulationState });
});

// Analytics & Reports API
app.get("/api/analytics", (req, res) => {
  const total = measurements.length;
  const methanes = measurements.map(m => m.methane);
  const aqis = measurements.map(m => m.air_quality);
  const avgMethane = total ? Math.round(methanes.reduce((a, b) => a + b, 0) / total) : 0;
  const maxMethane = total ? Math.max(...methanes) : 0;
  const avgAqi = total ? Math.round(aqis.reduce((a, b) => a + b, 0) / total) : 0;
  const maxAqi = total ? Math.max(...aqis) : 0;

  const riskCounts = {
    NORMAL: measurements.filter(m => m.risk_level === "NORMAL").length,
    MODERATE: measurements.filter(m => m.risk_level === "MODERATE").length,
    HIGH: measurements.filter(m => m.risk_level === "HIGH").length,
    CRITICAL: measurements.filter(m => m.risk_level === "CRITICAL").length,
  };

  res.json({
    summary: {
      total_measurements: total,
      avg_methane: avgMethane,
      max_methane: maxMethane,
      avg_aqi: avgAqi,
      max_aqi: maxAqi,
      risk_distribution: Object.entries(riskCounts).map(([level, count]) => ({ level, count })),
    },
    time_series: measurements.slice(-40).map(m => ({
      timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      methane: m.methane,
      air_quality: m.air_quality,
      temperature: m.temperature,
      humidity: m.humidity,
      risk: m.risk_level,
    })),
  });
});

app.get("/api/reports", (req, res) => {
  res.json({
    generated_at: new Date().toISOString(),
    monitoring_area: simulationState.area,
    drone_id: "EID-ALPHA-01",
    total_samples: measurements.length,
    active_alerts: alerts.filter(a => a.status !== "RESOLVED").length,
    risk_summary: "High concentration zone detected in Sector 4 downwind area.",
    recommendations: [
      "Deploy secondary survey drone EID Scout Beta to verify residential perimeter.",
      "Notify environmental hazard dispatch if Methane stays >200 PPM.",
      "Re-calibrate MQ-4 sensor post-flight due to high gas exposure.",
    ],
  });
});

// Gemini AI Integration Endpoints
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, contextData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent fallback when GEMINI_API_KEY environment variable is missing
      const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : "";
      let reply = "I am operating in environmental analytical offline mode. ";
      if (lastMsg.toLowerCase().includes("methane") || lastMsg.toLowerCase().includes("leak")) {
        reply += "Methane levels above 150 PPM at Jawaharnagar Solid Waste Facility require immediate flare stack checks and downwind perimeter verification.";
      } else if (lastMsg.toLowerCase().includes("drone") || lastMsg.toLowerCase().includes("mission")) {
        reply += "Drone EID-HYD-01 is currently maintaining 52m AGL altitude over Sector 3 with active MQ-4 & Optical Gas Imaging sensors.";
      } else {
        reply += "I am monitoring Hyderabad's ambient air quality and drone telemetry. Current average AQI across Jawaharnagar and Patancheru is within moderate parameters.";
      }
      return res.json({ text: reply, modelUsed: "local-analytical-engine" });
    }

    const systemInstruction = `You are the Environmental Intelligence AI Copilot (EID Hyderabad Assistant).
You specialize in real-time air quality monitoring, methane gas leak detection, drone flight path optimization, weather vector dispersion modeling, and municipal environmental safety compliance in Hyderabad, Telangana (e.g., Jawaharnagar Waste Management, Patancheru Industrial Belt, Hussain Sagar Eco-Zone, HITEC City).
Provide direct, concise, highly knowledgeable, and actionable responses.`;

    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === "model" || m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    if (contextData) {
      formattedContents.unshift({
        role: "user",
        parts: [{ text: `[Current Live System Telemetry Context]: ${JSON.stringify(contextData)}` }],
      });
      formattedContents.unshift({
        role: "model",
        parts: [{ text: "Acknowledged live environmental telemetry context." }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text, modelUsed: "gemini-2.5-flash" });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

app.post("/api/gemini/analyze-telemetry", async (req, res) => {
  try {
    const { measurements, drone, simulationState } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        analysis: "High methane concentration (180+ PPM) detected in downwind plume trajectory over Jawaharnagar Sector 4.",
        riskLevel: "HIGH",
        recommendedActions: [
          "Deploy auxiliary drone node EID-HYD-02 to expand perimeter mapping.",
          "Issue automated advisory to municipal waste station supervisor.",
          "Verify wind speed vector and adjust flight waypoints downwind.",
        ],
        modelUsed: "local-analytical-engine",
      });
    }

    const prompt = `Analyze this live drone sensor telemetry from Hyderabad monitoring zone:
Measurements sample: ${JSON.stringify((measurements || []).slice(-10))}
Active Drone: ${JSON.stringify(drone)}
Simulation state: ${JSON.stringify(simulationState)}

Provide a concise JSON analysis with keys:
- "analysis": short summary of environmental risk, gas dispersion, and AQI
- "riskLevel": "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL"
- "recommendedActions": array of 3 bullet points for drone operators and municipal response team`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ ...parsed, modelUsed: "gemini-2.5-flash" });
  } catch (error: any) {
    console.error("Gemini Telemetry Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to run telemetry analysis" });
  }
});

// API 404 Fallback - ensures unmatched /api routes return JSON instead of Vite index.html
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found` });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EID Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
