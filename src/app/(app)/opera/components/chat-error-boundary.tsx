"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ChatErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat bubble error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return <DefaultErrorFallback resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <AlertCircle className="w-8 h-8 text-destructive mb-2" />
      <p className="text-sm text-muted-foreground mb-3 text-center">
        Something went wrong with this message
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={resetError}
        className="gap-2"
      >
        <RefreshCw className="w-3 h-3" />
        Try again
      </Button>
    </div>
  );
}

export { ChatErrorBoundary, DefaultErrorFallback }; 