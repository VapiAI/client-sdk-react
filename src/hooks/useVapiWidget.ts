import { useState, useCallback } from 'react';
import { useVapiCall, UseVapiCallOptions } from './useVapiCall';
import { useVapiChat, UseVapiChatOptions, ChatMessage } from './useVapiChat';

export type VapiMode = 'voice' | 'chat' | 'hybrid';

export interface UseVapiWidgetOptions {
  mode: VapiMode;
  publicKey: string;
  vapiConfig: any;
  apiUrl?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
}

export const useVapiWidget = ({
  mode,
  publicKey,
  vapiConfig,
  apiUrl,
  onCallStart,
  onCallEnd,
  onMessage,
  onError,
}: UseVapiWidgetOptions) => {
  const [activeMode, setActiveMode] = useState<'voice' | 'chat' | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const [voiceConversation, setVoiceConversation] = useState<ChatMessage[]>([]);

  const getAssistantId = (): string | undefined => {
    if (typeof vapiConfig === 'string') {
      return vapiConfig;
    }
    if (vapiConfig?.assistantId) {
      return vapiConfig.assistantId;
    }
    // If using inline assistant config, we might not have an ID
    return undefined;
  };

  const assistantId = getAssistantId();

  // Voice call hook - only enabled in voice or hybrid mode
  const voiceEnabled = mode === 'voice' || mode === 'hybrid';
  const voice = useVapiCall({
    publicKey,
    vapiConfig,
    enabled: voiceEnabled,
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

  // Chat hook - only enabled in chat or hybrid mode
  const chatEnabled = mode === 'chat' || mode === 'hybrid';
  const chat = useVapiChat({
    enabled: chatEnabled,
    publicKey: chatEnabled ? publicKey : undefined,
    assistantId: chatEnabled ? assistantId : undefined,
    apiUrl,
    onMessage, // Keep the callback for external notifications
    onError,
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

  // Send message handler that manages mode switching
  const sendMessage = useCallback(
    async (text: string) => {
      // In hybrid mode, switch to chat and clear all conversations only if switching from voice
      if (mode === 'hybrid') {
        if (voice.isCallActive) {
          await voice.endCall();
        }
        // Only clear conversations if we're switching from voice mode
        if (activeMode !== 'chat') {
          setVoiceConversation([]);
          chat.clearMessages();
        }
        setActiveMode('chat');
      }
      await chat.sendMessage(text);
    },
    [mode, chat, voice, activeMode]
  );

  // Toggle call handler that manages mode switching
  const toggleCall = useCallback(async () => {
    if (mode === 'hybrid' && !voice.isCallActive) {
      // Clear all conversations when switching to voice
      chat.clearMessages();
      setVoiceConversation([]);
      setActiveMode('voice');
      setIsUserTyping(false);
    }
    await voice.toggleCall();
  }, [mode, voice, chat]);

  // Clear conversation
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
