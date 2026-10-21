import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Phone } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, send to monitoring service (e.g. Sentry/Datadog)
    // Avoid logging sensitive patient data
    if (process.env.NODE_ENV === 'development') {
      console.warn('ErrorBoundary captured rendering error:', error.message, errorInfo.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="my-8 mx-auto max-w-2xl rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] p-8 text-left shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#EEF4F3] p-3 text-[#0F3838]">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="font-editorial text-2xl font-bold text-[#1B2928]">
                {this.props.fallbackTitle || 'Unable to display this section'}
              </h2>
              <p className="mt-2 text-base text-[#556B69] leading-relaxed">
                A temporary display issue occurred while loading this clinical section. You can reload the component or contact our reception directly.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0F3838] px-5 py-2.5 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#1A5454] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3838]"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Reloading Section
                </button>
                <a
                  href={`tel:${CLINIC_INFO.phoneClean}`}
                  className="inline-flex items-center gap-2 rounded-md border border-[#E5DFD5] bg-white px-5 py-2.5 text-sm font-medium text-[#1B2928] transition-colors hover:bg-[#F3EEE7]"
                >
                  <Phone className="h-4 w-4 text-[#0F3838]" aria-hidden="true" />
                  Call Reception ({CLINIC_INFO.phone})
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
