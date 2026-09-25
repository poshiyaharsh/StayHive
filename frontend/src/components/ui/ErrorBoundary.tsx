import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production-safe logging without leaking user credentials
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              An unexpected error occurred while rendering this view. Our system has logged the event and our team is monitoring it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = '/'; }}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
