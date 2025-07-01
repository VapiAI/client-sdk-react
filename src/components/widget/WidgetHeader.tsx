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
  colors,
  styles,
}) => {
  const getStatusMessage = () => {
    if (connectionStatus === 'connecting') return 'Connecting...';

    if (isCallActive) {
      return isSpeaking ? 'Assistant Speaking...' : 'Listening...';
    }

    if (isTyping) return 'Assistant is typing...';

    if (hasActiveConversation) {
      if (mode === 'chat') return 'Chat active';
      if (mode === 'hybrid') return 'Ready to assist';
      return 'Connected';
    }

    if (mode === 'voice') return 'Click the microphone to start';
    if (mode === 'chat') return 'Type a message below';
    return 'Choose voice or text';
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
        <button
          onClick={onReset}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all}`}
          title="Reset conversation"
        >
          <ArrowsClockwiseIcon size={16} weight="bold" />
        </button>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all`}
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
