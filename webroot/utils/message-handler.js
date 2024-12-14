import { errorHandler } from './error-handler.js';
import { stateManager } from '../state.js';

export const MessageType = {
    // State Updates
    STATE_UPDATE: 'STATE_UPDATE',
    STATE_REQUEST: 'STATE_REQUEST',
    
    // Errors
    ERROR_REPORT: 'ERROR_REPORT',
    ERROR_ACKNOWLEDGE: 'ERROR_ACKNOWLEDGE',
    
    // User Actions
    USER_ACTION: 'USER_ACTION',
    ACTION_RESPONSE: 'ACTION_RESPONSE',
    
    // Lifecycle
    WEBVIEW_READY: 'WEBVIEW_READY',
    WEBVIEW_MOUNTED: 'WEBVIEW_MOUNTED',
    
    // Data Operations
    DATA_REQUEST: 'DATA_REQUEST',
    DATA_RESPONSE: 'DATA_RESPONSE',
};

class MessageHandler {
    constructor() {
        this.handlers = new Map();
        this.pendingRequests = new Map();
        
        // Set up message listener
        window.addEventListener('message', (event) => {
            if (event.data.type === 'devvit-message') {
                this.handleMessage(event.data.message);
            }
        });
        
        // Set up default handlers
        this.setupDefaultHandlers();
    }

    // Register a handler for a specific message type
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        
        this.handlers.get(type).add(handler);
        
        // Return unsubscribe function
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    // Send a message to Devvit
    send(type, payload) {
        const message = {
            type,
            payload,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };
        
        window.parent.postMessage({
            type: 'webview-message',
            message
        }, '*');
        
        return message.id;
    }

    // Send a message and wait for response
    async sendAndWait(type, payload, timeout = 5000) {
        const messageId = this.send(type, payload);
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(messageId);
                reject(new Error(`Request timeout for message type: ${type}`));
            }, timeout);
            
            this.pendingRequests.set(messageId, { resolve, reject, timeoutId });
        });
    }

    // Handle incoming messages
    async handleMessage(message) {
        // Check for pending request resolution
        if (message.id && this.pendingRequests.has(message.id)) {
            const { resolve, timeoutId } = this.pendingRequests.get(message.id);
            clearTimeout(timeoutId);
            this.pendingRequests.delete(message.id);
            resolve(message.payload);
            return;
        }
        
        // Handle message by type
        const handlers = this.handlers.get(message.type);
        
        if (handlers) {
            for (const handler of handlers) {
                try {
                    await handler(message.payload);
                } catch (error) {
                    errorHandler.handleError(error, {
                        context: 'message_handler',
                        messageType: message.type
                    });
                }
            }
        }
    }

    // Set up default message handlers
    setupDefaultHandlers() {
        // Handle state updates
        this.on(MessageType.STATE_UPDATE, ({ path, value }) => {
            stateManager.setState(path, value);
        });
        
        // Handle errors
        this.on(MessageType.ERROR_REPORT, (error) => {
            errorHandler.handleError(error);
        });
        
        // Handle data responses
        this.on(MessageType.DATA_RESPONSE, ({ resource, data, error }) => {
            if (error) {
                errorHandler.handleError(error, { resource });
            } else {
                stateManager.setState(['data', resource], data);
            }
        });
    }

    // Convenience methods for common message types
    sendStateRequest(path) {
        return this.send(MessageType.STATE_REQUEST, { path });
    }

    sendUserAction(action, data) {
        return this.send(MessageType.USER_ACTION, { action, data });
    }

    async requestData(resource, params) {
        return this.sendAndWait(MessageType.DATA_REQUEST, { resource, params });
    }

    notifyReady() {
        this.send(MessageType.WEBVIEW_READY, { timestamp: Date.now() });
    }

    notifyMounted() {
        this.send(MessageType.WEBVIEW_MOUNTED, { timestamp: Date.now() });
    }
}

// Create and export singleton instance
export const messageHandler = new MessageHandler();
