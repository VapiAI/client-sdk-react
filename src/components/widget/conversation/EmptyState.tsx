import React from 'react';
import { MicrophoneIcon, ChatCircleIcon } from '@phosphor-icons/react';
import { EmptyConversationProps } from '../../types';

const EmptyConversation: React.FC<EmptyConversationProps> = ({
  mode,
  isCallActive,
  theme,
  voiceEmptyMessage,
  voiceActiveEmptyMessage,
  chatEmptyMessage,
  hybridEmptyMessage,
}) => (
  <div className="vapi-text-center">
    <div
      className={`vapi-w-16 vapi-h-16 vapi-rounded-full vapi-flex vapi-items-center vapi-justify-center vapi-mx-auto vapi-mb-4 ${
        theme === 'dark' ? 'vapi-bg-gray-700' : 'vapi-bg-gray-100'
      }`}
    >
      {mode === 'voice' ? (
        <MicrophoneIcon
          size={32}
          className={theme === 'dark' ? 'vapi-text-gray-400' : 'vapi-text-gray-400'}
        />
      ) : (
        <ChatCircleIcon
          size={32}
          className={theme === 'dark' ? 'vapi-text-gray-400' : 'vapi-text-gray-400'}
        />
      )}
    </div>
    <p
      className={`vapi-text-sm ${theme === 'dark' ? 'vapi-text-gray-400' : 'vapi-text-gray-500'}`}
    >
      {mode === 'voice'
        ? isCallActive
          ? voiceActiveEmptyMessage
          : voiceEmptyMessage
        : mode === 'chat'
          ? chatEmptyMessage
          : hybridEmptyMessage}
    </p>
  </div>
);

export default EmptyConversation;
