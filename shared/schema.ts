import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bluetoothDevices = pgTable("bluetooth_devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  deviceType: text("device_type").notNull(), // headphones, speaker, etc.
  isConnected: boolean("is_connected").default(false),
  volume: integer("volume").default(75),
  batteryLevel: integer("battery_level"),
  signalStrength: integer("signal_strength"),
  lastConnected: timestamp("last_connected"),
});

export const audioSessions = pgTable("audio_sessions", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => bluetoothDevices.id),
  isActive: boolean("is_active").default(false),
  audioQuality: text("audio_quality").default("balanced"), // low_latency, balanced, high_quality
  bufferSize: integer("buffer_size").default(256),
  latency: integer("latency"), // in milliseconds
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
});

export const insertBluetoothDeviceSchema = createInsertSchema(bluetoothDevices).omit({
  id: true,
  lastConnected: true,
});

export const insertAudioSessionSchema = createInsertSchema(audioSessions).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export type BluetoothDevice = typeof bluetoothDevices.$inferSelect;
export type InsertBluetoothDevice = z.infer<typeof insertBluetoothDeviceSchema>;
export type AudioSession = typeof audioSessions.$inferSelect;
export type InsertAudioSession = z.infer<typeof insertAudioSessionSchema>;
