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
      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
        !chatInput.trim() || !isAvailable
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{
        backgroundColor: colors.accentColor,
        color: colors.buttonAccentColor || 'white',
      }}
    >
      <PaperPlaneTiltIcon size={20} weight="fill" />
    </button>
  </div>
);

export default ChatControls;
