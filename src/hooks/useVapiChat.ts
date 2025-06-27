import { useState, useCallback, useRef, useEffect } from 'react'
import { VapiChatClient, extractContentFromPath } from '../utils/vapiChatClient'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface VapiChatState {
  messages: ChatMessage[]
  isTyping: boolean
  isLoading: boolean
  sessionId?: string
}

export interface VapiChatHandlers {
  sendMessage: (text: string) => Promise<void>
  clearMessages: () => void
}

export interface UseVapiChatOptions {
  enabled?: boolean
  publicKey?: string
  assistantId?: string
  apiUrl?: string
  sessionId?: string
  onMessage?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

export const useVapiChat = ({
  enabled = true,
  publicKey,
  assistantId,
  apiUrl,
  sessionId: initialSessionId,
  onMessage,
  onError
}: UseVapiChatOptions): VapiChatState & VapiChatHandlers & { isEnabled: boolean } => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)
  
  const clientRef = useRef<VapiChatClient | null>(null)
  const abortFnRef = useRef<(() => void) | null>(null)
  const currentAssistantMessageRef = useRef<string>('')
  const assistantMessageIndexRef = useRef<number | null>(null)  // Track current assistant message index

  useEffect(() => {
    if (publicKey && enabled) {
      clientRef.current = new VapiChatClient({ publicKey, apiUrl })
    }
    
    return () => {
      // Cleanup: abort any ongoing stream
      abortFnRef.current?.()
    }
  }, [publicKey, apiUrl, enabled])

  // Update sessionId if initialSessionId changes
  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId)
    }
  }, [initialSessionId])

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message])
    onMessage?.(message)
  }, [onMessage])

  const sendMessage = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) return
    
    // Check if we have required configuration
    if (!publicKey || !assistantId) {
      const error = new Error('Missing required configuration: publicKey and assistantId')
      onError?.(error)
      throw error
    }
    
    if (!clientRef.current) {
      const error = new Error('Chat client not initialized')
      onError?.(error)
      throw error
    }

    try {
      setIsLoading(true)
      
      const userMessage: ChatMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date()
      }
      addMessage(userMessage)

      // Reset current assistant message and index
      currentAssistantMessageRef.current = ''
      assistantMessageIndexRef.current = null
      setIsTyping(true)
      
      const abort = await clientRef.current.streamChat(
        {
          input: text.trim(),
          assistantId,
          sessionId,  // Use current sessionId if available
          stream: true
        },
        (chunk) => {
          // Update sessionId if provided in response
          if (chunk.sessionId && chunk.sessionId !== sessionId) {
            setSessionId(chunk.sessionId)
          }
          
          const content = extractContentFromPath(chunk)
          if (content) {
            currentAssistantMessageRef.current += content
            
            setMessages(prev => {
              const newMessages = [...prev]
              
              // Check if we already have an assistant message index for this stream
              if (assistantMessageIndexRef.current !== null && assistantMessageIndexRef.current < newMessages.length) {
                const existingMessage = newMessages[assistantMessageIndexRef.current]
                if (existingMessage && existingMessage.role === 'assistant') {
                  newMessages[assistantMessageIndexRef.current] = {
                    ...existingMessage,
                    content: currentAssistantMessageRef.current
                  }
                }
              } else {
                assistantMessageIndexRef.current = newMessages.length
                newMessages.push({
                  role: 'assistant',
                  content: currentAssistantMessageRef.current,
                  timestamp: new Date()
                })
              }
              
              return newMessages
            })
          }
        },

        (error) => {
          console.error('Stream error:', error)
          setIsTyping(false)
          assistantMessageIndexRef.current = null
          onError?.(error)
        },

        // On complete callback
        () => {
          setIsTyping(false)
          assistantMessageIndexRef.current = null
          
          if (currentAssistantMessageRef.current) {
            const finalMessage: ChatMessage = {
              role: 'assistant',
              content: currentAssistantMessageRef.current,
              timestamp: new Date()
            }
            onMessage?.(finalMessage)
          }
        }
      )
      
      abortFnRef.current = abort
      
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      assistantMessageIndexRef.current = null
      onError?.(error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [enabled, publicKey, assistantId, sessionId, addMessage, onError, onMessage])

  const clearMessages = useCallback(() => {
    setMessages([])

    // Abort any ongoing stream
    abortFnRef.current?.()
    setIsTyping(false)
    setIsLoading(false)

    // Reset assistant message tracking
    currentAssistantMessageRef.current = ''
    assistantMessageIndexRef.current = null
    // Clear sessionId when clearing messages to start fresh
    setSessionId(undefined)
  }, [])

  return {
    // State
    messages,
    isTyping,
    isLoading,
    sessionId,
    isEnabled: enabled,

    // Handlers
    sendMessage,
    clearMessages
  }
} 