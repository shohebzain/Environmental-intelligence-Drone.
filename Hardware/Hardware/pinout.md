# EID Hardware Pinout

## ESP32 Environmental Node

| Component | Signal | ESP32 Pin |
|---|---|---:|
| MQ-4 | Analog Out | GPIO 34 |
| MQ-135 | Analog Out | GPIO 35 |
| DHT22 | Data | GPIO 4 |
| BMP280 | SDA | GPIO 21 |
| BMP280 | SCL | GPIO 22 |
| GPS | TX | GPIO 16 |
| GPS | RX | GPIO 17 |
| LoRa | NSS / CS | GPIO 5 |
| LoRa | RESET | GPIO 14 |
| LoRa | DIO0 | GPIO 26 |
| LoRa | SCK | GPIO 18 |
| LoRa | MISO | GPIO 19 |
| LoRa | MOSI | GPIO 23 |

## I2C

BMP280:

```text
BMP280 VCC → Appropriate supply
BMP280 GND → GND
BMP280 SDA → GPIO 21
BMP280 SCL → GPIO 22