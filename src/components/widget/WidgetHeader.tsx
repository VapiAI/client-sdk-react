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
      className={`vapi-relative vapi-z-10 vapi-p-4 vapi-flex vapi-items-center vapi-justify-between vapi-border-b ${
        styles.theme === 'dark'
          ? 'vapi-text-white vapi-border-gray-800 vapi-shadow-lg'
          : 'vapi-text-gray-900 vapi-border-gray-200 vapi-shadow-sm'
      }`}
      style={{ backgroundColor: colors.baseColor }}
    >
      <div className="vapi-flex vapi-items-center vapi-space-x-3">
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
          <div className="vapi-font-medium">{mainLabel}</div>
          <div
            className={`vapi-text-sm ${
              styles.theme === 'dark' ? 'vapi-text-gray-300' : 'vapi-text-gray-600'
            }`}
          >
            {getStatusMessage()}
          </div>
        </div>
      </div>
      <div className="vapi-flex vapi-items-center vapi-space-x-2">
        <button
          onClick={onReset}
          className={`vapi-w-8 vapi-h-8 vapi-rounded-full vapi-flex vapi-items-center vapi-justify-center vapi-transition-all}`}
          title="Reset conversation"
        >
          <ArrowsClockwiseIcon size={16} weight="bold" />
        </button>
        <button
          onClick={onClose}
          className={`vapi-w-8 vapi-h-8 vapi-rounded-full vapi-flex vapi-items-center vapi-justify-center vapi-transition-all`}
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
