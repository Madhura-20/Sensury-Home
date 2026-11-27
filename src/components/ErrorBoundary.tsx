import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('SENSURY HOME ErrorBoundary caught:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; operationType?: string; path?: string };
        if (parsed?.error) {
          friendly = `${parsed.error}${parsed.path ? ` (${parsed.operationType} on ${parsed.path})` : ''}`;
        }
      } catch {
        // plain text message
      }

      return (
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E7E5DF] rounded-xl p-8">
            <p className="text-xs font-medium text-[#B45309] mb-2">Application Notice</p>
            <h1 className="text-xl font-semibold text-[#14171A] mb-3">
              Something interrupted your workspace
            </h1>
            <p className="text-sm text-[#4A5056] leading-relaxed mb-6 break-words">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] transition-colors"
            >
              Reload SENSURY HOME
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
