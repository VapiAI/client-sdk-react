import { useState, useEffect, useRef, useCallback } from 'react'
import Vapi from '@vapi-ai/web'

export interface VapiCallState {
  isCallActive: boolean
  isSpeaking: boolean
  volumeLevel: number
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
}

export interface VapiCallHandlers {
  startCall: () => Promise<void>
  endCall: () => Promise<void>
  toggleCall: () => Promise<void>
}

export interface UseVapiCallOptions {
  publicKey: string
  vapiConfig: any
  enabled?: boolean
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: Error) => void
  onTranscript?: (transcript: { role: string; text: string; timestamp: Date }) => void
}

export const useVapiCall = ({
  publicKey,
  vapiConfig,
  enabled = true,
  onCallStart,
  onCallEnd,
  onMessage,
  onError,
  onTranscript
}: UseVapiCallOptions): VapiCallState & VapiCallHandlers => {
  // Create Vapi instance once, just like the working example
  const [vapi] = useState(() => publicKey ? new Vapi(publicKey) : null)
  
  const [isCallActive, setIsCallActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  
  // Store latest callbacks in a ref to avoid stale closures
  const callbacksRef = useRef({ onCallStart, onCallEnd, onMessage, onError, onTranscript })
  useEffect(() => {
    callbacksRef.current = { onCallStart, onCallEnd, onMessage, onError, onTranscript }
  })
  
  // Set up event listeners with proper cleanup
  useEffect(() => {
    if (!vapi) return

    console.log('Setting up Vapi event listeners')

    // Define event handlers so we can remove them later
    const handleCallStart = () => {
      console.log('Call started')
      setIsCallActive(true)
      setConnectionStatus('connected')
      callbacksRef.current.onCallStart?.()
    }

    const handleCallEnd = () => {
      console.log('Call ended')
      setIsCallActive(false)
      setConnectionStatus('disconnected')
      setVolumeLevel(0)
      setIsSpeaking(false)
      callbacksRef.current.onCallEnd?.()
    }

    const handleSpeechStart = () => {
      console.log('Assistant started speaking')
      setIsSpeaking(true)
    }

    const handleSpeechEnd = () => {
      console.log('Assistant stopped speaking')
      setIsSpeaking(false)
    }

    const handleVolumeLevel = (volume: number) => {
      setVolumeLevel(volume)
    }

    const handleMessage = (message: any) => {
      console.log('Received message:', message)
      
      // Handle transcripts - matching the working example
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        if (message.role === 'user' || message.role === 'assistant') {
          callbacksRef.current.onTranscript?.({
            role: message.role,
            text: message.transcript,
            timestamp: new Date()
          })
        }
      }
      
      // Pass through all messages
      callbacksRef.current.onMessage?.(message)
    }

    const handleError = (error: Error) => {
      console.error('Vapi error:', error)
      setConnectionStatus('disconnected')
      setIsCallActive(false)
      setIsSpeaking(false)
      callbacksRef.current.onError?.(error)
    }

    // Add event listeners
    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('speech-start', handleSpeechStart)
    vapi.on('speech-end', handleSpeechEnd)
    vapi.on('volume-level', handleVolumeLevel)
    vapi.on('message', handleMessage)
    vapi.on('error', handleError)

    // Cleanup - remove all listeners
    return () => {
      console.log('Cleaning up Vapi event listeners')
      vapi.removeListener('call-start', handleCallStart)
      vapi.removeListener('call-end', handleCallEnd)
      vapi.removeListener('speech-start', handleSpeechStart)
      vapi.removeListener('speech-end', handleSpeechEnd)
      vapi.removeListener('volume-level', handleVolumeLevel)
      vapi.removeListener('message', handleMessage)
      vapi.removeListener('error', handleError)
    }
  }, [vapi]) // Only depend on vapi instance

  // Cleanup Vapi instance on unmount
  useEffect(() => {
    return () => {
      if (vapi) {
        console.log('Stopping Vapi instance on unmount')
        vapi.stop()
      }
    }
  }, [vapi])

  const startCall = useCallback(async () => {
    if (!vapi || !enabled) {
      console.error('Cannot start call: no vapi instance or not enabled')
      return
    }

    try {
      console.log('Starting call with config:', vapiConfig)
      setConnectionStatus('connecting')
      await vapi.start(vapiConfig)
    } catch (error) {
      console.error('Error starting call:', error)
      setConnectionStatus('disconnected')
      callbacksRef.current.onError?.(error as Error)
    }
  }, [vapi, vapiConfig, enabled])

  const endCall = useCallback(async () => {
    if (!vapi) {
      console.log('Cannot end call: no vapi instance')
      return
    }

    console.log('Ending call')
    vapi.stop()
  }, [vapi])

  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      await endCall()
    } else {
      await startCall()
    }
  }, [isCallActive, startCall, endCall])

  return {
    // State
    isCallActive,
    isSpeaking,
    volumeLevel,
    connectionStatus,
    // Handlers
    startCall,
    endCall,
    toggleCall
  }
} 