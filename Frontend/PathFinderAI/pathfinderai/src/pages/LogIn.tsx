import React, {
  useEffect,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { IconInput } from "@/components/ui/icon-field.js";
import { PasswordField } from "@/components/ui/password-field.js";
import { GoogleSignInButton } from "@/components/GoogleSignInButton.js";
import { useAppState } from "../hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage, setAuthSession, setSessionUid, type AuthUser } from "@/lib/auth.js";
import { getFirebaseAuth, googleAuthProvider, isFirebaseConfigured } from "@/lib/firebase.js";
import robot from "@/assets/robot.png";

const GOOGLE_REDIRECT_PENDING = "google_redirect_pending";

export default function LogInPage() {
  const { theme } = useAppState();
  const { lang } = useLanguage();
  const darkMode = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });
  
  const lightOpacity = useSpring(useTransform(mouseX, [-300, 300], [0.4, 0.8]), { stiffness: 50, damping: 20 });
  const lightScale = useSpring(useTransform(mouseY, [-300, 300], [1, 1.3]), { stiffness: 50, damping: 20 });

function handleMouseMove(
  event: React.MouseEvent<HTMLDivElement>
) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting && !googleLoading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await apiFetch(apiUrl("/auth/login"), {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setError(await readApiErrorMessage(res));
        return;
      }
      const data = (await res.json()) as { token: string; user: AuthUser };
      setAuthSession(data.token, data.user);
      setLocation("/");
    } catch {
      setError(t("auth.networkError", lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    if (!isFirebaseConfigured()) {
      setError(t("auth.googleNotConfigured", lang));
      return;
    }
    setGoogleLoading(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, googleAuthProvider);
      const gEmail = result.user.email;
      const name = result.user.displayName ?? gEmail?.split("@")[0] ?? "User";
      if (!gEmail) {
        setError(t("auth.googleNoEmail", lang));
        return;
      }
      setSessionUid(result.user.uid);
      const res = await apiFetch(apiUrl("/auth/google"), {
        method: "POST",
        body: JSON.stringify({ email: gEmail, name })
      });
      if (!res.ok) {
        setError(await readApiErrorMessage(res));
        return;
      }
      const data = (await res.json()) as { token: string; user: AuthUser };
      setAuthSession(data.token, data.user);
      setLocation("/");
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "auth/popup-blocked") {
        try {
          sessionStorage.setItem(GOOGLE_REDIRECT_PENDING, "1");
        } catch { /* ignore */ }
        try {
          const auth = getFirebaseAuth();
          await signInWithRedirect(auth, googleAuthProvider);
          return;
        } catch (e2) {
          setError(e2 instanceof Error ? e2.message : t("auth.googleFail", lang));
          return;
        }
      }
      setError(err instanceof Error ? err.message : t("auth.googleFail", lang));
    } finally {
      setGoogleLoading(false);
    }
  };

useEffect(() => {
  const pending = (() => {
    try {
      return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING) === "1";
    } catch {
      return false;
    }
  })();

  if (!pending) return;

  const auth = getFirebaseAuth();

  const handleRedirectResult = async () => {
    setGoogleLoading(true);

    try {
      const result = await getRedirectResult(auth);

      if (!result) return;

      const gEmail = result.user.email;
      const name =
        result.user.displayName ??
        gEmail?.split("@")[0] ??
        "User";

      if (!gEmail) {
        setError(t("auth.googleNoEmail", lang));
        return;
      }

      setSessionUid(result.user.uid);

      const res = await apiFetch(apiUrl("/auth/google"), {
        method: "POST",
        body: JSON.stringify({
          email: gEmail,
          name,
        }),
      });

      if (!res.ok) {
        setError(await readApiErrorMessage(res));
        return;
      }

      const data = (await res.json()) as {
        token: string;
        user: AuthUser;
      };

      setAuthSession(data.token, data.user);
      setLocation("/");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("auth.googleFail", lang)
      );
    } finally {
      try {
        sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING);
      } catch {
        //
      }

      setGoogleLoading(false);
    }
  };

  void handleRedirectResult();
}, [lang, setLocation]);

