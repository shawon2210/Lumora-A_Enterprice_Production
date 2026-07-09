import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@lumora/ui';

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
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="glass-card max-w-md p-8 text-center">
            <AlertCircle className="text-error mx-auto h-12 w-12" />
            <h2 className="text-text-primary mt-4 text-lg font-semibold">Something went wrong</h2>
            <p className="text-text-secondary mt-2 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleRetry} className="mt-6 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
