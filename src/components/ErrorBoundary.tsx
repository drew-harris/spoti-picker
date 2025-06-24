import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: ({ error }: { error: Error }) => React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to a service
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

export const SimpleErrorDisplay = ({ error }: { error: Error }) => {
  return (
    <div className="bg-red-500/10 border border-red-400 p-2 rounded">
      <h1 className="text-lg">Something went wrong!</h1>
      <p className="pl-2 font-mono">{error.message}</p>
    </div>
  );
};
