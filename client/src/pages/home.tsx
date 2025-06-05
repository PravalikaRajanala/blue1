import { useState, useEffect } from "react";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import DeviceCard from "@/components/DeviceCard";
import AudioControls from "@/components/AudioControls";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(85);
  const [showAudioControls, setShowAudioControls] = useState(false);
  
  const {
    connectedDevices,
    availableDevices,
    isSupported,
    connectDevice,
    disconnectDevice,
    scanForDevices,
    stopScanning,
    updateDeviceVolume
  } = useBluetooth();

  const {
    isCapturing,
    audioLevel,
    startCapture,
    stopCapture,
    isSupported: isAudioSupported
  } = useAudioCapture();

  useEffect(() => {
    if (!isSupported) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API. Please use Chrome or Edge.",
        variant: "destructive"
      });
    }

    if (!isAudioSupported) {
      toast({
        title: "Audio Capture Not Supported", 
        description: "Your browser doesn't support screen capture API.",
        variant: "destructive"
      });
    }
  }, [isSupported, isAudioSupported, toast]);

  const handleToggleScanning = async () => {
    if (isScanning) {
      stopScanning();
      setIsScanning(false);
    } else {
      try {
        setIsScanning(true);
        await scanForDevices();
      } catch (error) {
        toast({
          title: "Scanning Failed",
          description: error instanceof Error ? error.message : "Failed to scan for devices",
          variant: "destructive"
        });
        setIsScanning(false);
      }
    }
  };

  const handleConnectDevice = async (deviceId: string) => {
    try {
      await connectDevice(deviceId);
      toast({
        title: "Device Connected",
        description: "Successfully connected to device",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to device",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    try {
      await disconnectDevice(deviceId);
      toast({
        title: "Device Disconnected",
        description: "Device has been disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed", 
        description: error instanceof Error ? error.message : "Failed to disconnect device",
        variant: "destructive"
      });
    }
  };

  const handleStartAudioCapture = async () => {
    try {
      await startCapture();
      toast({
        title: "Audio Capture Started",
        description: "System audio is now being captured and streamed",
      });
    } catch (error) {
      toast({
        title: "Audio Capture Failed",
        description: error instanceof Error ? error.message : "Failed to start audio capture",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* App Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="material-icons text-white text-sm">bluetooth_audio</span>
              </div>
              <h1 className="text-xl font-medium text-gray-900">BlueStream</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isScanning && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse-slow"></div>
                  <span className="text-sm font-medium">Scanning</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-green-600">
                <span className="material-icons text-xs">link</span>
                <span className="text-sm font-medium">{connectedDevices.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scanning Progress Bar */}
        {isScanning && (
          <div className="h-1 bg-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-60 animate-pulse"></div>
            <div className="absolute h-full bg-white w-1/3 animate-bounce-x"></div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-32">
        {/* System Audio Status */}
        <ConnectionStatus
          isCapturing={isCapturing}
          audioLevel={audioLevel}
          connectedDevicesCount={connectedDevices.length}
          onStartCapture={handleStartAudioCapture}
          onStopCapture={stopCapture}
        />

        {/* Device List */}
        <div className="px-4 space-y-4">
          {/* Connected Devices Section */}
          {connectedDevices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">Connected Devices</h2>
                <span className="text-sm text-gray-500">{connectedDevices.length} active</span>
              </div>
              
              {connectedDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isConnected={true}
                  onConnect={() => {}}
                  onDisconnect={() => handleDisconnectDevice(device.id)}
                  onVolumeChange={(volume) => updateDeviceVolume(device.id, volume)}
                />
              ))}
            </div>
          )}

          {/* Available Devices Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-900">Available Devices</h2>
              <button 
                onClick={handleToggleScanning}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center space-x-1"
              >
                <span className="material-icons text-base">refresh</span>
                <span>{isScanning ? 'Stop' : 'Refresh'}</span>
              </button>
            </div>
            
            {availableDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                isConnected={false}
                onConnect={() => handleConnectDevice(device.id)}
                onDisconnect={() => {}}
                onVolumeChange={() => {}}
              />
            ))}

            {/* No Devices Found State */}
            {availableDevices.length === 0 && !isScanning && (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="material-icons text-6xl text-gray-300 mb-4 block">bluetooth_disabled</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
                <p className="text-gray-600 mb-4">Make sure Bluetooth is enabled and devices are discoverable</p>
                <button
                  onClick={handleToggleScanning}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Audio Controls */}
      <AudioControls
        masterVolume={masterVolume}
        onMasterVolumeChange={setMasterVolume}
        isCapturing={isCapturing}
        connectedDevicesCount={connectedDevices.length}
        onDisconnectAll={() => {
          connectedDevices.forEach(device => handleDisconnectDevice(device.id));
        }}
        isVisible={showAudioControls}
        onToggleVisibility={() => setShowAudioControls(!showAudioControls)}
      />

      {/* Floating Action Button */}
      <button
        onClick={handleToggleScanning}
        className={`fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-20 ${
          isScanning ? 'animate-pulse' : ''
        }`}
      >
        <span className="material-icons text-xl">
          {isScanning ? 'stop' : 'bluetooth_searching'}
        </span>
      </button>
    </div>
  );
}
