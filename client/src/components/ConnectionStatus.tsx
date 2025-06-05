interface ConnectionStatusProps {
  isCapturing: boolean;
  audioLevel: number;
  connectedDevicesCount: number;
  onStartCapture: () => void;
  onStopCapture: () => void;
}

export default function ConnectionStatus({
  isCapturing,
  audioLevel,
  connectedDevicesCount,
  onStartCapture,
  onStopCapture
}: ConnectionStatusProps) {
  return (
    <div className="bg-white m-4 rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCapturing 
              ? 'bg-green-100' 
              : 'bg-gray-100'
          }`}>
            <span className={`material-icons ${
              isCapturing 
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}>
              {isCapturing ? 'mic' : 'mic_off'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">System Audio Capture</h3>
            <p className={`text-sm ${
              isCapturing 
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}>
              {isCapturing 
                ? `Active - Streaming to ${connectedDevicesCount} device${connectedDevicesCount !== 1 ? 's' : ''}` 
                : 'Inactive - Click to start'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isCapturing ? (
            <button
              onClick={onStopCapture}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={onStartCapture}
              className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              Start
            </button>
          )}
          
          {isCapturing && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
          )}
        </div>
      </div>
      
      {/* Audio Level Indicator */}
      {isCapturing && (
        <div className="mt-3 flex items-center space-x-2">
          <span className="material-icons text-gray-500 text-sm">volume_up</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-150"
              style={{ width: `${audioLevel}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 font-mono min-w-8">{Math.round(audioLevel)}%</span>
        </div>
      )}
    </div>
  );
}
