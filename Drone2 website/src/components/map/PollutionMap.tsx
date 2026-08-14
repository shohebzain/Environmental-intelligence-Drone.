import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Measurement, Drone, Waypoint, Prediction } from "../../types";
import { RiskBadge } from "../common/RiskBadge";
import { X, Layers, Navigation, Info, Eye, ShieldAlert, Cpu } from "lucide-react";

export type MapTileStyle = "satellite" | "hybrid" | "streets" | "dark";

export interface PresetZone {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  zoom: number;
  description: string;
}

export const HYDERABAD_PRESET_ZONES: PresetZone[] = [
  {
    id: "jawaharnagar",
    name: "Jawaharnagar Dump Yard",
    district: "Medchal-Malkajgiri, Hyderabad",
    lat: 17.5020,
    lng: 78.5830,
    zoom: 15,
    description: "Solid waste facility & methane plume monitoring area",
  },
  {
    id: "patancheru",
    name: "Patancheru Industrial Estate",
    district: "Sangareddy District, Hyderabad",
    lat: 17.5280,
    lng: 78.2670,
    zoom: 15,
    description: "Industrial chemical stack & effluent corridor",
  },
  {
    id: "hussainsagar",
    name: "Hussain Sagar Eco Lake",
    district: "Central Hyderabad",
    lat: 17.4239,
    lng: 78.4738,
    zoom: 15,
    description: "Urban lake green buffer & ambient AQI zone",
  },
  {
    id: "hiteccity",
    name: "HITEC City Cyberabad",
    district: "West Hyderabad",
    lat: 17.4435,
    lng: 78.3772,
    zoom: 15,
    description: "Commercial IT corridor & vehicular traffic node",
  },
];

interface PollutionMapProps {
  measurements: Measurement[];
  drone?: Drone;
  drones?: Drone[];
  waypoints?: Waypoint[];
  prediction?: Prediction;
  selectedMeasurement?: Measurement | null;
  onSelectMeasurement?: (m: Measurement) => void;
  height?: string;
  showControls?: boolean;
  defaultTileStyle?: MapTileStyle;
}

