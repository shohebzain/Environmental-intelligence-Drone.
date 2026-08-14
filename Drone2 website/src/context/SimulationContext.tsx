import React, { createContext, useContext, useState, useEffect } from "react";
import { SimulationState } from "../types";

interface SimulationContextType {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  updateSimulationState: (newState: Partial<SimulationState>) => Promise<void>;
  toggleSimulationMode: () => Promise<void>;
  toggleActive: () => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setScenario: (intensity: SimulationState["pollution_intensity"]) => Promise<void>;
}

const defaultSimulationState: SimulationState = {
  is_simulation_mode: true,
  active: true,
  speed: 1,
  area: "Jawaharnagar Solid Waste Facility (Hyderabad)",
  pollution_intensity: "High Hotspot",
  wind_speed: 4.8,
  wind_direction: 215,
  step_count: 50,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>(defaultSimulationState);

  // Fetch initial simulation state from backend
  useEffect(() => {
    fetch("/api/simulation/state")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load simulation state");
      })
      .then((data) => {
        setSimulationState((prev) => ({
          ...prev,
          ...data,
          is_simulation_mode: data.is_simulation_mode ?? true,
        }));
      })
      .catch((err) => console.error("Error loading simulation state:", err));
  }, []);

  const updateSimulationState = async (newState: Partial<SimulationState>) => {
    const updated = { ...simulationState, ...newState };
    setSimulationState(updated);

    try {
      await fetch("/api/simulation/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      // also post to /api/simulation/state for compatibility
      await fetch("/api/simulation/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to sync simulation state:", err);
    }
  };

  const toggleSimulationMode = async () => {
    await updateSimulationState({
      is_simulation_mode: !simulationState.is_simulation_mode,
    });
  };

  const toggleActive = async () => {
    await updateSimulationState({
      active: !simulationState.active,
    });
  };

  const setSpeed = async (speed: number) => {
    await updateSimulationState({ speed });
  };

  const setScenario = async (pollution_intensity: SimulationState["pollution_intensity"]) => {
    await updateSimulationState({ pollution_intensity });
  };

  return (
    <SimulationContext.Provider
      value={{
        simulationState,
        setSimulationState,
        updateSimulationState,
        toggleSimulationMode,
        toggleActive,
        setSpeed,
        setScenario,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    // Fallback if used outside Provider
    return {
      simulationState: defaultSimulationState,
      setSimulationState: () => {},
      updateSimulationState: async () => {},
      toggleSimulationMode: async () => {},
      toggleActive: async () => {},
      setSpeed: async () => {},
      setScenario: async () => {},
    };
  }
  return context;
};
