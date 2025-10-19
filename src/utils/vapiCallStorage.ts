export interface StoredCallData {
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
  callOptions?: any;
  timestamp: number;
}

export const storeCallData = (
  reconnectStorageKey: string,
  call: any,
  callOptions?: any
) => {
  const webCallUrl =
    (call as any).webCallUrl || (call.transport as any)?.callUrl;

  if (webCallUrl) {
    const webCallToStore = {
      webCallUrl,
      id: call.id,
      artifactPlan: call.artifactPlan,
      assistant: call.assistant,
      callOptions,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(reconnectStorageKey, JSON.stringify(webCallToStore));
    console.log('Stored call data for reconnection:', webCallToStore);
  } else {
    console.warn(
      'No webCallUrl found in call object, cannot store for reconnection'
    );
  }
};

export const getStoredCallData = (
  reconnectStorageKey: string
): StoredCallData | null => {
  try {
    const stored = sessionStorage.getItem(reconnectStorageKey);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch {
    sessionStorage.removeItem(reconnectStorageKey);
    return null;
  }
};

export const clearStoredCall = (reconnectStorageKey: string) => {
  sessionStorage.removeItem(reconnectStorageKey);
};

export const areCallOptionsEqual = (options1: any, options2: any): boolean => {
  // Handle null/undefined cases
  if (options1 === options2) return true;
  if (!options1 || !options2) return false;

  try {
    // Deep comparison using JSON serialization
    // This works for most cases but may not handle functions, dates, etc.
    return JSON.stringify(options1) === JSON.stringify(options2);
  } catch {
    // Fallback to reference equality if JSON.stringify fails
    return options1 === options2;
  }
};
