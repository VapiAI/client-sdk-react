export interface VapiWidgetProps {
  // API Configuration
  apiUrl?: string;

  // Vapi Configuration
  publicKey: string;
  assistantId?: string; // Supported by both voice and chat
  assistant?: any; // Assistant object - voice only
  assistantOverrides?: any; // Assistant overrides - supported by both voice and chat

  // Layout & Position
  position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'bottom-center';
  size?: 'tiny' | 'compact' | 'full';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';

  // Mode & Theme
  mode?: 'voice' | 'chat' | 'hybrid';
  theme?: 'light' | 'dark';

  // Colors
  baseBgColor?: string;
  accentColor?: string;
  ctaButtonColor?: string;
  ctaButtonTextColor?: string;

  // Text & Labels
  title?: string;
  startButtonText?: string;
  endButtonText?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;

  // Empty State Messages
  voiceEmptyMessage?: string;
  voiceActiveEmptyMessage?: string;
  chatEmptyMessage?: string;
  hybridEmptyMessage?: string;

  // Chat Configuration
  chatFirstMessage?: string;
  chatPlaceholder?: string;
  chatEndMessage?: string;

  // Voice Configuration
  voiceShowTranscript?: boolean;

  // Consent Configuration
  consentRequired?: boolean;
  consentTitle?: string;
  consentContent?: string;
  consentStorageKey?: string;

  // Event handlers
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;

  // Deprecated aliases
  /** @deprecated Use `borderRadius` instead */
  radius?: 'none' | 'small' | 'medium' | 'large';

  // Colors
  /** @deprecated Use `baseBgColor` instead */
  baseColor?: string;
  /** @deprecated Use `ctaButtonColor` instead */
  buttonBaseColor?: string;
  /** @deprecated Use `ctaButtonTextColor` instead */
  buttonAccentColor?: string;

  // Text & Labels
  /** @deprecated Use `title` instead */
  mainLabel?: string;

  // Empty State Messages
  /** @deprecated Use `voiceEmptyMessage` instead */
  emptyVoiceMessage?: string;
  /** @deprecated Use `voiceActiveEmptyMessage` instead */
  emptyVoiceActiveMessage?: string;
  /** @deprecated Use `chatEmptyMessage` instead */
  emptyChatMessage?: string;
  /** @deprecated Use `hybridEmptyMessage` instead */
  emptyHybridMessage?: string;

  /** @deprecated Use `chatFirstMessage` instead */
  firstChatMessage?: string;

  /** @deprecated Use `voiceShowTranscript` instead */
  showTranscript?: boolean;

  // Consent
  /** @deprecated Use `consentRequired` instead */
  requireConsent?: boolean;
  /** @deprecated Use `consentContent` instead */
  termsContent?: string;
  /** @deprecated Use `consentStorageKey` instead */
  localStorageKey?: string;

  // Event handlers
  /** @deprecated Use `onVoiceStart` instead */
  onCallStart?: () => void;
  /** @deprecated Use `onVoiceEnd` instead */
  onCallEnd?: () => void;
}

export interface ColorScheme {
  baseColor: string;
  accentColor: string;
  ctaButtonColor: string;
  ctaButtonTextColor: string;
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
  volumeLevel: number;
  onClick: () => void;
  onToggleCall?: () => void;
  mainLabel: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
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
  onChatComplete: () => void;
  showEndChatButton?: boolean;
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
  voiceEmptyMessage: string;
  voiceActiveEmptyMessage: string;
  chatEmptyMessage: string;
  hybridEmptyMessage: string;
}

export interface VoiceControlsProps {
  isCallActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isAvailable: boolean;
  isMuted: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
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
  placeholder?: string;
}

export interface HybridControlsProps {
  chatInput: string;
  isCallActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isChatAvailable: boolean;
  isVoiceAvailable: boolean;
  isMuted: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onToggleCall: () => void;
  onToggleMute: () => void;
  colors: ColorScheme;
  styles: StyleConfig;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}
