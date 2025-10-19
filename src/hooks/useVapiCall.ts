import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface StoredCallData {
  webCallUrl: string;
  id?: string;
  artifactPlan?: {
    videoRecordingEnabled?: boolean;
  };
  assistant?: {
    voice?: {
      provider?: string;
    };
  };
  timestamp: number;
}

export interface VapiCallState {
  isCallActive: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isMuted: boolean;
}

export interface VapiCallHandlers {
  startCall: () => Promise<void>;
  endCall: (opts?: { force?: boolean }) => Promise<void>;
  toggleCall: (opts?: { force?: boolean }) => Promise<void>;
  toggleMute: () => void;
  reconnect: () => Promise<void>;
  clearStoredCall: () => void;
}

export interface UseVapiCallOptions {
  publicKey: string;
  callOptions: any;
  apiUrl?: string;
  enabled?: boolean;
  roomDeleteOnUserLeaveEnabled?: boolean;
  reconnectStorageKey?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
  onTranscript?: (transcript: {
    role: string;
    text: string;
    timestamp: Date;
  }) => void;
}

export const useVapiCall = ({
  publicKey,
  callOptions,
  apiUrl,
  enabled = true,
  roomDeleteOnUserLeaveEnabled = false,
  reconnectStorageKey = 'vapi_widget_web_call',
  onCallStart,
  onCallEnd,
  onMessage,
  onError,
  onTranscript,
}: UseVapiCallOptions): VapiCallState & VapiCallHandlers => {
  const [vapi] = useState(() =>
    publicKey ? new Vapi(publicKey, apiUrl) : null
  );

  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');

  const callbacksRef = useRef({
    onCallStart,
    onCallEnd,
    onMessage,
    onError,
    onTranscript,
  });

  // localStorage utilities
  const storeCallData = useCallback(
    (call: any) => {
      if (!roomDeleteOnUserLeaveEnabled) {
        // Extract webCallUrl from the call object
        // The webCallUrl can be in call.webCallUrl or call.transport.callUrl
        const webCallUrl =
          (call as any).webCallUrl || (call.transport as any)?.callUrl;

        if (webCallUrl) {
          const webCallToStore = {
            webCallUrl,
            id: call.id,
            artifactPlan: call.artifactPlan,
            assistant: call.assistant,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            reconnectStorageKey,
            JSON.stringify(webCallToStore)
          );
          console.log('Stored call data for reconnection:', webCallToStore);
        } else {
          console.warn(
            'No webCallUrl found in call object, cannot store for reconnection'
          );
        }
      }
    },
    [roomDeleteOnUserLeaveEnabled, reconnectStorageKey]
  );

  const getStoredCallData = useCallback((): StoredCallData | null => {
    try {
      const stored = localStorage.getItem(reconnectStorageKey);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(reconnectStorageKey);
      return null;
    }
  }, [reconnectStorageKey]);

  const clearStoredCall = useCallback(() => {
    localStorage.removeItem(reconnectStorageKey);
  }, [reconnectStorageKey]);

  useEffect(() => {
    callbacksRef.current = {
      onCallStart,
      onCallEnd,
      onMessage,
      onError,
      onTranscript,
    };
  });

  useEffect(() => {
    if (!vapi) {
      return;
    }

    const handleCallStart = () => {
      setIsCallActive(true);
      setConnectionStatus('connected');
      callbacksRef.current.onCallStart?.();
    };

    const handleCallEnd = () => {
      setIsCallActive(false);
      setConnectionStatus('disconnected');
      setVolumeLevel(0);
      setIsSpeaking(false);
      setIsMuted(false);
      // Clear stored call data on successful call end
      clearStoredCall();
      callbacksRef.current.onCallEnd?.();
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleVolumeLevel = (volume: number) => {
      setVolumeLevel(volume);
    };

    const handleMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        if (message.role === 'user' || message.role === 'assistant') {
          callbacksRef.current.onTranscript?.({
            role: message.role,
            text: message.transcript,
            timestamp: new Date(),
          });
        }
      }

      callbacksRef.current.onMessage?.(message);
    };

    const handleError = (error: Error) => {
      console.error('Vapi error:', error);
      setConnectionStatus('disconnected');
      setIsCallActive(false);
      setIsSpeaking(false);
      callbacksRef.current.onError?.(error);
    };

    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    return () => {
      vapi.removeListener('call-start', handleCallStart);
      vapi.removeListener('call-end', handleCallEnd);
      vapi.removeListener('speech-start', handleSpeechStart);
      vapi.removeListener('speech-end', handleSpeechEnd);
      vapi.removeListener('volume-level', handleVolumeLevel);
      vapi.removeListener('message', handleMessage);
      vapi.removeListener('error', handleError);
    };
  }, [vapi, clearStoredCall]);

  useEffect(() => {
    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [vapi]);

  const startCall = useCallback(async () => {
    if (!vapi || !enabled) {
      console.error('Cannot start call: no vapi instance or not enabled');
      return;
    }

    try {
      console.log('Starting call with configuration:', callOptions);
      console.log('Starting call with options:', {
        roomDeleteOnUserLeaveEnabled,
      });
      setConnectionStatus('connecting');
      const call = await vapi.start(
        // assistant
        callOptions,
        // assistant overrides,
        undefined,
        // squad
        undefined,
        // workflow
        undefined,
        // workflow overrides
        undefined,
        // options
        {
          roomDeleteOnUserLeaveEnabled,
        }
      );

      // Store call data for reconnection if call was successful and auto-reconnect is enabled
      if (call && !roomDeleteOnUserLeaveEnabled) {
        storeCallData(call);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setConnectionStatus('disconnected');
      callbacksRef.current.onError?.(error as Error);
    }
  }, [vapi, callOptions, enabled, roomDeleteOnUserLeaveEnabled, storeCallData]);

  const endCall = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!vapi) {
        console.log('Cannot end call: no vapi instance');
        return;
      }

      console.log('Ending call with force:', force);
      if (force) {
        // end vapi call and delete daily room
        vapi.end();
      } else {
        // simply disconnect from daily room
        vapi.stop();
      }
    },
    [vapi]
  );

  const toggleCall = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (isCallActive) {
        await endCall({ force });
      } else {
        await startCall();
      }
    },
    [isCallActive, startCall, endCall]
  );

  const toggleMute = useCallback(() => {
    if (!vapi || !isCallActive) {
      console.log('Cannot toggle mute: no vapi instance or call not active');
      return;
    }

    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [vapi, isCallActive, isMuted]);

  const reconnect = useCallback(async () => {
    if (!vapi || !enabled) {
      console.error('Cannot reconnect: no vapi instance or not enabled');
      return;
    }

    const storedData = getStoredCallData();
    if (!storedData) {
      console.warn('No stored call data found for reconnection');
      return;
    }

    setConnectionStatus('connecting');
    try {
      await vapi.reconnect({
        webCallUrl: storedData.webCallUrl,
        id: storedData.id,
        artifactPlan: storedData.artifactPlan,
        assistant: storedData.assistant,
      });
      console.log('Successfully reconnected to call');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Reconnection failed:', error);
      clearStoredCall();
      callbacksRef.current.onError?.(error as Error);
    }
  }, [vapi, enabled, getStoredCallData, clearStoredCall]);

  // Check for stored call data on initialization and attempt reconnection
  useEffect(() => {
    if (!vapi || !enabled || roomDeleteOnUserLeaveEnabled) {
      return;
    }

    const storedData = getStoredCallData();
    if (storedData) {
      reconnect();
    }
  }, [
    vapi,
    enabled,
    roomDeleteOnUserLeaveEnabled,
    getStoredCallData,
    reconnect,
  ]);

  return {
    // State
    isCallActive,
    isSpeaking,
    volumeLevel,
    connectionStatus,
    isMuted,
    // Handlers
    startCall,
    endCall,
    toggleCall,
    toggleMute,
    reconnect,
    clearStoredCall,
  };
};
