import React from 'react';
import {
  MicrophoneIcon,
  StopIcon,
  MicrophoneSlashIcon,
  WaveformIcon,
} from '@phosphor-icons/react';
import { VoiceControlsProps } from '../../types';

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isCallActive,
  connectionStatus,
  isAvailable,
  isMuted,
  onToggleCall,
  onToggleMute,
  startButtonText,
  endButtonText,
  colors,
}) => (
  <div className="flex items-center justify-center space-x-2">
    {isCallActive && connectionStatus === 'connected' && (
      <button
        onClick={onToggleMute}
        className="h-12 w-12 flex items-center justify-center rounded-full transition-all hover:opacity-90 active:scale-95"
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
      disabled={!isAvailable && !isCallActive}
      className={`px-6 py-3 rounded-full font-medium transition-all flex items-center space-x-2 ${
        !isAvailable && !isCallActive
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90 active:scale-95'
      }`}
      style={{
        backgroundColor: isCallActive ? '#ef4444' : colors.accentColor,
        color: colors.ctaButtonTextColor || 'white',
      }}
    >
      {connectionStatus === 'connecting' ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
          <span>Connecting...</span>
        </>
      ) : isCallActive ? (
        <>
          <StopIcon size={16} weight="fill" />
          <span>{endButtonText}</span>
        </>
      ) : (
        <>
          <WaveformIcon size={16} weight="bold" />
          <span>{startButtonText}</span>
        </>
      )}
    </button>
  </div>
);

export default VoiceControls;
