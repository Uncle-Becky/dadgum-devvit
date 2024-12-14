import { Message, MessageType } from '../types/messages';
import type { WebView } from '@devvit/public-api';

export class MessageHandler {
    private webview: WebView;
    private handlers: Map<MessageType, Set<(message: Message) => void>>;

    constructor(webview: WebView) {
        this.webview = webview;
        this.handlers = new Map();
        
        // Set up message listener
        this.webview.onMessage((message) => this.handleMessage(message));
    }

    // Register a handler for a specific message type
    public on<T>(type: MessageType, handler: (message: Message<T>) => void): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        
        this.handlers.get(type)!.add(handler);
        
        // Return unsubscribe function
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    // Send a message to the webview
    public send<T>(type: MessageType, payload: T): void {
        const message: Message<T> = {
            type,
            payload,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };
        
        this.webview.postMessage(message);
    }

    // Handle incoming messages
    private async handleMessage(message: Message): Promise<void> {
        const handlers = this.handlers.get(message.type);
        
        if (handlers) {
            for (const handler of handlers) {
                try {
                    await handler(message);
                } catch (error) {
                    console.error(`Error in message handler for ${message.type}:`, error);
                    this.send(MessageType.ERROR_REPORT, {
                        type: 'HANDLER_ERROR',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        details: { messageType: message.type }
                    });
                }
            }
        }
    }

    // Convenience methods for common message types
    public sendStateUpdate(path: string[], value: unknown): void {
        this.send(MessageType.STATE_UPDATE, { path, value });
    }

    public sendError(error: Error, details?: Record<string, unknown>): void {
        this.send(MessageType.ERROR_REPORT, {
            type: error.name,
            message: error.message,
            details,
            stack: error.stack
        });
    }

    public sendDataResponse<T>(resource: string, data: T, error?: Error): void {
        this.send(MessageType.DATA_RESPONSE, {
            resource,
            data,
            error: error ? {
                type: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
}
