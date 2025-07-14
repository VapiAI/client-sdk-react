export interface WidgetConfig {
  mode: 'voice' | 'chat' | 'hybrid';
  theme: 'light' | 'dark';
  baseBgColor: string;
  accentColor: string;
  ctaButtonColor: string;
  ctaButtonTextColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  size: 'tiny' | 'compact' | 'full';
  position:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'bottom-center';
  title: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  startButtonText: string;
  endButtonText: string;
  consentRequired: boolean;
  consentTitle?: string;
  consentContent: string;
  consentStorageKey: string;
  voiceShowTranscript: boolean;
  chatFirstMessage?: string;

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
