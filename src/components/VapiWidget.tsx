import React, { useState, useEffect, useRef } from 'react'
import { 
  MicrophoneIcon, 
  PaperPlaneTiltIcon, 
  XIcon, 
  ChatCircleIcon, 
  StopIcon,
  ArrowsClockwiseIcon
} from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import { useVapiWidget } from '../hooks'
import AnimatedStatusIcon from './AnimatedStatusIcon'
import ConsentForm from './ConsentForm'


export interface VapiWidgetProps {
  publicKey: string
  
  // Vapi Configuration - Generic support for all vapi.start() patterns
  vapiConfig: any // This gets passed directly to vapi.start()
  
  // API Configuration
  apiUrl?: string // Optional custom API URL for chat
  
  // Layout & Position
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'tiny' | 'compact' | 'full'
  radius?: 'none' | 'small' | 'medium' | 'large'
  
  // Mode & Theme
  mode?: 'voice' | 'chat' | 'hybrid'
  theme?: 'light' | 'dark'
  
  // Colors
  baseColor?: string
  accentColor?: string
  buttonBaseColor?: string
  buttonAccentColor?: string
  
  // Text & Labels
  mainLabel?: string
  startButtonText?: string
  endButtonText?: string
  
  // Empty State Messages
  emptyVoiceMessage?: string
  emptyVoiceActiveMessage?: string
  emptyChatMessage?: string
  emptyHybridMessage?: string
  
  // Legal & Consent
  requireConsent?: boolean
  termsContent?: string
  localStorageKey?: string
  
  // Transcript
  showTranscript?: boolean
  
  // Legacy props (for backwards compatibility)
  primaryColor?: string
  
  // Event handlers
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: Error) => void
}

// Type definitions for sub-components
interface ColorScheme {
  baseColor: string
  accentColor: string
  buttonBaseColor: string
  buttonAccentColor: string
}

interface StyleConfig {
  size: 'tiny' | 'compact' | 'full'
  radius: 'none' | 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
}

// Style constants
const sizeClasses = {
  tiny: {
    button: 'w-12 h-12',
    expanded: 'w-72 h-80',
    icon: 'w-5 h-5'
  },
  compact: {
    button: 'px-4 py-3 h-12',
    expanded: 'w-96 h-[32rem]',
    icon: 'w-5 h-5'
  },
  full: {
    button: 'px-6 py-4 h-14',
    expanded: 'w-[28rem] h-[40rem]',
    icon: 'w-6 h-6'
  }
}

const radiusClasses = {
  none: 'rounded-none',
  small: 'rounded-lg',
  medium: 'rounded-2xl',
  large: 'rounded-3xl'
}

const buttonRadiusClasses = {
  none: 'rounded-none',
  small: 'rounded-lg',
  medium: 'rounded-2xl',
  large: 'rounded-3xl'
}

const messageRadiusClasses = {
  none: 'rounded-none',
  small: 'rounded-md',     // 6px - subtle rounding
  medium: 'rounded-lg',    // 8px - moderate rounding
  large: 'rounded-xl'      // 12px - more rounded but not excessive
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6'
}

interface VolumeIndicatorProps {
  volumeLevel: number
  isCallActive: boolean
  isSpeaking: boolean
  theme: 'light' | 'dark'
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({ 
  volumeLevel, 
  isCallActive, 
  isSpeaking,
  theme 
}) => (
  <div className="text-center space-y-4">
    <div 
      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      <MicrophoneIcon 
        size={40} 
        className={`${
          isCallActive 
            ? (isSpeaking ? 'text-red-400 animate-pulse' : 'text-green-400') 
            : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
        }`} 
      />
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center space-x-2 justify-center">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              i < volumeLevel * 7 ? 'bg-green-400' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            style={{ height: `${12 + i * 3}px` }}
          />
        ))}
      </div>
      
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
      </p>
    </div>
  </div>
)

