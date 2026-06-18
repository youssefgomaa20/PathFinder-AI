import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save, Sparkles, ArrowRightLeft, Target, ShieldCheck, Zap, TrendingUp, DollarSign, Brain, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";
import { useToast } from "@/hooks/use-toast.js";

type StatColorType = "purple" | "emerald" | "orange" | "cyan";

type ComparisonResult = {
  career1: string;
  career2: string;
  comparison: {
    overview: { career1: string; career2: string };
    difficulty: { career1: string; career2: string };
    requiredLanguages: { career1: string[]; career2: string[] };
    frameworks: { career1: string[]; career2: string[] };
    salaryRange: { career1: string; career2: string };
    demand: { career1: string; career2: string };
    remoteOpportunities: { career1: string; career2: string };
    timeToLearn: { career1: string; career2: string };
    personalityType: { career1: string; career2: string };
    futureGrowth: { career1: string; career2: string };
    aiRisk: { career1: string; career2: string };
    freelancePotential: { career1: string; career2: string };
    recommendedForBeginners: { career1: string; career2: string };
    prosCons: {
        career1: { pros: string[]; cons: string[] };
        career2: { pros: string[]; cons: string[] };
    };
    finalRecommendation: string;
    verdict?: string;
  };
};

export default function Compare() {
  const { lang } = useLanguage();
  const { theme } = useAppState();
  const { toast } = useToast();
  const currentCompare = useAppState(s => s.currentCompare);
  const setCurrentCompare = useAppState(s => s.setCurrentCompare);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  const [career1, setCareer1] = useState(currentCompare?.career1 || "");
  const [career2, setCareer2] = useState(currentCompare?.career2 || "");
  const [result, setResult] = useState<ComparisonResult | null>(
    currentCompare 
      ? (currentCompare.comparison 
          ? currentCompare 
          : { career1: currentCompare.career1 || "Track 1", career2: currentCompare.career2 || "Track 2", comparison: currentCompare })
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setCurrentCompare(null);
    };
  }, [setCurrentCompare]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!career1 || !career2) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch(apiUrl("/api/pathfinder/compare-careers"), {
        method: "POST",
        body: JSON.stringify({ track1: career1, track2: career2, language: lang }),
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      const rawData = await res.json();
      
      const formattedData: ComparisonResult = {
        career1,
        career2,
        comparison: rawData.result || rawData
      };
      
      setResult(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("compare.errorFail", lang));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const payload = {
        careerTitle: `${result.career1} vs ${result.career2}`,
        roadmapData: JSON.stringify(result),
        type: "compare"
      };
      const res = await apiFetch(apiUrl("/api/pathfinder/saved-roadmaps"), {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      toast({
        title: "Comparison Saved",
        description: "You can view it in your Saved Roadmaps.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save comparison.";
      toast({ title: "Save Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const data = result?.comparison;

  return (
    <div className={`page-shell min-h-screen py-8 sm:py-12 px-4 sm:px-6 transition-all duration-700
      ${theme === "dark" ? "bg-[#030712] text-white" : "bg-[#fcfcfd] text-[#1a1a1a]"}
    `}>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-4 border border-blue-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{t("compare.aiPowered", lang || "AI Analysis Engine")}</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10 fill-current" />
            </motion.div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              {t("compare.title", lang)}
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            {t("compare.subtitle", lang)}
          </p>
        </motion.div>

        <form onSubmit={handleCompare} className="mb-20">
          <motion.div 
            whileHover={{ y: -5 }}
            className={`
              relative p-6 md:p-10 rounded-[2.5rem]
              backdrop-blur-3xl border transition-all duration-500
              ${theme === "dark"
                ? "bg-white/5 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                : "bg-white border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
              }
            `}
          >
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center relative min-w-0">
              <div className="space-y-3">
                <label className="text-sm font-bold ml-2 text-sky-500 uppercase tracking-widest">Career 1</label>
                <div className="relative group">
                  <input
                    value={career1}
                    onChange={e => setCareer1(e.target.value)}
                    placeholder="e.g. UI/UX Designer"
                    className={`
                      w-full h-16 pl-14 pr-6 rounded-2xl
                      border-2 transition-all outline-none text-lg
                      ${theme === "dark"
                        ? "bg-black/20 border-white/5 focus:border-sky-500/50 focus:bg-black/40 text-white"
                        : "bg-white border-black/5 focus:border-sky-500/30 focus:shadow-inner"
                      }
                    `}
                  />
                  <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-sky-500 group-focus-within:drop-shadow-[0_0_12px_rgba(14,165,233,1)] transition-all" />
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <button
                  type="button"
                  onClick={() => { setCareer1(career2); setCareer2(career1); }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:rotate-180 transition-all duration-500 flex items-center justify-center active:scale-90"
                >
                  <ArrowRightLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold ml-2 text-blue-400 uppercase tracking-widest">Career 2</label>
                <div className="relative group">
                  <input
                    value={career2}
                    onChange={e => setCareer2(e.target.value)}
                    placeholder="e.g. Backend Engineer"
                    className={`
                      w-full h-16 pl-14 pr-6 rounded-2xl
                      border-2 transition-all outline-none text-lg
                      ${theme === "dark"
                        ? "bg-black/20 border-white/5 focus:border-blue-400/50 focus:bg-black/40 text-white"
                        : "bg-white border-black/5 focus:border-blue-400/30 focus:shadow-inner"
                      }
                    `}
                  />
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 group-focus-within:drop-shadow-[0_0_12px_rgba(96,165,250,1)] transition-all" />
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Button
                type="submit"
                disabled={isLoading || !career1 || !career2}
                className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-base sm:text-lg font-bold shadow-[0_10px_20px_rgba(37,99,235,0.4)] hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "Start Deep Comparison"}
              </Button>
            </div>
          </motion.div>
        </form>

        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex justify-end sticky top-4 z-50 pointer-events-none">
                 <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="pointer-events-auto rounded-full px-8 py-6 bg-white dark:bg-slate-900 border border-blue-500/20 shadow-2xl hover:scale-105 transition-all text-current font-bold gap-3"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-blue-500" />}
                  Save Comparison Result
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                {/*  Career 1 */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                  className={`p-8 md:p-12 space-y-10 transition-all duration-500 
                    hover:shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] 
                    border-r border-white/5
                    ${theme === 'dark' ? 'bg-[#0a0f1d]' : 'bg-[#0f172a]'}`}
                >
                  <motion.div variants={itemVariants} className="space-y-2 border-b-4 border-sky-500 pb-8 group">
                    <span className="inline-block text-sky-400 font-black tracking-widest text-xs uppercase bg-sky-500/10 px-3 py-1 rounded-md mb-2">Career 1</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase break-words leading-tight transition-transform duration-300 group-hover:translate-x-2">
                      {result?.career1}
                    </h2>
                  </motion.div>

                  <motion.div variants={itemVariants} className="transform transition-all hover:scale-[1.02]">
                    <SectionCard title="Core Overview" color="sky" content={data.overview.career1} icon={<Zap className="text-yellow-400 w-6 h-6 fill-yellow-400/20" />} />
                  </motion.div>
                  
                  <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Complexity", value: data.difficulty.career1, sub: "Learning Curve", icon: <Brain />, colorType: "purple" },
                        { label: "Salary Avg", value: data.salaryRange.career1, sub: "Yearly Est.", icon: <DollarSign />, colorType: "emerald" },
                        { label: "Market Demand", value: data.demand.career1, sub: "Job Openings", icon: <Briefcase />, colorType: "orange" },
                        { label: "Future Growth", value: data.futureGrowth.career1, sub: "10yr Outlook", icon: <TrendingUp />, colorType: "cyan" }
                      ].map((stat, i) => (
                        <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02, translateX: 5 }} className="cursor-pointer rounded-2xl">
                          <StatBox {...stat} colorType={stat.colorType as StatColorType} />
                        </motion.div>
                      ))}
                  </div>

                  <motion.div variants={itemVariants} className="hover:bg-white/5 p-4 rounded-xl transition-colors">
                    <TechStack title="Technology & Ecosystem" color="sky" languages={data.requiredLanguages.career1} frameworks={data.frameworks.career1} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <h4 className="text-sm font-bold text-sky-400 uppercase tracking-widest border-l-2 border-sky-500 pl-3">Pros & Cons</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.prosCons.career1.pros.map(p => <Badge key={p} text={p} type="pro" />)}
                        {data.prosCons.career1.cons.map(c => <Badge key={c} text={c} type="con" />)}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Career 2 */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                  className={`p-8 md:p-12 space-y-10 transition-all duration-500 
                    hover:shadow-[inset_0_0_60px_rgba(37,99,235,0.15)] 
                    border-l border-white/5
                    ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-[#111827]'}`} 
                >
                  <motion.div variants={itemVariants} className="space-y-2 border-b-4 border-blue-600 pb-8 lg:text-right group">
                    <span className="inline-block text-blue-400 font-black tracking-widest text-xs uppercase bg-blue-600/10 px-3 py-1 rounded-md mb-2">Career 2</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase break-words leading-tight transition-transform duration-300 group-hover:-translate-x-2">
                      {result?.career2}
                    </h2>
                  </motion.div>

                  <motion.div variants={itemVariants} className="transform transition-all hover:scale-[1.02]">
                    <SectionCard title="Core Overview" color="blue" content={data.overview.career2} icon={<Zap className="text-yellow-400 w-6 h-6 fill-yellow-400/20" />} />
                  </motion.div>
                  
                  <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Complexity", value: data.difficulty.career2, sub: "Learning Curve", icon: <Brain />, colorType: "purple" },
                        { label: "Salary Avg", value: data.salaryRange.career2, sub: "Yearly Est.", icon: <DollarSign />, colorType: "emerald" },
                        { label: "Market Demand", value: data.demand.career2, sub: "Job Openings", icon: <Briefcase />, colorType: "orange" },
                        { label: "Future Growth", value: data.futureGrowth.career2, sub: "10yr Outlook", icon: <TrendingUp />, colorType: "cyan" }
                      ].map((stat, i) => (
                        <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02, translateX: -5 }} className="cursor-pointer rounded-2xl">
                          <StatBox {...stat} colorType={stat.colorType as StatColorType} />
                        </motion.div>
                      ))}
                  </div>

                  <motion.div variants={itemVariants} className="hover:bg-white/5 p-4 rounded-xl transition-colors">
                    <TechStack title="Technology & Ecosystem" color="blue" languages={data.requiredLanguages.career2} frameworks={data.frameworks.career2} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest border-r-2 border-blue-600 pr-3 lg:text-right">Pros & Cons</h4>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {data.prosCons.career2.pros.map(p => <Badge key={p} text={p} type="pro" />)}
                        {data.prosCons.career2.cons.map(c => <Badge key={c} text={c} type="con" />)}
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Verdict Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="relative p-[1.5px] bg-gradient-to-r from-sky-400 via-blue-600 to-blue-900 rounded-3xl shadow-2xl w-[98%] max-w-7xl mx-auto overflow-hidden group transition-all duration-500"
              >
                <div className={`relative px-6 py-6 md:py-8 rounded-[calc(1.5rem+6px)] bg-slate-950 backdrop-blur-2xl`}>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                      <Sparkles className="w-7 h-7 text-blue-400 fill-blue-400/20" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent italic tracking-tight mb-2">"The Final Verdict"</h3>
                      <p className="text-base md:text-lg font-bold leading-relaxed text-white opacity-100">{data?.finalRecommendation || data?.verdict}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components
function SectionCard({ 
  title, 
  content, 
  icon, 
  color 
}: { 
  title: string, 
  content: string, 
  icon: React.ReactNode, 
  color: string 
}) {
  const isSky = color === "sky";

  return (
    <div
      className={`
        group relative overflow-hidden rounded-3xl p-6 border transition-all duration-500
        backdrop-blur-xl
        ${
          isSky
            ? `
              border-sky-500/10 bg-sky-500/[0.03]
              hover:border-sky-400/40
              hover:shadow-[0_0_35px_rgba(14,165,233,0.35)]
            `
            : `
              border-blue-500/10 bg-blue-500/[0.03]
              hover:border-blue-400/40
              hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]
            `
        }
      `}
    >
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl
          ${isSky ? "bg-sky-500/10" : "bg-blue-500/10"}
        `}
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`
              p-3 rounded-2xl transition-all duration-500
              ${
                isSky
                  ? `
                    bg-sky-500/10 text-sky-400
                    group-hover:bg-sky-500/20
                    group-hover:shadow-[0_0_20px_rgba(14,165,233,0.7)]
                    group-hover:scale-110
                  `
                  : `
                    bg-blue-500/10 text-blue-400
                    group-hover:bg-blue-500/20
                    group-hover:shadow-[0_0_20px_rgba(59,130,246,0.7)]
                    group-hover:scale-110
                  `
              }
            `}
          >
            {icon}
          </div>

          <h4
            className={`
              text-xl font-black uppercase tracking-tight transition-all duration-500
              ${
                isSky
                  ? `
                    text-sky-400
                    group-hover:text-sky-300
                    group-hover:drop-shadow-[0_0_12px_rgba(14,165,233,1)]
                  `
                  : `
                    text-blue-400
                    group-hover:text-blue-300
                    group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,1)]
                  `
              }
            `}
          >
            {title}
          </h4>
        </div>

        <p className="text-lg leading-relaxed font-bold text-white/80 transition-all duration-500 group-hover:text-white">
          {content}
        </p>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  icon,
  colorType
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactElement<{ className?: string }>;
  colorType: StatColorType;
})
{
  
  const colorMap = {
    purple: {
      text: "text-purple-400",
      borderHover: "hover:border-purple-500/50",
      shadowHover: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      dropShadow: "group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,1)]",
      bgGlow: "bg-purple-500/5"
    },
    emerald: {
      text: "text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      shadowHover: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      dropShadow: "group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,1)]",
      bgGlow: "bg-emerald-500/5"
    },
    orange: {
      text: "text-orange-400",
      borderHover: "hover:border-orange-500/50",
      shadowHover: "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      dropShadow: "group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,1)]",
      bgGlow: "bg-orange-500/5"
    },
    cyan: {
      text: "text-cyan-400",
      borderHover: "hover:border-cyan-500/50",
      shadowHover: "hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
      dropShadow: "group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,1)]",
      bgGlow: "bg-cyan-500/5"
    }
  };

  const activeColor = colorMap[colorType];

  return (
    <div className={`
      flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-500
      bg-slate-900/40 border-white/5 relative overflow-hidden group
      ${activeColor.borderHover} ${activeColor.shadowHover}
    `}>
      
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl ${activeColor.bgGlow}`} />

      <div className={`
        relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
        bg-white/5 shadow-[0_0_10px_rgba(0,0,0,0.2)]
        ${activeColor.text} group-hover:bg-white/10 group-hover:scale-110 ${activeColor.dropShadow}
      `}>
        {React.cloneElement(icon, {
          className: `w-6 h-6 transition-all duration-500 group-hover:animate-pulse`
        })}
      </div>
      
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-[11px] font-black uppercase tracking-widest transition-all duration-500 
            ${activeColor.text} group-hover:scale-105
          `}>
            {label}
          </p>
          <p className="text-[10px] font-bold text-white/20 truncate hidden sm:block">{sub}</p>
        </div>
        <p className="text-xl font-black tracking-tight text-white transition-all">
          {value}
        </p>
      </div>
    </div>
  );
}

function TechStack({ title, languages, frameworks, color }: { title: string, languages: string[], frameworks: string[], color: string }) {
  const isSky = color === 'sky';
  const titleColor = isSky ? 'text-sky-400' : 'text-blue-400';
  return (
    <div className="space-y-5">
      <h4 className={`text-sm font-bold uppercase tracking-widest ${titleColor}`}>{title}</h4>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {languages.map(l => (
            <span key={l} className={`px-4 py-2 rounded-xl text-xs font-black shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all hover:scale-110 hover:shadow-lg ${isSky ? 'bg-sky-600 text-white shadow-sky-500/20' : 'bg-blue-700 text-white shadow-blue-500/20'}`}>
              {l}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {frameworks.map(f => (
            <span key={f} className={`px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors ${isSky ? 'hover:border-sky-400/50 hover:bg-sky-400/10' : 'hover:border-blue-400/50 hover:bg-blue-400/10'}`}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Badge({ text, type }: { text: string, type: 'pro' | 'con' }) {
  return (
    <motion.span 
      whileHover={{ scale: 1.05, boxShadow: type === 'pro' ? "0 0 15px rgba(16,185,129,0.4)" : "0 0 15px rgba(244,63,94,0.4)" }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 rounded-xl text-[12px] font-bold border-2 transition-all shadow-sm ${
      type === 'pro' 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    }`}>
      {type === 'pro' ? '✓' : '✕'} {text}
    </motion.span>
  );
}