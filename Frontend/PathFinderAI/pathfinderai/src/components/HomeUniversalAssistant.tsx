import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Zap,
  Maximize2,
  Minimize2,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { useUniversalAssistant } from "@/hooks/use-universal-assistant.js";
import { isRtl, t } from "@/lib/i18n.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { useToast } from "@/hooks/use-toast.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";

interface TextChunk { id: string; text: string; isComplete: boolean; }
interface Message { role: "user" | "assistant"; content: string; }
interface DisplayMessage extends Message { id: string; isStreaming?: boolean; textChunks?: TextChunk[]; }

export function HomeUniversalAssistant() {
  const { lang } = useLanguage();
  const rtl = isRtl(lang);
  const { theme, currentChat, setCurrentChat, triggerAssistantOpen, setTriggerAssistantOpen } = useAppState();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const {
  messages: apiMessages,
  setMessages,
  isLoading,
  sendMessage,
} = useUniversalAssistant();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

useEffect(() => {
  if (!triggerAssistantOpen) return;

  setIsOpen(true);
  setTriggerAssistantOpen(false);

  const id = setTimeout(() => {
    inputRef.current?.focus();
  }, 500);

  return () => clearTimeout(id);
}, [triggerAssistantOpen, setTriggerAssistantOpen]);

  useEffect(() => {
    if (currentChat && currentChat.length > 0) {
      setIsOpen(true);
      setMessages(currentChat);
      setCurrentChat(null);
    }
  }, [currentChat, setMessages, setCurrentChat]);

  const handleSaveChat = async () => {
    if (!apiMessages || apiMessages.length === 0) return;
    setIsSaving(true);
    try {
      const title = apiMessages.find((msg) => msg.role === "user")?.content.slice(0, 60) || "Universal AI Conversation";
      const messagesWithTimestamps = apiMessages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp ?? new Date().toISOString()
      }));

      const res = await apiFetch(apiUrl("/api/saved-chats"), {
        method: "POST",
        body: JSON.stringify({
          title,
          messages: messagesWithTimestamps,
        })
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res));
      toast({ title: t("common.success", lang) || "Saved!", description: "Chat saved to your dashboard." });
      window.dispatchEvent(new Event("savedChatCreated"));
    } catch (err) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Logic 
