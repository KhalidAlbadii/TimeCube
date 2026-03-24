
export type BluetoothState = 'disconnected' | 'connecting' | 'connected';

// Custom UUIDs - These should match your ESP32 firmware
// Standard Nordic UART or custom ones work well.
const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

export class BluetoothService {
  // Using any for Web Bluetooth objects to avoid missing type definitions in standard TS environments
  private device: any | null = null;
  private characteristic: any | null = null;
  private onFaceChangeCallback: (faceId: number) => void = () => {};
  private onStateChangeCallback: (state: BluetoothState) => void = () => {};

  constructor(
    onFaceChange: (faceId: number) => void,
    onStateChange: (state: BluetoothState) => void
  ) {
    this.onFaceChangeCallback = onFaceChange;
    this.onStateChangeCallback = onStateChange;
  }

  async connect() {
    try {
      this.onStateChangeCallback('connecting');
      
      // Cast navigator to any as the bluetooth property is often missing from standard Navigator type definitions
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'TimeCube' }],
        optionalServices: [SERVICE_UUID]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.onStateChangeCallback('disconnected');
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);
      this.characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID) || null;

      if (this.characteristic) {
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value;
          const faceId = value.getUint8(0);
          if (faceId >= 1 && faceId <= 6) {
            this.onFaceChangeCallback(faceId);
          }
        });
        this.onStateChangeCallback('connected');
      }
    } catch (error) {
      console.error('Bluetooth Connection Failed:', error);
      this.onStateChangeCallback('disconnected');
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
  }
}
