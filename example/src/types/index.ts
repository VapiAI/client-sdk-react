export interface WidgetConfig {
  mode: 'voice' | 'chat' | 'hybrid';
  theme: 'light' | 'dark';
  baseColor: string;
  accentColor: string;
  buttonBaseColor: string;
  buttonAccentColor: string;
  radius: 'none' | 'small' | 'medium' | 'large';
  size: 'tiny' | 'compact' | 'full';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  mainLabel: string;
  startButtonText: string;
  endButtonText: string;
  requireConsent: boolean;
  termsContent: string;
  localStorageKey: string;
  showTranscript: boolean;
  firstChatMessage?: string;

  // Vapi Configuration
  apiUrl?: string;
  publicKey: string;
  assistantId?: string;
  assistantOverrides?: {
    variableValues?: {
      [key: string]: string;
    };
  };
  assistant?: any;
}
