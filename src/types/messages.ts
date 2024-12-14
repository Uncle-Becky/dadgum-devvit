export enum MessageType {
    // State Updates
    STATE_UPDATE = 'STATE_UPDATE',
    STATE_REQUEST = 'STATE_REQUEST',
    
    // Errors
    ERROR_REPORT = 'ERROR_REPORT',
    ERROR_ACKNOWLEDGE = 'ERROR_ACKNOWLEDGE',
    
    // User Actions
    USER_ACTION = 'USER_ACTION',
    ACTION_RESPONSE = 'ACTION_RESPONSE',
    
    // Lifecycle
    WEBVIEW_READY = 'WEBVIEW_READY',
    WEBVIEW_MOUNTED = 'WEBVIEW_MOUNTED',
    
    // Data Operations
    DATA_REQUEST = 'DATA_REQUEST',
    DATA_RESPONSE = 'DATA_RESPONSE',
}

export interface Message<T = unknown> {
    type: MessageType;
    payload: T;
    id?: string;
    timestamp: string;
}

export interface StateUpdatePayload {
    path: string[];
    value: unknown;
}

export interface ErrorPayload {
    type: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
}

export interface UserActionPayload {
    action: string;
    data?: unknown;
}

export interface DataRequestPayload {
    resource: string;
    params?: Record<string, unknown>;
}

export interface DataResponsePayload<T = unknown> {
    resource: string;
    data: T;
    error?: ErrorPayload;
}
