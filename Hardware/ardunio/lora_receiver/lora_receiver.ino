/*
 * ============================================================
 * Environmental Intelligence Drone
 * LoRa Ground Station Receiver
 * ============================================================
 *
 * Receives environmental telemetry from EID drone.
 *
 * Current output:
 *   Serial Monitor
 *
 * Future:
 *   ESP32 Wi-Fi -> FastAPI -> Database -> Dashboard
 * ============================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>

// ============================================================
// LORA PINS
// ============================================================

#define LORA_SCK      18
#define LORA_MISO     19
#define LORA_MOSI     23
#define LORA_SS       5
#define LORA_RST      14
#define LORA_DIO0     26

// ============================================================
// FREQUENCY
// ============================================================

#define LORA_FREQUENCY 433E6

// ============================================================
// SETUP
// ============================================================

void setup()
{
    Serial.begin(115200);

    delay(1000);

    Serial.println();
    Serial.println("=====================================");
    Serial.println(" EID LoRa Ground Station");
    Serial.println("=====================================");

    // SPI
    SPI.begin(
        LORA_SCK,
        LORA_MISO,
        LORA_MOSI,
        LORA_SS
    );

    // LoRa pins
    LoRa.setPins(
        LORA_SS,
        LORA_RST,
        LORA_DIO0
    );

    // Initialize LoRa
    if (!LoRa.begin(LORA_FREQUENCY))
    {
        Serial.println("[ERROR] LoRa initialization failed!");

        while (true)
        {
            delay(1000);
        }
    }

    LoRa.enableCrc();

    Serial.println("[OK] LoRa receiver ready");
    Serial.println("-------------------------------------");
}

// ============================================================
// LOOP
// ============================================================

void loop()
{
    int packetSize = LoRa.parsePacket();

    if (packetSize)
    {
        Serial.println();
        Serial.println("=====================================");
        Serial.println(" NEW ENVIRONMENTAL PACKET");
        Serial.println("=====================================");

        String receivedData = "";

        while (LoRa.available())
        {
            char c = LoRa.read();

            receivedData += c;
        }

        Serial.println("Payload:");
        Serial.println(receivedData);

        Serial.println();
        Serial.print("RSSI: ");
        Serial.print(LoRa.packetRssi());
        Serial.println(" dBm");

        Serial.print("SNR: ");
        Serial.print(LoRa.packetSnr());
        Serial.println(" dB");

        Serial.println("=====================================");
    }
}