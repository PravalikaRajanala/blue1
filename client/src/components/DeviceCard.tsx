import { BluetoothDevice } from "@/hooks/useBluetooth";

interface DeviceCardProps {
  device: BluetoothDevice;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function DeviceCard({ 
  device, 
  isConnected, 
  onConnect, 
  onDisconnect, 
  onVolumeChange 
}: DeviceCardProps) {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'headphones':
        return 'headphones';
      case 'speaker':
        return 'speaker';
      default:
        return 'headset';
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    onVolumeChange(volume);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isConnected 
              ? 'bg-green-100' 
              : 'bg-gray-100'
          }`}>
            <span className={`material-icons text-lg ${
              isConnected 
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}>
              {getDeviceIcon(device.deviceType)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{device.name}</h3>
            {device.address && (
              <p className="text-sm text-gray-500 font-mono">{device.address}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                isConnected ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isConnected ? 'Connected' : 'Available'}
              </span>
              {device.batteryLevel && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{device.batteryLevel}%</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVolumeChange(Math.max(0, device.volume - 10))}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <span className="material-icons text-gray-600">volume_down</span>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-8 text-center">
                {device.volume}%
              </span>
              <button
                onClick={() => onVolumeChange(Math.min(100, device.volume + 10))}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <span className="material-icons text-gray-600">volume_up</span>
              </button>
              <button
                onClick={onDisconnect}
                className="p-2 hover:bg-red-50 rounded-full transition-colors ml-2"
              >
                <span className="material-icons text-red-600">bluetooth_disabled</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          )}
          
          {device.signalStrength && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span className="material-icons text-xs">signal_cellular_alt</span>
              <span>{device.signalStrength}dBm</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Equalizer Visualization for Connected Devices */}
      {isConnected && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-green-500 rounded-full animate-pulse equalizer-bar"
                style={{
                  height: `${Math.random() * 12 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
            <span className="text-xs text-gray-500 ml-2">Audio streaming active</span>
          </div>
        </div>
      )}

      {/* Volume Slider for Connected Devices */}
      {isConnected && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-gray-500">volume_down</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={device.volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer volume-slider"
              />
            </div>
            <span className="material-icons text-gray-500">volume_up</span>
          </div>
        </div>
      )}
    </div>
  );
}
