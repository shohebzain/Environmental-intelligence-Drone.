
# EID Circuit Diagram

This directory is reserved for the Environmental Intelligence Drone circuit diagram.

## Recommended Diagram

The circuit diagram should show:

```text
                    ┌─────────────┐
                    │    MQ-4     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    ESP32    │
                    └──────▲──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
    MQ-135               DHT22               GPS
       │                   │                   │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                       BMP280
                           │
                           ▼
                         LoRa
                           │
                           ▼
                    Ground Station
                
Hardware Modules
ESP32
MQ-4
MQ-135
DHT22
BMP280
GPS
LoRa
Power supply
Sensor boom
Mechanical Design

The environmental sensors should be mounted on a dedicated boom away from the main propeller airflow.

The purpose is to reduce potential airflow interference during measurement.

Future Hardware Documentation

Add:

Actual circuit diagram
PCB/wiring photograph
Sensor boom photograph
Drone assembly photograph
Power distribution diagram
3D model