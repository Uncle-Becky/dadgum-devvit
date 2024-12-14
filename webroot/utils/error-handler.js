import { logger } from '../../config/env.js';
import { stateManager } from '../state.js';

// Error types
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    AUTH: 'AUTH_ERROR',
    API: 'API_ERROR',
    STATE: 'STATE_ERROR',
    UI: 'UI_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

// Custom error class
export class AppError extends Error {
    constructor(type, message, details = {}) {
        super(message);
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp,
            stack: __DEV__ ? this.stack : undefined
        };
    }
}

// Error handler class
class ErrorHandler {
    constructor() {
        this.errorListeners = new Set();
        this.lastError = null;
    }

    // Add error listener
    addListener(listener) {
        this.errorListeners.add(listener);
        return () => this.errorListeners.delete(listener);
    }

    // Handle error
    handleError(error, context = {}) {
        // Convert to AppError if not already
        const appError = error instanceof AppError 
            ? error 
            : new AppError(
                ErrorTypes.UNKNOWN,
                error.message || 'An unexpected error occurred',
                { originalError: error, ...context }
            );

        // Store last error
        this.lastError = appError;

        // Log error
        this._logError(appError);

        // Update state
        this._updateErrorState(appError);

        // Notify listeners
        this._notifyListeners(appError);

        // Send to Devvit if critical
        if (this._isCriticalError(appError)) {
            this._notifyDevvit(appError);
        }

        return appError;
    }

    // Clear current error
    clearError() {
        this.lastError = null;
        stateManager.setState({
            error: null
        });
    }

    // Get last error
    getLastError() {
        return this.lastError;
    }

    // Private methods
    _logError(error) {
        const errorData = {
            ...error.toJSON(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        logger.error('[Error]', errorData);
    }

    _updateErrorState(error) {
        stateManager.setState({
            error: error.toJSON()
        });
    }

    _notifyListeners(error) {
        this.errorListeners.forEach(listener => {
            try {
                listener(error);
            } catch (listenerError) {
                logger.error('Error in error listener:', listenerError);
            }
        });
    }

    _notifyDevvit(error) {
        window.parent.postMessage({
            type: 'webview-message',
            message: {
                type: 'ERROR_REPORT',
                error: error.toJSON()
            }
        }, '*');
    }

    _isCriticalError(error) {
        return [
            ErrorTypes.NETWORK,
            ErrorTypes.AUTH,
            ErrorTypes.API
        ].includes(error.type);
    }
}

// Create and export singleton instance
export const errorHandler = new ErrorHandler();

// Error boundary for React components
export class ErrorBoundary {
    constructor() {
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        errorHandler.handleError(error, { errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || this.defaultErrorUI();
        }
        return this.props.children;
    }

    defaultErrorUI() {
        return `
            <div class="error-boundary">
                <h2>Something went wrong</h2>
                <p>Please try refreshing the page</p>
                ${__DEV__ ? `<pre>${this.state.error?.stack}</pre>` : ''}
            </div>
        `;
    }
}

// Network error interceptor
export function setupNetworkErrorInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            
            if (!response.ok) {
                throw new AppError(
                    ErrorTypes.API,
                    `API request failed: ${response.status} ${response.statusText}`,
                    {
                        status: response.status,
                        statusText: response.statusText,
                        url: args[0]
                    }
                );
            }
            
            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            
            throw new AppError(
                ErrorTypes.NETWORK,
                'Network request failed',
                {
                    originalError: error,
                    url: args[0]
                }
            );
        }
    };
}

// Utility functions for common errors
export const throwValidationError = (message, details) => {
    throw new AppError(ErrorTypes.VALIDATION, message, details);
};

export const throwAuthError = (message, details) => {
    throw new AppError(ErrorTypes.AUTH, message, details);
};

export const throwApiError = (message, details) => {
    throw new AppError(ErrorTypes.API, message, details);
};

// Initialize error handling
export function initializeErrorHandling() {
    // Set up global error handler
    window.onerror = (message, source, lineno, colno, error) => {
        errorHandler.handleError(error || message, {
            source,
            lineno,
            colno
        });
        return true;
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        errorHandler.handleError(event.reason, {
            type: 'unhandledrejection'
        });
    });

    // Set up network error interceptor
    setupNetworkErrorInterceptor();

    logger.info('Error handling initialized');
}
