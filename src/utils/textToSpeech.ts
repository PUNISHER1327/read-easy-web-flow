
type SpeechCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onWordBoundary?: (event: SpeechSynthesisEvent) => void;
  onSentenceBoundary?: (event: SpeechSynthesisEvent) => void;
};

class TextToSpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synth: SpeechSynthesis;
  private callbacks: SpeechCallbacks = {};
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private text: string = '';
  private rate: number = 1.0;
  
  constructor() {
    this.synth = window.speechSynthesis;
  }

  setCallbacks(callbacks: SpeechCallbacks) {
    this.callbacks = callbacks;
  }
  
  speak(text: string, rate: number = 1.0) {
    // Cancel any ongoing speech
    this.stop();
    
    this.text = text;
    this.rate = rate;
    
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = rate;
    this.utterance.lang = 'en-US';
    
    // Set up event listeners
    if (this.callbacks.onStart) {
      this.utterance.onstart = this.callbacks.onStart;
    }
    
    if (this.callbacks.onEnd) {
      this.utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        if (this.callbacks.onEnd) this.callbacks.onEnd();
      };
    }
    
    if (this.callbacks.onWordBoundary) {
      this.utterance.onboundary = (event) => {
        if (event.name === 'word' && this.callbacks.onWordBoundary) {
          this.callbacks.onWordBoundary(event);
        } else if (event.name === 'sentence' && this.callbacks.onSentenceBoundary) {
          this.callbacks.onSentenceBoundary(event);
        }
      };
    }
    
    this.isSpeaking = true;
    this.isPaused = false;
    this.synth.speak(this.utterance);
  }
  
  pause() {
    if (this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      if (this.callbacks.onPause) this.callbacks.onPause();
    }
  }
  
  resume() {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      if (this.callbacks.onResume) this.callbacks.onResume();
    }
  }
  
  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
  }
  
  getVoices() {
    return this.synth.getVoices();
  }
  
  setRate(rate: number) {
    this.rate = rate;
    if (this.utterance) {
      this.utterance.rate = rate;
    }
  }
  
  getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      text: this.text,
      rate: this.rate
    };
  }
}

export const textToSpeech = new TextToSpeechService();
