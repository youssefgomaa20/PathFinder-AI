import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Globe,
  Compass,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAppState } from "../hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { Button } from "@/components/ui/button.js";
import { clearAuthSession, getStoredUser, getToken, getUserScopedData, type AuthUser } from "@/lib/auth.js";
import { resolveMediaUrl } from "@/lib/http.js";

export function Header() {
  const { theme, setTheme } = useAppState();
  const { lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? getStoredUser() : null));
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    const sync = () => {
      setUser(getToken() ? getStoredUser() : null);
      const stored = getStoredUser();
      const img =
        getUserScopedData()?.profileImage ??
        resolveMediaUrl(stored?.photoUrl ?? "") ??
        "";
      setProfileImage(img);
    };
    sync();
    window.addEventListener("pathfinder-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pathfinder-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setUserOpen(false);
    setLocation("/login");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "";

  const navLinks = [
    { key: "home", path: "/" },
    { key: "about", path: "/about" },
    { key: "compare", path: "/compare" },
    { key: "resume", path: "/resume" },
    { key: "chat", path: "/chat" },
    { key: "saved", path: "/saved" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${
        theme === "dark"
          ? "border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-black/5 bg-slate-50/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
      }`}
    >
      {/* الخط المتحرك اللامع في نهاية الهيدر */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
        <motion.div 
          className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between py-2 sm:py-3 min-w-0 gap-2">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group overflow-hidden min-w-0 shrink">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <Compass
              className={`w-9 h-9 transition-colors ${
                theme === "light" ? "text-blue-600" : "text-blue-500"
              }`}
            />
          </motion.div>
          <span className={`font-black text-lg sm:text-2xl tracking-tighter transition-colors truncate ${
            theme === "light" ? "text-black" : "text-white"
          }`}>
            PathFinder <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ key, path }) => {
              const isActive = location === path;
              return (
                <Link key={key} href={path}>
                  <div className={`relative px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 group ${
                    isActive 
                      ? (theme === "dark" ? "bg-white/10" : "bg-black/5") 
                      : (theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5")
                  }`}>
                    <span className={`text-sm font-bold transition-colors relative z-10 ${
                      isActive
                        ? "text-blue-500"
                        : (theme === "light" ? "text-black group-hover:text-blue-600" : "text-white group-hover:text-blue-400")
                    }`}>
                      {t(`nav.${key}`, lang)}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-blue-500/15 rounded-full border border-blue-500/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className={`rounded-full transition-all duration-300 ${
               theme === "dark" ? "text-white hover:bg-blue-500/20 hover:text-blue-400" : "text-black hover:bg-blue-500/10 hover:text-blue-600"
            }`}
          >
            <Globe className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: 10, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -10, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-black" />}
              </motion.div>
            </AnimatePresence>
          </Button>

          {/* User Menu */}
          <div ref={userMenuRef} className="relative ml-1 sm:ml-2 border-l pl-2 sm:pl-4 border-slate-300 dark:border-slate-700">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 group outline-none"
            >
              <div className="relative">
                <img
                  src={profileImage || "/default-profile.png"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-transparent group-hover:ring-blue-500 transition-all object-cover shadow-lg"
                  alt="Profile"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {user && (
                <div className="hidden md:flex items-center gap-1">
                  <span className={`text-sm font-bold truncate max-w-[72px] sm:max-w-[100px] ${theme === "light" ? "text-black" : "text-white"}`}>
                    {displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${userOpen ? "rotate-180" : ""} ${theme === "light" ? "text-black" : "text-white"}`} />
                </div>
              )}
            </motion.button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                  className={`absolute right-0 mt-4 w-60 rounded-2xl shadow-2xl border overflow-hidden z-[60] ${
                    theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-black/5"
                  }`}
                >
                  <div className="p-2">
                    {user ? (
                      <>
                        <Link href="/profile" onClick={() => setUserOpen(false)}>
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${theme === "dark" ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"}`}>
                            <UserIcon className="w-4 h-4 group-hover:text-blue-500" />
                            <span className="text-sm font-bold">{t("nav.profile", lang)}</span>
                          </div>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-bold">{t("nav.logout", lang)}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setUserOpen(false)}>
                          <div className={`px-4 py-3 rounded-xl transition-colors font-bold text-sm ${theme === "dark" ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"}`}>
                            {t("nav.login", lang)}
                          </div>
                        </Link>
                        <Link href="/signup" onClick={() => setUserOpen(false)}>
                          <div className={`px-4 py-3 rounded-xl transition-colors font-bold text-sm ${theme === "dark" ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"}`}>
                            {t("nav.signup", lang)}
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`lg:hidden ml-1 ${theme === "dark" ? "text-white" : "text-black"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {menuOpen && user && (
          <motion.nav
            ref={mobileMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`lg:hidden overflow-hidden border-t ${
              theme === "dark" ? "bg-slate-900 border-white/5" : "bg-slate-50 border-black/5"
            }`}
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map(({ key, path }) => {
                const isActive = location === path;
                return (
                  <Link key={key} href={path} onClick={() => setMenuOpen(false)}>
                    <div className={`px-4 py-4 rounded-2xl font-black text-xl transition-all ${
                      isActive 
                        ? "bg-blue-500/10 text-blue-500 border-l-4 border-blue-500" 
                        : (theme === "dark" ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black")
                    }`}>
                      {t(`nav.${key}`, lang)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}