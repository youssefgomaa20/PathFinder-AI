import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageCircle, Send, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useRoadmapStream } from "@/hooks/use-roadmap-stream.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { getChatBundle, readStoredLang, t } from "@/lib/i18n.js";
import { getUserScopedData } from "@/lib/auth.js";

type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: { value: string; label: string }[];
};

export default function Chat() {
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { startStream, isStreaming, isComplete, error } = useRoadmapStream();
  const { theme } = useAppState();
  const [profileImage, setProfileImage] = useState<string>(() => getUserScopedData()?.profileImage ?? "");
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(1);

  const [messages, setMessages] = useState<Message[]>(() => {
    const b = getChatBundle(readStoredLang());
    return [{ id: "q1", sender: "ai", text: b.questions[0] ?? "" }];
  });
  const [answers, setAnswers] = useState({
    careerInterest: "",
    educationLevel: "",
    skills: "",
    challenges: ""
  });

  useEffect(() => {
    const bundle = getChatBundle(lang);
    setStep(0);
    setAnswers({ careerInterest: "", educationLevel: "", skills: "", challenges: "" });
    setInputValue("");
    setMessages([{ id: "q1", sender: "ai", text: bundle.questions[0] ?? "" }]);
  }, [lang]);

  useEffect(() => {
    const sync = () => setProfileImage(getUserScopedData()?.profileImage ?? "");
    sync();
    window.addEventListener("pathfinder-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pathfinder-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isStreaming]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setLocation("/results"), 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, setLocation]);

  const handleAnswer = (val: string, displayVal: string) => {
    if (!val.trim()) return;

    const bundle = getChatBundle(lang);
    const userMsg: Message = { id: `msg-${nextIdRef.current++}`, sender: "user", text: displayVal };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    const merged = { ...answers };
    if (step === 0) merged.careerInterest = val;
    if (step === 1) merged.educationLevel = val;
    if (step === 2) merged.skills = val;
    if (step === 3) merged.challenges = val;
    setAnswers(merged);

    setTimeout(() => {
      const nextStep = step + 1;
      setStep(nextStep);

      if (nextStep < 4) {
        const nextMsg: Message = {
          id: `q${nextStep + 1}`,
          sender: "ai",
          text: bundle.questions[nextStep] ?? "",
          options:
            nextStep === 1 ? bundle.educationOptions : nextStep === 3 ? bundle.challengeOptions : undefined
        };
        setMessages((prev) => [...prev, nextMsg]);
      } else {
        startStream?.({
          language: lang,
          careerInterest: merged.careerInterest,
          careerGoal: merged.careerInterest,
          educationLevel: merged.educationLevel,
          skills: merged.skills.split(",").map((s) => s.trim()).filter(Boolean),
          challenges: merged.challenges
        });
      }
    }, 600);
  };

  const bundle = getChatBundle(lang);

  return (
    <div
      className={`page-shell relative w-full min-h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] flex flex-col transition-colors duration-500
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-b from-background/10 via-background/80 to-background text-black"}`}
    >
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {error && (
          <div className="mx-auto mb-4 flex max-w-3xl items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 items-start ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-11 h-11 rounded-full overflow-hidden border-2 flex items-start
    ${msg.sender === "user" ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : "border-primary/30 bg-card shadow-sm"}`}
              >
                <img
                  src={msg.sender === "user" ? profileImage || "/default-profile.png" : "/icon.png"}
                  alt={msg.sender === "user" ? "User" : "AI"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className={`max-w-[88%] sm:max-w-[75%] min-w-0 flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`
      px-4 py-2 rounded-2xl
      ${
        msg.sender === "user"
          ? "bg-primary text-primary-foreground"
          : theme === "dark"
            ? "glass-panel shadow-sm text-white"
            : "bg-white border border-blue-300 text-black shadow-sm"
      }
    `}
                >
                  {msg.text}
                </div>

                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnswer(opt.value, opt.label)}
                        className={`rounded-full ${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isStreaming && (
        <div className="mx-auto mt-2 mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("chat.generating", lang)}</span>
        </div>
      )}
      {/* Input Area */}
      <div
        className={`relative mt-2 border-t border-border 
  ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} // خلي خلفية الشات في اللايت واضحة
`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnswer(inputValue, inputValue);
          }}
          className="relative max-w-3xl mx-auto w-full px-4 pt-2 mb-6"
        >
          <div className="group relative w-full">
            <MessageCircle
              className="pointer-events-none absolute start-4 top-1/2 z-[1] h-5 w-5 -translate-y-1/2 text-[#aaa] transition-colors duration-300 ease-in-out group-focus-within:text-[#00d4ff]"
              aria-hidden
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={bundle.inputPlaceholder}
              disabled={step === 1 || step === 3 || isStreaming || step >= 4}
              className={`w-full h-14 rounded-2xl ps-12 pe-14 transition-all duration-300 ease-in-out focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/35 focus:shadow-[0_0_12px_rgba(0,212,255,0.18)] disabled:opacity-50
        ${theme === "dark" ? "border border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border border-blue-300 bg-white text-black placeholder-gray-600"} 
      `}
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || step === 1 || step === 3 || isStreaming || step >= 4}
              className="absolute top-1/2 -translate-y-1/2 end-3 rounded-xl h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Send className={`w-5 h-5 ${lang === "ar" ? "-rotate-[90deg]" : ""}`} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
