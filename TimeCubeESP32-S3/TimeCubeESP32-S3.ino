#include <Arduino.h>
#include <Wire.h>
#include <math.h>
#include <ICM20600.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#define SERVICE_UUID        "0000ffe0-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID "0000ffe1-0000-1000-8000-00805f9b34fb"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

#define I2C_SDA 9
#define I2C_SCL 8

const float LPF_ALPHA        = 0.15f;
const unsigned long DWELL_MS = 500;
const float FACE_DEG_MARGIN  = 20.0f;

struct V3 { float x, y, z; };
enum Face { TOP=0, BOTTOM, LEFT, RIGHT, FRONT, BACK, UNKNOWN };
const char* FACE_NAME[] = {"TOP","BOTTOM","LEFT","RIGHT","FRONT","BACK","UNKNOWN"};

const V3 FACE_NORMALS[6] = {
  { 0, 0, +1},
  { 0, 0, -1},
  {-1, 0,  0},
  {+1, 0,  0},
  { 0,+1,  0},
  { 0,-1,  0}
};

static inline float vdot(const V3& a, const V3& b) { return a.x*b.x + a.y*b.y + a.z*b.z; }
static inline float vmag(V3 v) { return sqrtf(v.x*v.x + v.y*v.y + v.z*v.z); }
static inline V3 vnorm(V3 v) {
  float m = vmag(v);
  if (m > 1e-6f) {
    v.x /= m;
    v.y /= m;
    v.z /= m;
  }
  return v;
}

ICM20600 icm;
float ax_g_f = 0, ay_g_f = 0, az_g_f = 0;
Face stableFace = UNKNOWN;
unsigned long faceSince = 0;

// LED pins
const int LED_PINS[6] = {1, 2, 3, 4, 5, 6};

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) { deviceConnected = true; }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    pServer->getAdvertising()->start();
  }
};

Face candidateFaceFromGravity(const V3& g_unit) {
  float best = -2.0f;
  int idx = -1;

  for (int i = 0; i < 6; i++) {
    float d = vdot(g_unit, FACE_NORMALS[i]);
    if (d > best) {
      best = d;
      idx = i;
    }
  }

  if (idx < 0) return UNKNOWN;

  float cosMargin = cosf(FACE_DEG_MARGIN * (float)M_PI / 180.0f);
  if (best < cosMargin) return UNKNOWN;

  return (Face)idx;
}

void updateFaceLEDs(Face face) {
  for (int i = 0; i < 6; i++) {
    digitalWrite(LED_PINS[i], LOW);
  }

  if (face >= TOP && face <= BACK) {
    digitalWrite(LED_PINS[(int)face], HIGH);
  }
}

void setup() {
  Serial.begin(115200);

  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(400000);
  icm.initialize();

  for (int i = 0; i < 6; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }

  BLEDevice::init("TimeCube-S3");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  pServer->getAdvertising()->start();

  Serial.println("BLE Ready: TimeCube-S3");
}

void loop() {
  float ax_g = icm.getAccelerationX() / 1000.0f;
  float ay_g = icm.getAccelerationY() / 1000.0f;
  float az_g = icm.getAccelerationZ() / 1000.0f;

  ax_g_f = LPF_ALPHA * ax_g + (1 - LPF_ALPHA) * ax_g_f;
  ay_g_f = LPF_ALPHA * ay_g + (1 - LPF_ALPHA) * ay_g_f;
  az_g_f = LPF_ALPHA * az_g + (1 - LPF_ALPHA) * az_g_f;

  V3 gu = vnorm({ax_g_f, ay_g_f, az_g_f});
  Face cand = candidateFaceFromGravity(gu);

  static Face lastCand = UNKNOWN;
  if (cand != lastCand) {
    lastCand = cand;
    faceSince = millis();
  }

  if ((stableFace != lastCand) && (millis() - faceSince >= DWELL_MS)) {
    stableFace = lastCand;

    Serial.printf(">>> Face changed: %s\n", FACE_NAME[stableFace]);

    updateFaceLEDs(stableFace);

    if (deviceConnected && stableFace != UNKNOWN) {
      uint8_t faceData = (uint8_t)stableFace + 1;
      pCharacteristic->setValue(&faceData, 1);
      pCharacteristic->notify();
    }
  }

  delay(10);
}