const [particles] = useState(() =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i,
    duration: 5 + Math.random() * 4,
    delay: Math.random() * 5,
    left: 40 + Math.random() * 60,
    xMove: i % 2 === 0 ? 60 : -60,
  }))
);
return (
    <div className="page-shell min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#020617] selection:bg-cyan-500/30">
      
      {/*  Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 animate-star-move pointer-events-none"></div>
        
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/20 blur-[140px] rounded-full"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/15 blur-[140px] rounded-full"
        ></motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="w-full max-w-5xl z-10"
      >
        <div 
          onMouseMove={handleMouseMove}
          className={`grid grid-cols-1 md:grid-cols-2 rounded-[2.5rem] overflow-hidden border shadow-[0_0_80px_-20px_rgba(0,180,255,0.2)] ${
            darkMode ? "border-white/10 bg-slate-900/40" : "border-black/5 bg-white/80"
          } backdrop-blur-3xl transition-all duration-500 relative group`}
        >
          
          {/* Left: Form Section */}
          <div className="p-8 sm:p-12 flex flex-col justify-center relative bg-inherit rounded-[2.5rem] z-40">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                {t("auth.loginTitle", lang)}
              </h1>
              <p className="text-muted-foreground mb-8 font-medium">
                {t("home.badge", lang)}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mb-6 rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                if (!canSubmit) {
                  e.preventDefault();
                  setError(!isEmailValid ? t("auth.invalidEmail", lang) : t("auth.required", lang));
                  return;
                }
                void handleSubmit(e);
              }}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="space-y-4">
                <IconInput
                  icon={Mail}
                  darkMode={darkMode}
                  surface="auth"
                  type="email"
                  placeholder={t("auth.email", lang)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 transition-all duration-300"
                />
                <PasswordField
                  icon={Lock}
                  darkMode={darkMode}
                  surface="auth"
                  placeholder={t("auth.password", lang)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold transition-all duration-500 group overflow-hidden relative"
                disabled={!canSubmit}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : t("auth.logIn", lang)}
                  {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />}
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ width: '200%' }}
                />
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 py-1 rounded-full border border-white/10 bg-[#020617] text-gray-400 font-bold tracking-widest">
                  {t("auth.or", lang)}
                </span>
              </div>
            </div>

            <GoogleSignInButton 
              className="h-14 rounded-2xl border-white/10 hover:bg-white/5 hover:border-cyan-500/50 transition-all duration-500"
              disabled={isSubmitting || googleLoading} 
              onClick={() => void handleGoogle()}
            >
              {googleLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              {googleLoading ? t("auth.continuing", lang) : t("auth.continueGoogle", lang)}
            </GoogleSignInButton>

            <div className="mt-8 space-y-3 text-center">
              <Link href="/forgot-password" 
                className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors hover:underline underline-offset-4">
                {t("auth.forgotPassword", lang)}
              </Link>
              <p className="text-sm text-gray-500">
                {t("auth.noAccount", lang)}{" "}
                <Link href="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                  {t("auth.signupLink", lang)}
                </Link>
              </p>
            </div>
          </div>

          {/*  Robot Section  */}
          <div className="relative hidden md:flex items-center justify-center bg-transparent overflow-hidden perspective-1200 min-h-[320px]">
            
            <motion.div 
               style={{ 
                 opacity: lightOpacity, 
                 scale: lightScale,
                 rotateX, rotateY
               }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-radial from-cyan-500/30 via-blue-600/10 to-transparent blur-[100px] pointer-events-none z-10" 
            />

            <motion.div 
               style={{ rotateX, rotateY }}
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute w-[80%] h-[80%] border border-cyan-500/20 rounded-full blur-[2px] z-10 pointer-events-none"
            />
            
            <motion.div
              style={{ 
                rotateX, 
                rotateY,
                transformStyle: "preserve-3d" 
              }}
              className="relative w-full h-full flex items-center justify-center z-20"
            >
              <motion.img
                src={robot}
                alt="AI Robot"
                loading="lazy"
                decoding="async"
                initial={{ y: 0, filter: "drop-shadow(0 0 0px rgba(0,255,255,0))" }}
                animate={{ 
                  y: [0, -30, 0],
                }}
                whileHover={{ 
                  scale: 1.08,
                  filter: "drop-shadow(0 0 30px rgba(34,211,238,0.6)) brightness(1.1)",
                }}
                transition={{ 
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 200 },
                  filter: { duration: 0.3 }
                }}
                className="
                  absolute 
                  right-[-75%] 
                  top-[12%]
                  w-[250%] 
                  max-w-none 
                  scale-[2.5]
                  object-contain 
                  z-20
                  pointer-events-auto
                  drop-shadow-[0_10px_40px_rgba(0,180,255,0.4)]
                "
              />

              <motion.div 
                animate={{ 
                  scale: [1, 0.7, 1],
                  opacity: [0.4, 0.1, 0.4]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[10%] right-[-20%] w-[160%] h-[50px] bg-cyan-900/40 blur-3xl rounded-[100%] z-10"
              />
            </motion.div>
            
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
         {particles.map((particle) => (
        <motion.div
          key={particle.id}
            className="absolute w-[2px] h-[2px] bg-cyan-400 rounded-full"
        animate={{
           y: [0, -250],
           x: [0, particle.xMove],
           opacity: [0, 1, 0],
           scale: [0, 2, 0],
             }}
         transition={{
         duration: particle.duration,
         repeat: Infinity,
         delay: particle.delay,
         ease: "easeOut",
           }}
         style={{
          left: `${particle.left}%`,
          bottom: "20%",
          boxShadow: "0 0 8px #22d3ee",
          }}
          />

          ))}
            </div>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes star-move {
          from { background-position: 0 0; }
          to { background-position: -200px -200px; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        .animate-star-move {
          animation: star-move 60s linear infinite;
        }
        .perspective-1200 {
          perspective: 1200px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
        }
      `}} />
    </div>
  );
}