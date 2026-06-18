import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";

function ErrorFallback({
  message,
  onReset
}: {
  message: string;
  onReset: () => void;
}) {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-xl font-semibold">{t("error.title", lang)}</h1>
      <p className="max-w-lg text-sm text-slate-400">{message}</p>
      <button
        type="button"
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
        onClick={onReset}
      >
        {t("error.reload", lang)}
      </button>
    </div>
  );
}

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Something went wrong." };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          message={this.state.message}
          onReset={() => {
            this.setState({ hasError: false, message: "" });
            window.location.href = "/";
          }}
        />
      );
    }
    return this.props.children;
  }
}
