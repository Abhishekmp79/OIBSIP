/**
 * ErrorBoundary — catches render errors and shows a friendly fallback
 * instead of a blank white screen.
 */
import React from 'react';

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
          <div className="text-6xl">🍕</div>
          <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
          <p className="max-w-md text-charcoal/70">
            We burned this pizza. Please try reloading the page.
          </p>
          {this.state.message && (
            <pre className="max-w-lg overflow-auto rounded-lg bg-charcoal/5 p-3 text-xs text-charcoal/60">
              {this.state.message}
            </pre>
          )}
          <button onClick={this.handleReload} className="btn-primary">
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
