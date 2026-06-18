import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import { User, Mail, Sparkles, Zap, Lock } from "lucide-react";
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
import type React from "react";

const GOOGLE_REDIRECT_PENDING = "google_redirect_pending";

export default function SignUpPage() {
  useAppState();
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  //  Logic for Robot
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isNameValid = name.trim().length >= 2;
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isNameValid && isEmailValid && isPasswordValid && passwordsMatch && !isSubmitting && !googleLoading;
  const lightOpacity = useMotionValue(0.6);
  const lightScale = useMotionValue(1);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await apiFetch(apiUrl("/auth/signup"), {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        })
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
      const gName = result.user.displayName ?? gEmail?.split("@")[0] ?? "User";
      if (!gEmail) {
        setError(t("auth.googleNoEmail", lang));
        return;
      }
      setSessionUid(result.user.uid);
      const res = await apiFetch(apiUrl("/auth/google"), {
        method: "POST",
        body: JSON.stringify({ email: gEmail, name: gName })
      });
      if (!res.ok) {
        setError(await readApiErrorMessage(res));
        return;
      }
      const data = (await res.json()) as { token: string; user: AuthUser };
      setAuthSession(data.token, data.user);
      setLocation("/");
    } catch (err) {
      const e = err as { code?: string };
      if (e?.code === "auth/popup-blocked") {
        try { sessionStorage.setItem(GOOGLE_REDIRECT_PENDING, "1"); } catch { /* empty */ }
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
      try { return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING) === "1"; } catch { return false; }
    })();
    if (!pending) return;
    const auth = getFirebaseAuth();
    void (async () => {
      setGoogleLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;
        const gEmail = result.user.email;
        const gName = result.user.displayName ?? gEmail?.split("@")[0] ?? "User";
        if (!gEmail) {
          setError(t("auth.googleNoEmail", lang));
          return;
        }
        setSessionUid(result.user.uid);
        const res = await apiFetch(apiUrl("/auth/google"), {
          method: "POST",
          body: JSON.stringify({ email: gEmail, name: gName })
        });
        if (!res.ok) {
          setError(await readApiErrorMessage(res));
          return;
        }
        const data = (await res.json()) as { token: string; user: AuthUser };
        setAuthSession(data.token, data.user);
        setLocation("/");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("auth.googleFail", lang));
      } finally {
        try { sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING); } catch { /* empty */ }
        setGoogleLoading(false);
      }
    })();
  }, [lang, setLocation]);
