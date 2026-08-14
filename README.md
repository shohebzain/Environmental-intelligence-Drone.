# Environmental Intelligence Drone (EID)

Environmental Intelligence Drone is a prototype platform for monitoring air and weather conditions in pollution-prone areas using an ESP32-based sensor node, LoRa telemetry, and a web dashboard.

## What this project includes

- **Drone/field sensor firmware** (ESP32 + sensors + GPS + LoRa)
- **LoRa ground receiver firmware**
- **React + TypeScript dashboard(s)** for visualization and alerts
- **Hardware documentation** (pinout and circuit diagram notes)

## Repository structure

```text
.
├── Drone website/              # Main web dashboard (React + Vite + Express)
├── Drone2 website/             # Alternate dashboard variant
├── Hardware/
│   ├── ardunio/                # ESP32 firmware and LoRa receiver sketches
│   │   ├── env_node/
│   │   │   └── EID_Environmental_Node.ino
│   │   └── lora_receiver/
│   │       └── lora_receiver.ino
│   └── Hardware/
│       ├── Circuit_diagram/
│       └── pinout.md
├── Block-Diagram.png
└── Product requirement document.pdf
```

## System overview

1. Sensors (MQ-4, MQ-135, DHT22, BMP280) and GPS feed the ESP32 node.
2. The ESP32 packages telemetry and sends it over LoRa.
3. A LoRa receiver collects packets at the ground station.
4. Dashboard applications visualize readings, trends, and risk indicators.

## Quick start

### 1) Run the web dashboard

Choose one dashboard folder (`Drone website` or `Drone2 website`):

```bash
cd "Drone website"
npm install
cp .env.example .env.local
npm run dev
```

Then open the local URL shown in the terminal.

> `GEMINI_API_KEY` is required for Gemini-powered features.

### 2) Build production web assets

```bash
cd "Drone website"
npm run build
npm run start
```

### 3) Flash ESP32 firmware

- Open `Hardware/ardunio/env_node/EID_Environmental_Node.ino` in Arduino IDE.
- Install required libraries used by the sketch (LoRa, DHT, Adafruit BMP280, TinyGPS++).
- Select the correct ESP32 board/port and upload.

### 4) Flash LoRa receiver

- Open `Hardware/ardunio/lora_receiver/lora_receiver.ino`.
- Upload to the receiver ESP32 configured with matching LoRa frequency.

## Hardware notes

- Pin mapping is documented in `Hardware/Hardware/pinout.md`.
- Circuit diagram notes are in `Hardware/Hardware/Circuit_diagram/README.md`.

## Current status

This repository represents an active prototype. Some assets and documents are drafts and may evolve as hardware and dashboard capabilities are refined.
