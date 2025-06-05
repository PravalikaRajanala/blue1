import { useState, useCallback, useRef } from "react";
import { BluetoothManager } from "@/lib/bluetooth";

export interface BluetoothDevice {
  id: string;
  name: string;
  address?: string;
  deviceType: string;
  isConnected: boolean;
  volume: number;
  batteryLevel?: number;
  signalStrength?: number;
  gattServer?: any;
}

// Demo devices for testing when real Bluetooth isn't available
const DEMO_DEVICES: BluetoothDevice[] = [
  {
    id: "demo-airpods",
    name: "AirPods Pro",
    address: "AA:BB:CC:DD:EE:01",
    deviceType: "headphones",
    isConnected: false,
    volume: 75,
    batteryLevel: 85,
    signalStrength: -45
  },
  {
    id: "demo-speaker",
    name: "JBL Flip 5",
    address: "AA:BB:CC:DD:EE:02", 
    deviceType: "speaker",
    isConnected: false,
    volume: 60,
    batteryLevel: 70,
    signalStrength: -38
  },
  {
    id: "demo-headphones",
    name: "Sony WH-1000XM4",
    address: "AA:BB:CC:DD:EE:03",
    deviceType: "headphones", 
    isConnected: false,
    volume: 80,
    batteryLevel: 92,
    signalStrength: -42
  }
];

export const useBluetooth = () => {
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const bluetoothManager = useRef(new BluetoothManager());

  const isSupported = 'bluetooth' in navigator;

  const scanForDevices = useCallback(async () => {
    if (!isSupported) {
      throw new Error("Bluetooth is not supported in this browser");
    }

    try {
      setIsScanning(true);
      const devices = await bluetoothManager.current.scanForDevices();
      
      setAvailableDevices(devices.map(device => ({
        id: device.id,
        name: device.name || "Unknown Device",
        address: device.id,
        deviceType: "audio",
        isConnected: false,
        volume: 75,
        gattServer: (device as any).gatt
      })));
    } catch (error) {
      console.error("Failed to scan for devices:", error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [isSupported]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const connectDevice = useCallback(async (deviceId: string) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    try {
      const connected = await bluetoothManager.current.connectToDevice(device.gattServer!);
      if (connected) {
        const connectedDevice = { ...device, isConnected: true };
        
        setConnectedDevices(prev => [...prev, connectedDevice]);
        setAvailableDevices(prev => prev.filter(d => d.id !== deviceId));
        
        // Start audio streaming to this device
        await bluetoothManager.current.startAudioStream(device.gattServer!);
      }
    } catch (error) {
      console.error("Failed to connect to device:", error);
      throw error;
    }
  }, [availableDevices]);

  const disconnectDevice = useCallback(async (deviceId: string) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    try {
      await bluetoothManager.current.disconnectDevice(device.gattServer!);
      
      setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
      setAvailableDevices(prev => [...prev, { ...device, isConnected: false }]);
    } catch (error) {
      console.error("Failed to disconnect device:", error);
      throw error;
    }
  }, [connectedDevices]);

  const updateDeviceVolume = useCallback(async (deviceId: string, volume: number) => {
    setConnectedDevices(prev => 
      prev.map(device => 
        device.id === deviceId ? { ...device, volume } : device
      )
    );
    
    // Send volume update to the actual device
    const device = connectedDevices.find(d => d.id === deviceId);
    if (device && device.gattServer) {
      await bluetoothManager.current.setDeviceVolume(device.gattServer, volume);
    }
  }, [connectedDevices]);

  return {
    connectedDevices,
    availableDevices,
    isScanning,
    isSupported,
    scanForDevices,
    stopScanning,
    connectDevice,
    disconnectDevice,
    updateDeviceVolume
  };
};
