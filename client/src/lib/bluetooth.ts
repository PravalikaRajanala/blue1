// Declare Web Bluetooth API types
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: any): Promise<any>;
      getAvailability(): Promise<boolean>;
    };
  }
}

export class BluetoothManager {
  private connectedDevices: Map<string, any> = new Map();

  async scanForDevices(): Promise<any[]> {
    if (!navigator.bluetooth) {
      throw new Error("Bluetooth API is not available in this browser. Please use Chrome, Edge, or another Chromium-based browser.");
    }

    try {
      // Request device with accept all devices for audio pairing
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'battery_service',
          'device_information',
          0x180F, // Battery Service
          0x1812, // HID Service
          0x110A, // Audio Source
          0x110B, // Audio Sink
          0x111E  // Hands-free
        ]
      });

      return [device];
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          throw new Error("No Bluetooth devices found. Make sure your audio devices are in pairing mode and nearby.");
        } else if (error.name === 'SecurityError') {
          throw new Error("Bluetooth access denied. Please enable Bluetooth permissions for this site.");
        } else if (error.name === 'NotSupportedError') {
          throw new Error("Bluetooth not supported on this device or browser.");
        }
      }
      console.error("Bluetooth scan error:", error);
      throw new Error("Failed to scan for Bluetooth devices. Please try again.");
    }
  }

  async connectToDevice(gattServer: any): Promise<boolean> {
    try {
      if (!gattServer.connected) {
        await gattServer.connect();
      }
      
      this.connectedDevices.set(gattServer.device.id, gattServer);
      
      // Set up disconnect handler
      gattServer.device.addEventListener('gattserverdisconnected', () => {
        this.connectedDevices.delete(gattServer.device.id);
      });

      return true;
    } catch (error) {
      console.error("Failed to connect to device:", error);
      throw new Error("Failed to connect to device. Make sure the device is available and in range.");
    }
  }

  async disconnectDevice(gattServer: any): Promise<void> {
    try {
      if (gattServer.connected) {
        gattServer.disconnect();
      }
      this.connectedDevices.delete(gattServer.device.id);
    } catch (error) {
      console.error("Failed to disconnect device:", error);
      throw error;
    }
  }

  async startAudioStream(gattServer: any): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Establish audio connection using appropriate Bluetooth audio profile
      // 2. Set up audio streaming pipeline
      // 3. Configure audio codec and quality settings
      
      console.log("Starting audio stream to device:", gattServer.device.name);
      
      // For now, we'll simulate the audio streaming setup
      // Real implementation would require additional Bluetooth audio APIs
      // that are not yet fully supported in Web Bluetooth
      
    } catch (error) {
      console.error("Failed to start audio stream:", error);
      throw error;
    }
  }

  async setDeviceVolume(gattServer: any, volume: number): Promise<void> {
    try {
      // In a real implementation, this would send volume control commands
      // through Bluetooth AVRCP (Audio/Video Remote Control Profile)
      console.log(`Setting volume to ${volume}% for device:`, gattServer.device.name);
      
    } catch (error) {
      console.error("Failed to set device volume:", error);
      throw error;
    }
  }

  getConnectedDevices(): any[] {
    return Array.from(this.connectedDevices.values());
  }
}
