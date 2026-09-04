import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-3xl">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Refresh the page to continue. Your data on the server is
              unchanged.
            </p>
            <button
              className="mt-6 rounded-md bg-moss px-4 py-2 text-sm font-medium text-paper-raised hover:bg-moss-hover"
              onClick={() => window.location.reload()}
              type="button"
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
