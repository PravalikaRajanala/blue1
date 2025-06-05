import { useState, useRef, useCallback } from "react";
import { AudioCaptureManager } from "@/lib/audio";

export const useAudioCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioCaptureManager = useRef(new AudioCaptureManager());

  const isSupported = 'getDisplayMedia' in navigator.mediaDevices || 'getUserMedia' in navigator.mediaDevices;

  const startCapture = useCallback(async () => {
    if (!isSupported) {
      throw new Error("Screen capture is not supported in this browser");
    }

    try {
      await audioCaptureManager.current.startCapture();
      setIsCapturing(true);

      // Set up audio level monitoring
      audioCaptureManager.current.onAudioLevel = (level: number) => {
        setAudioLevel(level);
      };
    } catch (error) {
      console.error("Failed to start audio capture:", error);
      throw error;
    }
  }, [isSupported]);

  const stopCapture = useCallback(() => {
    audioCaptureManager.current.stopCapture();
    setIsCapturing(false);
    setAudioLevel(0);
  }, []);

  const getAudioStream = useCallback(() => {
    return audioCaptureManager.current.getAudioStream();
  }, []);

  return {
    isCapturing,
    audioLevel,
    isSupported,
    startCapture,
    stopCapture,
    getAudioStream
  };
};
