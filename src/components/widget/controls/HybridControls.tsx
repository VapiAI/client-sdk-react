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
  <div className="vapi-flex vapi-items-center vapi-space-x-2">
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
      className={`vapi-flex-1 vapi-px-3 vapi-py-2 vapi-rounded-lg vapi-border ${
        styles.theme === 'dark'
          ? 'vapi-border-gray-600 vapi-text-white vapi-placeholder-gray-400'
          : 'vapi-border-gray-300 vapi-text-gray-900 vapi-placeholder-gray-500'
      } focus:vapi-outline-none focus:vapi-ring-2 ${
        isCallActive ? 'vapi-opacity-50 vapi-cursor-not-allowed' : ''
      }`}
      style={
        {
          // '--tw-ring-color':
          //   styles.theme === 'dark'
          //     ? `${colors.accentColor}33` // 20% opacity in dark mode
          //     : `${colors.accentColor}80`, // 50% opacity in light mode
          backgroundColor: colors.baseColor,
          filter:
            styles.theme === 'dark' ? 'brightness(1.8)' : 'brightness(0.98)',
        } as React.CSSProperties
      }
    />
    <button
      onClick={onSendMessage}
      disabled={!chatInput.trim() || !isChatAvailable || isCallActive}
      className={`vapi-h-10 vapi-w-10 vapi-flex vapi-items-center vapi-justify-center vapi-rounded-lg vapi-transition-all ${
        !chatInput.trim() || !isChatAvailable || isCallActive
          ? 'vapi-opacity-50 vapi-cursor-not-allowed'
          : 'hover:vapi-opacity-90 active:vapi-scale-95'
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
        className="vapi-h-10 vapi-w-10 vapi-flex vapi-items-center vapi-justify-center vapi-rounded-lg vapi-transition-all hover:vapi-opacity-90 active:vapi-scale-95"
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
      className={`vapi-h-10 vapi-w-10 vapi-flex vapi-items-center vapi-justify-center vapi-rounded-lg vapi-transition-all ${
        !isVoiceAvailable && !isCallActive
          ? 'vapi-opacity-50 vapi-cursor-not-allowed'
          : 'hover:vapi-opacity-90 active:vapi-scale-95'
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
        <div className="vapi-animate-spin vapi-w-5 vapi-h-5 vapi-border-2 vapi-border-current vapi-border-t-transparent vapi-rounded-full"></div>
      ) : isCallActive ? (
        <StopIcon size={20} weight="fill" />
      ) : (
        <WaveformIcon size={20} weight="bold" />
      )}
    </button>
  </div>
);

export default HybridControls;
