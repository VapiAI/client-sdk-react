import React from 'react';
import { XIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';
import AnimatedStatusIcon from '../AnimatedStatusIcon';
import { WidgetHeaderProps } from '../types';

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
  onChatComplete,
  showEndChatButton,
  colors,
  styles,
  labels,
}) => {
  const getStatusMessage = () => {
    if (connectionStatus === 'connecting') return labels.connecting;

    if (isCallActive) {
      return isSpeaking ? labels.assistantSpeaking : labels.listening;
    }

    if (isTyping) return labels.assistantTyping;

    if (hasActiveConversation) {
      if (mode === 'chat') return labels.chatActive;
      if (mode === 'hybrid') return labels.readyToAssist;
      return labels.connected;
    }

    if (mode === 'voice') return labels.voiceIdle;
    if (mode === 'chat') return labels.chatIdle;
    return labels.hybridIdle;
  };

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
          <div
            className={`text-sm ${
              styles.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {getStatusMessage()}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {showEndChatButton !== false && mode === 'chat' && (
          <button
            onClick={onChatComplete}
            className={`text-red-600 text-sm font-medium px-2 py-1 border border-transparent hover:border-red-600 rounded-md transition-colors`}
            title={labels.endChat}
          >
            {labels.endChat}
          </button>
        )}
        <button
          onClick={onReset}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all}`}
          title={labels.resetConversation}
        >
          <ArrowsClockwiseIcon size={16} weight="bold" />
        </button>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all`}
          title={labels.close}
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
