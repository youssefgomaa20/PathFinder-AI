import { useEffect, type ComponentType } from "react";
import { useLocation } from "wouter";
import { getToken } from "@/lib/auth.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";

export function ProtectedRoute({ component: Comp }: { component: ComponentType }) {
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();
  const token = getToken();

  useEffect(() => {
    if (!getToken()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-muted-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">{t("common.loading", lang)}</p>
      </div>
    );
  }

  return <Comp />;
}
