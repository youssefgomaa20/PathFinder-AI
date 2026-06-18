import { motion } from "framer-motion";
import { Mail, Facebook, Instagram, MessageCircle, ArrowRight, CheckCircle2, Star, Sparkles, BookOpen, Target } from "lucide-react";
import bgAbout from "../assets/bg-about.jpg";
import { useAppState } from "@/hooks/use-app-state.js";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import youssef from "@/assets/youssef.jpeg";
import AhmedImage from "../assets/Ahmed.jpeg";
import adelImage from "../assets/adel.jpeg";
import hodaImage from "../assets/hoda.jpeg";
import { Linkedin } from "lucide-react";
import type { JSX } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

const teamMembers = [
  {
    name: "Youssef Gomaa",
    role: "AI Engineer",
    image: youssef,
    links: {
      whatsapp: "https://wa.me/201150187774",
      facebook: "https://www.facebook.com/share/1JpuwZJ6U3/",
      instagram: "https://www.instagram.com/_youssef_gomaa11?igsh=MTY4a3BnNHBlb2pkbg==",
      email: "mailto:youssefgomaa780@mail.com",
      linkedin: "https://www.linkedin.com/in/youssef-gomaa11/"
    }
  },
  {
    name: "Hoda Mostafa",
    role: "Cyberecurity Engineer",
    image: hodaImage,
    links: {
      whatsapp: "https://wa.me/201002273786",
      facebook: "https://www.facebook.com/share/1DgELSCbym/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/shahd_2_m?igsh=MTk3NG1yNHVnb212cA%3D%3D&utm_source=qr",
      email: "mailto:24680952shahd@gmail.com",
      linkedin: "https://www.linkedin.com/in/shahd-mostafa-4431853b7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
    }
  },
  {
    name: "Adel Mohamed",
    role: "Front-End Developer",
    image: adelImage,
    links: {
      whatsapp: "https://wa.me/01033229174",
      facebook: "https://www.facebook.com/share/1GShu9N4r3/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/adel__mo7med?igsh=cHVvNTV2bTZ5cXo5&utm_source=qr",
      email: "mailto:adelsalem.78@icloud.com",
      linkedin: "https://www.linkedin.com/in/adel-mohamed-8b8961336?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
    }
  },
  {
    name: "Ahmed Khaled",
    role: "Ui/UX Design",
    image: AhmedImage,
    links: {
      whatsapp: "https://wa.me/201151400487",
      facebook: "https://www.facebook.com/share/1HDisNcDcQ/",
      instagram: "https://www.instagram.com/ahmad_elgebaly11?igsh=M3JneTRpaGZneDJo",
      email: "mailto:aelgebaly07@gmail.com",
      linkedin: "https://www.linkedin.com/in/ahmad-elgebaly-3b3a00267?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    }
  },
  {
    name: "Ibrahim Saad",
    role: "AI Engineer",
    image: "https://ui-avatars.com/api/?name=Rana+Samir&background=0D8ABC&color=fff&size=200",
    links: {
      whatsapp: "https://wa.me/1234567890",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      email: "mailto:youssef@example.com",
      linkedin: "https://linkedin.com/in/username"
    }
  },
  {
    name: "Mohamed Eslam",
    role: "Front-End Developer",
    image: "https://ui-avatars.com/api/?name=Rana+Samir&background=0D8ABC&color=fff&size=200",
    links: {
      whatsapp: "https://wa.me/1234567890",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      email: "mailto:rana@example.com",
      linkedin: "https://linkedin.com/in/username"
    }
  },
  {
    name: "Esmail Mahmoud",
    role: "Back-End Developer",
    image: "https://ui-avatars.com/api/?name=Karim+Magdy&background=0D8ABC&color=fff&size=200",
    links: {
      whatsapp: "https://wa.me/201101614219",
      facebook: "https://www.facebook.com/share/17aP75XwFt/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/ismaill.mahmood?igsh=MXE4NDRxdWx2N3RhbQ%3D%3D&utm_source=qr",
      email: "mailto:ismailmahmoud8357656@gmail.com",
    }
  }
];

type Platform = "whatsapp" | "facebook" | "instagram" | "email" | "linkedin";
type TeamMember = {
  name: string;
  role: string;
  image: string;
  links?: Partial<Record<Platform, string>>;
};

export default function About() {
  const { theme } = useAppState();
  const { lang } = useLanguage();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const features = [
    {
      title: t("about.f1Title", lang),
      desc: t("about.f1Desc", lang),
      icon: <MessageCircle className="w-8 h-8 text-blue-400" />,
      glow: "from-blue-500/10 via-blue-400/10 to-cyan-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]"
    },
    {
      title: t("about.f2Title", lang),
      desc: t("about.f2Desc", lang),
      icon: <Target className="w-8 h-8 text-cyan-400" />,
      glow: "from-cyan-500/10 via-cyan-400/10 to-blue-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]"
    },
    {
      title: t("about.f3Title", lang),
      desc: t("about.f3Desc", lang),
      icon: <Star className="w-8 h-8 text-emerald-400" />,
      glow: "from-emerald-500/10 via-green-400/10 to-teal-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]"
    },
    {
      title: t("about.f4Title", lang),
      desc: t("about.f4Desc", lang),
      icon: <BookOpen className="w-8 h-8 text-purple-400" />,
      glow: "from-purple-500/10 via-violet-400/10 to-indigo-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]"
    },
    {
      title: t("about.f5Title", lang),
      desc: t("about.f5Desc", lang),
      icon: <Sparkles className="w-8 h-8 text-orange-400" />,
      glow: "from-orange-500/10 via-amber-400/10 to-yellow-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.6)]"
    },
    {
      title: t("about.f6Title", lang),
      desc: t("about.f6Desc", lang),
      icon: <CheckCircle2 className="w-8 h-8 text-pink-400" />,
      glow: "from-pink-500/10 via-rose-400/10 to-purple-400/10",
      shadow: "hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.6)]"
    }
  ];

  return (
    <div className={`page-shell min-h-screen py-12 sm:py-20 px-4 sm:px-6 transition-colors duration-500 overflow-hidden relative
      ${theme === "dark" ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"}
    `}>
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-0">
        <img
          src={bgAbout}
          alt="background"
          className="w-full h-[min(670px,80vh)] md:h-[min(900px,90vh)] lg:h-[670px] object-cover opacity-40"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-32">

        {/* SECTION A — HERO */}
<div className="text-center relative min-h-[400px] flex flex-col justify-center -mt-12">
  
  <div className="absolute inset-0 -z-10">
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 100, 200]} scale={2.4}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            opacity={0.15}
            transparent
          />
        </Sphere>
      </Float>
    </Canvas>
  </div>

  <motion.div
    initial={{ opacity: 0, y: 25, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.9, ease: "easeOut" }}
    className="relative z-10"
  >
    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full
      bg-white/5 backdrop-blur-xl border border-white/10
      text-blue-300 font-medium mb-8
      shadow-[0_0_25px_-10px_rgba(59,130,246,0.4)]
      hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.6)]
      hover:scale-105 transition-all duration-300"
    >
      <Sparkles className="w-4 h-4 animate-pulse" />
      {t("about.badge", lang)}
    </div>

    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight"
      style={{ textShadow: "0 10px 40px rgba(59,130,246,0.25)" }}>
      <span className="inline-block hover:translate-y-[-4px] transition duration-300">
        {t("about.heroTitle1", lang)}
      </span>{" "}
      <span className="mb-8 inline-block text-transparent bg-clip-text
        bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600
        hover:scale-105 transition duration-300">
        PathFinder AI
      </span>{" "}
      <span className="inline-block hover:translate-y-[-4px] transition duration-300">
        {t("about.heroTitle2", lang)}
      </span>
    </h1>

    <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed
      text-gray-200 mb-16 px-8 py-8 rounded-3xl
      bg-white/5 backdrop-blur-md border border-white/10
      shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)]
      hover:shadow-[0_0_45px_-10px_rgba(59,130,246,0.5)]
      hover:-translate-y-1 transition-all duration-300"
    >
      {t("about.heroDesc", lang)}
    </p>

    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
      {[t("about.heroCheck1", lang), t("about.heroCheck2", lang), t("about.heroCheck3", lang)].map((text, i) => (
        <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full
          bg-white/5 border border-white/10 backdrop-blur-md
          text-gray-300 hover:text-blue-300 hover:border-blue-400/30
          hover:scale-105 transition-all duration-300">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          {text}
        </span>
      ))}
    </div>
  </motion.div>