interface FloatingButtonProps {
  isCallActive: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isSpeaking: boolean
  isTyping: boolean
  onClick: () => void
  onToggleCall?: () => void
  mainLabel: string
  colors: ColorScheme
  styles: StyleConfig
  mode: 'voice' | 'chat' | 'hybrid'
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  isCallActive,
  connectionStatus,
  isSpeaking,
  isTyping,
  onClick,
  onToggleCall,
  mainLabel, 
  colors, 
  styles,
  mode
}) => {
  // Special handling for tiny voice mode
  const isTinyVoice = mode === 'voice' && styles.size === 'tiny'
  const handleClick = () => {
    if (isTinyVoice && onToggleCall) {
      onToggleCall()
    } else {
      onClick()
    }
  }

  // Larger size and glow effect for tiny voice mode when active
  const buttonClass = isTinyVoice && isCallActive
    ? 'w-20 h-20' // Larger size for active tiny voice
    : sizeClasses[styles.size].button

  return (
    <div 
      className={`${buttonClass} ${buttonRadiusClasses[styles.radius]} shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center relative ${
        isTinyVoice && isCallActive ? 'animate-glow' : ''
      }`}
      style={{ 
        backgroundColor: isCallActive && isTinyVoice ? '#ef4444' : colors.buttonBaseColor
      }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
        <AnimatedStatusIcon
          size={isTinyVoice && isCallActive ? 48 : styles.size === 'tiny' ? 24 : 28}
          connectionStatus={connectionStatus}
          isCallActive={isCallActive}
          isSpeaking={isSpeaking}
          isTyping={isTyping}
          baseColor={colors.accentColor}
          colors={colors.accentColor}
        />
        
        {(styles.size === 'compact' || styles.size === 'full') && !isTinyVoice && (
          <span className={`${styles.size === 'full' ? 'text-sm' : 'text-sm'} font-medium`} style={{ color: colors.buttonAccentColor }}>
            {mainLabel}
          </span>
        )}
      </div>
    </div>
  )
}

interface WidgetHeaderProps {
  mode: 'voice' | 'chat' | 'hybrid'
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isCallActive: boolean
  isSpeaking: boolean
  isTyping: boolean
  hasActiveConversation: boolean
  mainLabel: string
  onClose: () => void
  onReset: () => void
  colors: ColorScheme
  styles: StyleConfig
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({ 
  mode, 
  connectionStatus, 
  isCallActive, 
  isSpeaking, 
  isTyping,
  hasActiveConversation,
  mainLabel, 
  onClose, 
  onReset,
  colors,
  styles
}) => {
  // Determine the status message based on current state
  const getStatusMessage = () => {
    if (connectionStatus === 'connecting') return 'Connecting...'
    
    if (isCallActive) {
      return isSpeaking ? 'Assistant Speaking...' : 'Listening...'
    }
    
    if (isTyping) return 'Assistant is typing...'
    
    // If there's an active conversation, show appropriate status
    if (hasActiveConversation) {
      if (mode === 'chat') return 'Chat active'
      if (mode === 'hybrid') return 'Ready to assist'
      return 'Connected'
    }
    
    // No conversation yet - show how to start
    if (mode === 'voice') return 'Click the microphone to start'
    if (mode === 'chat') return 'Type a message below'
    return 'Choose voice or text'
  }
  
  return (
    <div 
      className={`relative z-10 p-4 flex items-center justify-between border-b ${
        styles.theme === 'dark' 
          ? 'text-white border-gray-800 shadow-lg' 
          : 'text-gray-900 border-gray-200 shadow-sm'
      }`}
      style={{ backgroundColor: colors.baseColor }}
    >
      <div className="flex items-center space-x-3">
        <AnimatedStatusIcon
          size={40}
          connectionStatus={connectionStatus}
          isCallActive={isCallActive}
          isSpeaking={isSpeaking}
          isTyping={isTyping}
          baseColor={colors.accentColor}
          colors={colors.accentColor}
        />
        
        <div>
          <div className="font-medium">{mainLabel}</div>
          <div className={`text-sm ${
            styles.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getStatusMessage()}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onReset}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            styles.theme === 'dark' 
              ? 'bg-white bg-opacity-10 hover:bg-opacity-20 text-gray-300' 
              : 'bg-black bg-opacity-5 hover:bg-opacity-10 text-gray-600'
          }`}
          title="Reset conversation"
        >
          <ArrowsClockwiseIcon size={16} weight="bold" />
        </button>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            styles.theme === 'dark' 
              ? 'bg-white bg-opacity-10 hover:bg-opacity-20 text-gray-300' 
              : 'bg-black bg-opacity-5 hover:bg-opacity-10 text-gray-600'
          }`}
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}

interface ConversationMessageProps {
  role: 'user' | 'assistant'
  content: string
  colors: ColorScheme
  styles: StyleConfig
  isLoading?: boolean  // Renamed from isStreaming to avoid confusion
}

// Markdown message renderer component
interface MarkdownMessageProps {
  content: string
  isLoading?: boolean
  role: 'user' | 'assistant'
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isLoading, role }) => (
  <div className="markdown-content">
    <ReactMarkdown
      components={{
        // Style markdown elements to fit the chat bubble design
        p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
        ul: ({children}) => <ul className="list-disc list-inside mb-1 last:mb-0">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal list-inside mb-1 last:mb-0">{children}</ol>,
        li: ({children}) => <li className="mb-0.5">{children}</li>,
        code: ({children, ...props}) => {
          const inline = !('inline' in props) || props.inline
          return inline 
            ? <code className="px-1 py-0.5 rounded bg-black bg-opacity-10 text-sm">{children}</code>
            : <pre className="p-2 rounded bg-black bg-opacity-10 overflow-x-auto text-sm"><code>{children}</code></pre>
        },
        a: ({children, href}) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:opacity-80"
          >
            {children}
          </a>
        ),
        strong: ({children}) => <strong className="font-semibold">{children}</strong>,
        em: ({children}) => <em className="italic">{children}</em>,
        h1: ({children}) => <h1 className="text-lg font-bold mb-1">{children}</h1>,
        h2: ({children}) => <h2 className="text-base font-bold mb-1">{children}</h2>,
        h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
        blockquote: ({children}) => (
          <blockquote className="border-l-2 pl-2 my-1 opacity-80">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    {isLoading && role === 'assistant' && (
      <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-blink" />
    )}
  </div>
)

const ConversationMessage: React.FC<ConversationMessageProps> = ({ 
  role, 
  content, 
  colors, 
  styles,
  isLoading = false 
}) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs px-3 py-2 ${messageRadiusClasses[styles.radius]} text-sm`}
      style={{
        backgroundColor: role === 'user' 
          ? colors.accentColor 
          : styles.theme === 'dark' 
            ? colors.baseColor // Will use filter for differentiation
            : colors.baseColor,
        color: role === 'user' 
          ? '#FFFFFF' 
          : styles.theme === 'dark' ? '#FFFFFF' : '#1F2937',
        ...(role === 'assistant' && {
          filter: styles.theme === 'dark' 
            ? 'brightness(1.5) contrast(0.9)' 
            : 'brightness(0.95) contrast(1.05)'
        })
      }}
    >
      <MarkdownMessage content={content} isLoading={isLoading} role={role} />
    </div>
  </div>
)

interface EmptyConversationProps {
  mode: 'voice' | 'chat' | 'hybrid'
  isCallActive: boolean
  theme: 'light' | 'dark'
  emptyVoiceMessage: string
  emptyVoiceActiveMessage: string
  emptyChatMessage: string
  emptyHybridMessage: string
}

const EmptyConversation: React.FC<EmptyConversationProps> = ({ 
  mode, 
  isCallActive, 
  theme,
  emptyVoiceMessage,
  emptyVoiceActiveMessage,
  emptyChatMessage,
  emptyHybridMessage
}) => (
  <div className="text-center">
    <div 
      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      {mode === 'voice' ? (
        <MicrophoneIcon size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
      ) : (
        <ChatCircleIcon size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
      )}
    </div>
    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
      {mode === 'voice' 
        ? (isCallActive ? emptyVoiceActiveMessage : emptyVoiceMessage)
        : mode === 'chat'
        ? emptyChatMessage
        : emptyHybridMessage
      }
    </p>
  </div>
)

interface VoiceControlsProps {
  isCallActive: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isAvailable: boolean
  onToggleCall: () => void
  startButtonText: string
  endButtonText: string
  colors: ColorScheme
}

const VoiceControls: React.FC<VoiceControlsProps> = ({ 
  isCallActive,
  connectionStatus,
  isAvailable,
  onToggleCall,
  startButtonText,
  endButtonText,
  colors
}) => (
  <div className="flex items-center justify-center">
    <button
      onClick={onToggleCall}
      disabled={!isAvailable && !isCallActive}
      className={`px-6 py-3 rounded-full font-medium transition-all flex items-center space-x-2 ${
        !isAvailable && !isCallActive
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{
        backgroundColor: isCallActive ? '#ef4444' : colors.accentColor,
        color: colors.buttonAccentColor || 'white'
      }}
    >
      {connectionStatus === 'connecting' ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
          <span>Connecting...</span>
        </>
      ) : isCallActive ? (
        <>
          <StopIcon size={16} weight="fill" />
          <span>{endButtonText}</span>
        </>
      ) : (
        <>
          <MicrophoneIcon size={16} weight="fill" />
          <span>{startButtonText}</span>
        </>
      )}
    </button>
  </div>
)

interface ChatControlsProps {
  chatInput: string
  isAvailable: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSendMessage: () => void
  colors: ColorScheme
  styles: StyleConfig
  inputRef?: React.RefObject<HTMLInputElement>
}

const ChatControls: React.FC<ChatControlsProps> = ({ 
  chatInput,
  isAvailable,
  onInputChange,
  onSendMessage,
  colors,
  styles,
  inputRef
}) => (
  <div className="flex items-center space-x-2">
    <input
      ref={inputRef}
      type="text"
      value={chatInput}
      onChange={onInputChange}
      onKeyPress={(e) => e.key === 'Enter' && isAvailable && onSendMessage()}
      placeholder="Type your message..."
      className={`flex-1 px-3 py-2 rounded-lg border ${
        styles.theme === 'dark' 
          ? 'border-gray-600 text-white placeholder-gray-400' 
          : 'border-gray-300 text-gray-900 placeholder-gray-500'
      } focus:outline-none focus:ring-2`}
      style={{ 
        '--tw-ring-color': styles.theme === 'dark' 
          ? `${colors.accentColor}33` // 20% opacity in dark mode
          : `${colors.accentColor}80`, // 50% opacity in light mode
        backgroundColor: colors.baseColor,
        filter: styles.theme === 'dark' 
          ? 'brightness(1.8)' 
          : 'brightness(0.98)'
      } as React.CSSProperties}
    />
    <button
      onClick={onSendMessage}
      disabled={!chatInput.trim() || !isAvailable}
      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
        !chatInput.trim() || !isAvailable
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{ backgroundColor: colors.accentColor, color: colors.buttonAccentColor || 'white' }}
    >
      <PaperPlaneTiltIcon size={20} weight="fill" />
    </button>
  </div>
)

interface HybridControlsProps {
  chatInput: string
  isCallActive: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isChatAvailable: boolean
  isVoiceAvailable: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSendMessage: () => void
  onToggleCall: () => void
  colors: ColorScheme
  styles: StyleConfig
  inputRef?: React.RefObject<HTMLInputElement>
}

const HybridControls: React.FC<HybridControlsProps> = ({ 
  chatInput,
  isCallActive,
  connectionStatus,
  isChatAvailable,
  isVoiceAvailable,
  onInputChange,
  onSendMessage,
  onToggleCall,
  colors,
  styles,
  inputRef
}) => (
  <div className="flex items-center space-x-2">
    <input
      ref={inputRef}
      type="text"
      value={chatInput}
      onChange={onInputChange}
      onKeyPress={(e) => e.key === 'Enter' && isChatAvailable && !isCallActive && onSendMessage()}
      placeholder="Type your message..."
      disabled={isCallActive}
      className={`flex-1 px-3 py-2 rounded-lg border ${
        styles.theme === 'dark' 
          ? 'border-gray-600 text-white placeholder-gray-400' 
          : 'border-gray-300 text-gray-900 placeholder-gray-500'
      } focus:outline-none focus:ring-2 ${
        isCallActive ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{ 
        '--tw-ring-color': styles.theme === 'dark' 
          ? `${colors.accentColor}33` // 20% opacity in dark mode
          : `${colors.accentColor}80`, // 50% opacity in light mode
        backgroundColor: colors.baseColor,
        filter: styles.theme === 'dark' 
          ? 'brightness(1.8)' 
          : 'brightness(0.98)'
      } as React.CSSProperties}
    />
    <button
      onClick={onSendMessage}
      disabled={!chatInput.trim() || !isChatAvailable || isCallActive}
      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
        !chatInput.trim() || !isChatAvailable || isCallActive
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{ backgroundColor: colors.accentColor, color: colors.buttonAccentColor || 'white' }}
      title="Send message"
    >
      <PaperPlaneTiltIcon size={20} weight="fill" />
    </button>
    <button
      onClick={onToggleCall}
      disabled={!isVoiceAvailable && !isCallActive}
      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
        !isVoiceAvailable && !isCallActive
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{
        backgroundColor: isCallActive ? '#ef4444' : colors.accentColor,
        color: colors.buttonAccentColor || 'white'
      }}
      title={
        connectionStatus === 'connecting' 
          ? 'Connecting...' 
          : isCallActive 
            ? 'Stop voice call' 
            : 'Start voice call'
      }
    >
      {connectionStatus === 'connecting' ? (
        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
      ) : isCallActive ? (
        <StopIcon size={20} weight="fill" />
      ) : (
        <MicrophoneIcon size={20} weight="fill" />
      )}
    </button>
  </div>
)

