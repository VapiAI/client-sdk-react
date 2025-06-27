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

  // Vapi Configuration
  publicKey: string;
  vapiConfigType: 'assistantId' | 'assistantWithOverrides' | 'assistantObject';
  assistantId: string;
  assistantOverrides: string;
  assistantObject: string;
}
