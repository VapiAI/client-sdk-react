import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import * as vapiCallStorage from '../utils/vapiCallStorage';
import type { StorageType } from '../utils/vapiCallStorage';

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
  voiceAutoReconnect?: boolean;
  voiceReconnectStorage?: StorageType;
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
  voiceAutoReconnect = false,
  voiceReconnectStorage = 'session',
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
      vapiCallStorage.clearStoredCall(
        reconnectStorageKey,
        voiceReconnectStorage
      );
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
  }, [vapi, reconnectStorageKey, voiceReconnectStorage]);

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
        voiceAutoReconnect,
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
          roomDeleteOnUserLeaveEnabled: !voiceAutoReconnect,
        }
      );

      // Store call data for reconnection if call was successful and auto-reconnect is enabled
      if (call && voiceAutoReconnect) {
        vapiCallStorage.storeCallData(
          reconnectStorageKey,
          call,
          callOptions,
          voiceReconnectStorage
        );
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setConnectionStatus('disconnected');
      callbacksRef.current.onError?.(error as Error);
    }
  }, [
    vapi,
    callOptions,
    enabled,
    voiceAutoReconnect,
    voiceReconnectStorage,
    reconnectStorageKey,
  ]);

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

    const storedData = vapiCallStorage.getStoredCallData(
      reconnectStorageKey,
      voiceReconnectStorage
    );

    if (!storedData) {
      console.warn('No stored call data found for reconnection');
      return;
    }

    // Check if callOptions match before reconnecting
    if (
      !vapiCallStorage.areCallOptionsEqual(storedData.callOptions, callOptions)
    ) {
      console.warn(
        'CallOptions have changed since last call, clearing stored data and skipping reconnection'
      );
      vapiCallStorage.clearStoredCall(
        reconnectStorageKey,
        voiceReconnectStorage
      );
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
      vapiCallStorage.clearStoredCall(
        reconnectStorageKey,
        voiceReconnectStorage
      );
      callbacksRef.current.onError?.(error as Error);
    }
  }, [vapi, enabled, reconnectStorageKey, voiceReconnectStorage, callOptions]);

  const clearStoredCall = useCallback(() => {
    vapiCallStorage.clearStoredCall(reconnectStorageKey, voiceReconnectStorage);
  }, [reconnectStorageKey, voiceReconnectStorage]);

  useEffect(() => {
    if (!vapi || !enabled || !voiceAutoReconnect) {
      return;
    }
    reconnect();
  }, [vapi, enabled, voiceAutoReconnect, reconnect, reconnectStorageKey]);

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
