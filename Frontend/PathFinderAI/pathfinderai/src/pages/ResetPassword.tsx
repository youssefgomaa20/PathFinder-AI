import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { PasswordField } from "@/components/ui/password-field.js";
import { useAppState } from "../hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";
import robot2 from "@/assets/robot2.png";

export default function ResetPasswordPage() {
  const { theme } = useAppState();
  const { lang } = useLanguage();
  const darkMode = theme === "dark";
  const search = useSearch();
  const token = useMemo(() => new URLSearchParams(search).get("token") ?? "", [search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      setError(t("auth.resetTokenMissing", lang));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch", lang));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch(apiUrl("/auth/reset-password"), {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : await readApiErrorMessage(res));
        return;
      }
      setSuccess(typeof data.message === "string" ? data.message : t("auth.passwordUpdated", lang));
      setPassword("");
      setConfirm("");
    } catch {
      setError(t("auth.networkErrorShort", lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`page-shell min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden transition-colors duration-500 ${darkMode ? "bg-[#0b0f19]" : "bg-slate-50"}`}>
      
      <div className="absolute inset-0 pointer-events-none z-0 opacity-70">
        <div className={`absolute inset-0 bg-repeat animate-stars ${darkMode ? 'bg-[radial-gradient(1px_1px_at_20px_30px,#fff,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#fff,rgba(0,0,0,0)),radial-gradient(2px_2px_at_50px_160px,#fff,rgba(0,0,0,0))]' : 'bg-[radial-gradient(1px_1px_at_20px_30px,#6366f1,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#3b82f6,rgba(0,0,0,0))]'}`} style={{ backgroundSize: '200px 200px' }}></div>
        <div className={`absolute inset-0 bg-repeat animate-stars-slow ${darkMode ? 'bg-[radial-gradient(1.5px_1.5px_at_100px_150px,#fff,rgba(0,0,0,0)),radial-gradient(2px_2px_at_200px_300px,#38bdf8,rgba(0,0,0,0))]' : 'bg-[radial-gradient(1.5px_1.5px_at_100px_150px,#3b82f6,rgba(0,0,0,0))]'}`} style={{ backgroundSize: '300px 300px' }}></div>
      </div>

      <style>{`
        @keyframes drift {
          from { transform: translateY(0px); }
          to { transform: translateY(-200px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stars { animation: drift 20s linear infinite; }
        .animate-stars-slow { animation: drift 40s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="max-w-md w-full relative z-10 pt-20 animate-fade-in">
        <div className="absolute -top-[45px] left-1/2 -translate-x-1/2 z-20 w-50 h-50 pointer-events-none animate-float">
          <img 
            src={robot2}
            alt="Robot Guide"
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-contain filter drop-shadow(0 10px 15px rgba(0,0,0,0.15)) ${darkMode ? 'invert-0 brightness-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'hue-rotate-180 brightness-90'}`}
          />
        </div>

        <div className={`w-full p-8 rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-md
          ${darkMode 
            ? "bg-gray-900/80 border-gray-800 text-white shadow-blue-900/10 hover:border-blue-500/30" 
            : "bg-white/90 border-slate-200 text-gray-900 shadow-slate-200/50 hover:border-blue-500/20"
          }`}
        >
          <h1 className="text-2xl font-bold text-center mt-6 mb-6 tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            {t("auth.resetTitle", lang)}
          </h1>

          {!token && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 animate-fade-in">
              {t("auth.resetInvalidLink", lang)}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500 dark:text-green-400 animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="transition-all duration-200 transform hover:scale-[1.01]">
              <PasswordField
                icon={Lock}
                darkMode={darkMode}
                surface="auth"
                placeholder={t("auth.resetNew", lang)}
                title={t("auth.resetNew", lang)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={!token}
                className={`w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 rounded-xl`}
              />
            </div>
            <div className="transition-all duration-200 transform hover:scale-[1.01]">
              <PasswordField
                icon={Lock}
                darkMode={darkMode}
                surface="auth"
                placeholder={t("auth.resetConfirm", lang)}
                title={t("auth.resetConfirm", lang)}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                disabled={!token}
                className={`w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 rounded-xl`}
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full py-6 rounded-xl font-medium shadow-lg transition-all duration-300 transform active:scale-95 
                ${isSubmitting || !token 
                  ? "opacity-80 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/20 hover:-translate-y-0.5 text-white"
                }`} 
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.resetUpdating", lang)}
                </span>
              ) : (
                t("auth.resetSubmit", lang)
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors duration-200 hover:underline decoration-2 underline-offset-4">
              ← {t("auth.resetBack", lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
