import { 
  bluetoothDevices, 
  audioSessions, 
  type BluetoothDevice, 
  type InsertBluetoothDevice,
  type AudioSession,
  type InsertAudioSession
} from "@shared/schema";

export interface IStorage {
  // Bluetooth device operations
  getAllDevices(): Promise<BluetoothDevice[]>;
  getDevice(id: number): Promise<BluetoothDevice | undefined>;
  getDeviceByAddress(address: string): Promise<BluetoothDevice | undefined>;
  createDevice(device: InsertBluetoothDevice): Promise<BluetoothDevice>;
  updateDevice(id: number, updates: Partial<BluetoothDevice>): Promise<BluetoothDevice | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  
  // Audio session operations
  getAllSessions(): Promise<AudioSession[]>;
  getSession(id: number): Promise<AudioSession | undefined>;
  createSession(session: InsertAudioSession): Promise<AudioSession>;
  updateSession(id: number, updates: Partial<AudioSession>): Promise<AudioSession | undefined>;
  getDeviceSessions(deviceId: number): Promise<AudioSession[]>;
  getActiveSessions(): Promise<AudioSession[]>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, BluetoothDevice>;
  private sessions: Map<number, AudioSession>;
  private deviceIdCounter: number;
  private sessionIdCounter: number;

  constructor() {
    this.devices = new Map();
    this.sessions = new Map();
    this.deviceIdCounter = 1;
    this.sessionIdCounter = 1;
  }

  // Bluetooth device operations
  async getAllDevices(): Promise<BluetoothDevice[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<BluetoothDevice | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByAddress(address: string): Promise<BluetoothDevice | undefined> {
    return Array.from(this.devices.values()).find(device => device.address === address);
  }

  async createDevice(insertDevice: InsertBluetoothDevice): Promise<BluetoothDevice> {
    const id = this.deviceIdCounter++;
    const device: BluetoothDevice = {
      id,
      name: insertDevice.name,
      address: insertDevice.address,
      deviceType: insertDevice.deviceType,
      isConnected: insertDevice.isConnected ?? false,
      volume: insertDevice.volume ?? 75,
      batteryLevel: insertDevice.batteryLevel ?? null,
      signalStrength: insertDevice.signalStrength ?? null,
      lastConnected: insertDevice.isConnected ? new Date() : null,
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<BluetoothDevice>): Promise<BluetoothDevice | undefined> {
    const device = this.devices.get(id);
    if (!device) {
      return undefined;
    }

    const updatedDevice: BluetoothDevice = {
      ...device,
      ...updates,
      lastConnected: updates.isConnected ? new Date() : device.lastConnected,
    };
    
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    return this.devices.delete(id);
  }

  // Audio session operations
  async getAllSessions(): Promise<AudioSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<AudioSession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertAudioSession): Promise<AudioSession> {
    const id = this.sessionIdCounter++;
    const session: AudioSession = {
      id,
      deviceId: insertSession.deviceId ?? null,
      isActive: insertSession.isActive ?? true,
      audioQuality: insertSession.audioQuality ?? "balanced",
      bufferSize: insertSession.bufferSize ?? 256,
      latency: insertSession.latency ?? null,
      startTime: new Date(),
      endTime: null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, updates: Partial<AudioSession>): Promise<AudioSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) {
      return undefined;
    }

    const updatedSession: AudioSession = {
      ...session,
      ...updates,
      endTime: updates.isActive === false ? new Date() : session.endTime,
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getDeviceSessions(deviceId: number): Promise<AudioSession[]> {
    return Array.from(this.sessions.values()).filter(session => session.deviceId === deviceId);
  }

  async getActiveSessions(): Promise<AudioSession[]> {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }
}

export const storage = new MemStorage();
