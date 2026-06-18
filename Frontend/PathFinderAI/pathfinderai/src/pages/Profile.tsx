import { useState, useEffect, type ChangeEvent } from "react";
import { useLocation } from "wouter";
import {
  User, Mail, Phone, MapPin, Camera, Trophy, CheckCircle2, ShieldAlert,
  FileText, Globe, Linkedin, Github,
  GraduationCap, Building2, Target, FileUp,
  ChevronDown, Plus, Trash2,
  Zap, ShieldCheck, Crown,
  Code2,
  Calendar
} from "lucide-react";
import { Button } from "../components/ui/button.js";
import { IconInput } from "@/components/ui/icon-field.js";
import { useAppState } from "../hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { apiFetch, apiUrl, resolveMediaUrl } from "@/lib/http.js";
import {
  clearAuthSession, getToken, getStoredUser, getUserScopedData, setUserScopedData,
  updateStoredUser, readApiErrorMessage,
  type AuthUser
} from "@/lib/auth.js";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import profileImg from "../assets/profile.png";

type ProfileApi = AuthUser & { email: string };
type Level = {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
};

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  bio: string;
  birthDate: string;
  university: string;
  education: string;
  experienceLevel: string;
  careerGoal: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skillsText: string;
  photoURL: string;
  cvUrl: string;
  level: string;
  specialization: string;
  graduationYear: string;
};

const normalizeUrlField = (value: string): string => {
  const s = value.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
};

const emptyForm = (): FormState => ({
  fullName: "", phone: "", address: "", bio: "", birthDate: "",
  university: "", education: "", experienceLevel: "", careerGoal: "",
  linkedin: "", github: "", portfolio: "", skillsText: "", photoURL: "", cvUrl: "", level: "Junior",
  specialization: "",
  graduationYear: ""
});

function mapProfileToForm(p: ProfileApi): FormState {
  const birth =
    p.birthDate && typeof p.birthDate === "string"
      ? p.birthDate.slice(0, 10)
      : "";

  return {
    fullName: p.name ?? "",
    phone: p.phone ?? "",
    address: p.address ?? "",
    bio: p.bio ?? "",
    birthDate: birth,
    university: p.university ?? "",
    education: p.education ?? "",
    experienceLevel: p.experienceLevel ?? "",
    careerGoal: p.careerGoal ?? "",
    linkedin: p.linkedin ?? "",
    github: p.github ?? "",
    portfolio: p.portfolio ?? "",
    skillsText: "",
    photoURL: resolveMediaUrl((p as any).photoUrl ?? (p as any).photoURL ?? ""),
    cvUrl: resolveMediaUrl(p.cvUrl ?? ""),
    level: (p as any).level || "Junior",
    specialization: (p as any).specialization ?? "",
    graduationYear: (p as any).graduationYear ?? ""
  };
}

const initialFormFromSession = (): FormState => {
  const stored = getStoredUser();
  if (!stored) return emptyForm();
  return mapProfileToForm({ ...stored, email: stored.email } as ProfileApi);
};

