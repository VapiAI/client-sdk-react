import Cookies from 'js-cookie';

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

export type StorageType = 'session' | 'cookies';

// Get root domain for cookie (e.g., ".domain.com")
function getRootDomain(): string {
  const hostname = window.location.hostname;

  // Handle localhost/IP
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return hostname;
  }

  const parts = hostname.split('.');

  // Already root domain
  if (parts.length <= 2) {
    return hostname;
  }

  // Return root domain with leading dot (e.g., ".domain.com")
  return '.' + parts.slice(-2).join('.');
}

export const storeCallData = (
  reconnectStorageKey: string,
  call: any,
  callOptions?: any,
  storageType: StorageType = 'session'
) => {
  const webCallUrl =
    (call as any).webCallUrl || (call.transport as any)?.callUrl;

  if (!webCallUrl) {
    console.warn(
      'No webCallUrl found in call object, cannot store for reconnection'
    );
    return;
  }

  const webCallToStore: StoredCallData = {
    webCallUrl,
    id: call.id,
    artifactPlan: call.artifactPlan,
    assistant: call.assistant,
    callOptions,
    timestamp: Date.now(),
  };

  if (storageType === 'session') {
    sessionStorage.setItem(reconnectStorageKey, JSON.stringify(webCallToStore));
  } else if (storageType === 'cookies') {
    try {
      const rootDomain = getRootDomain();

      Cookies.set(reconnectStorageKey, JSON.stringify(webCallToStore), {
        domain: rootDomain,
        path: '/',
        secure: true,
        sameSite: 'lax',
        expires: 1 / 24, // 1 hour (expires takes days, so 1/24 = 1 hour)
      });
    } catch (error) {
      console.error('Failed to store call data in cookie:', error);
    }
  }
};

export const getStoredCallData = (
  reconnectStorageKey: string,
  storageType: StorageType = 'session'
): StoredCallData | null => {
  try {
    if (storageType === 'session') {
      const sessionData = sessionStorage.getItem(reconnectStorageKey);
      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } else if (storageType === 'cookies') {
      const cookieValue = Cookies.get(reconnectStorageKey);

      if (!cookieValue) return null;

      return JSON.parse(cookieValue);
    }

    return null;
  } catch (error) {
    console.error('Error reading stored call data:', error);
    return null;
  }
};

export const clearStoredCall = (
  reconnectStorageKey: string,
  storageType: StorageType = 'session'
) => {
  if (storageType === 'session') {
    sessionStorage.removeItem(reconnectStorageKey);
  } else if (storageType === 'cookies') {
    const rootDomain = getRootDomain();
    Cookies.remove(reconnectStorageKey, {
      domain: rootDomain,
      path: '/',
    });
  }
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
