"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error caught by KrishiSetu ErrorBoundary:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mb-4 text-sm">
            An unexpected error occurred in the KrishiSetu AI user interface. Your data in the offline ledger has been preserved.
          </p>
          {this.state.error && (
            <pre className="bg-slate-100 p-3 rounded text-xs text-red-700 max-w-lg overflow-auto mb-6 text-left border border-slate-200">
              {this.state.error.message}
            </pre>
          )}
          <Button
            onClick={this.handleReset}
            className="bg-green-700 hover:bg-green-800 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
