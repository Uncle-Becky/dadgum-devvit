import React, { useEffect, useState } from 'react';
import { ErrorTypes } from '../../webroot/utils/error-handler';

interface ErrorToastProps {
    error: {
        type: string;
        message: string;
        details?: Record<string, unknown>;
    };
    onClose: () => void;
    autoHideDuration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
    error,
    onClose,
    autoHideDuration = 5000
}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
    }, [autoHideDuration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const isCritical = [
        ErrorTypes.NETWORK,
        ErrorTypes.AUTH,
        ErrorTypes.API
    ].includes(error.type);

    return (
        <div
            className={`error-toast ${isExiting ? 'error-toast-exit' : ''} ${
                isCritical ? 'critical' : 'warning'
            }`}
        >
            <div className="error-toast-header">
                <span className="error-toast-title">
                    {isCritical ? 'Error' : 'Warning'}
                </span>
                <button
                    className="error-toast-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
            <div className="error-toast-message">{error.message}</div>
            {__DEV__ && error.details && (
                <pre className="error-toast-details">
                    {JSON.stringify(error.details, null, 2)}
                </pre>
            )}
        </div>
    );
};
