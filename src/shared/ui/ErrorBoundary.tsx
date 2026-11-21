import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Ocurrió un error inesperado en la interfaz.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught UI error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dulcinea-dots flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl border border-dulcinea-copper/35 shadow-lg max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-dulcinea-cherry/10 text-dulcinea-cherry flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold font-serif text-dulcinea-midnight">
                Algo salió mal en Dulcinea
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tus recetas, insumos y ventas están a salvo en el almacenamiento local. Puedes recargar la aplicación para continuar.
              </p>
              {this.state.errorMessage && (
                <p className="text-[11px] font-mono bg-dulcinea-cream/50 text-dulcinea-cherry px-3 py-2 rounded-xl border border-dulcinea-copper/25 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-dulcinea-copper" />
              <span>Recargar aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
