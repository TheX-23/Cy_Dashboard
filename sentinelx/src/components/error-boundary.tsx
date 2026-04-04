"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      console.error("ErrorBoundary caught an error:", error?.toString(), errorInfo);
    } catch (e) {
      console.error("ErrorBoundary logging failed:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-900 dark:bg-white flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-4">Something went wrong</h2>
              <p className="text-gray-300 dark:text-gray-700 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Try again
              </button>
              {this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-400 dark:text-gray-600 hover:text-gray-300 dark:hover:text-gray-500">
                    Error details
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-800 dark:bg-gray-100 rounded text-xs text-red-400 dark:text-red-600 overflow-auto">
                    {this.state.error?.toString?.() || 'Unknown error'}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
