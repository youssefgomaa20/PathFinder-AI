import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Download, Share2, BookmarkPlus, 
  BookOpen, TrendingUp, Target, 
  ArrowRight, Sparkles, Lightbulb, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { useToast } from "@/hooks/use-toast.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";

export default function Results() {
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const roadmap = useAppState(s => s.currentRoadmap);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!roadmap && !isSaving) {
      setLocation("/");
    }
  }, [roadmap, isSaving, setLocation]);

  if (!roadmap && !isSaving) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 text-cyan-400/60">
        {t("results.redirecting", lang)}
      </div>
    );
  }

  if (!roadmap) return null;

  const handlePrint = () => window.print();

  const handleSave = async () => {
    if (!roadmap) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(apiUrl("/api/pathfinder/saved-roadmaps"), {
        method: "POST",
        body: JSON.stringify({
          careerTitle: roadmap.careerOverview?.split('.')[0] || "My Career Roadmap",
          roadmapData: JSON.stringify(roadmap),
          type: "roadmap"
        }),
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      toast({ title: t("common.success", lang), description: t("results.toastSavedDesc", lang) });
    } catch {
      toast({ title: t("common.error", lang), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl min-h-screen text-slate-100 selection:bg-cyan-500/30">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-16 no-print">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <div className="p-3 bg-cyan-500/20 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
            {t("results.title", lang)}
          </h1>
        </motion.div>
        
        <p className="text-slate-300 text-xl max-w-2xl mb-10 font-light italic leading-relaxed">
          {roadmap.careerOverview?.split('.')[0]}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="bg-white/5 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 text-white rounded-full px-6 transition-all duration-300 backdrop-blur-xl"
          >
            <Download className="w-4 h-4 mr-2 text-cyan-400" /> {t("results.download", lang)}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigator.share({ url: window.location.href }).catch(()=>null)} 
            className="bg-white/5 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 text-white rounded-full px-6 transition-all duration-300 backdrop-blur-xl"
          >
            <Share2 className="w-4 h-4 mr-2 text-cyan-400" /> {t("results.share", lang)}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-full px-8 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 border-none"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" /> 
            {isSaving ? t("common.loading", lang) : t("results.save", lang)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Career Overview  */}
          {roadmap?.careerOverview && (
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }}
              whileHover={{ boxShadow: "0 0 40px rgba(6,182,212,0.2)" }}
              className="relative p-8 rounded-[2rem] border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-3xl overflow-hidden group transition-all duration-500"
            >
              <div className="absolute top-0 right-0 opacity-10 -mt-8 -mr-8 group-hover:opacity-30 group-hover:text-cyan-400 transition-all duration-700 rotate-12">
                <Lightbulb className="w-64 h-64" />
              </div>
              
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 ring-1 ring-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">
                   Foundational Career Overview
                </h2>
              </div>
              <p className="relative z-10 text-white leading-relaxed text-lg font-normal tracking-wide">
                {roadmap.careerOverview}
              </p>
            </motion.div>
          )}

          {roadmap?.learningPlan && (
            <div className="relative py-10 overflow-hidden rounded-[3rem] bg-gradient-to-b from-blue-950/20 to-transparent border border-blue-500/10">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[pulse_8s_infinite]" />
              </div>

              <h2 className="relative z-10 text-3xl font-bold text-center mb-20 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">
                <TrendingUp className="text-cyan-400 w-8 h-8" />
                {t("results.plan", lang)}
              </h2>

              <div className="absolute left-1/2 top-32 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent -translate-x-1/2 hidden md:block z-10" />

              <div className="relative z-10 space-y-16">
                {roadmap.learningPlan.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center justify-center md:justify-between w-full ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="w-full md:w-[45%] group">
                      <div className="p-6 rounded-[1.5rem] bg-blue-950/40 border border-blue-500/30 hover:border-cyan-400 transition-all duration-500 hover:bg-blue-900/40 shadow-2xl backdrop-blur-md">
                        <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2 block">{step.duration}</span>
                        <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-500 transition-all duration-300">
                          {step.title}
                        </h3>
                        <p className="text-white text-sm leading-relaxed font-normal opacity-100 transition-opacity">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex-col items-center justify-center z-10 hidden md:flex">
                      <div className="w-12 h-12 rounded-full bg-[#030712] border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform">
                        <span className="text-cyan-400 font-black">{idx + 1}</span>
                      </div>
                    </div>

                    <div className="hidden md:block w-[45%]" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Skills */}
          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">
              <Target className="w-5 h-5 text-cyan-400"/> {t("results.skills", lang)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {roadmap?.skillsToLearn?.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-white rounded-lg text-xs font-medium hover:bg-blue-600 hover:text-white transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Salary Card */}
          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-blue-500/10">
            <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">
              {t("results.salary", lang)}
            </h3>
            <div className="space-y-3">
              {[
                { label: t("common.junior", lang), value: roadmap.salaryExpectations?.junior, color: "text-slate-200" },
                { label: t("common.mid", lang), value: roadmap.salaryExpectations?.mid, color: "text-cyan-400" },
                { label: t("common.senior", lang), value: roadmap.salaryExpectations?.senior, color: "text-blue-400" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all">
                  <span className="text-sm font-medium text-slate-300">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl border border-white/10 bg-white/5">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">
              <BookOpen className="w-5 h-5 text-cyan-400"/> {t("results.resources", lang)}
            </h3>
            <div className="space-y-3">
              {roadmap?.freeResources?.map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between group p-4 rounded-xl bg-black/20 hover:bg-blue-500/20 transition-all border border-transparent hover:border-blue-500/30">
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">{res.name}</div>
                    <div className="text-xs text-slate-400">{res.type}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 transition-all group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Expert Advice Card */}
          <motion.div 
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.4)]"
          >
            <div className="absolute top-0 right-0 opacity-20 -mt-4 -mr-4">
              <Lightbulb className="w-24 h-24" />
            </div>
            <h3 className="font-bold text-xl mb-4 relative z-10">{lang === 'ar' ? 'نصيحة الخبراء' : 'Expert Advice'}</h3>
            <p className="text-white italic font-normal leading-relaxed relative z-10">
              "{roadmap.finalRecommendation || roadmap.motivationalAdvice}"
            </p>
          </motion.div>

        </div>
      </div>
      
      {/* Footer */}
      <div className="hidden print:block mt-12 text-center text-slate-500 text-sm">
        Generated by AI Pathfinder - {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}