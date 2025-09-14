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
  <div className="vapi-flex vapi-items-center vapi-justify-center vapi-space-x-2">
    {isCallActive && connectionStatus === 'connected' && (
      <button
        onClick={onToggleMute}
        className="vapi-h-12 vapi-w-12 vapi-flex vapi-items-center vapi-justify-center vapi-rounded-full vapi-transition-all hover:vapi-opacity-90 active:vapi-scale-95"
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
      className={`vapi-px-6 vapi-py-3 vapi-rounded-full vapi-font-medium vapi-transition-all vapi-flex vapi-items-center vapi-space-x-2 ${
        !isAvailable && !isCallActive
          ? 'vapi-opacity-50 vapi-cursor-not-allowed'
          : 'hover:vapi-opacity-90 active:vapi-scale-95'
      }`}
      style={{
        backgroundColor: isCallActive ? '#ef4444' : colors.accentColor,
        color: colors.ctaButtonTextColor || 'white',
      }}
    >
      {connectionStatus === 'connecting' ? (
        <>
          <div className="vapi-animate-spin vapi-w-4 vapi-h-4 vapi-border-2 vapi-border-current vapi-border-t-transparent vapi-rounded-full"></div>
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
