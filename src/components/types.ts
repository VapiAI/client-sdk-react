export interface VapiWidgetProps {
  // API Configuration
  apiUrl?: string;

  // Vapi Configuration
  publicKey: string;
  assistantId?: string; // Supported by both voice and chat
  assistant?: any; // Full assistant object - voice only
  assistantOverrides?: any; // Assistant overrides - supported by both voice and chat

  // Layout & Position
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'tiny' | 'compact' | 'full';
  radius?: 'none' | 'small' | 'medium' | 'large';

  // Mode & Theme
  mode?: 'voice' | 'chat' | 'hybrid';
  theme?: 'light' | 'dark';

  // Colors
  baseColor?: string;
  accentColor?: string;
  buttonBaseColor?: string;
  buttonAccentColor?: string;

  // Text & Labels
  mainLabel?: string;
  startButtonText?: string;
  endButtonText?: string;

  // Empty State Messages
  emptyVoiceMessage?: string;
  emptyVoiceActiveMessage?: string;
  emptyChatMessage?: string;
  emptyHybridMessage?: string;

  // Legal & Consent
  requireConsent?: boolean;
  termsContent?: string;
  localStorageKey?: string;

  // Transcript
  showTranscript?: boolean;

  // Event handlers
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
}

export interface ColorScheme {
  baseColor: string;
  accentColor: string;
  buttonBaseColor: string;
  buttonAccentColor: string;
}

export interface StyleConfig {
  size: 'tiny' | 'compact' | 'full';
  radius: 'none' | 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
}

export interface VolumeIndicatorProps {
  volumeLevel: number;
  isCallActive: boolean;
  isSpeaking: boolean;
  theme: 'light' | 'dark';
}

export interface FloatingButtonProps {
  isCallActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isSpeaking: boolean;
  isTyping: boolean;
  onClick: () => void;
  onToggleCall?: () => void;
  mainLabel: string;
  colors: ColorScheme;
  styles: StyleConfig;
  mode: 'voice' | 'chat' | 'hybrid';
}

export interface WidgetHeaderProps {
  mode: 'voice' | 'chat' | 'hybrid';
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isCallActive: boolean;
  isSpeaking: boolean;
  isTyping: boolean;
  hasActiveConversation: boolean;
  mainLabel: string;
  onClose: () => void;
  onReset: () => void;
  colors: ColorScheme;
  styles: StyleConfig;
}

export interface ConversationMessageProps {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  colors: ColorScheme;
  styles: StyleConfig;
  isLoading?: boolean;
}

export interface MarkdownMessageProps {
  content: string;
  isLoading?: boolean;
  role: 'user' | 'assistant' | 'tool';
}

export interface EmptyConversationProps {
  mode: 'voice' | 'chat' | 'hybrid';
  isCallActive: boolean;
  theme: 'light' | 'dark';
  emptyVoiceMessage: string;
  emptyVoiceActiveMessage: string;
  emptyChatMessage: string;
  emptyHybridMessage: string;
}

export interface VoiceControlsProps {
  isCallActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isAvailable: boolean;
  onToggleCall: () => void;
  startButtonText: string;
  endButtonText: string;
  colors: ColorScheme;
}

export interface ChatControlsProps {
  chatInput: string;
  isAvailable: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  colors: ColorScheme;
  styles: StyleConfig;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export interface HybridControlsProps {
  chatInput: string;
  isCallActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isChatAvailable: boolean;
  isVoiceAvailable: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onToggleCall: () => void;
  colors: ColorScheme;
  styles: StyleConfig;
  inputRef?: React.RefObject<HTMLInputElement>;
}
