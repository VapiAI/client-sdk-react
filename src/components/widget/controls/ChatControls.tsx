import React from 'react';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { ChatControlsProps } from '../../types';

const ChatControls: React.FC<ChatControlsProps> = ({
  chatInput,
  isAvailable,
  onInputChange,
  onSendMessage,
  colors,
  styles,
  inputRef,
  placeholder = 'Type your message...', // Default fallback
}) => (
  <div className="vapi-flex vapi-items-center vapi-space-x-2">
    <input
      ref={inputRef}
      type="text"
      value={chatInput}
      onChange={onInputChange}
      onKeyPress={(e) => e.key === 'Enter' && isAvailable && onSendMessage()}
      placeholder={placeholder}
      className={`vapi-flex-1 vapi-px-3 vapi-py-2 vapi-rounded-lg vapi-border ${
        styles.theme === 'dark'
          ? 'vapi-border-gray-600 vapi-text-white vapi-placeholder-gray-400'
          : 'vapi-border-gray-300 vapi-text-gray-900 vapi-placeholder-gray-500'
      } focus:vapi-outline-none focus:vapi-ring-2`}
      style={
        {
          '--tw-ring-color':
            styles.theme === 'dark'
              ? `${colors.accentColor}33` // 20% opacity in dark mode
              : `${colors.accentColor}80`, // 50% opacity in light mode
          backgroundColor: colors.baseColor,
          filter:
            styles.theme === 'dark' ? 'brightness(1.8)' : 'brightness(0.98)',
        } as React.CSSProperties
      }
    />
    <button
      onClick={onSendMessage}
      disabled={!chatInput.trim() || !isAvailable}
      className={`vapi-h-10 vapi-w-10 vapi-flex vapi-items-center vapi-justify-center vapi-rounded-lg vapi-transition-all ${
        !chatInput.trim() || !isAvailable
          ? 'vapi-opacity-50 vapi-cursor-not-allowed'
          : 'hover:vapi-opacity-90 active:vapi-scale-95'
      }`}
      style={{
        backgroundColor: colors.accentColor,
        color: colors.ctaButtonTextColor || 'white',
      }}
    >
      <PaperPlaneTiltIcon size={20} weight="fill" />
    </button>
  </div>
);

export default ChatControls;
