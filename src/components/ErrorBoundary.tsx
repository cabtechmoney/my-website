import { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-vh-100 d-flex align-items-center justify-content-center bg-cream px-3">
          <div className="text-center" style={{ maxWidth: '480px' }}>
            <p className="text-uppercase small mb-2" style={{ color: '#c9a84c', letterSpacing: '0.12em' }}>Hera Palace</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}>Something went wrong</h1>
            <p className="text-muted mb-4">Please refresh the page or return to the collection and try again.</p>
            <button className="btn btn-gold px-4" onClick={() => window.location.assign('/')}>Return home</button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
