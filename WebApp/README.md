
### WebApp
The companion web application built with React and TypeScript.
- Connect to the TimeCube via Bluetooth
- Live tracking with 3D cube visualiser
- Session history, analytics, and CSV export

**To run:**
1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
   
### TimeCubeEsp32-S3
ESP32-S3 Arduino firmware for orientation detection and BLE communication.
- Accelerometer-based face detection using dot product comparison
- BLE notification of active face (1–6)

**To upload:**
1. Open `TimeCubeEsp32-S3/TimeCubeEsp32-S3.ino` in Arduino IDE
2. Select board: ESP32-S3
3. Upload