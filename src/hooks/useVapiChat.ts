import { useState, useCallback, useRef, useEffect } from 'react';
import type { AssistantOverrides } from '../utils/vapiChatClient';
import {
  VapiChatClient,
  extractContentFromPath,
} from '../utils/vapiChatClient';

export interface ChatMessage {
  id?: string;
  sessionId?: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
}

export interface VapiChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  sessionId?: string;
}

export interface VapiChatHandlers {
  sendMessage: (text: string, sessionEnd?: boolean) => Promise<void>;
  clearMessages: () => void;
}

export interface UseVapiChatOptions {
  enabled?: boolean;
  publicKey?: string;
  assistantId?: string;
  assistantOverrides?: AssistantOverrides;
  apiUrl?: string;
  sessionId?: string;
  firstChatMessage?: string;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export const validateChatInput = (
  text: string,
  enabled: boolean,
  publicKey?: string,
  assistantId?: string,
  client?: VapiChatClient | null
): void => {
  if (!enabled || !text.trim()) {
    throw new Error('Chat is disabled or message is empty');
  }

  if (!publicKey || !assistantId) {
    throw new Error(
      'Missing required configuration: publicKey and assistantId'
    );
  }

  if (!client) {
    throw new Error('Chat client not initialized');
  }
};

export const createUserMessage = (text: string): ChatMessage => ({
  role: 'user',
  content: text.trim(),
  timestamp: new Date(),
});

export const createAssistantMessage = (content: string): ChatMessage => ({
  role: 'assistant',
  content,
  timestamp: new Date(),
});

export const resetAssistantMessageTracking = (
  currentAssistantMessageRef: React.MutableRefObject<string>,
  assistantMessageIndexRef: React.MutableRefObject<number | null>
): void => {
  currentAssistantMessageRef.current = '';
  assistantMessageIndexRef.current = null;
};

export const preallocateAssistantMessage = (
  assistantMessageIndexRef: React.MutableRefObject<number | null>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): void => {
  // Pre-allocate the assistant message slot
  setMessages((prev) => {
    const newMessages = [...prev];
    assistantMessageIndexRef.current = newMessages.length; // Set index BEFORE adding
    newMessages.push({
      role: 'assistant',
      content: '', // Start with empty content
      timestamp: new Date(),
    });
    return newMessages;
  });
};

export const handleStreamError = (
  error: Error,
  setIsTyping: (typing: boolean) => void,
  assistantMessageIndexRef: React.MutableRefObject<number | null>,
  onError?: (error: Error) => void
): void => {
  console.error('Stream error:', error);
  setIsTyping(false);
  assistantMessageIndexRef.current = null;
  onError?.(error);
};

export const handleStreamChunk = (
  chunk: any,
  sessionId: string | undefined,
  setSessionId: (id: string | undefined) => void,
  currentAssistantMessageRef: React.MutableRefObject<string>,
  assistantMessageIndexRef: React.MutableRefObject<number | null>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): void => {
  // Update sessionId if provided in response
  if (chunk.sessionId && chunk.sessionId !== sessionId) {
    setSessionId(chunk.sessionId);
  }

  const content = extractContentFromPath(chunk);
  if (content) {
    currentAssistantMessageRef.current += content;

    // Since we pre-allocated, we know the index is always valid
    if (assistantMessageIndexRef.current !== null) {
      const targetIndex = assistantMessageIndexRef.current!;
      setMessages((prev) => {
        const newMessages = [...prev];

        if (targetIndex < newMessages.length) {
          newMessages[targetIndex] = {
            ...newMessages[targetIndex],
            content: currentAssistantMessageRef.current,
          };
        }

        return newMessages;
      });
    }
  }
};

export const handleStreamComplete = (
  setIsTyping: (typing: boolean) => void,
  assistantMessageIndexRef: React.MutableRefObject<number | null>,
  currentAssistantMessageRef: React.MutableRefObject<string>,
  onMessage?: (message: ChatMessage) => void
): void => {
  setIsTyping(false);
  assistantMessageIndexRef.current = null;

  if (currentAssistantMessageRef.current) {
    const finalMessage = createAssistantMessage(
      currentAssistantMessageRef.current
    );
    onMessage?.(finalMessage);
  }
};

export const useVapiChat = ({
  enabled = true,
  publicKey,
  assistantId,
  assistantOverrides,
  apiUrl,
  sessionId: initialSessionId,
  firstChatMessage,
  onMessage,
  onError,
}: UseVapiChatOptions): VapiChatState &
  VapiChatHandlers & { isEnabled: boolean } => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (enabled && firstChatMessage) {
      return [
        {
          role: 'assistant',
          content: firstChatMessage,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(
    initialSessionId
  );

  const clientRef = useRef<VapiChatClient | null>(null);
  const abortFnRef = useRef<(() => void) | null>(null);
  const currentAssistantMessageRef = useRef<string>(''); // Accumulates assistant message content
  const assistantMessageIndexRef = useRef<number | null>(null); // Tracks array position
  const isEndingSessionRef = useRef<boolean>(false);

  useEffect(() => {
    if (publicKey && enabled) {
      clientRef.current = new VapiChatClient({ publicKey, apiUrl });
    }

    return () => {
      // Cleanup: abort any ongoing stream
      abortFnRef.current?.();
    };
  }, [publicKey, apiUrl, enabled]);

  // Update sessionId if initialSessionId changes
  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
    }
  }, [initialSessionId]);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      onMessage?.(message);
    },
    [onMessage]
  );

  const sendMessage = useCallback(
    async (text: string, sessionEnd: boolean = false) => {
      try {
        if (sessionEnd) {
          if (isEndingSessionRef.current) {
            return; // IMP: Prevent duplicate end-session sends
          }
          isEndingSessionRef.current = true;
        }

        validateChatInput(
          text,
          enabled,
          publicKey,
          assistantId,
          clientRef.current
        );

        setIsLoading(true);

        if (!sessionEnd && text.trim()) {
          const userMessage = createUserMessage(text);
          addMessage(userMessage);
        }

        if (!sessionEnd) {
          resetAssistantMessageTracking(
            currentAssistantMessageRef,
            assistantMessageIndexRef
          );
          preallocateAssistantMessage(assistantMessageIndexRef, setMessages);
          setIsTyping(true);
        } else {
          const endingText = text.trim() || 'Ending chat...';
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: endingText,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(true);
        }

        const onStreamError = (error: Error) =>
          handleStreamError(
            error,
            setIsTyping,
            assistantMessageIndexRef,
            onError
          );

        const onChunk = (chunk: any) =>
          handleStreamChunk(
            chunk,
            sessionId,
            setSessionId,
            currentAssistantMessageRef,
            assistantMessageIndexRef,
            setMessages
          );

        const onComplete = sessionEnd
          ? () => {
              setIsTyping(false);
              assistantMessageIndexRef.current = null;
            }
          : () =>
              handleStreamComplete(
                setIsTyping,
                assistantMessageIndexRef,
                currentAssistantMessageRef,
                onMessage
              );

        let input: string | Array<{ role: string; content: string }>;
        if (sessionEnd) {
          input = text.trim();
        } else {
          if (
            firstChatMessage &&
            firstChatMessage.trim() !== '' &&
            messages.length === 1 &&
            messages[0].role === 'assistant'
          ) {
            input = [
              {
                role: 'assistant',
                content: firstChatMessage,
              },
              {
                role: 'user',
                content: text.trim(),
              },
            ];
          } else {
            input = text.trim();
          }
        }

        const abort = await clientRef.current!.streamChat(
          {
            input,
            assistantId: assistantId!,
            assistantOverrides,
            sessionId,
            stream: true,
            sessionEnd,
          },
          onChunk,
          onStreamError,
          onComplete
        );

        abortFnRef.current = abort;
      } catch (error) {
        console.error('Error sending message:', error);
        setIsTyping(false);
        assistantMessageIndexRef.current = null;
        onError?.(error as Error);
        throw error;
      } finally {
        setIsLoading(false);
        if (sessionEnd) {
          isEndingSessionRef.current = false;
        }
      }
    },
    [
      enabled,
      publicKey,
      assistantId,
      assistantOverrides,
      sessionId,
      addMessage,
      onError,
      onMessage,
      firstChatMessage,
      messages,
    ]
  );

  const clearMessages = useCallback(() => {
    // Reset to firstChatMessage if provided, otherwise empty array
    if (enabled && firstChatMessage) {
      setMessages([
        {
          role: 'assistant',
          content: firstChatMessage,
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }

    // Abort any ongoing stream
    abortFnRef.current?.();
    setIsTyping(false);
    setIsLoading(false);

    // Reset assistant message tracking
    resetAssistantMessageTracking(
      currentAssistantMessageRef,
      assistantMessageIndexRef
    );

    // Clear sessionId when clearing messages to start fresh
    setSessionId(undefined);
  }, [enabled, firstChatMessage]);

  return {
    // State
    messages,
    isTyping,
    isLoading,
    sessionId,
    isEnabled: enabled,

    // Handlers
    sendMessage,
    clearMessages,
  };
};
