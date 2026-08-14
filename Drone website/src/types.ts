/**
 * Environmental Intelligence Drone (EID) Platform Data Models
 */

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
}

export type DataSource = 'REAL' | 'SIMULATION';

export type DroneConnectionStatus = 'ONLINE' | 'LIMITED' | 'OFFLINE';
export type DroneFlightStatus = 'IDLE' | 'IN_FLIGHT' | 'HOLDING' | 'LANDING' | 'CHARGING';
export type GpsStatus = 'LOCKED' | 'SEARCHING' | 'NO_SIGNAL';
export type LoraStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

export type RiskLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Drone {
  id: string;
  drone_id: string;
  name: string;
  status: DroneConnectionStatus;
  battery: number; // percentage 0-100
  latitude: number;
  longitude: number;
  altitude: number; // meters
  gps_status: GpsStatus;
  flight_status: DroneFlightStatus;
  current_mission_id?: string;
  last_seen: string;
  lora_status: LoraStatus;
  signal_strength_dbm: number;
  speed_ms: number;
  model?: string;
  zone?: string;
  firmware?: string;
  sensors_payload?: string[];
}

export interface Measurement {
  id: string;
  measurement_id: string;
  drone_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  methane: number; // PPM (MQ-4)
  air_quality: number; // AQI (MQ-135)
  temperature: number; // °C (DHT22)
  humidity: number; // % (DHT22)
  pressure: number; // hPa (BMP280)
  wind_speed: number; // m/s
  wind_direction: number; // degrees 0-360
  data_source: DataSource;
  risk_level: RiskLevel;
}

export interface Waypoint {
  id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  altitude: number;
  status: 'PENDING' | 'REACHED' | 'CURRENT';
}

export type MissionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface Mission {
  id: string;
  mission_id: string;
  drone_id: string;
  name: string;
  area: string;
  status: MissionStatus;
  start_time: string;
  end_time?: string;
  waypoints: Waypoint[];
  coverage_sq_km: number;
  total_measurements: number;
  notes?: string;
}

export interface Prediction {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  predicted_intensity: number; // 0 - 100
  risk_level: RiskLevel;
  model_name: string;
  model_version: string;
  confidence: number; // 0 - 1
  prediction_horizon_min: number;
  influencing_factors: string[];
  reasoning: string;
}

export type AlertSeverity = 'NORMAL' | 'INFO' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'DETECTED' | 'GENERATED' | 'DISPLAYED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  alert_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  severity: AlertSeverity;
  parameter: 'Methane' | 'Air Quality' | 'Temperature' | 'Battery' | 'LoRa Signal' | 'Pressure';
  value: number;
  unit: string;
  message: string;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_note?: string;
}

export interface SensorHardware {
  id: string;
  code: 'MQ-4' | 'MQ-135' | 'DHT22' | 'BMP280' | 'ANEMOMETER';
  name: string;
  parameter: string;
  status: 'Online' | 'Calibrating' | 'Degraded' | 'Offline';
  calibration_status: 'Valid' | 'Needs Calibration' | 'Expired';
  last_reading: string;
  unit: string;
  drone_id: string;
}

export interface SimulationState {
  is_simulation_mode?: boolean;
  active: boolean;
  speed: number; // 1, 2, 5
  area: string;
  pollution_intensity: 'Normal' | 'Moderate Hotspot' | 'High Hotspot' | 'Critical Leak';
  wind_speed: number;
  wind_direction: number;
  step_count: number;
}

export interface AnalyticsSummary {
  summary: {
    total_measurements: number;
    avg_methane: number;
    max_methane: number;
    avg_aqi: number;
    max_aqi: number;
    risk_distribution: { level: RiskLevel; count: number }[];
  };
  time_series: {
    timestamp: string;
    methane: number;
    air_quality: number;
    temperature: number;
    humidity: number;
    risk: RiskLevel;
  }[];
}

export interface ReportData {
  reportType: 'jawaharnagar' | 'patancheru' | 'hussainsagar' | string;
  title: string;
  zone: string;
  date: string;
  surveyId: string;
  riskLevel: string;
  peakMethane: string;
  avgAqi: string;
  temp: string;
  wind: string;
  coverage: string;
  droneNode: string;
  summary: string;
  hotspot: string;
  recommendations: string[];
  analytics?: AnalyticsSummary;
  timeSeries?: {
    timestamp: string;
    methane: number;
    air_quality: number;
    temperature: number;
    humidity: number;
    risk: string;
  }[];
}
