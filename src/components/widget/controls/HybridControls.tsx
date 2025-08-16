import React from 'react';
import {
  PaperPlaneTiltIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  StopIcon,
  WaveformIcon,
} from '@phosphor-icons/react';
import { HybridControlsProps } from '../../types';

const HybridControls: React.FC<HybridControlsProps> = ({
  chatInput,
  isCallActive,
  connectionStatus,
  isChatAvailable,
  isVoiceAvailable,
  isMuted,
  onInputChange,
  onSendMessage,
  onToggleCall,
  onToggleMute,
  colors,
  styles,
  inputRef,
  placeholder = 'Type your message...', // Default fallback
}) => (
  <div className="flex items-center space-x-2">
    <input
      ref={inputRef}
      type="text"
      value={chatInput}
      onChange={onInputChange}
      onKeyPress={(e) =>
        e.key === 'Enter' && isChatAvailable && !isCallActive && onSendMessage()
      }
      placeholder={placeholder}
      disabled={isCallActive}
      className={`flex-1 px-3 py-2 rounded-lg border ${
        styles.theme === 'dark'
          ? 'border-gray-600 text-white placeholder-gray-400'
          : 'border-gray-300 text-gray-900 placeholder-gray-500'
      } focus:outline-none focus:ring-2 ${
        isCallActive ? 'opacity-50 cursor-not-allowed' : ''
      }`}
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
      disabled={!chatInput.trim() || !isChatAvailable || isCallActive}
      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
        !chatInput.trim() || !isChatAvailable || isCallActive
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{
        backgroundColor: colors.accentColor,
        color: colors.ctaButtonTextColor || 'white',
      }}
      title="Send message"
    >
      <PaperPlaneTiltIcon size={20} weight="fill" />
    </button>
    {isCallActive && connectionStatus === 'connected' && (
      <button
        onClick={onToggleMute}
        className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:opacity-90 active:scale-95"
        style={{
          backgroundColor: isMuted ? '#ef4444' : colors.accentColor,
          color: colors.ctaButtonTextColor || 'white',
        }}
        title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? (
          <MicrophoneSlashIcon size={20} weight="fill" />
        ) : (
          <MicrophoneIcon size={20} weight="fill" />
        )}
      </button>
    )}
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
        color: colors.ctaButtonTextColor || 'white',
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
        <WaveformIcon size={20} weight="bold" />
      )}
    </button>
  </div>
);

export default HybridControls;
