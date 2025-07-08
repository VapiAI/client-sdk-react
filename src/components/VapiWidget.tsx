import React, { useState, useEffect, useRef } from 'react';
import { useVapiWidget } from '../hooks';

import { VapiWidgetProps, ColorScheme, StyleConfig } from './types';

import { sizeStyles, radiusStyles, positionStyles } from './constants';

import ConsentForm from './widget/ConsentForm';
import FloatingButton from './widget/FloatingButton';
import WidgetHeader from './widget/WidgetHeader';
import AnimatedStatusIcon from './AnimatedStatusIcon';
import ConversationMessage from './widget/conversation/Message';
import EmptyConversation from './widget/conversation/EmptyState';
import VoiceControls from './widget/controls/VoiceControls';
import ChatControls from './widget/controls/ChatControls';
import HybridControls from './widget/controls/HybridControls';

import '../styles/animations.css';

const VapiWidget: React.FC<VapiWidgetProps> = ({
  publicKey,
  assistantId,
  assistant,
  assistantOverrides,
  apiUrl,
  position = 'bottom-right',
  size = 'full',
  radius = 'medium',
  mode = 'chat',
  theme = 'light',
  baseColor,
  accentColor,
  buttonBaseColor,
  buttonAccentColor,
  mainLabel = 'Talk with AI',
  startButtonText = 'Start',
  endButtonText = 'End Call',
  emptyVoiceMessage = 'Click the start button to begin a conversation',
  emptyVoiceActiveMessage = 'Listening...',
  emptyChatMessage = 'Type a message to start chatting',
  emptyHybridMessage = 'Use voice or text to communicate',
  firstChatMessage,
  requireConsent = false,
  termsContent = 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.',
  localStorageKey = 'vapi_widget_consent',
  showTranscript = false,
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
    assistantId,
    assistant,
    assistantOverrides,
    apiUrl,
    firstChatMessage,
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

  const showExpandedView = isExpanded && !(mode === 'voice' && size === 'tiny');

  const getExpandedWidgetStyle = (): React.CSSProperties => ({
    ...sizeStyles[size].expanded,
    ...radiusStyles[radius],
    backgroundColor: colors.baseColor,
    border: `1px solid ${styles.theme === 'dark' ? '#1F2937' : '#E5E7EB'}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow:
      styles.theme === 'dark'
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        : '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  });

  const getConversationAreaStyle = (): React.CSSProperties => ({
    flex: '1 1 0%',
    padding: '1rem',
    overflowY: 'auto',
    backgroundColor: colors.baseColor,
    ...(styles.theme === 'dark' ? { filter: 'brightness(1.1)' } : {}),
  });

  const getControlsAreaStyle = (): React.CSSProperties => ({
    padding: '1rem',
    borderTop: `1px solid ${styles.theme === 'dark' ? '#1F2937' : '#E5E7EB'}`,
    backgroundColor: colors.baseColor,
    ...(styles.theme === 'dark'
      ? { filter: 'brightness(1.05)' }
      : { filter: 'brightness(0.97)' }),
  });

  const getConversationLayoutStyle = (): React.CSSProperties => {
    const isEmpty = vapi.conversation.length === 0;
    const hideTranscript =
      !showTranscript &&
      vapi.voice.isCallActive &&
      (mode === 'voice' || mode === 'hybrid');
    const showingEmptyState = mode === 'voice' && !vapi.voice.isCallActive;

    if (isEmpty || hideTranscript || showingEmptyState) {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    }

    return {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    };
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

    if (mode === 'chat' || mode === 'hybrid') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleFloatingButtonClick = () => {
    setIsExpanded(true);
  };

  const renderConversationMessages = () => {
    if (vapi.conversation.length === 0) {
      return (
        <EmptyConversation
          mode={mode}
          isCallActive={vapi.voice.isCallActive}
          theme={styles.theme}
          emptyVoiceMessage={emptyVoiceMessage}
          emptyVoiceActiveMessage={emptyVoiceActiveMessage}
          emptyChatMessage={emptyChatMessage}
          emptyHybridMessage={emptyHybridMessage}
        />
      );
    }

    return (
      <>
        {vapi.conversation.map((message, index) => {
          try {
            const key = message?.id || `${message.role}-${index}`;
            return (
              <ConversationMessage
                key={key}
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
            console.error('Error rendering message:', error, message);
            return null;
          }
        })}
        <div ref={conversationEndRef} />
      </>
    );
  };

  const renderConversationArea = () => {
    // Chat mode: always show conversation messages
    if (mode === 'chat') {
      return renderConversationMessages();
    }

    // Hybrid mode: show messages when call is not active, respect showTranscript when active
    if (mode === 'hybrid') {
      if (!vapi.voice.isCallActive) {
        return renderConversationMessages();
      } else if (showTranscript) {
        return renderConversationMessages();
      } else {
        return (
          <AnimatedStatusIcon
            size={150}
            connectionStatus={vapi.voice.connectionStatus}
            isCallActive={vapi.voice.isCallActive}
            isSpeaking={vapi.voice.isSpeaking}
            isTyping={vapi.chat.isTyping}
            volumeLevel={vapi.voice.volumeLevel}
            baseColor={colors.accentColor}
            colors={colors.accentColor}
          />
        );
      }
    }

    // Voice mode: respect showTranscript when call is active
    if (mode === 'voice') {
      if (vapi.voice.isCallActive) {
        if (showTranscript) {
          return renderConversationMessages();
        } else {
          return (
            <AnimatedStatusIcon
              size={150}
              connectionStatus={vapi.voice.connectionStatus}
              isCallActive={vapi.voice.isCallActive}
              isSpeaking={vapi.voice.isSpeaking}
              isTyping={vapi.chat.isTyping}
              volumeLevel={vapi.voice.volumeLevel}
              baseColor={colors.accentColor}
              colors={colors.accentColor}
            />
          );
        }
      }
    }

    // Default: show empty conversation
    return (
      <EmptyConversation
        mode={mode}
        isCallActive={vapi.voice.isCallActive}
        theme={styles.theme}
        emptyVoiceMessage={emptyVoiceMessage}
        emptyVoiceActiveMessage={emptyVoiceActiveMessage}
        emptyChatMessage={emptyChatMessage}
        emptyHybridMessage={emptyHybridMessage}
      />
    );
  };

  const renderControls = () => {
    if (mode === 'voice') {
      return (
        <VoiceControls
          isCallActive={vapi.voice.isCallActive}
          connectionStatus={vapi.voice.connectionStatus}
          isAvailable={vapi.voice.isAvailable}
          onToggleCall={handleToggleCall}
          startButtonText={startButtonText}
          endButtonText={endButtonText}
          colors={colors}
        />
      );
    }

    if (mode === 'chat') {
      return (
        <ChatControls
          chatInput={chatInput}
          isAvailable={vapi.chat.isAvailable}
          onInputChange={handleChatInputChange}
          onSendMessage={handleSendMessage}
          colors={colors}
          styles={styles}
          inputRef={inputRef}
        />
      );
    }

    if (mode === 'hybrid') {
      return (
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
      );
    }

    return null;
  };

  const renderExpandedWidget = () => {
    if (requireConsent && !hasConsent) {
      return (
        <ConsentForm
          termsContent={termsContent}
          onAccept={handleConsentAgree}
          onCancel={handleConsentCancel}
          colors={colors}
          styles={styles}
          radius={radius}
        />
      );
    }

    return (
      <div style={getExpandedWidgetStyle()}>
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
          className="vapi-conversation-area"
          style={{
            ...getConversationAreaStyle(),
            ...getConversationLayoutStyle(),
          }}
        >
          {renderConversationArea()}
        </div>

        {/* Controls Area */}
        <div style={getControlsAreaStyle()}>{renderControls()}</div>
      </div>
    );
  };

  return (
    <div className="vapi-widget-wrapper">
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          ...positionStyles[position],
        }}
      >
        {showExpandedView ? (
          renderExpandedWidget()
        ) : (
          <FloatingButton
            isCallActive={vapi.voice.isCallActive}
            connectionStatus={vapi.voice.connectionStatus}
            isSpeaking={vapi.voice.isSpeaking}
            isTyping={vapi.chat.isTyping}
            volumeLevel={vapi.voice.volumeLevel}
            onClick={handleFloatingButtonClick}
            onToggleCall={handleToggleCall}
            mainLabel={mainLabel}
            colors={colors}
            styles={styles}
            mode={mode}
          />
        )}
      </div>
    </div>
  );
};

export default VapiWidget;