export default function Profile() {
  const { theme } = useAppState();
  useLanguage();
  const [data, setData] = useState<FormState>(initialFormFromSession);
  const [, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();
  const [saveMessage, setSaveMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [percentage, setPercentage] = useState(50);
  const [skills, setSkills] = useState<{ id: string; name: string; level: number }[]>([]);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  useEffect(() => {
    const load = async () => {
      if (!getToken()) {
        setLocation("/login");
        return;
      }
      try {
        const res = await apiFetch(apiUrl("/user/profile"));
        if (res.status === 401) {
          clearAuthSession();
          setLocation("/login");
          return;
        }
        if (!res.ok) {
          const msg = await readApiErrorMessage(res);
          console.error("[profile] fetch failed:", msg);
          setSaveMessage(msg);
          setShowMessage(true);
          return;
        }
        const profile = (await res.json()) as ProfileApi;
        setSkills(
          Array.isArray(profile.skills)
            ? profile.skills.map((skill: string) => {
                let parsed: { name?: string; level?: number } = { name: skill, level: 50 };
                if (skill.startsWith("{")) {
                  try {
                    parsed = JSON.parse(skill) as { name?: string; level?: number };
                  } catch {
                    /* keep default */
                  }
                }
                return {
                  id: crypto.randomUUID(),
                  name: parsed.name || skill,
                  level: parsed.level ?? 50
                };
              })
            : []
        );
        setEmail(profile.email);
        const mapped = mapProfileToForm(profile);
        const photo =
          mapped.photoURL || resolveMediaUrl(getUserScopedData()?.profileImage ?? "");
        setData({ ...mapped, photoURL: photo });
        updateStoredUser(profile);
        if (photo) setUserScopedData({ profileImage: photo });
        setIsDirty(false);
      } catch (err) {
        console.error("[profile] fetch error:", err);
        setSaveMessage(
          err instanceof Error ? err.message : "Failed to load profile."
        );
        setShowMessage(true);
      } finally {
        setInitialLoading(false);
      }
    };
    void load();
  }, [setLocation]);

const addSkill = () => {
  if (!newSkill.trim()) return;

  setSkills(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      name: newSkill,
      level: Number(percentage)
    }
  ]);

  setIsDirty(true);

  setNewSkill("");
  setPercentage(50);
};
const deleteSkill = (id: string) => {
  setSkills(prev => prev.filter(skill => skill.id !== id));
  setIsDirty(true);
};
  const updateField = (key: keyof FormState, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please select an image file.");
      setShowMessage(true);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setData((prev) => ({ ...prev, photoURL: base64 }));
      try {
        console.log("[profile] image_upload_request", { size: file.size, type: file.type });
        const res = await apiFetch(apiUrl("/user/upload-image"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 })
        });
        const result = (await res.json().catch(() => ({}))) as {
          url?: string;
          photoUrl?: string;
          message?: string;
          user?: AuthUser;
        };
        if (!res.ok) {
          const msg =
            typeof result.message === "string"
              ? result.message
              : await readApiErrorMessage(res);
          console.error("[profile] image_upload_failed", msg);
          setSaveMessage(msg);
          setShowMessage(true);
          return;
        }
        const url = resolveMediaUrl(
          result.url ?? result.photoUrl ?? result.user?.photoUrl ?? ""
        );
        if (!url) {
          setSaveMessage("Upload succeeded but no image URL was returned.");
          setShowMessage(true);
          return;
        }
        const displayUrl = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
        console.log("[profile] image_upload_success", displayUrl);
        setData((prev) => ({ ...prev, photoURL: displayUrl }));
        if (result.user) {
          const withEmail = { ...result.user, email: email || result.user.email, photoUrl: url };
          updateStoredUser(withEmail);
        }
        setUserScopedData({ profileImage: url });
        setIsDirty(false);
        setSaveMessage("Profile image updated!");
        setShowMessage(true);
      } catch (err) {
        console.error("[profile] image_upload_error", err);
        setSaveMessage(
          err instanceof Error ? err.message : "Failed to upload profile image."
        );
        setShowMessage(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCvChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch(apiUrl("/user/upload-cv"), {
        method: "POST",
        body: formData
      });

      const result = (await res.json()) as { url?: string; cvUrl?: string; user?: AuthUser };
      if (!res.ok) {
        setSaveMessage(await readApiErrorMessage(res));
        setShowMessage(true);
        return;
      }

      const url = resolveMediaUrl(result.url ?? result.cvUrl ?? "");
      setData((prev) => ({ ...prev, cvUrl: url }));
      if (result.user) updateStoredUser(result.user);
      setSaveMessage("CV uploaded successfully!");
      setShowMessage(true);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to upload CV.");
      setShowMessage(true);
    } finally {
      setCvUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await apiFetch(apiUrl("/user/delete-account"), { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        setSaveMessage(await readApiErrorMessage(res));
        setShowMessage(true);
        setShowDeleteModal(false);
        return;
      }
      clearAuthSession();
      setShowDeleteModal(false);
      setLocation("/login");
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to delete account. Please try again.");
      setShowMessage(true);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
  setSaving(true);

  try {
    const body = {
      name: data.fullName,
      phone: data.phone,
      address: data.address,
      bio: data.bio,
      birthDate: data.birthDate,
      university: data.university,
      education: data.education,
      experienceLevel: data.experienceLevel || null,
      level: data.level || null,
      specialization: data.specialization || null,
      graduationYear: data.graduationYear || null,
      careerGoal: data.careerGoal,
      linkedin: normalizeUrlField(data.linkedin),
      github: normalizeUrlField(data.github),
      portfolio: normalizeUrlField(data.portfolio),
      skills: skills.map((skill) => JSON.stringify({
        name: skill.name,
        level: skill.level
      }))
    };


    const res = await apiFetch(apiUrl("/user/profile"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = (await res.json()) as AuthUser & { message?: string };

    if (!res.ok) {
      throw new Error(result.message || "Update failed");
    }

    const saved = { ...result, email: email || result.email } as ProfileApi;
    const mapped = mapProfileToForm(saved);
    setData(mapped);
    updateStoredUser(saved);
    if (mapped.photoURL) setUserScopedData({ profileImage: mapped.photoURL });
    setIsDirty(false);

    setSaveMessage("Profile Updated Successfully!");
    setShowMessage(true);
  } catch (err) {
    console.error(err);
    setSaveMessage(err instanceof Error ? err.message : "Failed to update profile.");
    setShowMessage(true);
  } finally {
    setSaving(false);
  }
};
  const levels = [
    { id: "Junior", label: "Junior Phase", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { id: "Mid-Level", label: "Mid-Level Pro", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "Senior", label: "Senior AI Core", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
    { id: "Lead", label: "Lead Expert System", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const currentLevel: Level = levels.find(l => l.id === data.level) ?? levels[0]!;
  const darkMode = theme === "dark";
  const glassEffect = "backdrop-blur-xl border border-white/10 shadow-2xl";
  const cardBg = darkMode ? "bg-slate-900/40" : "bg-white/70";

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const handleMouse = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={`page-shell min-h-screen w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-sans selection:bg-cyan-500/30 ${darkMode ? "bg-[#02060c] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      <AnimatePresence>
        {showMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 w-[90%] max-w-md"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">{saveMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 sm:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group ${glassEffect} ${cardBg}`}
      >
        <div className="lg:col-span-1 flex flex-col items-center justify-center lg:border-r border-white/10 relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} className="relative group w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-500 shrink-0">
            <div className="w-full h-full overflow-hidden rounded-full border-4 border-[#02060c] bg-slate-800">
              <img
                key={data.photoURL || "default"}
                src={data.photoURL || "/default-profile.png"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt="Profile"
                onError={(ev) => {
                  const el = ev.currentTarget;
                  const src = data.photoURL;
                  if (!src || src.includes("/default-profile")) return;
                  const base = src.split("?")[0];
                  if (base && el.src !== base) el.src = base;
                }}
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full backdrop-blur-sm">
                <Camera className="text-white w-8 h-8" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </motion.div>
          <h2 className="mt-4 text-xl lg:text-2xl font-bold text-center">{data.fullName || "User Name"}</h2>
          <p className="text-cyan-400 text-xs font-medium uppercase tracking-widest text-center">{data.careerGoal || "Professional Title"}</p>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center gap-4 px-2 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput icon={User} value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} darkMode={darkMode} placeholder="Full Name" />
            <IconInput icon={Mail} value={email} disabled darkMode={darkMode} />
            <IconInput icon={Phone} value={data.phone} onChange={(e) => updateField("phone", e.target.value)} darkMode={darkMode} placeholder="Phone" />
            <IconInput icon={MapPin} value={data.address} onChange={(e) => updateField("address", e.target.value)} darkMode={darkMode} placeholder="Address" />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col justify-center gap-3 relative z-20">
          <div className="relative w-full">
            <div onClick={() => setIsLevelOpen(!isLevelOpen)} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${currentLevel.bg} ${currentLevel.color}`}><currentLevel.icon size={18} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Expertise</span>
                  <span className="text-sm font-semibold text-white">{currentLevel.label}</span>
                </div>
              </div>
              <ChevronDown className={`text-white/40 transition-transform ${isLevelOpen ? "rotate-180" : ""}`} size={16} />
            </div>
            <AnimatePresence>
              {isLevelOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full z-[100] bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  {levels.map((lvl) => (
                    <div key={lvl.id} onClick={() => { updateField("level", lvl.id); setIsLevelOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors">
                      <lvl.icon size={16} className={lvl.color} />
                      <span className="text-sm text-slate-300">{lvl.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl focus-within:border-blue-500 transition-all">
             <Trophy className="text-blue-500" size={18}/>
             <input type="text" value={data.careerGoal} onChange={(e) => updateField("careerGoal", e.target.value)} placeholder="Professional Title" className="bg-transparent w-full border-none focus:ring-0 text-sm font-semibold text-white outline-none" />
          </div>

          <Button onClick={handleSave} disabled={!isDirty || saving} className={`w-full rounded-2xl h-12 font-bold transition-all ${isDirty ? "bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
            {saving ? "Saving..." : "Update Profile"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pb-10">
        
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className={`p-6 rounded-[2rem] ${glassEffect} ${cardBg} group`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
              <FileText size={18} className="text-cyan-500" /> Bio
            </h3>
            <textarea value={data.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Tell us about yourself..." className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white min-h-[120px] focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
          </div>

          <div className={`p-6 rounded-[2rem] ${glassEffect} ${cardBg}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
              <GraduationCap className="text-cyan-500" /> Education
            </h3>
            <div className="flex flex-col gap-3">
              <IconInput icon={Building2} value={data.university} onChange={(e) => updateField("university", e.target.value)} darkMode={darkMode} placeholder="University" />
              <IconInput icon={GraduationCap} value={data.education} onChange={(e) => updateField("education", e.target.value)} darkMode={darkMode} placeholder="Degree" />
              <IconInput icon={Target} value={data.specialization} onChange={(e) => updateField("specialization", e.target.value)} darkMode={darkMode} placeholder="Specialization" />
              <IconInput icon={Calendar} value={data.graduationYear} onChange={(e) => updateField("graduationYear", e.target.value)} darkMode={darkMode} placeholder="Graduation Year" />
              
              <div className="relative">
                <div onClick={() => setIsExpOpen(!isExpOpen)} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Target size={16} className="text-cyan-400" /> {data.experienceLevel || "Experience"}
                  </div>
                  <ChevronDown size={14} className="text-white/40" />
                </div>
                <AnimatePresence>
                  {isExpOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-full mt-2 w-full bg-[#0f172a] rounded-xl border border-white/10 z-50 overflow-hidden">
                      {["Beginner", "Intermediate", "Advanced"].map(exp => (
                        <div key={exp} onClick={() => { updateField("experienceLevel", exp); setIsExpOpen(false); }} className="p-3 text-sm text-white hover:bg-cyan-500/20 cursor-pointer">{exp}</div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                <div>
                  <p className="text-[13px] font-bold">Privacy Guaranteed</p>
                  <p className="text-[11px] opacity-50">Your data is encrypted.</p>
                </div>
              </div>
              <Button onClick={() => setShowDeleteModal(true)} variant="ghost" className="w-full justify-start text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all h-10 px-4">
                <ShieldAlert size={16} className="mr-2" /> Delete Account
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-6">
          <div
            className="rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-blue-950/60 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 shadow-[0_20px_80px_rgba(6,182,212,0.25)] h-[320px] sm:h-[420px] md:h-[500px] lg:h-[550px] min-w-0"
            style={{ perspective: 1600 }}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/25 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />
            <motion.div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" animate={{ y: [0, 400, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
            <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-full flex justify-center items-center">
              <motion.div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full border-2 border-cyan-400/40" style={{ transform: "translateZ(20px)" }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_20px_5px_rgba(6,182,212,0.8)]" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_20px_5px_rgba(168,85,247,0.8)]" />
              </motion.div>
              <motion.div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px] rounded-full border border-purple-400/30" style={{ transform: "translateZ(10px)" }} animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} />
              <div className="absolute w-[min(280px,85vw)] h-[min(280px,85vw)] rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-purple-500/40 blur-3xl" style={{ transform: "translateZ(0px)" }} />
              <motion.img initial={{ scale: 0.8, opacity: 0, z: -100 }} animate={{ scale: 1, opacity: 1, z: 0, y: [0, -15, 0] }} transition={{ scale: { duration: 0.8, ease: "easeOut" }, opacity: { duration: 0.8 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }} whileHover={{ scale: 1.08, filter: "drop-shadow(0 30px 60px rgba(6, 182, 212, 0.7)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))" }} src={profileImg} className="w-full max-w-none max-h-[1200px] object-contain cursor-pointer select-none relative z-10" alt="Career Odyssey Map" style={{ transform: "translateZ(80px)", filter: "drop-shadow(0 20px 40px rgba(6, 182, 212, 0.5)) drop-shadow(0 0 30px rgba(168, 85, 247, 0.3))" }} />
              <motion.div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 mix-blend-overlay rounded-full" style={{ transform: "translateZ(90px)" }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 3 }} />
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} className="absolute w-3.5 h-3.5 bg-cyan-300 rounded-full shadow-[0_0_10px_2px_rgba(6,182,212,0.8)]" style={{ transform: `translateZ(${40 + i * 10}px)`, left: `${20 + i * 12}%`, top: `${30 + (i % 3) * 20}%` }} animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }} />
              ))}
            </motion.div>
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400/60 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-400/60 rounded-br-2xl pointer-events-none" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80 font-bold">Career Map</p>
            </div>
          </div>

          {/* CV Section  */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} whileHover={{ scale: 1.01 }}
            className={`w-full p-6 rounded-[2.5rem] ${glassEffect} bg-slate-900/80 border border-cyan-500/20 shadow-2xl flex flex-col items-center justify-center overflow-hidden backdrop-blur-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-70" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="relative z-10">
              <FileUp size={32} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
            </motion.div>
            <h3 className="relative z-10 text-lg font-black mt-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">{cvUploading ? "Uploading..." : "Career CV"}</h3>
            {data.cvUrl && (
              <p className="relative z-10 text-xs text-emerald-400 mt-1">CV uploaded — ready to use</p>
            )}
            <input type="file" accept=".pdf" onChange={handleCvChange} className="hidden" id="cv-upload-final" />
            <Button variant="outline" className="relative z-10 mt-4 px-6 rounded-full border-cyan-500/30 hover:border-cyan-400 text-white h-9 text-xs" onClick={() => document.getElementById("cv-upload-final")?.click()}>
              {data.cvUrl ? "Update CV" : "Select PDF"}
            </Button>
          </motion.div>
        </div>

        {/* Skills & Socials */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className={`p-6 rounded-[2.5rem] ${glassEffect} ${cardBg} shadow-2xl`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
              <Code2 size={22} className="text-cyan-400" /> Professional Skills
            </h3>
            <div className="flex flex-col gap-4 mb-8 p-4 rounded-2xl bg-black/20">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill name" className="w-full p-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50" />
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-slate-400 w-8">{percentage}%</span>
                 <input type="range" min="1" max="100" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
              <button onClick={addSkill} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Plus size={16} /> Add Skill
              </button>
            </div>
            <div className="space-y-5">
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-wider text-slate-300 mb-2">
                      <span>{skill.name}</span>
                      <div className="flex items-center gap-3">
                        <span>{skill.level}%</span>
                        <button onClick={() => deleteSkill(skill.id)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] ${glassEffect} ${cardBg}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-purple-500"/> Socials</h3>
            <div className="space-y-3">
               <IconInput icon={Linkedin} value={data.linkedin} onChange={(e)=>updateField("linkedin", e.target.value)} darkMode={darkMode} placeholder="LinkedIn" />
               <IconInput icon={Github} value={data.github} onChange={(e)=>updateField("github", e.target.value)} darkMode={darkMode} placeholder="GitHub" />
               <IconInput icon={Globe} value={data.portfolio} onChange={(e) => updateField("portfolio", e.target.value)} darkMode={darkMode} placeholder="Portfolio" />
            </div>
          </div>
        </div>

      </div>

      {/* Delete */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full rounded-[2.5rem] p-8 border border-white/10 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
              <h2 className="text-2xl font-bold mb-2 text-red-500">Wait! Are you sure?</h2>
              <p className="opacity-70 mb-8 text-sm">This action is permanent and will delete all your career history and skills analysis.</p>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1 rounded-2xl h-12 bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>Delete Forever</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}