useEffect(() => {
if (!apiMessages || apiMessages.length === 0) {
  queueMicrotask(() => {
    setDisplayMessages([]);
  });

  return;
}
  if (textTimeoutRef.current) {
    clearTimeout(textTimeoutRef.current);
  }

  const converted: DisplayMessage[] = apiMessages.map((msg, idx) => ({
    id: `${msg.role}-${idx}`,
    role: msg.role,
    content: msg.content ?? "",
  }));

  const lastIndex = converted.length - 1;
  if (lastIndex < 0) {
  queueMicrotask(() => {
    setDisplayMessages(converted);
  });

    return;
  }

  const lastMsg = converted[lastIndex];
  if (!lastMsg || lastMsg.role !== "assistant" || isLoading) {
  queueMicrotask(() => {
    setDisplayMessages(converted);
  });

  return;
  }

  const textChunks: TextChunk[] = lastMsg.content
    .split(/(?=\s|[.!?])/g)
    .filter((chunk) => chunk.trim())
    .map((chunk, idx): TextChunk => ({
      id: `${lastMsg.id}-chunk-${idx}`,
      text: chunk,
      isComplete: false,
    }));

  converted[lastIndex] = {
    ...lastMsg,
    isStreaming: true,
    textChunks,
  };

  setDisplayMessages(converted);

  let chunkIndex = 0;

  const animateChunks = () => {
    setDisplayMessages((prev) => {
      const updated = [...prev];
      const msg = updated[lastIndex];

      if (!msg?.textChunks) return prev;
      if (chunkIndex >= msg.textChunks.length) return prev;

      const chunk = msg.textChunks[chunkIndex];
      if (!chunk) return prev;

      const updatedChunks = [...msg.textChunks];

      updatedChunks[chunkIndex] = {
        ...chunk,
        isComplete: true,
      };

      updated[lastIndex] = {
        ...msg,
        textChunks: updatedChunks,
      };

      return updated;
    });

    chunkIndex++;

    const current = converted[lastIndex]?.textChunks?.length ?? 0;

    if (chunkIndex < current) {
      textTimeoutRef.current = setTimeout(animateChunks, 25);
    } else {
      setDisplayMessages((prev) => {
        const updated = [...prev];
        if (!updated[lastIndex]) return prev;

        updated[lastIndex] = {
          ...updated[lastIndex],
          isStreaming: false,
        };

        return updated;
      });
    }
  };

  textTimeoutRef.current = setTimeout(animateChunks, 25);

return () => {
  if (textTimeoutRef.current) {
    clearTimeout(textTimeoutRef.current);
  }
};
}, [apiMessages, isLoading]);
async function handleSendMessage(): Promise<void> {
  const messageText = inputValue.trim();

  if (!messageText || isLoading) return;

  setInputValue("");

  try {
    await sendMessage(messageText);
  } catch (error) {
    console.error("Send message failed:", error);
  }
}
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`fixed ${rtl ? "left-6" : "right-6"} bottom-6 z-50`}
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-all duration-500 overflow-hidden group ${
            isOpen 
              ? "bg-slate-900 text-white" 
              : "bg-gradient-to-br from-indigo-600 via-primary to-cyan-400 text-white"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
                <Sparkles className="w-7 h-7" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-white rounded-full blur-md"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(20px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed max-h-[calc(100dvh-5rem)] ${isExpanded ? "left-3 right-3 sm:left-8 sm:right-8 lg:left-16 lg:right-16 top-20 sm:top-24 bottom-4 sm:bottom-6" : `${rtl ? "left-3 sm:left-6" : "right-3 sm:right-6"} top-20 sm:top-24 bottom-4 sm:bottom-24 w-[min(92vw,420px)]`} z-50 flex flex-col transition-all duration-500`}
          >
            <div className={`flex flex-col h-full rounded-[2.5rem] border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl ${
              theme === "dark" 
                ? "bg-slate-950/90 border-white/10" 
                : "bg-white/90 border-slate-200"
            }`}>
              
              {/* Header */}
              <div className="p-5 flex items-center justify-between bg-gradient-to-b from-primary/20 to-transparent border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:rotate-12 transition-transform">
                      <Zap className="w-6 h-6 text-primary fill-primary/20" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      {t("universal.title", lang)}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Gemini 3 Flash</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {apiMessages?.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={handleSaveChat} disabled={isSaving} className="rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors" title="Save Chat">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors hidden sm:flex" title="Toggle Fullscreen">
                    {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Chat */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 scroll-smooth">
                <div className={`mx-auto w-full space-y-6 ${isExpanded ? "max-w-4xl" : ""}`}>
                {displayMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                      <MessageSquare className="w-10 h-10 text-primary/30" />
                    </div>
                    <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{t("universal.welcome", lang)}</h4>
                    <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                      ابدأ المحادثة الآن مع المساعد الذكي المدعوم بأحدث تقنيات الذكاء الاصطناعي
                    </p>
                  </div>
                ) : (
                  displayMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`group relative max-w-[88%] px-5 py-3.5 rounded-[22px] text-[14.5px] leading-relaxed transition-all duration-300 ${
                        msg.role === "user"
                          ? "bg-primary text-white shadow-lg shadow-primary/25 rounded-tr-none"
                          : theme === "dark" 
                            ? "bg-white/10 border border-white/10 text-white rounded-tl-none hover:bg-white/[0.15]" 
                            : "bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none"
                      }`}>
                        {msg.textChunks ? (
                          <span className="drop-shadow-sm">
                            {msg.textChunks.map((chunk, i) => (
                              chunk?.isComplete ? <span key={chunk.id || i}>{chunk.text}</span> : null
                            ))}
                            {msg.isStreaming && (
                              <motion.span 
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-2 h-4 ml-1 bg-primary align-middle rounded-full" 
                              />
                            )}
                          </span>
                        ) : (
                          <span className="drop-shadow-sm">{msg.content}</span>
                        )}
                        
                        {msg.role === "assistant" && !msg.isStreaming && (
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="absolute -right-10 top-2 p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-white"
                          >
                            {copiedId === msg.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl rounded-tl-none flex gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    </div>
                  </motion.div>
                )}
                </div>
              </div>

              {/* Input  */}
              <div className="p-6 bg-gradient-to-t from-slate-900/50 to-transparent">
                <div className={`mx-auto w-full ${isExpanded ? "max-w-4xl" : ""}`}>
                  <div className={`relative flex items-center gap-2 p-2 rounded-[20px] border transition-all duration-500 shadow-inner ${
                  theme === "dark" 
                  ? "bg-black/40 border-white/10 focus-within:border-primary focus-within:ring-1 ring-primary/30" 
                  : "bg-white border-slate-200 focus-within:border-primary"
                }`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={t("universal.placeholder", lang)}
                    className={`flex-1 bg-transparent px-4 py-2 text-sm outline-none ${
                     theme === "dark" ? "text-white" : "text-slate-900"
                    } placeholder:text-slate-500`}/>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex items-center justify-center rounded-[14px] h-10 w-10 bg-primary text-white disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <div className="h-[1px] w-8 bg-white/5" />
                    <p className="text-[10px] text-white/40 font-medium tracking-tighter uppercase italic">
                      Supercharged by AI
                    </p>
                    <div className="h-[1px] w-8 bg-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}