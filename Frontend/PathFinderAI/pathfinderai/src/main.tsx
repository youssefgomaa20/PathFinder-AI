import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { ErrorBoundary } from "./components/error-boundary.js";
import { LanguageProvider } from "./context/LanguageContext.js";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </LanguageProvider>
);
