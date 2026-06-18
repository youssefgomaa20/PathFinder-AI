import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Download, Save, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Briefcase, GraduationCap, 
  User as UserIcon, Code2, Award, Zap, FileOutput, Sparkles as SparklesIcon, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";
import { useToast } from "@/hooks/use-toast.js";
import html2pdf from "html2pdf.js";
import React from "react";

type ResumeData = {
 targetRole: string;
  fullName: string;

  personalInfo?: {
    fullName: string; professionalTitle: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string;
  };
  summary?: string;
  technicalSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  experience?: { title: string; company: string; date: string; description: string[] }[];
  internships?: { title: string; company: string; date: string; description: string[] }[];
  projects?: { title: string; description: string[] }[];
  education?: { degree: string; institution: string; date: string }[];
  certifications?: { name: string; issuer: string; date: string }[];
  training?: { name: string; organization: string; date: string }[];
  achievements?: string[];
  volunteerWork?: { role: string; organization: string; date: string; description: string[] }[];
};

const STEPS = [
  { id: 1, title: "Personal Details", icon: <UserIcon className="w-5 h-5" /> },
  { id: 2, title: "Target Role & Summary", icon: <Briefcase className="w-5 h-5" /> },
  { id: 3, title: "Experience & Projects", icon: <Code2 className="w-5 h-5" /> },
  { id: 4, title: "Education & Skills", icon: <GraduationCap className="w-5 h-5" /> },
];
const ResumePreview = ({ data }: { data: ResumeData }) => {
  return (
    <div className="bg-white text-black p-8 font-serif leading-relaxed max-w-[800px] mx-auto text-[11pt]" style={{ fontFamily: 'Georgia, serif' }}>
      {/* HEADER */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-1">{data.personalInfo?.fullName || "No Name Provided"}</h1>
        <div className="text-sm font-medium tracking-wide flex justify-center flex-wrap gap-x-4 text-gray-700">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
        <div className="text-sm font-medium tracking-wide flex justify-center flex-wrap gap-x-4 text-gray-700 mt-1">
          {data.personalInfo?.linkedin && <span>{data.personalInfo.linkedin}</span>}
          {data.personalInfo?.github && <span>{data.personalInfo.github}</span>}
          {data.personalInfo?.portfolio && <span>{data.personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* PROFESSIONAL SUMMARY */}
      {data.summary && (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Professional Summary</h2>
          <p className="text-justify text-sm leading-normal">{data.summary}</p>
        </div>
      )}

      {/* SKILLS */}
      {(data.technicalSkills?.length || data.softSkills?.length || data.languages?.length) ? (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Skills & Expertise</h2>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {data.technicalSkills?.length ? (
              <div><strong>Technical Skills:</strong> {data.technicalSkills.join(" • ")}</div>
            ) : null}
            {data.softSkills?.length ? (
              <div><strong>Soft Skills:</strong> {data.softSkills.join(" • ")}</div>
            ) : null}
            {data.languages?.length ? (
              <div><strong>Languages:</strong> {data.languages.join(" • ")}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* EXPERIENCE */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Professional Experience</h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{exp.title}</h3>
                <span className="text-sm font-semibold">{exp.date}</span>
              </div>
              <div className="text-sm italic mb-1">{exp.company}</div>
              <ul className="list-disc list-outside ml-5 text-sm space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i} className="leading-snug">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Key Projects</h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-bold text-sm mb-1">{proj.title}</h3>
              <ul className="list-disc list-outside ml-5 text-sm space-y-1">
                {proj.description.map((desc, i) => (
                  <li key={i} className="leading-snug">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline mb-1">
              <div>
                <span className="font-bold text-sm">{edu.degree}</span> — <span className="italic text-sm">{edu.institution}</span>
              </div>
              <span className="text-sm font-semibold">{edu.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* CERTIFICATIONS */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider">Certifications & Training</h2>
          <ul className="list-disc list-outside ml-5 text-sm space-y-1">
            {data.certifications.map((cert, idx) => (
              <li key={idx} className="leading-snug">
                <strong>{cert.name}</strong>, {cert.issuer} ({cert.date})
              </li>
            ))}
            {data.training?.map((tr, idx) => (
              <li key={`tr-${idx}`} className="leading-snug">
                <strong>{tr.name}</strong>, {tr.organization} ({tr.date})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function Resume() {
  const { lang } = useLanguage();
  const { theme, currentResume, setCurrentResume } = useAppState();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    targetRole: "",
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    workExperience: "",
    projects: "",
    education: "",
    technicalSkills: "",
    softSkills: "",
    languages: "",
    certifications: "",
    training: "",
    achievements: "",
    volunteerWork: ""
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
const [stepError, setStepError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentResume) {
      setResumeResult(currentResume);
      setCurrentStep(3); // Jump to preview
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
    return () => setCurrentResume(null);
  }, [currentResume, setCurrentResume]);

  const strengthScore = React.useMemo(() => {

    let score = 0;
    if (formData.fullName.length > 2) score += 5;
    if (formData.email.length > 5) score += 5;
    if (formData.phone.length > 5) score += 5;
    if (formData.targetRole.length > 2) score += 10;
    if (formData.summary.length > 20) score += 15;
    if (formData.workExperience.length > 20) score += 20;
    if (formData.projects.length > 10) score += 15;
    if (formData.technicalSkills.length > 10) score += 10;
    if (formData.education.length > 5) score += 10;
    if (formData.linkedin.length > 5) score += 5;
    return Math.min(100, score);

  }, [formData]);

  const handleGenerate = async () => {
    if (strengthScore < 40) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in more details to generate a professional resume.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch(apiUrl("/api/pathfinder/resume"), {
        method: "POST",
        body: JSON.stringify({ ...formData, language: lang }),
      });
      
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      const data = await res.json();
      setResumeResult(data.result || data);
      
      previewRef.current?.scrollIntoView({ behavior: 'smooth' });

      toast({ title: "Success!", description: "Resume generated successfully." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resumeResult) return;
    setIsSaving(true);
    try {
      const payload = {
        careerTitle: `${resumeResult.personalInfo?.fullName || 'Resume'} - ${formData.targetRole}`,
        roadmapData: JSON.stringify(resumeResult),
        type: "resume"
      };
      const res = await apiFetch(apiUrl("/api/pathfinder/saved-roadmaps"), {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      toast({ title: "Saved!", description: "Check your saved roadmaps." });
    } catch (err: unknown) {
  console.error(err);
  toast({ title: "Save Failed", variant: "destructive" });
}

  };

  const exportPDF = () => {
    if (!previewRef.current) return;
const opt = {
  margin: 0,
  filename: `${formData.fullName || "Resume"}.pdf`,
  image: { type: "jpeg" as const, quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
};
  
    html2pdf().from(previewRef.current).set(opt).save();
  };

  const exportDOCX = () => {
    if (!previewRef.current) return;
    const html = previewRef.current.innerHTML;
    const blob = new Blob(['<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>' + html + '</body></html>'], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.fullName || 'Resume'}.doc`;
    link.click();
  };

const renderField = (name: keyof typeof formData, label: string, placeholder: string, isTextarea = false) => {
const getMinLength = (fieldName: string) => {
  if (['fullName', 'professionalTitle', 'location', 'targetRole', 'technicalSkills'].includes(fieldName))
    return 3;

  if (['email', 'phone'].includes(fieldName))
    return 5;

  if (['summary', 'workExperience'].includes(fieldName))
    return 20;

  if (fieldName === 'projects')
    return 10;

  return 0;
};
  const minLength = getMinLength(name);
  const currentLength = (formData[name] || "").toString().length;
  const isInvalid = currentLength < minLength; // الحقل غير صالح لو أقل من المطلوب
  const isFocused = focusedField === name;

  return (
    <motion.div 
      key={name} 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col group"
    >
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-focus-within:text-primary transition-colors">
          {label} {['fullName', 'email', 'targetRole'].includes(name) && <span className="text-red-500">*</span>}
        </label>
        
        <AnimatePresence>
          {isFocused && isInvalid && minLength > 0 && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse"
            >
              Needs at least {minLength} characters ({currentLength}/{minLength})
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isTextarea ? (
        <textarea
          rows={4}
          value={formData[name]}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full p-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/30 outline-none focus:ring-4 transition-all duration-300 resize-none dark:text-white ${
            isFocused && isInvalid 
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/10"
          }`}
        />
      ) : (
        <input
          value={formData[name]}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full h-12 px-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/30 outline-none focus:ring-4 transition-all duration-300 dark:text-white ${
            isFocused && isInvalid 
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/10"
          }`}
        />
      )}
    </motion.div>
  );
};

const isStepValid = () => {
  const safe = (v: any) => (v ?? "").toString().trim();

  if (currentStep === 1) {
    if (safe(formData.fullName).length < 3) return false;
    if (safe(formData.email).length < 5) return false;
    if (safe(formData.phone).length < 5) return false;
    if (safe(formData.professionalTitle).length < 3) return false;
    if (safe(formData.location).length < 3) return false;
  }

  if (currentStep === 2) {
    if (safe(formData.targetRole).length < 3) return false;
    if (safe(formData.summary).length < 20) return false;
  }

  if (currentStep === 3) {
    if (safe(formData.workExperience).length < 20) return false;
    if (safe(formData.projects).length < 10) return false;
  }

  if (currentStep === 4) {
    if (safe(formData.technicalSkills).length < 3) return false;
  }

  return true;
};
const handleNextStep = () => {
  if (!isStepValid()) {
    setStepError(getStepErrorMessage());
    return;
  }

  setStepError(null);
  setCurrentStep((prev) => Math.min(4, prev + 1));
};
const getStepErrorMessage = () => {
  switch (currentStep) {
    case 1:
      return "Please fill in all required personal information (name, email, phone, title, location).";

    case 2:
      return "Please enter a target role and a summary of at least 20 characters.";

    case 3:
      return "Please provide more detailed work experience and projects.";

    case 4:
      return "Please add at least basic technical skills (e.g. React, Node, etc.).";

    default:
      return "Please complete this step before continuing.";
  }
};
return (
<div className={`page-shell min-h-screen w-full px-4 sm:px-6 py-8 sm:py-12 relative selection:bg-primary/30 transition-colors duration-500 ${theme === "dark" ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
    {/* Background Decor */}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        x: [0, 50, 0],
        opacity: [0.3, 0.5, 0.3] 
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px]" 
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.3, 1],
        x: [0, -50, 0],
        opacity: [0.2, 0.4, 0.2] 
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" 
    />
  </div>

  <div className="max-w-7xl mx-auto relative z-10">
    <header className="text-center mb-16">
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, }}
      >
<motion.span 
  whileHover={{ scale: 1.05 }}
  className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium tracking-wide text-primary rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md"
>
  <Sparkles className="w-4 h-4 text-primary" />
  Future of Hiring is Here
</motion.span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter ">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-blue-700 animate-gradient-x">
            AI Resume Builder PRO
          </span>
        </h1>
        
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6 ">
          Elevate your career with <span className="text-slate-900 dark:text-slate-100 font-semibold">ATS-optimized</span> resumes powered by next-gen artificial intelligence.
        </p>
      </motion.div>
    </header>

    <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ 
    y: -8, 
    transition: { duration: 0.3, ease: "easeOut" } 
  }}
  className="mb-5 relative group p-6 rounded-[2rem] border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

  <div className="relative z-10">
    <div className="flex justify-between items-end ">
      <div>
        <h3 className="font-bold text-xl flex items-center gap-2.5 text-slate-800 dark:text-white">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </div>
          Content Strength
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Optimize your data for peak AI performance
        </p>
      </div>
      
      <div className="flex flex-col items-end">
        <motion.span 
          key={strengthScore}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
        >
          {strengthScore}%
        </motion.span>
      </div>
    </div>

    <div className="relative w-full h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full p-[3px] overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${strengthScore}%` }}
        transition={{ duration: 1.2, ease: "circOut" }}
        className={`relative h-full rounded-full transition-all duration-700 ${
          strengthScore > 80 
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
            : strengthScore > 40 
            ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
            : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
        }`}
      >
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
        />
      </motion.div>
    </div>
    
    <div className="mt-3 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold opacity-40">
      <span>Weak</span>
      <span>Optimal</span>
    </div>
  </div>
</motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          
          {/* LEFT: FORM SECTION */}
          <div className="space-y-4">
            {/* Step Navigation */}
<nav className="relative flex justify-between px-4 py-6 gap-4">
  <div className="absolute top-12 left-0 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />

  {STEPS.map((step) => {
    const isActive = currentStep === step.id;
    const isCompleted = currentStep > step.id;

    return (
      <button
        key={step.id}
onClick={() => {
  if (step.id < currentStep) {
    setCurrentStep(step.id);
    return;
  }

  if (!isStepValid()) return;

  if (step.id > currentStep + 1) return;

  setCurrentStep(step.id);
}}
        className={`relative flex flex-col items-center gap-3 flex-1 group transition-all duration-500`}
      >
        <div className={`
          relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
          ${isActive 
            ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-110 z-10' 
            : isCompleted 
              ? 'border-emerald-500 bg-emerald-500 text-white' 
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 group-hover:border-primary/50'}
        `}>
          
          {isActive && (
            <span className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-20"></span>
          )}

          <div className="transition-transform duration-300 group-hover:scale-110">
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 animate-in zoom-in duration-300" />
            ) : (
              React.cloneElement(step.icon, { className: "w-6 h-6" })
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className={`
            text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 hidden sm:block
            ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-500'}
          `}>
            {step.title}
          </span>
          
          <div className={`h-1 rounded-full bg-primary transition-all duration-500 mt-1
            ${isActive ? 'w-4' : 'w-0'}
          `} />
        </div>
      </button>
    );
  })}
</nav>
            {/* Form Container */}
            <div className="p-8 rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900/80 shadow-2xl min-h-[500px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <UserIcon className="text-primary w-6 h-6"/> 
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                      </div>
                      {renderField("fullName", "Full Name", "e.g. John Doe")}
                      {renderField("professionalTitle", "Professional Title", "e.g. Software Engineer")}
                      {renderField("email", "Email Address", "john@example.com")}
                      {renderField("phone", "Phone", "+1 234...")}
                      {renderField("location", "Location", "Remote or City, Country")}
                      {renderField("linkedin", "LinkedIn URL", "linkedin.com/in/...")}
                      {renderField("github", "GitHub", "github.com/...")}
                      {renderField("portfolio", "Portfolio", "website.com")}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <Briefcase className="text-primary w-6 h-6"/> 
                        <h2 className="text-2xl font-bold">Target Role & Summary</h2>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 items-start text-sm">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                        <p>Our AI uses your <b>Target Role</b> to optimize keywords for ATS systems.</p>
                      </div>
                      {renderField("targetRole", "Target Job Title", "e.g. Senior Product Designer")}
                      {renderField("summary", "Brief Summary", "Tell us about your background...", true)}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <Code2 className="text-primary w-6 h-6"/> 
                        <h2 className="text-2xl font-bold">Experience & Projects</h2>
                      </div>
                      {renderField("workExperience", "Work History", "List companies and roles...", true)}
                      {renderField("projects", "Key Projects", "What have you built?", true)}
                      {renderField("volunteerWork", "Volunteer Work", "Optional...", true)}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <GraduationCap className="text-primary w-6 h-6"/> 
                        <h2 className="text-2xl font-bold">Education & Skills</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {renderField("technicalSkills", "Technical Skills", "React, Node, etc.", true)}
                        {renderField("softSkills", "Soft Skills", "Leadership, etc.")}
                        {renderField("education", "Education", "Degree, School...", true)}
                        {renderField("certifications", "Certifications", "AWS, etc.")}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

<footer className="flex justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
      {stepError && (
  <div className="text-rose-500 text-sm font-medium mt-2 animate-in fade-in">
    {stepError}
  </div>
)}
  <Button 
    variant="ghost" 
    onClick={() => setCurrentStep(s => Math.max(1, s-1))} 
    disabled={currentStep === 1} 
    className="rounded-xl group transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  >
    <ChevronLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
    <span>Back</span>
  </Button>

  {currentStep < 4 ? (
<Button
  onClick={handleNextStep}
  disabled={!isStepValid()}
  className={`rounded-xl px-8 bg-slate-900 dark:bg-white dark:text-slate-900 relative overflow-hidden group transition-all duration-300 shadow-md
  ${isStepValid()
    ? "hover:scale-105 active:scale-95 hover:shadow-lg"
    : "opacity-50 cursor-not-allowed"}`}
>
<span className="relative z-10 flex items-center">
    Next <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
  </span>

  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
</Button>
  ) : (
    <Button 
      onClick={handleGenerate} 
      disabled={isLoading || strengthScore < 40}
      className={`
        rounded-xl px-10 relative overflow-hidden transition-all duration-500
        ${isLoading || strengthScore < 40 
          ? 'bg-slate-300 cursor-not-allowed' 
          : 'bg-gradient-to-r from-indigo-600 via-purple-400 to-blue-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 active:scale-95'}
      `}
    >

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="flex items-center">
          <SparklesIcon className="mr-2 w-4 h-4 animate-pulse text-yellow-200" /> 
          <span className="font-bold tracking-wide">Generate AI Resume</span>
        </div>
      )}
      
      {!isLoading && strengthScore >= 40 && (
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Button>
  )}
</footer>
            </div>
            {error && <div className="text-rose-500 text-center text-sm font-medium animate-bounce">{error}</div>}
          </div>

          {/* RIGHT: PREVIEW SECTION */}
<aside className="sticky  space-y-6 mt-6">
  <div className="group flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-xl transition-all duration-300 hover:shadow-primary/10 hover:border-primary/30">
    <h3 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <div className="p-2 bg-primary/10 rounded-lg group-hover:rotate-12 transition-transform duration-300">
        <Award className="text-primary w-5 h-5" />
      </div>
      <span>Preview</span>
    </h3>
    
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleSave} 
        disabled={!resumeResult || isSaving} 
        className="rounded-lg transition-all active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 text-slate-600" />}
      </Button>

      {/* PDF Button */}
      <Button 
        size="sm" 
        onClick={exportPDF} 
        disabled={!resumeResult} 
        className="rounded-lg bg-rose-500 text-white border-none hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95"
      >
        <Download className="w-4 h-4" />
      </Button>

      <Button 
        size="sm" 
        onClick={exportDOCX} 
        disabled={!resumeResult} 
        className="rounded-lg bg-blue-600 text-white border-none hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95"
      >
        <FileOutput className="w-4 h-4" />
      </Button>
    </div>
  </div>

<div className="relative group perspective-1000 pt-7">
  <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

  <div className="relative transition-all duration-700 ease-out transform-gpu group-hover:-translate-y-2 group-hover:rotate-x-1 rounded-[2.8rem] p-[2px] overflow-hidden bg-slate-200/50 dark:bg-slate-800/50 shadow-2xl ">
    
    <div className="absolute inset-[-1000%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#3B82F6_50%,#E2E8F0_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1E293B_0%,#3B82F6_50%,#1E293B_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 " />

    <div className="relative rounded-[2.7rem] bg-slate-100 dark:bg-slate-900 p-1.5 backdrop-blur-3xl ">
      
      <div className="relative overflow-hidden rounded-[2.2rem] bg-white dark:bg-slate-950 border border-white/40 dark:border-slate-800 shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] ">
        
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 flex flex-col items-center justify-end pb-8">
          <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl border border-white/20 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
            Live Preview Mode
          </span>
        </div>

        <div 
          ref={previewRef}
     className="bg-white text-slate-900 w-full min-h-[560px] sm:min-h-[700px] lg:min-h-[800px] pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-10 origin-top transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
          style={{ 
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {resumeResult ? (
            <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-1000 ease-out">
             
              {/* Resume */}
              <div className="relative z-0">
            <ResumePreview data={resumeResult} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 py-40">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
                   <FileOutput className="w-10 h-10 opacity-40 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Waiting for your brilliance...</p>
                <p className="text-xs text-slate-400/60 mt-1 uppercase tracking-tighter">Enter your details to generate magic</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[100px] rounded-full" />
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 blur-[100px] rounded-full" />
  </div>
</aside>
        </div>
      </div>
    </div>
  );
}

