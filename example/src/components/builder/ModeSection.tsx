import React from 'react';
import {
  MicrophoneIcon,
  ChatCircleIcon,
  WaveformIcon,
} from '@phosphor-icons/react';

interface ModeSectionProps {
  mode: string;
  showTranscript: boolean;
  onModeChange: (mode: 'voice' | 'chat' | 'hybrid') => void;
  onTranscriptToggle: (value: boolean) => void;
}

const ModeSection: React.FC<ModeSectionProps> = ({
  mode,
  showTranscript,
  onModeChange,
  onTranscriptToggle,
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-900">Mode</h2>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
      </svg>
    </div>
    <p className="text-sm mb-4 text-gray-600">
      Configure what mode will the widget support
    </p>

    <div className="grid grid-cols-2 gap-4">
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          mode === 'chat'
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onModeChange('chat')}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              mode === 'chat' ? 'bg-teal-500' : 'bg-gray-200'
            }`}
          >
            <ChatCircleIcon
              size={20}
              weight="fill"
              className={mode === 'chat' ? 'text-white' : 'text-gray-500'}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Chat</h3>
            <p className="text-sm text-gray-600">
              Users will text with the widget
            </p>
          </div>
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          mode === 'voice'
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onModeChange('voice')}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              mode === 'voice' ? 'bg-teal-500' : 'bg-gray-200'
            }`}
          >
            <MicrophoneIcon
              size={20}
              weight="fill"
              className={mode === 'voice' ? 'text-white' : 'text-gray-500'}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Voice</h3>
            <p className="text-sm text-gray-600">
              Users will speak with the widget
            </p>
          </div>
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          mode === 'hybrid'
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onModeChange('hybrid')}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              mode === 'hybrid' ? 'bg-teal-500' : 'bg-gray-200'
            }`}
          >
            <WaveformIcon
              size={20}
              weight="fill"
              className={mode === 'hybrid' ? 'text-white' : 'text-gray-500'}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Hybrid</h3>
            <p className="text-sm text-gray-600">
              Users can switch between voice and chat
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Show Transcript Toggle */}
    {(mode === 'voice' || mode === 'hybrid') && (
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Show Transcript
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Display conversation transcript during voice calls
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTranscript}
              onChange={(e) => onTranscriptToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
      </div>
    )}
  </div>
);

export default ModeSection;