const [particles] = useState(() =>
  Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    xMove: (Math.random() - 0.5) * 100,
    duration: 3 + Math.random() * 3,
    delay: Math.random() * 2,
    size: Math.random() * 3 + 1,
  }))
);
const [stars] = useState(() =>
  Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    width: Math.random() * 2 + 1,
    height: Math.random() * 2 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
  }))
);
  return (
    <div 
      onMouseMove={handleMouseMove}
      className="page-shell min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#020617]"
    >
  <div className="absolute inset-0 z-0 pointer-events-none">
{stars.map((s) => (
<motion.div
              key={s.id}
              className="absolute bg-white rounded-full"
              style={{
                width: s.width,
                height: s.height,
                left: `${s.left}%`,
                top: `${s.top}%`,
                x,
                y,
                boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.3)", // توهج خفيف
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeInOut",
              }}
             />
          ))}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] backdrop-blur-2xl bg-slate-950/40">
          
          <div className="p-8 sm:p-12 flex flex-col justify-center relative bg-white/[0.02] z-30 pointer-events-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <span className="inline-block py-1 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
                {t("auth.signUp", lang)}
              </span>
          <h1 className="
           text-4xl sm:text-5xl font-black tracking-tighter
           bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600
           bg-clip-text text-transparent
           animate-pulse">

                {t("auth.signupTitle", lang)}
              </h1>
              <p className="text-blue-100/40 mb-8 flex items-center gap-3 text-lg">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                {t("home.subtitle", lang)}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <IconInput 
                  icon={User} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={t("auth.name", lang)} 
                  className="h-14 bg-white/[0.05] border-white/10 rounded-xl focus:border-cyan-500/50 transition-all text-white placeholder:text-white/20" 
                  darkMode={true} 
                />
                <IconInput 
                icon={Mail} 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder={t("auth.email", lang)} 
        type="email" 
        className="h-14 w-full bg-white/[0.07] border-white/10 rounded-2xl 
                   focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10
                   hover:bg-white/[0.12] transition-all duration-300
                   text-white placeholder:text-white/30 backdrop-blur-md" 
               darkMode={true}/>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PasswordField 
                    icon={Lock} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={t("auth.password", lang)} 
                     className="h-14 bg-white/[0.07] border-white/10 rounded-2xl 
                     focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10
                     hover:bg-white/[0.12] transition-all duration-300 backdrop-blur-md" 
                    darkMode={true}/>
                  <PasswordField 
                  icon={Lock} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                 placeholder={t("auth.confirmPassword", lang)} 
                 className="h-14 bg-white/[0.07] border-white/10 rounded-2xl 
                 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10
                 hover:bg-white/[0.12] transition-all duration-300 backdrop-blur-md" 
                   darkMode={true}/>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(37,99,235,0.9)" }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={!canSubmit} 
                className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-900/20 transition-all">
                {isSubmitting ? <Zap className="w-5 h-5 animate-spin" /> : t("auth.signUp", lang)}
              </motion.button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <span className="relative px-4 bg-slate-950/20 text-[10px] uppercase tracking-widest text-white/30 mx-auto block w-fit">
                {t("auth.or", lang)}
              </span>
            </div>

            <GoogleSignInButton 
              disabled={isSubmitting || googleLoading} 
              onClick={() => void handleGoogle()} 
              className="h-14 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all text-white font-medium"
            >
              {googleLoading ? t("auth.continuing", lang) : t("auth.continueGoogle", lang)}
            </GoogleSignInButton>

            <p className="text-center mt-8 text-white/40 text-sm">
              {t("auth.haveAccount", lang)}{" "}
              <Link href="/login" className="text-cyan-400 font-bold hover:text-white transition-colors underline underline-offset-4">
                {t("auth.loginLink", lang)}
              </Link>
            </p>
          </div>

          <div className="relative hidden md:flex items-center justify-center bg-transparent overflow-hidden perspective-1200 min-h-[320px]">
            
            {/* Dynamic Blue Ambient Aura */}
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
                  right-[-45%] 
                  top-[10%]
                  w-[200%] 
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
          opacity: [0.4, 0.2, 0.4],
          y: [0, -10, 0], 
        }}
        whileHover={{
          scale: 1.2, 
          opacity: 0.8,
          backgroundColor: "rgba(22, 78, 99, 0.6)", 
          filter: "blur(40px)", 
        }}
        transition={{
          
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] right-[-20%] w-[160%] h-[50px] bg-cyan-900/40 blur-3xl rounded-[100%] z-10"
      />

      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[10%] right-[-10%] w-[140%] h-[40px] bg-cyan-500/20 blur-2xl rounded-[100%] z-0"
      />
    </motion.div>
     <div className="absolute inset-0 overflow-hidden pointer-events-none z-30 group">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            y: [0, -150, -300],
            x: [0, particle.xMove * 0.5, particle.xMove],
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360], 
          }}
          
          whileHover={{
            scale: 3,
            backgroundColor: "#22d3ee", 
            transition: { duration: 0.2 }
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          style={{
            left: `${particle.left}%`,
            bottom: "10%",
            width: particle.size || "3px", 
            height: particle.size || "3px",
            boxShadow: "0 0 12px 2px rgba(34, 211, 238, 0.6)",
            filter: "blur(0.5px)", 
          }}/>
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