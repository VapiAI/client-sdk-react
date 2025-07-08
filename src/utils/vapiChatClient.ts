import { fetchEventSource } from '@microsoft/fetch-event-source';

export interface AssistantOverrides {
  variableValues?: {
    [key: string]: string;
  };
}

export interface VapiChatMessage {
  input: string | Array<{ role: string; content: string }>;
  assistantId: string;
  assistantOverrides?: AssistantOverrides;
  sessionId?: string;
  stream?: boolean;
}

export interface VapiChatStreamChunk {
  id?: string;
  path?: string;
  delta?: string;
  sessionId?: string;
  output?: string;
  [key: string]: any;
}

export interface VapiChatClientOptions {
  apiUrl?: string;
  publicKey: string;
}

export type StreamCallback = (chunk: VapiChatStreamChunk) => void;
export type ErrorCallback = (error: Error) => void;
export type CompleteCallback = () => void;

// Custom error classes for retry logic
class RetriableError extends Error {}
class FatalError extends Error {}

export class VapiChatClient {
  private apiUrl: string;
  private publicKey: string;
  private abortController: AbortController | null = null;

  constructor(options: VapiChatClientOptions) {
    this.publicKey = options.publicKey;
    this.apiUrl = options.apiUrl || 'https://api.vapi.ai';
  }

  async streamChat(
    message: VapiChatMessage,
    onChunk: StreamCallback,
    onError?: ErrorCallback,
    onComplete?: CompleteCallback
  ): Promise<() => void> {
    // Cancel any existing stream
    this.abort();

    // Create new abort controller
    this.abortController = new AbortController();

    try {
      await fetchEventSource(`${this.apiUrl}/chat/web`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          stream: true,
        }),
        signal: this.abortController.signal,

        // Event handlers
        async onopen(response) {
          if (
            response.ok &&
            response.headers.get('content-type')?.includes('text/event-stream')
          ) {
            return; // everything's good
          } else if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            // Client errors are non-retriable
            throw new FatalError(`HTTP error! status: ${response.status}`);
          } else {
            throw new RetriableError(`HTTP error! status: ${response.status}`);
          }
        },

        onmessage(event) {
          // Skip the [DONE] message
          if (event.data === '[DONE]') {
            return;
          }

          try {
            const chunk = JSON.parse(event.data) as VapiChatStreamChunk;
            // Only emit chunks that have relevant content
            if (
              chunk.delta !== undefined ||
              chunk.output !== undefined ||
              chunk.path !== undefined
            ) {
              onChunk(chunk);
            }
          } catch (error) {
            console.warn(`Failed to parse SSE data: ${event.data}`);
          }
        },

        onclose() {
          // Stream closed normally
          onComplete?.();
        },

        onerror(err) {
          if (err instanceof FatalError) {
            onError?.(err);
            throw err; // Stop the operation
          } else if (err instanceof Error && err.name === 'AbortError') {
            // Stream was intentionally aborted
            onComplete?.();
            throw err; // Stop the operation
          } else {
            // Retriable error - return nothing to retry
            // You can also return a retry interval in milliseconds
            console.warn('Retriable error occurred, retrying...', err);
          }
        },
      });
    } catch (error) {
      // Handle any errors that weren't handled in onerror
      if (error instanceof Error && error.name !== 'AbortError') {
        onError?.(error);
      }
    }

    // Return abort function
    return () => this.abort();
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export function extractContentFromPath(
  chunk: VapiChatStreamChunk
): string | null {
  // Check if this is a content chunk with delta and path
  if (chunk.delta && chunk.path === 'chat.output[0].content') {
    return chunk.delta;
  }
  // Also check for direct output field
  if (chunk.output !== undefined) {
    return chunk.output;
  }
  return null;
}
