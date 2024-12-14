import { useEffect, useCallback } from 'react';
import { Message, MessageType } from '../types/messages';
import { messageHandler } from '../handlers/MessageHandler';

export function useMessage<T = unknown>(
    type: MessageType,
    handler: (payload: T) => void,
    deps: any[] = []
) {
    useEffect(() => {
        const unsubscribe = messageHandler.on(type, (message: Message<T>) => {
            handler(message.payload);
        });
        
        return () => {
            unsubscribe();
        };
    }, [type, handler, ...deps]);
    
    const send = useCallback((payload: T) => {
        messageHandler.send(type, payload);
    }, [type]);
    
    const sendAndWait = useCallback(async (payload: T) => {
        return messageHandler.sendAndWait(type, payload);
    }, [type]);
    
    return { send, sendAndWait };
}

// Convenience hooks for common message types
export function useStateUpdate() {
    return useMessage(MessageType.STATE_UPDATE, (payload) => {
        const { path, value } = payload as { path: string[]; value: unknown };
        // Update your state management system here
    });
}

export function useUserAction() {
    return useMessage(MessageType.USER_ACTION, (payload) => {
        const { action, data } = payload as { action: string; data?: unknown };
        // Handle user actions here
    });
}

export function useDataRequest<T>() {
    const { send, sendAndWait } = useMessage<T>(MessageType.DATA_REQUEST);
    
    const request = useCallback(async (resource: string, params?: Record<string, unknown>) => {
        return sendAndWait({ resource, params } as T);
    }, [sendAndWait]);
    
    return { request };
}
