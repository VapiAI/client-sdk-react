import React, { useState, useEffect, useRef } from 'react';
import { useVapiWidget } from '../hooks';

import { VapiWidgetProps, ColorScheme, StyleConfig } from './types';

import { sizeClasses, radiusClasses, positionClasses } from './constants';

import ConsentForm from './widget/ConsentForm';
import FloatingButton from './widget/FloatingButton';
import WidgetHeader from './widget/WidgetHeader';
import VolumeIndicator from './widget/conversation/VolumeIndicator';
import ConversationMessage from './widget/conversation/Message';
import EmptyConversation from './widget/conversation/EmptyState';
import VoiceControls from './widget/controls/VoiceControls';
import ChatControls from './widget/controls/ChatControls';
import HybridControls from './widget/controls/HybridControls';

import '../styles/animations.css';

const VapiWidget: React.FC<VapiWidgetProps> = ({
  publicKey,
  vapiConfig,
  apiUrl,
  position = 'bottom-right',
  size = 'full',
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
  onError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const conversationEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const vapi = useVapiWidget({
    mode,
    publicKey,
    vapiConfig,
    apiUrl,
    onCallStart,
    onCallEnd,
    onMessage,
    onError,
  });

  const colors: ColorScheme = {
    baseColor: baseColor
      ? theme === 'dark' && baseColor === '#FFFFFF'
        ? '#000000'
        : baseColor
      : theme === 'dark'
        ? '#000000'
        : '#FFFFFF',
    accentColor: accentColor || '#14B8A6',
    buttonBaseColor: buttonBaseColor || '#000000',
    buttonAccentColor: buttonAccentColor || '#FFFFFF',
  };

  const effectiveSize = mode !== 'voice' && size === 'tiny' ? 'compact' : size;

  const styles: StyleConfig = {
    size: effectiveSize,
    radius,
    theme,
  };

  useEffect(() => {
    if (requireConsent) {
      const storedConsent = localStorage.getItem(localStorageKey);
      const hasStoredConsent = storedConsent === 'true';
      setHasConsent(hasStoredConsent);
    } else {
      setHasConsent(true);
    }
  }, [requireConsent, localStorageKey]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [vapi.conversation, vapi.chat.isTyping]);

  useEffect(() => {
    if (isExpanded && (mode === 'chat' || mode === 'hybrid')) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, mode]);

  const handleConsentAgree = () => {
    localStorage.setItem(localStorageKey, 'true');
    setHasConsent(true);
  };

  const handleConsentCancel = () => {
    setIsExpanded(false);
  };

  const handleToggleCall = async () => {
    await vapi.voice.toggleCall();
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput('');

    await vapi.chat.sendMessage(message);

    inputRef.current?.focus();
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChatInput(value);
    vapi.chat.handleInput(value);
  };

  const handleReset = () => {
    vapi.clearConversation();

    if (vapi.voice.isCallActive) {
      vapi.voice.endCall();
    }

    setChatInput('');
  };

  // Don't allow expanded view for tiny voice mode
  const showExpandedView = isExpanded && !(mode === 'voice' && size === 'tiny');

  const handleFloatingButtonClick = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <div className={`fixed z-[50] ${positionClasses[position]}`}>
        {showExpandedView ? (
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
            <div
              className={`${sizeClasses[size].expanded} ${radiusClasses[radius]} border flex flex-col overflow-hidden ${
                styles.theme === 'dark'
                  ? 'shadow-2xl shadow-black/50'
                  : 'shadow-2xl'
              }`}
              style={{
                backgroundColor: colors.baseColor,
                borderColor: styles.theme === 'dark' ? '#1F2937' : '#E5E7EB',
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
                  vapi.conversation.length === 0 ||
                  (!showTranscript &&
                    vapi.voice.isCallActive &&
                    (mode === 'voice' || mode === 'hybrid'))
                    ? 'flex items-center justify-center'
                    : 'space-y-3'
                }`}
                style={{
                  backgroundColor: colors.baseColor,
                  ...(styles.theme === 'dark'
                    ? { filter: 'brightness(1.1)' }
                    : {}),
                }}
              >
                {showTranscript ||
                mode === 'chat' ||
                (mode === 'hybrid' && !vapi.voice.isCallActive) ? (
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
                                isLoading={
                                  index === vapi.conversation.length - 1 &&
                                  message.role === 'assistant' &&
                                  vapi.chat.isTyping
                                }
                              />
                            );
                          } catch (error) {
                            console.error(
                              'Error rendering message:',
                              error,
                              message
                            );
                            return null;
                          }
                        })}
                        {/* Scroll anchor */}
                        <div ref={conversationEndRef} />
                      </>
                    )}
                  </>
                ) : vapi.voice.isCallActive ? (
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
                    : { filter: 'brightness(0.97)' }),
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
  );
};

export default VapiWidget;
