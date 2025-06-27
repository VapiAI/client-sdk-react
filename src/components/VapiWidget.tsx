import React, { useState, useEffect, useRef } from 'react'
import { useVapiWidget } from '../hooks'

// Import extracted types
import { VapiWidgetProps, ColorScheme, StyleConfig } from './types'

// Import extracted constants
import { sizeClasses, radiusClasses, positionClasses } from './constants'

// Import extracted components
import ConsentForm from './widget/ConsentForm'
import FloatingButton from './widget/FloatingButton'
import WidgetHeader from './widget/WidgetHeader'
import VolumeIndicator from './widget/conversation/VolumeIndicator'
import ConversationMessage from './widget/conversation/Message'
import EmptyConversation from './widget/conversation/EmptyState'
import VoiceControls from './widget/controls/VoiceControls'
import ChatControls from './widget/controls/ChatControls'
import HybridControls from './widget/controls/HybridControls'

// Import animations
import '../styles/animations.css'

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
    </>
  )
}

export default VapiWidget