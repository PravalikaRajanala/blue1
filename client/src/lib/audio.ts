export class AudioCaptureManager {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrame: number | null = null;
  
  public onAudioLevel: ((level: number) => void) | null = null;

  async startCapture(): Promise<void> {
    try {
      // First try to get system audio through screen capture
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        },
        video: {
          width: 1,
          height: 1,
          frameRate: 1
        }
      });

      // Check if audio track exists
      const audioTracks = this.mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        // Fallback to microphone if no system audio
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100
          }
        });
      }

      // Create audio context for processing
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create source from the captured stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser for audio level monitoring
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect nodes
      this.source.connect(this.analyser);
      
      // Start audio level monitoring
      this.startAudioLevelMonitoring();
      
      // Set up stream processing for low-latency output
      this.setupAudioProcessing();
      
    } catch (error) {
      console.error("Failed to start audio capture:", error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error("Permission denied. Please allow screen sharing with audio to capture system audio.");
        } else if (error.name === 'NotSupportedError') {
          throw new Error("Audio capture not supported in this browser.");
        } else if (error.name === 'AbortError') {
          throw new Error("Audio capture was cancelled. Please try again.");
        }
      }
      throw new Error("Failed to capture audio. Please ensure your browser supports audio capture and try again.");
    }
  }

  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      const level = (average / 255) * 100;
      
      if (this.onAudioLevel) {
        this.onAudioLevel(level);
      }
      
      this.animationFrame = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private setupAudioProcessing(): void {
    if (!this.audioContext || !this.source) return;

    // Create a gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1.0;

    // Create a compressor for audio quality
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Connect the audio processing chain
    this.source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(this.analyser!);

    // In a real implementation, this would connect to the Bluetooth audio output
    // For now, we're setting up the processing pipeline
  }

  stopCapture(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.source = null;
    this.analyser = null;
  }

  getAudioStream(): MediaStream | null {
    return this.mediaStream;
  }

  setMasterVolume(volume: number): void {
    if (this.audioContext) {
      // In a real implementation, this would adjust the gain node
      console.log("Setting master volume to:", volume);
    }
  }

  // Method to get processed audio stream for Bluetooth transmission
  getProcessedAudioStream(): MediaStream | null {
    if (!this.audioContext || !this.source) return null;

    // Create a destination for the processed audio
    const destination = this.audioContext.createMediaStreamDestination();
    
    // In a real implementation, this would return the processed stream
    // that gets sent to connected Bluetooth devices
    return destination.stream;
  }
}
