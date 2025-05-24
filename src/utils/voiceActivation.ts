
class VoiceActivationService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private isEnabled: boolean = false;
  private onActivated: (() => void) | null = null;
  private onStopped: (() => void) | null = null;
  private triggerPhrase: string = 'hey discover';
  private stopPhrase: string = 'stop discover';

  constructor() {
    // Check for browser compatibility
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      
      console.log('Voice detected:', transcript);
      
      if (transcript.includes(this.triggerPhrase)) {
        console.log('Trigger phrase detected!');
        if (this.onActivated) {
          this.onActivated();
        }
      } else if (transcript.includes(this.stopPhrase)) {
        console.log('Stop phrase detected!');
        if (this.onStopped) {
          this.onStopped();
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isEnabled = false;
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      if (this.isEnabled && this.isListening) {
        // Restart recognition to keep listening
        setTimeout(() => {
          if (this.isEnabled && this.recognition) {
            this.recognition.start();
          }
        }, 100);
      }
    };
  }

  setActivationCallback(callback: () => void) {
    this.onActivated = callback;
  }

  setStopCallback(callback: () => void) {
    this.onStopped = callback;
  }

  async startListening(): Promise<boolean> {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return false;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.isEnabled = true;
      this.isListening = true;
      this.recognition.start();
      console.log('Voice activation started - listening for "Hey Discover" and "Stop Discover"');
      return true;
    } catch (error) {
      console.error('Failed to start voice activation:', error);
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      this.isEnabled = false;
      this.isListening = false;
      this.recognition.stop();
      console.log('Voice activation stopped');
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  getStatus() {
    return {
      isSupported: this.isSupported(),
      isEnabled: this.isEnabled,
      isListening: this.isListening
    };
  }
}

export const voiceActivation = new VoiceActivationService();
