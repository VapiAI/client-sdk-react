import React from 'react'
import { MicrophoneIcon, ChatCircleIcon } from '@phosphor-icons/react'
import { EmptyConversationProps } from '../../types'

const EmptyConversation: React.FC<EmptyConversationProps> = ({ 
  mode, 
  isCallActive, 
  theme,
  emptyVoiceMessage,
  emptyVoiceActiveMessage,
  emptyChatMessage,
  emptyHybridMessage
}) => (
  <div className="text-center">
    <div 
      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      {mode === 'voice' ? (
        <MicrophoneIcon size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
      ) : (
        <ChatCircleIcon size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
      )}
    </div>
    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
      {mode === 'voice' 
        ? (isCallActive ? emptyVoiceActiveMessage : emptyVoiceMessage)
        : mode === 'chat'
        ? emptyChatMessage
        : emptyHybridMessage
      }
    </p>
  </div>
)

export default EmptyConversation 