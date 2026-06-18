import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Compass } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { HomeUniversalAssistant } from "@/components/HomeUniversalAssistant.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { isRtl, t } from "@/lib/i18n.js";
import heroBg from "@/assets/hero-bg.png";

export default function Home() {
  const { lang } = useLanguage();
  const rtl = isRtl(lang);

  return (
    <>
      <div className="page-shell min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Background Image */}
<div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-20 dark:opacity-40 mix-blend-overlay"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#020617]/60 to-[#020617]" />
        </div>
        <div className="container px-4 mx-auto text-center z-10 max-w-4xl mt-4">
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ 
    scale: 1.05, 
    backgroundColor: "rgba(var(--primary-rgb), 0.15)",
    borderColor: "rgba(var(--primary-rgb), 0.4)" 
  }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 cursor-default overflow-hidden transition-colors duration-300 shadow-sm hover:shadow-primary/20"
>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />

  <motion.div
    animate={{ 
      rotate: [0, 15, -15, 0],
      scale: [1, 1.2, 1.2, 1]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    <Sparkles className="w-4 h-4 fill-primary/20" />
  </motion.div>

  <span className="relative z-10 text-sm font-semibold tracking-wide uppercase">
    {t("home.badge", lang)}
  </span>

</motion.div>
          {/* Hero Title */}
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
  className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight mt-4"
>
<motion.span 
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="text-black dark:text-white font-bold block pt-4 drop-shadow-sm"
  >
    Discover Your Perfect
  </motion.span>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300 glow-primary block mt-8">
    Path Career
  </span>
</motion.h1>
<motion.p
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.8, 
    delay: 0.3, 
    ease: [0.21, 0.47, 0.32, 0.98] // Cubic-bezier لحركة أكثر سلاسة
  }}
  className="text-lg md:text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white mb-12 max-w-3xl mx-auto leading-relaxed pt-6 px-4 text-center"
>
  {t("home.subtitle", lang)}
</motion.p>
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
  className="flex flex-col sm:flex-row items-center justify-center gap-6  mb-4"
>
  <Link href="/chat" className="w-full sm:w-auto">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        size="lg" 
        className="relative w-full sm:w-auto text-lg rounded-full px-8 py-6 h-auto font-semibold overflow-hidden group bg-primary hover:ring-4 hover:ring-primary/30 transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        
        <span className="relative flex items-center">
          {t("home.startBtn", lang)}
          <ArrowRight
            className={`ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5 ${
              rtl ? "rotate-180 group-hover:-translate-x-1.5 ml-0 mr-2" : ""
            }`}
          />
        </span>
      </Button>
    </motion.div>
  </Link>

  {/* Explore Careers */}
  <Link href="/compare" className="w-full sm:w-auto">
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full sm:w-auto text-lg rounded-full px-8 py-6 h-auto border-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-300 dark:text-white backdrop-blur-sm"
      >
        {t("home.exploreCareers", lang)}
      </Button>
    </motion.div>
  </Link>
</motion.div>


          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left pt-4 mb-10"
          >
            <Link href="/saved">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="cursor-pointer p-6 rounded-3xl transition-colors duration-500 bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-100 hover:shadow-[0_0_20px_#0ff]"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6 text-primary dark:text-cyan-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("home.card1Title", lang)}</h3>
                <p className="text-sm">{t("home.card1Desc", lang)}</p>
              </motion.div>
            </Link>

            <Link href="/resume">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="cursor-pointer p-6 rounded-3xl transition-colors duration-500 bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-100 hover:shadow-[0_0_20px_#a0f]"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-400 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("home.card2Title", lang)}</h3>
                <p className="text-sm">{t("home.card2Desc", lang)}</p>
              </motion.div>
            </Link>

            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="cursor-pointer p-6 rounded-3xl transition-colors duration-500 bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-100 hover:shadow-[0_0_20px_#0f0]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400 dark:text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("home.card3Title", lang)}</h3>
                <p className="text-sm">{t("home.card3Desc", lang)}</p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Universal AI Assistant Widget - Home Page Only */}
      <HomeUniversalAssistant />
    </>
  );
}
