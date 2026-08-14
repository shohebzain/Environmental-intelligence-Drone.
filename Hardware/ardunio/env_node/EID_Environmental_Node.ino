/*
 * ============================================================
 * Environmental Intelligence Drone (EID)
 * Environmental Sensor Node
 * ============================================================
 *
 * Platform: ESP32
 *
 * Sensors:
 *   MQ-4     -> Methane / gas sensing
 *   MQ-135   -> Air-quality-related sensing
 *   DHT22    -> Temperature + Humidity
 *   BMP280   -> Atmospheric Pressure
 *   GPS      -> Latitude + Longitude
 *
 * Communication:
 *   LoRa SX1276/SX1278
 *
 * ============================================================
 *
 * IMPORTANT:
 * MQ-4 and MQ-135 values are RAW ADC values.
 * They are NOT directly ppm or certified AQI values.
 * Proper calibration is required before quantitative use.
 *
 * ============================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <TinyGPSPlus.h>

// ============================================================
// PIN DEFINITIONS
// ============================================================

// MQ Sensors
#define MQ4_PIN       34
#define MQ135_PIN     35

// DHT22
#define DHT_PIN       4
#define DHT_TYPE      DHT22

// I2C
#define SDA_PIN       21
#define SCL_PIN       22

// GPS
#define GPS_RX_PIN    16
#define GPS_TX_PIN    17

// LoRa
#define LORA_SCK      18
#define LORA_MISO     19
#define LORA_MOSI     23
#define LORA_SS       5
#define LORA_RST      14
#define LORA_DIO0     26

// ============================================================
// LORA FREQUENCY
// ============================================================

// Change according to your LoRa module and local regulations.
// Examples:
// 433E6
// 868E6
// 915E6

#define LORA_FREQUENCY 433E6

// ============================================================
// OBJECTS
// ============================================================

DHT dht(DHT_PIN, DHT_TYPE);

Adafruit_BMP280 bmp;

TinyGPSPlus gps;

HardwareSerial GPSSerial(1);

// ============================================================
// VARIABLES
// ============================================================

unsigned long packetID = 0;

unsigned long lastSensorRead = 0;

const unsigned long SENSOR_INTERVAL = 2000;

// Wind sensor placeholder
float windSpeed = 0.0;
float windDirection = 0.0;

// ============================================================
// SETUP
// ============================================================

void setup()
{
    Serial.begin(115200);

    delay(1000);

    Serial.println();
    Serial.println("==========================================");
    Serial.println(" Environmental Intelligence Drone");
    Serial.println(" ESP32 Environmental Sensor Node");
    Serial.println("==========================================");

    // --------------------------------------------------------
    // ADC
    // --------------------------------------------------------

    analogReadResolution(12);

    Serial.println("[OK] ADC configured");

    // --------------------------------------------------------
    // DHT22
    // --------------------------------------------------------

    dht.begin();

    Serial.println("[OK] DHT22 initialized");

    // --------------------------------------------------------
    // I2C
    // --------------------------------------------------------

    Wire.begin(SDA_PIN, SCL_PIN);

    // --------------------------------------------------------
    // BMP280
    // --------------------------------------------------------

    if (bmp.begin(0x76))
    {
        Serial.println("[OK] BMP280 found at 0x76");
    }
    else if (bmp.begin(0x77))
    {
        Serial.println("[OK] BMP280 found at 0x77");
    }
    else
    {
        Serial.println("[WARNING] BMP280 not detected");
    }

    // --------------------------------------------------------
    // GPS
    // --------------------------------------------------------

    GPSSerial.begin(
        9600,
        SERIAL_8N1,
        GPS_RX_PIN,
        GPS_TX_PIN
    );

    Serial.println("[OK] GPS initialized");

    // --------------------------------------------------------
    // LORA
    // --------------------------------------------------------

    SPI.begin(
        LORA_SCK,
        LORA_MISO,
        LORA_MOSI,
        LORA_SS
    );

    LoRa.setPins(
        LORA_SS,
        LORA_RST,
        LORA_DIO0
    );

    Serial.println("[INFO] Starting LoRa...");

    if (!LoRa.begin(LORA_FREQUENCY))
    {
        Serial.println("[ERROR] LoRa initialization failed!");

        while (true)
        {
            delay(1000);
        }
    }

    LoRa.setTxPower(17);
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    LoRa.enableCrc();

    Serial.println("[OK] LoRa initialized");

    Serial.println("------------------------------------------");
    Serial.println("System ready.");
    Serial.println("------------------------------------------");
}

// ============================================================
// LOOP
// ============================================================

void loop()
{
    // Continuously process GPS data
    readGPS();

    // Read sensors every 2 seconds
    if (millis() - lastSensorRead >= SENSOR_INTERVAL)
    {
        lastSensorRead = millis();

        readSensors();

        printSensorData();

        sendLoRaData();

        Serial.println("------------------------------------------");
    }
}

// ============================================================
// GPS
// ============================================================

void readGPS()
{
    while (GPSSerial.available())
    {
        char c = GPSSerial.read();

        gps.encode(c);
    }
}

// ============================================================
// SENSOR READING
// ============================================================

void readSensors()
{
    packetID++;

    // --------------------------------------------------------
    // MQ-4
    // --------------------------------------------------------

    int mq4Raw = analogRead(MQ4_PIN);

    // Raw ADC value only
    float methaneRaw = mq4Raw;

    // --------------------------------------------------------
    // MQ-135
    // --------------------------------------------------------

    int mq135Raw = analogRead(MQ135_PIN);

    // Raw ADC value only
    float airQualityRaw = mq135Raw;

    // --------------------------------------------------------
    // DHT22
    // --------------------------------------------------------

    float temperature = dht.readTemperature();

    float humidity = dht.readHumidity();

    if (isnan(temperature))
    {
        temperature = -999;
    }

    if (isnan(humidity))
    {
        humidity = -999;
    }

    // --------------------------------------------------------
    // BMP280
    // --------------------------------------------------------

    float pressure = bmp.readPressure() / 100.0;

    // Pressure in hPa

    // --------------------------------------------------------
    // GPS
    // --------------------------------------------------------

    double latitude = 0.0;
    double longitude = 0.0;

    bool gpsValid = false;

    if (gps.location.isValid())
    {
        latitude = gps.location.lat();
        longitude = gps.location.lng();

        gpsValid = true;
    }

    // --------------------------------------------------------
    // PRINT INTERNAL VALUES
    // --------------------------------------------------------

    Serial.println();
    Serial.println("Environmental Reading");
    Serial.println("====================");

    Serial.print("Packet ID: ");
    Serial.println(packetID);

    Serial.print("MQ-4 Raw: ");
    Serial.println(methaneRaw);

    Serial.print("MQ-135 Raw: ");
    Serial.println(airQualityRaw);

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    Serial.print("Pressure: ");
    Serial.print(pressure);
    Serial.println(" hPa");

    Serial.print("Wind Speed: ");
    Serial.print(windSpeed);
    Serial.println(" m/s");

    Serial.print("Wind Direction: ");
    Serial.print(windDirection);
    Serial.println("°");

    Serial.print("GPS Valid: ");
    Serial.println(gpsValid ? "YES" : "NO");

    if (gpsValid)
    {
        Serial.print("Latitude: ");
        Serial.println(latitude, 6);

        Serial.print("Longitude: ");
        Serial.println(longitude, 6);
    }
}

// ============================================================
// LORA TRANSMISSION
// ============================================================

void sendLoRaData()
{
    // Read latest values again for transmission

    int mq4Raw = analogRead(MQ4_PIN);

    int mq135Raw = analogRead(MQ135_PIN);

    float temperature = dht.readTemperature();

    float humidity = dht.readHumidity();

    float pressure = bmp.readPressure() / 100.0;

    double latitude = 0.0;
    double longitude = 0.0;

    bool gpsValid = false;

    if (gps.location.isValid())
    {
        latitude = gps.location.lat();
        longitude = gps.location.lng();

        gpsValid = true;
    }

    if (isnan(temperature))
    {
        temperature = -999;
    }

    if (isnan(humidity))
    {
        humidity = -999;
    }

    // --------------------------------------------------------
    // Build JSON-like packet
    // --------------------------------------------------------

    String payload = "{";

    payload += "\"packet_id\":";
    payload += packetID;

    payload += ",\"latitude\":";
    payload += String(latitude, 6);

    payload += ",\"longitude\":";
    payload += String(longitude, 6);

    payload += ",\"gps_valid\":";
    payload += gpsValid ? "true" : "false";

    payload += ",\"methane_raw\":";
    payload += mq4Raw;

    payload += ",\"air_quality_raw\":";
    payload += mq135Raw;

    payload += ",\"temperature\":";
    payload += String(temperature, 2);

    payload += ",\"humidity\":";
    payload += String(humidity, 2);

    payload += ",\"pressure\":";
    payload += String(pressure, 2);

    payload += ",\"wind_speed\":";
    payload += String(windSpeed, 2);

    payload += ",\"wind_direction\":";
    payload += String(windDirection, 2);

    payload += ",\"uptime\":";
    payload += millis();

    payload += "}";

    // --------------------------------------------------------
    // Send
    // --------------------------------------------------------

    Serial.println();
    Serial.println("[LoRa] Sending:");
    Serial.println(payload);

    LoRa.beginPacket();

    LoRa.print(payload);

    int result = LoRa.endPacket();

    if (result == 1)
    {
        Serial.println("[LoRa] Transmission successful");
    }
    else
    {
        Serial.println("[LoRa] Transmission failed");
    }
}