export class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  setupVoiceCommands(commands) {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Voice command received:', command);

      if (command.includes('debug') || command.includes('find errors')) {
        commands.onDebug();
      } else if (command.includes('optimize')) {
        commands.onOptimize();
      } else if (command.includes('download')) {
        commands.onDownload();
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };
  }

  startListening() {
    if (!this.recognition) return;
    
    this.isListening = true;
    this.recognition.start();
  }

  stopListening() {
    if (!this.recognition) return;
    
    this.isListening = false;
    this.recognition.stop();
  }

  isSupported() {
    return !!this.recognition;
  }
}

export const voiceService = new VoiceService(); 