export const PollutionMap: React.FC<PollutionMapProps> = ({
  measurements,
  drone,
  drones = [],
  waypoints = [],
  prediction,
  onSelectMeasurement,
  height = "520px",
  showControls = true,
  defaultTileStyle = "satellite",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);

  // Map View Settings
  const [tileStyle, setTileStyle] = useState<MapTileStyle>(defaultTileStyle);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);
  const [activeZoneId, setActiveZoneId] = useState<string>("jawaharnagar");

  // Selected Point Inspector
  const [activePoint, setActivePoint] = useState<Measurement | null>(null);
  const [showRawDetails, setShowRawDetails] = useState(false);

  // HUD Coordinates state
  const [mapCenterCoords, setMapCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.5020,
    lng: 78.5830,
  });

  // Combine single drone prop with drones array
  const allDrones: Drone[] = [];
  const droneMap = new Map<string, Drone>();

  if (drone) droneMap.set(drone.id || drone.drone_id, drone);
  drones.forEach((d) => {
    if (d) droneMap.set(d.id || d.drone_id, d);
  });
  droneMap.forEach((d) => allDrones.push(d));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = allDrones[0]?.latitude || 17.5020;
      const initialLng = allDrones[0]?.longitude || 78.5830;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      map.on("moveend", () => {
        const center = map.getCenter();
        setMapCenterCoords({ lat: center.lat, lng: center.lng });
      });

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when tileStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (overlayTileLayerRef.current) {
      map.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    if (tileStyle === "satellite" || tileStyle === "hybrid") {
      // High Resolution Esri World Imagery Satellite Tiles
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
          maxZoom: 19,
        }
      ).addTo(map);
      baseTileLayerRef.current = satLayer;

      if (tileStyle === "hybrid") {
        // Esri Boundaries and Places Reference Overlay
        const refLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            opacity: 0.9,
          }
        ).addTo(map);
        overlayTileLayerRef.current = refLayer;
      }
    } else if (tileStyle === "streets") {
      // Detailed OpenStreetMap Street Map
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      baseTileLayerRef.current = streetLayer;
    } else if (tileStyle === "dark") {
      // CartoDB Dark Canvas
      const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      baseTileLayerRef.current = darkLayer;
    }
  }, [tileStyle]);

  // Handle flying to a preset zone
  const flyToZone = (zone: PresetZone) => {
    setActiveZoneId(zone.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], zone.zoom, {
        duration: 1.2,
      });
    }
  };

  // Render Overlays & Georeferenced Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Mission Boundary Polygon
    if (waypoints.length >= 3) {
      const boundaryCoords = waypoints.map((w) => [w.latitude, w.longitude] as [number, number]);
      boundaryCoords.push([waypoints[0].latitude, waypoints[0].longitude]);
      const boundaryPolygon = L.polygon(boundaryCoords, {
        color: tileStyle === "satellite" || tileStyle === "hybrid" ? "#34d399" : "#047857",
        weight: 2.5,
        dashArray: "6, 6",
        fillColor: "#10b981",
        fillOpacity: 0.12,
      });
      boundaryPolygon.bindTooltip("Survey Mission Boundary", { sticky: true });
      layerGroup.addLayer(boundaryPolygon);
    }

    // 2. Mission Waypoints Markers
    waypoints.forEach((wp) => {
      const wpIcon = L.divIcon({
        className: "custom-wp-icon",
        html: `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-emerald-400 border border-emerald-400 font-mono font-bold text-[10px] shadow-md">
            ${wp.sequence}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const wpMarker = L.marker([wp.latitude, wp.longitude], { icon: wpIcon });
      wpMarker.bindPopup(`
        <div class="p-2 font-sans text-xs">
          <div class="font-bold text-slate-900">Waypoint #${wp.sequence}</div>
          <div class="text-slate-600">Lat: ${wp.latitude.toFixed(5)}°, Lng: ${wp.longitude.toFixed(5)}°</div>
          <div class="text-slate-600">Altitude: ${wp.altitude}m AGL</div>
          <div class="text-emerald-700 font-semibold uppercase mt-1">Status: ${wp.status}</div>
        </div>
      `);
      layerGroup.addLayer(wpMarker);
    });

    // 3. Drone Flight Path Polyline
    if (showFlightPath && measurements.length > 1) {
      const pathCoords = measurements.map((m) => [m.latitude, m.longitude] as [number, number]);
      const flightPolyline = L.polyline(pathCoords, {
        color: tileStyle === "satellite" || tileStyle === "hybrid" ? "#38bdf8" : "#0284c7",
        weight: 3.5,
        opacity: 0.9,
      });
      layerGroup.addLayer(flightPolyline);
    }

    // 4. Pollution Heatmap Circles
    if (showHeatmap && measurements.length > 0) {
      measurements.forEach((m) => {
        let circleColor = "#10b981";
        let radius = 35;
        let opacity = 0.3;

        if (m.risk_level === "CRITICAL") {
          circleColor = "#ef4444";
          radius = 75;
          opacity = 0.55;
        } else if (m.risk_level === "HIGH") {
          circleColor = "#f97316";
          radius = 55;
          opacity = 0.45;
        } else if (m.risk_level === "MODERATE") {
          circleColor = "#eab308";
          radius = 42;
          opacity = 0.35;
        }

        const heatCircle = L.circle([m.latitude, m.longitude], {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: opacity,
          radius,
          stroke: false,
        });
        layerGroup.addLayer(heatCircle);
      });
    }

    // 5. Predicted Plume Dispersion Overlay
    if (showPredictions && prediction) {
      const predCircle = L.circle([prediction.latitude, prediction.longitude], {
        color: "#f59e0b",
        fillColor: "#fbbf24",
        fillOpacity: 0.25,
        radius: 140,
        dashArray: "6, 6",
        weight: 2.5,
      });
      predCircle.bindTooltip(`AI Predicted Methane Plume: ${prediction.predicted_risk} Risk`, { sticky: true });
      layerGroup.addLayer(predCircle);
    }

    // 6. Georeferenced Measurement Point Markers
    if (showMeasurements) {
      measurements.forEach((m) => {
        let pointColor = "#10b981";
        if (m.risk_level === "CRITICAL") pointColor = "#ef4444";
        if (m.risk_level === "HIGH") pointColor = "#f97316";
        if (m.risk_level === "MODERATE") pointColor = "#eab308";

        const circleMarker = L.circleMarker([m.latitude, m.longitude], {
          radius: 6.5,
          fillColor: pointColor,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        });

        circleMarker.bindTooltip(
          `Methane: ${m.methane} PPM | AQI: ${m.air_quality} (${m.latitude.toFixed(4)}°, ${m.longitude.toFixed(4)}°)`,
          { direction: "top" }
        );

        circleMarker.on("click", () => {
          setActivePoint(m);
          setShowRawDetails(false);
          if (onSelectMeasurement) onSelectMeasurement(m);
        });

        layerGroup.addLayer(circleMarker);
      });
    }

    // 7. Georeferenced Active Drone Markers
    allDrones.forEach((d) => {
      const isFlying = d.flight_status === "IN_FLIGHT";
      const statusBg = isFlying ? "bg-emerald-600" : d.status === "ONLINE" ? "bg-amber-500" : "bg-slate-500";

      const droneIcon = L.divIcon({
        className: "custom-drone-node-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <!-- Pulsating GPS Beacon Ring -->
            <div class="absolute w-12 h-12 rounded-full ${statusBg} opacity-30 animate-ping"></div>
            
            <!-- Drone Marker Pill -->
            <div class="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBg} text-white border-2 border-white shadow-lg font-sans">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span class="text-[11px] font-extrabold tracking-wide whitespace-nowrap">${d.drone_id}</span>
              <span class="text-[9px] font-bold bg-black/30 px-1 py-0.2 rounded">${d.battery}%</span>
            </div>
          </div>
        `,
        iconSize: [110, 40],
        iconAnchor: [55, 20],
      });

      const droneMarker = L.marker([d.latitude, d.longitude], { icon: droneIcon });

      const popupHtml = `
        <div class="p-3 font-sans text-xs space-y-2 min-w-[220px]">
          <div class="border-b border-slate-200 pb-2">
            <div class="text-[10px] uppercase font-bold text-slate-400">EID Active Drone Node</div>
            <div class="text-sm font-bold text-slate-900">${d.name} (${d.drone_id})</div>
            <div class="text-[11px] text-emerald-700 font-semibold">${d.zone || "Hyderabad Region"}</div>
          </div>

          <div class="space-y-1 text-slate-700 text-[11px]">
            <div class="flex justify-between">
              <span class="text-slate-500">Georef Coordinates:</span>
              <span class="font-mono font-bold text-slate-900">${d.latitude.toFixed(5)}°N, ${d.longitude.toFixed(5)}°E</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Flight Telemetry:</span>
              <span class="font-semibold text-slate-900">${d.altitude}m AGL • ${d.speed_ms} m/s</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Battery Level:</span>
              <span class="font-bold text-emerald-700">${d.battery}% (${d.flight_status})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">GPS & Wireless:</span>
              <span class="font-semibold text-slate-800">${d.gps_status} • LoRa ${d.signal_strength_dbm} dBm</span>
            </div>
          </div>

          ${
            d.sensors_payload && d.sensors_payload.length > 0
              ? `
            <div class="pt-1 border-t border-slate-100">
              <span class="text-[10px] text-slate-400 font-bold block uppercase">Mounted Sensor Payload:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                ${d.sensors_payload
                  .map(
                    (s) =>
                      `<span class="bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">${s}</span>`
                  )
                  .join("")}
              </div>
            </div>
            `
              : ""
          }
        </div>
      `;

      droneMarker.bindPopup(popupHtml);
      layerGroup.addLayer(droneMarker);
    });
  }, [
    measurements,
    allDrones,
    waypoints,
    prediction,
    showHeatmap,
    showMeasurements,
    showFlightPath,
    showPredictions,
    tileStyle,
  ]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs"
      style={{ height }}
    >
      {/* Top Bar: Title & Preset Zones Quick Fly Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-2xl">
        <div className="bg-slate-900/90 text-white border border-slate-700 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-md flex items-center gap-2 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Hyderabad Environmental GIS Map
        </div>

        {/* Preset Zone Quick-Fly Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/85 border border-slate-700 rounded-xl p-1 backdrop-blur-md shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400" /> Zones:
          </span>
          {HYDERABAD_PRESET_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => flyToZone(zone)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                activeZoneId === zone.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              {zone.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Tile Style Switcher */}
      {showControls && (
        <div className="absolute top-3 right-12 z-20 bg-slate-900/90 text-white border border-slate-700 rounded-xl p-2 backdrop-blur-md shadow-lg font-sans text-xs space-y-2 max-w-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 px-1 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Tile Layer Mode
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => setTileStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all text-left ${
                tileStyle === "satellite"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-xs"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              🛰️ Satellite
            </button>

            <button
              onClick={() => setTileStyle("hybrid")}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all text-left ${
                tileStyle === "hybrid"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-xs"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              🗺️ Hybrid
            </button>

            <button
              onClick={() => setTileStyle("streets")}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all text-left ${
                tileStyle === "streets"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-xs"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              🏙️ Streets
            </button>

            <button
              onClick={() => setTileStyle("dark")}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all text-left ${
                tileStyle === "dark"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-xs"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              🌙 Dark GIS
            </button>
          </div>

          {/* Layer Toggles */}
          <div className="pt-1 border-t border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-1">Data Overlays</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2 py-0.5 rounded border font-semibold ${
                  showHeatmap ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {showHeatmap ? "✓ Heatmap" : "+ Heatmap"}
              </button>

              <button
                onClick={() => setShowMeasurements(!showMeasurements)}
                className={`px-2 py-0.5 rounded border font-semibold ${
                  showMeasurements ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {showMeasurements ? "✓ Points" : "+ Points"}
              </button>

              <button
                onClick={() => setShowFlightPath(!showFlightPath)}
                className={`px-2 py-0.5 rounded border font-semibold ${
                  showFlightPath ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {showFlightPath ? "✓ Path" : "+ Path"}
              </button>

              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`px-2 py-0.5 rounded border font-semibold ${
                  showPredictions ? "bg-amber-950 text-amber-300 border-amber-700" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {showPredictions ? "✓ AI Plume" : "+ AI Plume"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom GIS HUD Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Map Legend */}
        <div className="pointer-events-auto bg-slate-900/90 text-white border border-slate-700 rounded-xl px-3.5 py-2 backdrop-blur-md text-xs font-sans shadow-md space-y-1 max-w-md">
          <div className="flex items-center gap-4 font-bold text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              ● Telemetry Node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-400/20" />
              ◌ AI Plume
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              🛸 {allDrones.length} Active Nodes
            </span>
          </div>
        </div>

        {/* Live Coordinate HUD */}
        <div className="pointer-events-auto bg-slate-900/90 text-slate-300 border border-slate-700 rounded-xl px-3 py-1.5 backdrop-blur-md text-[11px] font-mono flex items-center gap-3">
          <span>
            Center: <strong className="text-white">{mapCenterCoords.lat.toFixed(5)}°N, {mapCenterCoords.lng.toFixed(5)}°E</strong>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 uppercase font-sans font-bold text-[10px]">
            Mode: {tileStyle}
          </span>
        </div>
      </div>

      {/* Location Point Inspector Modal */}
      {activePoint && (
        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative font-sans space-y-4 text-slate-800">
            <button
              onClick={() => setActivePoint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Georeferenced Telemetry Point
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Monitoring Point Inspection
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">GPS Location</span>
                <span className="font-mono font-bold text-slate-900">
                  {activePoint.latitude.toFixed(5)}°N, {activePoint.longitude.toFixed(5)}°E
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Methane Level</span>
                <span className="font-bold text-slate-900">
                  {activePoint.methane > 100 ? "Elevated" : "Normal"} ({activePoint.methane} PPM)
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Air Quality Index</span>
                <span className="font-bold text-slate-900">
                  AQI {activePoint.air_quality} ({activePoint.air_quality > 120 ? "Moderate" : "Good"})
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Climate Readings</span>
                <span className="font-semibold text-slate-800">
                  {activePoint.temperature}°C • {activePoint.humidity}% RH
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Risk Assessment</span>
                <RiskBadge level={activePoint.risk_level} size="sm" />
              </div>
            </div>

            {/* Technical Detail Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRawDetails(!showRawDetails)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center justify-between w-full"
              >
                <span>{showRawDetails ? "Hide technical data" : "View raw sensor payload →"}</span>
              </button>

              {showRawDetails && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
                  <div>ID: <span className="text-slate-900 font-bold">{activePoint.measurement_id}</span></div>
                  <div>Barometric: <span className="text-slate-900 font-bold">{activePoint.pressure} hPa</span></div>
                  <div>Wind Vector: <span className="text-slate-900 font-bold">{activePoint.wind_speed} m/s ({activePoint.wind_direction}°)</span></div>
                  <div>Source Node: <span className="text-slate-900 font-bold">{activePoint.drone_id || "EID-HYD-01"}</span></div>
                  <div>Timestamp: <span className="text-slate-900 font-bold">{activePoint.timestamp}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
