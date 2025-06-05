interface AudioControlsProps {
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
  isCapturing: boolean;
  connectedDevicesCount: number;
  onDisconnectAll: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function AudioControls({
  masterVolume,
  onMasterVolumeChange,
  isCapturing,
  connectedDevicesCount,
  onDisconnectAll,
  isVisible,
  onToggleVisibility
}: AudioControlsProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    onMasterVolumeChange(volume);
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-6 left-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-20"
      >
        <span className="material-icons">tune</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30">
      <div className="max-w-md mx-auto p-4">
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Audio Controls</h3>
          <button
            onClick={onToggleVisibility}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-icons text-gray-600">close</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Master Volume</span>
          <span className="text-sm font-medium text-gray-900">{masterVolume}%</span>
        </div>
        
        {/* Master Volume Slider */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-gray-500">volume_down</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer volume-slider"
              />
            </div>
            <span className="material-icons text-gray-500">volume_up</span>
          </div>
        </div>

        {/* Audio Source Selection */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Audio Source</h4>
          <div className="flex space-x-2">
            <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
              System Audio
            </button>
            <button className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Microphone
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <span className="material-icons text-gray-700">
              {masterVolume === 0 ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          
          {connectedDevicesCount > 0 && (
            <button
              onClick={onDisconnectAll}
              className="p-3 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
            >
              <span className="material-icons text-red-600">bluetooth_disabled</span>
            </button>
          )}
          
          <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <span className="material-icons text-gray-700">tune</span>
          </button>
        </div>

        {/* Audio Quality Indicator */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">Stream Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isCapturing ? 'text-green-600' : 'text-gray-500'}`}>
                {isCapturing ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connected Devices:</span>
              <span className="font-medium text-gray-900">{connectedDevicesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Audio Quality:</span>
              <span className="font-medium text-blue-600">High Quality</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Latency:</span>
              <span className="font-medium text-green-600">~12ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
