import { useState, useCallback } from 'react';
import type { UseVapiCallOptions } from './useVapiCall';
import { useVapiCall } from './useVapiCall';
import type { UseVapiChatOptions, ChatMessage } from './useVapiChat';
import { useVapiChat } from './useVapiChat';
import type { AssistantOverrides } from '../utils/vapiChatClient';

export type VapiMode = 'voice' | 'chat' | 'hybrid';

export interface UseVapiWidgetOptions {
  mode: VapiMode;
  publicKey: string;
  assistantId?: string;
  assistant?: any;
  assistantOverrides?: AssistantOverrides;
  apiUrl?: string;
  firstChatMessage?: string;
  voiceAutoReconnect?: boolean;
  reconnectStorageKey?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
}

export const useVapiWidget = ({
  mode,
  publicKey,
  assistantId,
  assistant,
  assistantOverrides,
  apiUrl,
  firstChatMessage,
  voiceAutoReconnect = false,
  reconnectStorageKey,
  onCallStart,
  onCallEnd,
  onMessage,
  onError,
}: UseVapiWidgetOptions) => {
  const [activeMode, setActiveMode] = useState<'voice' | 'chat' | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const [voiceConversation, setVoiceConversation] = useState<ChatMessage[]>([]);

  const buildCallOptions = (): any => {
    // Priority: assistant object > assistantId with overrides > assistantId alone
    if (assistant) {
      return assistant;
    }
    if (assistantId) {
      if (assistantOverrides) {
        return {
          assistantId,
          assistantOverrides,
        };
      }
      return assistantId;
    }
    return undefined;
  };

  // Voice call hook - only enabled in voice or hybrid mode
  const voiceEnabled = mode === 'voice' || mode === 'hybrid';
  const voice = useVapiCall({
    publicKey,
    callOptions: buildCallOptions(),
    apiUrl,
    enabled: voiceEnabled,
    roomDeleteOnUserLeaveEnabled: voiceAutoReconnect,
    reconnectStorageKey,
    onCallStart: () => {
      // In hybrid mode, clear all conversations when starting voice
      if (mode === 'hybrid') {
        chat.clearMessages();
        setVoiceConversation([]);
      }
      setActiveMode('voice');
      setIsUserTyping(false);
      onCallStart?.();
    },
    onCallEnd: () => {
      setActiveMode(null);
      onCallEnd?.();
    },
    onMessage,
    onError,
    onTranscript: (transcript) => {
      const message: ChatMessage = {
        role: transcript.role as 'user' | 'assistant',
        content: transcript.text,
        timestamp: transcript.timestamp,
      };
      setVoiceConversation((prev) => [...prev, message]);
    },
  } as UseVapiCallOptions);

  // Chat only supports assistantId and assistantOverrides
  const chatEnabled = mode === 'chat' || mode === 'hybrid';
  const chat = useVapiChat({
    enabled: chatEnabled,
    publicKey: chatEnabled ? publicKey : undefined,
    assistantId: chatEnabled ? assistantId : undefined,
    assistantOverrides: chatEnabled ? assistantOverrides : undefined,
    apiUrl,
    onMessage, // Keep the callback for external notifications
    onError,
    firstChatMessage,
  } as UseVapiChatOptions);

  // Combine voice and chat conversations
  const conversation =
    mode === 'voice'
      ? voiceConversation
      : mode === 'chat'
        ? chat.messages
        : [...voiceConversation, ...chat.messages].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          );

  // Handle chat input state for hybrid mode
  const handleChatInput = useCallback((value: string) => {
    setIsUserTyping(value.length > 0);
    // Don't force mode switch just by typing
  }, []);

  const sendMessage = useCallback(
    async (text: string, sessionEnd: boolean = false) => {
      // In hybrid mode, switch to chat and clear all conversations only if switching from voice
      if (mode === 'hybrid') {
        if (voice.isCallActive) {
          await voice.endCall({ force: true });
        }
        // Only clear conversations if we're switching from voice mode
        if (activeMode !== 'chat') {
          setVoiceConversation([]);
          chat.clearMessages();
        }
        setActiveMode('chat');
      }
      await chat.sendMessage(text, sessionEnd);
    },
    [mode, chat, voice, activeMode]
  );

  const toggleCall = useCallback(
    async ({ force }: { force?: boolean } = {}) => {
      if (mode === 'hybrid' && !voice.isCallActive) {
        // Clear all conversations when switching to voice
        chat.clearMessages();
        setVoiceConversation([]);
        setActiveMode('voice');
        setIsUserTyping(false);
      }
      await voice.toggleCall({ force });
    },
    [mode, voice, chat]
  );

  const clearConversation = useCallback(() => {
    setVoiceConversation([]);
    chat.clearMessages();
    setActiveMode(null);
    setIsUserTyping(false);
  }, [chat]);

  const isVoiceAvailable =
    voiceEnabled && !voice.isCallActive && !chat.isLoading;
  const isChatAvailable = chatEnabled && !chat.isLoading;

  return {
    // Current mode and state
    mode,
    activeMode,
    conversation,

    // Voice state and handlers
    voice: {
      ...voice,
      isAvailable: isVoiceAvailable,
      toggleCall,
    },

    // Chat state and handlers
    chat: {
      ...chat,
      isAvailable: isChatAvailable,
      sendMessage,
      handleInput: handleChatInput,
    },

    // Combined handlers
    clearConversation,
    isUserTyping,
  };
};
