import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Optionally log error to a service
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h2>
          <p className="mb-2">A technical error occurred. Please try refreshing the page.</p>
          <p>
            If this keeps happening, please{' '}
            <a
              href="mailto:campusolx.connect@gmail.com"
              className="underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              contact us
            </a>
            .
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
