import React from 'react';
import { MicrophoneIcon } from '@phosphor-icons/react';
import { VolumeIndicatorProps } from '../../types';

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({
  volumeLevel,
  isCallActive,
  isSpeaking,
  theme,
}) => (
  <div className="text-center space-y-4">
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      <MicrophoneIcon
        size={40}
        className={`${
          isCallActive
            ? isSpeaking
              ? 'text-red-400 animate-pulse'
              : 'text-green-400'
            : theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-400'
        }`}
      />
    </div>

    <div className="space-y-2">
      <div className="flex items-center space-x-2 justify-center">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              i < volumeLevel * 7
                ? 'bg-green-400'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            }`}
            style={{ height: `${12 + i * 3}px` }}
          />
        ))}
      </div>

      <p
        className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
      >
        {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
      </p>
    </div>
  </div>
);

export default VolumeIndicator;
