import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-zinc-200/80 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-zinc-900">Something went wrong</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                QuickMart encountered an unexpected rendering error. Click below to reload the app.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-100 p-3 rounded-xl text-left overflow-auto max-h-36 text-[11px] font-mono text-zinc-700">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload QuickMart</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
