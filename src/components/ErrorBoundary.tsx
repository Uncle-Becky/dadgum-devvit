import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler } from '../../webroot/utils/error-handler';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        errorHandler.handleError(error, { errorInfo });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || this.defaultErrorUI();
        }

        return this.props.children;
    }

    private defaultErrorUI(): ReactNode {
        return (
            <div className="error-boundary">
                <h2>Something went wrong</h2>
                <p>Please try refreshing the page</p>
                {__DEV__ && this.state.error && (
                    <pre>{this.state.error.stack}</pre>
                )}
            </div>
        );
    }
}
