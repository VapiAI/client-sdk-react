import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

export interface VapiCallState {
  isCallActive: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export interface VapiCallHandlers {
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleCall: () => Promise<void>;
}

export interface UseVapiCallOptions {
  publicKey: string;
  callOptions: any;
  apiUrl?: string;
  enabled?: boolean;
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
  }, [vapi]);

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
      console.log('Starting call with options:', callOptions);
      setConnectionStatus('connecting');
      await vapi.start(callOptions);
    } catch (error) {
      console.error('Error starting call:', error);
      setConnectionStatus('disconnected');
      callbacksRef.current.onError?.(error as Error);
    }
  }, [vapi, callOptions, enabled]);

  const endCall = useCallback(async () => {
    if (!vapi) {
      console.log('Cannot end call: no vapi instance');
      return;
    }

    console.log('Ending call');
    vapi.stop();
  }, [vapi]);

  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      await endCall();
    } else {
      await startCall();
    }
  }, [isCallActive, startCall, endCall]);

  return {
    // State
    isCallActive,
    isSpeaking,
    volumeLevel,
    connectionStatus,
    // Handlers
    startCall,
    endCall,
    toggleCall,
  };
};