</div>

  {/* SECTION B — HOW THE PLATFORM WORKS */}
<motion.div 
  initial="hidden" 
  whileInView="show" 
  viewport={{ once: true, margin: "-100px" }} 
  variants={containerVariants}
  className="max-w-7xl mx-auto px-4"
>
  <div className="text-center mb-16 pt-12">
    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
      {t("about.howTitle", lang)}
    </h2>
    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
      {t("about.howDesc", lang)}
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {features.map((feature, i) => (
      <motion.div
        key={i}
        variants={itemVariants}
        whileHover={{ y: -12 }}
        className="group relative"
      >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.glow || 'from-blue-500 to-cyan-500'} rounded-[2rem] blur opacity-10 group-hover:opacity-40 transition duration-700`}></div>
        <div className="relative h-full p-8 rounded-[2rem] bg-[#0f172a]/80 backdrop-blur-2xl border border-white/5 overflow-hidden flex flex-col items-start shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 ring-1 ring-white/5 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
            <div className="text-blue-400 group-hover:text-white transition-colors duration-300">
              {feature.icon}
            </div>
          </div>

          <h3 className="relative z-10 text-2xl font-bold mb-4 text-white/90 group-hover:text-white">
            {feature.title}
          </h3>
          
          <p className="relative z-10 text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
            {feature.desc}
          </p>

          <div className="relative z-10 mt-8 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover:w-full transition-all duration-500" />
        </div>
      </motion.div>
    ))}
  </div>
</motion.div>
        {/* SECTION C — COMPLETE USER GUIDE */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
          className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-b from-primary/5 to-transparent p-6 sm:p-12 md:p-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-2 text-center">{t("about.guideTitle", lang)}</h2>
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:ml-[50%] before:h-full before:w-1 before:bg-gradient-to-b before:from-primary before:via-cyan-500 before:to-transparent">
              {[
                { step: t("about.s1Title", lang), desc: t("about.s1Desc", lang) },
                { step: t("about.s2Title", lang), desc: t("about.s2Desc", lang) },
                { step: t("about.s3Title", lang), desc: t("about.s3Desc", lang) },
                { step: t("about.s4Title", lang), desc: t("about.s4Desc", lang) },
                { step: t("about.s5Title", lang), desc: t("about.s5Desc", lang) },
                { step: t("about.s6Title", lang), desc: t("about.s6Desc", lang) }
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants} className={`relative flex items-center justify-between md:justify-normal ${idx % 2 === 0 ? "md:flex-row-reverse" : ""} group`}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-xl absolute left-0 md:left-1/2 md:-translate-x-1/2 shadow-[0_0_20px_rgba(14,165,233,0.5)] z-10">
                    {idx + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-background border border-white/10 shadow-xl hover:border-primary/50 transition-colors ml-auto md:ml-0">
                    <h3 className="font-bold text-xl text-primary mb-2">{item.step}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SECTION D — WHY IT'S DIFFERENT */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t("about.diffTitle", lang)}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("about.diffDesc", lang)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{ title: t("about.d1Title", lang), desc: t("about.d1Desc", lang) }, { title: t("about.d2Title", lang), desc: t("about.d2Desc", lang) }].map((item, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative overflow-hidden group flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_35px_-10px_rgba(14,165,233,0.5)]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/10 via-cyan-500/10 to-transparent blur-2xl transition duration-500" />
                <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:scale-110 transition">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition">{item.title}</h4>
                  <p className="text-muted-foreground group-hover:text-gray-200 transition">{item.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* TEAM SECTION */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }} variants={containerVariants} className="pb-24 relative">
          {/* Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
             <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
             <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full animate-pulse" />
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium mb-2">
              <Star className="w-4 h-4" /> {t("about.teamBadge", lang)}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 transition-all duration-500 hover:scale-105 hover:tracking-wide">
              {t("about.teamTitle", lang)}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("about.teamDesc", lang)}</p>
          </div>

          {/* Top Row: 4 Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.slice(0, 4).map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>

          {/* Bottom Row: 3 Members (Centered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:w-[80%] mx-auto">
            {teamMembers.slice(4, 7).map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>
        </motion.div>

        {/* SECTION F — CTA */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={containerVariants} className="text-center pb-32">
          <h2 className="text-4xl md:text-6xl font-black mb-8">{t("about.ctaTitle1", lang)} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">PathFinder AI</span></h2>
          <Link href="/chat">
            <button className="px-8 py-4 rounded-full bg-primary text-white font-bold text-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all duration-300 flex items-center justify-center gap-3 mx-auto">
              {t("about.ctaBtn", lang)} <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const platforms: Platform[] = ["whatsapp", "facebook", "instagram", "email", "linkedin"];

  const getIcon = (platform: Platform) => {
    const icons: Record<Platform, JSX.Element> = {
      whatsapp: <MessageCircle className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />
    };
    return icons[platform];
  };

  const hoverColors: Record<Platform, string> = {
    whatsapp: "hover:bg-[#25D366] hover:shadow-[#25D366]/20",
    facebook: "hover:bg-[#1877F2] hover:shadow-[#1877F2]/20",
    instagram: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:shadow-[#ee2a7b]/20",
    email: "hover:bg-[#EA4335] hover:shadow-[#EA4335]/20",
    linkedin: "hover:bg-[#0A66C2] hover:shadow-[#0A66C2]/20",
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -15 }}
      className="relative group min-h-[310px] h-auto sm:h-[310px]"
    >
      <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />

      <div className="relative h-full bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden">
        
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

        {/* Profile Image */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow group-hover:animate-none transition-all">
             <div className="w-full h-full rounded-full bg-[#0f172a] p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
             </div>
          </div>
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-[#0f172a] rounded-full shadow-lg" />
        </div>

        <div className="z-10">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-cyan-500/80 uppercase tracking-widest mb-6">
            {member.role}
          </p>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full max-w-full mt-auto z-10">
          {platforms.map((platform) => {
            const url = member.links?.[platform];
            if (!url) return null;

            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={`
                  aspect-square rounded-xl flex items-center justify-center 
                  bg-white/5 text-gray-400 border border-white/5
                  hover:text-white hover:-translate-y-1 hover:shadow-xl
                  transition-all duration-300
                  ${hoverColors[platform]}
                `}
              >
                {getIcon(platform)}
              </a>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>
    </motion.div>
  );
}