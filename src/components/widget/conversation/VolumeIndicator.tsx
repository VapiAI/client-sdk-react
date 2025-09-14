import React from 'react';
import { MicrophoneIcon } from '@phosphor-icons/react';
import { VolumeIndicatorProps } from '../../types';

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({
  volumeLevel,
  isCallActive,
  isSpeaking,
  theme,
}) => (
  <div className="vapi-text-center vapi-space-y-4">
    <div
      className={`vapi-w-20 vapi-h-20 vapi-rounded-full vapi-flex vapi-items-center vapi-justify-center vapi-mx-auto ${
        theme === 'dark' ? 'vapi-bg-gray-700' : 'vapi-bg-gray-100'
      }`}
    >
      <MicrophoneIcon
        size={40}
        className={`${
          isCallActive
            ? isSpeaking
              ? 'vapi-text-red-400 vapi-animate-pulse'
              : 'vapi-text-green-400'
            : theme === 'dark'
              ? 'vapi-text-gray-400'
              : 'vapi-text-gray-400'
        }`}
      />
    </div>

    <div className="vapi-space-y-2">
      <div className="vapi-flex vapi-items-center vapi-space-x-2 vapi-justify-center">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`vapi-w-1.5 vapi-rounded-full vapi-transition-all vapi-duration-150 ${
              i < volumeLevel * 7
                ? 'vapi-bg-green-400'
                : theme === 'dark'
                  ? 'vapi-bg-gray-600'
                  : 'vapi-bg-gray-300'
            }`}
            style={{ height: `${12 + i * 3}px` }}
          />
        ))}
      </div>

      <p
        className={`vapi-text-sm ${theme === 'dark' ? 'vapi-text-gray-400' : 'vapi-text-gray-500'}`}
      >
        {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
      </p>
    </div>
  </div>
);

export default VolumeIndicator;