const VapiWidget: React.FC<VapiWidgetProps> = ({
  publicKey,
  vapiConfig,
  apiUrl,
  position = 'bottom-right',
  size = 'compact',
  radius = 'medium',
  mode = 'voice',
  theme = 'light',
  baseColor,
  accentColor,
  buttonBaseColor,
  buttonAccentColor,
  mainLabel = 'Talk with AI',
  startButtonText = 'Start',
  endButtonText = 'End Call',
  emptyVoiceMessage = 'Click the microphone to start talking',
  emptyVoiceActiveMessage = 'Listening...',
  emptyChatMessage = 'Type a message to start chatting',
  emptyHybridMessage = 'Use voice or text to communicate',
  requireConsent = false,
  termsContent = 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.',
  localStorageKey = 'vapi_widget_consent',
  showTranscript = true,
  onCallStart,
  onCallEnd,
  onMessage,
  onError
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [chatInput, setChatInput] = useState('')
  
  // Ref for auto-scrolling
  const conversationEndRef = useRef<HTMLDivElement>(null)
  
  // Ref for input field focus
  const inputRef = useRef<HTMLInputElement>(null)

  // Use the new combined hook
  const vapi = useVapiWidget({
    mode,
    publicKey,
    vapiConfig,
    apiUrl,
    onCallStart,
    onCallEnd,
    onMessage,
    onError
  })

  // Create color scheme object
  const colors: ColorScheme = {
    baseColor: baseColor 
      ? (theme === 'dark' && baseColor === '#FFFFFF' ? '#000000' : baseColor)
      : (theme === 'dark' ? '#000000' : '#FFFFFF'),
    accentColor: accentColor || '#14B8A6',
    buttonBaseColor: buttonBaseColor || '#000000',
    buttonAccentColor: buttonAccentColor || '#FFFFFF'
  }

  // Adjust size for chat/hybrid modes - tiny behaves as medium
  const effectiveSize = mode !== 'voice' && size === 'tiny' ? 'compact' : size

  // Create style config object
  const styles: StyleConfig = {
    size: effectiveSize,
    radius,
    theme
  }

  // Check consent on mount
  useEffect(() => {
    if (requireConsent) {
      const storedConsent = localStorage.getItem(localStorageKey)
      const hasStoredConsent = storedConsent === 'true'
      setHasConsent(hasStoredConsent)
    } else {
      setHasConsent(true)
    }
  }, [requireConsent, localStorageKey])

  // Auto-scroll to bottom when new messages arrive or content streams
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [vapi.conversation, vapi.chat.isTyping])

  // Auto-focus input when widget expands in chat or hybrid mode
  useEffect(() => {
    if (isExpanded && (mode === 'chat' || mode === 'hybrid')) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isExpanded, mode])

  const handleConsentAgree = () => {
    localStorage.setItem(localStorageKey, 'true')
    setHasConsent(true)
    // Widget will automatically show since isExpanded is already true
  }

  const handleConsentCancel = () => {
    // Just close the expanded view
    setIsExpanded(false)
  }

  const handleToggleCall = async () => {
    await vapi.voice.toggleCall()
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    
    // Store the message and clear input immediately
    const message = chatInput.trim()
    setChatInput('')
    
    // Then send the message
    await vapi.chat.sendMessage(message)
    
    // Maintain focus on the input field
    inputRef.current?.focus()
  }

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setChatInput(value)
    vapi.chat.handleInput(value)
  }

  const handleReset = () => {
    // Clear all conversation history and session states
    vapi.clearConversation()
    
    // If there's an active call, end it
    if (vapi.voice.isCallActive) {
      vapi.voice.endCall()
    }
    
    // Clear the chat input
    setChatInput('')
  }

  // Don't allow expanded view for tiny voice mode
  const showExpandedView = isExpanded && !(mode === 'voice' && size === 'tiny')

  // Handle floating button click
  const handleFloatingButtonClick = () => {
    setIsExpanded(true)
  }

  return (
    <>
      <div className={`fixed z-[50] ${positionClasses[position]}`}>
        {showExpandedView ? (
          // Check if we need to show consent form or the actual widget
          requireConsent && !hasConsent ? (
            <ConsentForm
              termsContent={termsContent}
              onAccept={handleConsentAgree}
              onCancel={handleConsentCancel}
              colors={colors}
              styles={styles}
              radius={radius}
            />
          ) : (
            // Expanded Widget
            <div 
              className={`${sizeClasses[size].expanded} ${radiusClasses[radius]} border flex flex-col overflow-hidden ${
                styles.theme === 'dark' 
                  ? 'shadow-2xl shadow-black/50' 
                  : 'shadow-2xl'
              }`}
              style={{ 
                backgroundColor: colors.baseColor,
                borderColor: styles.theme === 'dark' ? '#1F2937' : '#E5E7EB'
              }}
            >
              <WidgetHeader
                mode={mode}
                connectionStatus={vapi.voice.connectionStatus}
                isCallActive={vapi.voice.isCallActive}
                isSpeaking={vapi.voice.isSpeaking}
                isTyping={vapi.chat.isTyping}
                hasActiveConversation={vapi.conversation.length > 0}
                mainLabel={mainLabel}
                onClose={() => setIsExpanded(false)}
                onReset={handleReset}
                colors={colors}
                styles={styles}
              />

              {/* Conversation Area */}
              <div 
                className={`flex-1 p-4 overflow-y-auto ${
                  // Apply flex centering for empty states and volume indicator
                  (vapi.conversation.length === 0 || (!showTranscript && vapi.voice.isCallActive && (mode === 'voice' || mode === 'hybrid')))
                    ? 'flex items-center justify-center'
                    : 'space-y-3'
                }`}
                style={{
                  backgroundColor: colors.baseColor,
                  ...(styles.theme === 'dark' 
                    ? { filter: 'brightness(1.1)' } 
                    : {})
                }}
              >
                {/* Show transcript when: showTranscript is true OR in chat mode OR in hybrid mode but voice is not active */}
                {(showTranscript || mode === 'chat' || (mode === 'hybrid' && !vapi.voice.isCallActive)) ? (
                  <>
                    {vapi.conversation.length === 0 ? (
                      <EmptyConversation 
                        mode={mode} 
                        isCallActive={vapi.voice.isCallActive} 
                        theme={styles.theme} 
                        emptyVoiceMessage={emptyVoiceMessage}
                        emptyVoiceActiveMessage={emptyVoiceActiveMessage}
                        emptyChatMessage={emptyChatMessage}
                        emptyHybridMessage={emptyHybridMessage}
                      />
                    ) : (
                      <>
                        {vapi.conversation.map((message, index) => {
                          try {
                            return (
                              <ConversationMessage
                                key={`${message.role}-${index}-${message.timestamp.getTime()}`}
                                role={message.role}
                                content={message.content || ''}
                                colors={colors}
                                styles={styles}
                                isLoading={index === vapi.conversation.length - 1 && message.role === 'assistant' && vapi.chat.isTyping}
                              />
                            )
                          } catch (error) {
                            console.error('Error rendering message:', error, message)
                            return null
                          }
                        })}
                        {/* Scroll anchor */}
                        <div ref={conversationEndRef} />
                      </>
                    )}
                  </>
                ) : (
                  /* Show center volume indicator when transcript is hidden and voice call is active */
                  vapi.voice.isCallActive ? (
                    <VolumeIndicator
                      volumeLevel={vapi.voice.volumeLevel}
                      isCallActive={vapi.voice.isCallActive}
                      isSpeaking={vapi.voice.isSpeaking}
                      theme={styles.theme}
                    />
                  ) : (
                    <EmptyConversation 
                      mode={mode} 
                      isCallActive={vapi.voice.isCallActive} 
                      theme={styles.theme} 
                      emptyVoiceMessage={emptyVoiceMessage}
                      emptyVoiceActiveMessage={emptyVoiceActiveMessage}
                      emptyChatMessage={emptyChatMessage}
                      emptyHybridMessage={emptyHybridMessage}
                    />
                  )
                )}
              </div>

              {/* Controls */}
              <div 
                className={`p-4 border-t ${
                  styles.theme === 'dark' 
                    ? 'border-gray-800' 
                    : 'border-gray-200'
                }`}
                style={{ 
                  backgroundColor: colors.baseColor,
                  ...(styles.theme === 'dark' 
                    ? { filter: 'brightness(1.05)' } 
                    : { filter: 'brightness(0.97)' }
                  )
                }}
              >
                {mode === 'voice' && (
                  <VoiceControls
                    isCallActive={vapi.voice.isCallActive}
                    connectionStatus={vapi.voice.connectionStatus}
                    isAvailable={vapi.voice.isAvailable}
                    onToggleCall={handleToggleCall}
                    startButtonText={startButtonText}
                    endButtonText={endButtonText}
                    colors={colors}
                  />
                )}

                {mode === 'chat' && (
                  <ChatControls
                    chatInput={chatInput}
                    isAvailable={vapi.chat.isAvailable}
                    onInputChange={handleChatInputChange}
                    onSendMessage={handleSendMessage}
                    colors={colors}
                    styles={styles}
                    inputRef={inputRef}
                  />
                )}

                {mode === 'hybrid' && (
                  <HybridControls
                    chatInput={chatInput}
                    isCallActive={vapi.voice.isCallActive}
                    connectionStatus={vapi.voice.connectionStatus}
                    isChatAvailable={vapi.chat.isAvailable}
                    isVoiceAvailable={vapi.voice.isAvailable}
                    onInputChange={handleChatInputChange}
                    onSendMessage={handleSendMessage}
                    onToggleCall={handleToggleCall}
                    colors={colors}
                    styles={styles}
                    inputRef={inputRef}
                  />
                )}
              </div>
            </div>
          )
        ) : (
          // Floating Button - Always visible
          <FloatingButton
            isCallActive={vapi.voice.isCallActive}
            connectionStatus={vapi.voice.connectionStatus}
            isSpeaking={vapi.voice.isSpeaking}
            isTyping={vapi.chat.isTyping}
            onClick={handleFloatingButtonClick}
            onToggleCall={handleToggleCall}
            mainLabel={mainLabel}
            colors={colors}
            styles={styles}
            mode={mode}
          />
        )}
      </div>
      
      {/* Additional styles for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 25px rgba(239, 68, 68, 0.5);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.7);
          }
        }
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-blink {
          animation: blink 1s steps(1, start) infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

export default VapiWidget