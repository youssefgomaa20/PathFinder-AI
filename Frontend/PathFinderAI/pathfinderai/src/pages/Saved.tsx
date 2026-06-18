import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, GitCompare, FileText, Trash2, Calendar, ChevronRight, MessageSquare, Sparkles, PlusCircle 
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button.js";
import { useAppState } from "@/hooks/use-app-state.js";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";
import { apiFetch, apiUrl } from "@/lib/http.js";

type Category = "all" | "roadmap" | "compare" | "resume" | "chat";

type SavedItemType = Exclude<Category, "all">;

type SavedItem = {
  id: string;
  type: SavedItemType;
  title: string;
  createdAt: string;
  updatedAt?: string;
  careerTitle?: string;
  roadmapData?: string;
  completedSteps?: number[];
  messages?: Array<{ role: "user" | "assistant"; content: string; timestamp?: string }>;
};

const emptyStateConfig: Record<Category, any> = {
  all: {
    title: "No saved items",
    desc: "You don't have any saved data yet",
    icon: Map,
    color: "text-blue-500",
    bgColor: "from-blue-500/20",
  },
  roadmap: {
    title: "No saved roadmaps",
    desc: "Generate your first career roadmap to see it here",
    icon: Map,
    color: "text-blue-500",
    bgColor: "from-blue-500/20",
    link: "/"
  },
  compare: {
    title: "No saved comparisons",
    desc: "Compare careers to save your analysis",
    icon: GitCompare,
    color: "text-purple-500",
    bgColor: "from-purple-500/20",
    link: "/compare"
  },
  resume: {
    title: "No saved resumes",
    desc: "Create an ATS-friendly resume to save it",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "from-orange-500/20",
    link: "/resume"
  },
  chat: {
    title: "No saved chats",
    desc: "Save your conversations with the AI assistant",
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "from-green-500/20",
    link: "/"
  }
};

const actionMap: Record<Category, { label: string; href: string }> = {
  all: { label: "Start Your Journey", href: "/" }, 
  roadmap: { label: "Generate Roadmap", href: "/chat" }, 
  compare: { label: "Start Comparison", href: "/compare" },
  resume: { label: "Build Resume", href: "/resume" }, 
  chat: { label: "Start Chat", href: "/" },
};

export default function Saved() {
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const theme = useAppState(s => s.theme);
  const { setCurrentRoadmap, setCurrentCompare, setCurrentResume, setCurrentChat, setTriggerAssistantOpen } = useAppState();

  const activeEmpty = emptyStateConfig[activeCategory];
  const activeAction = actionMap[activeCategory];
  const EmptyIcon = activeEmpty.icon;

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: t("saved.all", lang) || "All Saved" },
    { id: "roadmap", label: t("saved.roadmaps", lang) || "Roadmaps" },
    { id: "compare", label: t("saved.comparisons", lang) || "Comparisons" },
    { id: "resume", label: t("saved.resumes", lang) || "CVs" },
    { id: "chat", label: t("saved.chats", lang) || "Chats" }
  ];

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [roadmapRes, chatRes] = await Promise.all([
          apiFetch(apiUrl("/api/pathfinder/saved-roadmaps")),
          apiFetch(apiUrl("/api/saved-chats"))
        ]);

        if (!mounted) return;

        const items: SavedItem[] = [];

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          items.push(
            ...roadmapData.map((item: any) => ({
              ...item,
              type: (item.type || "roadmap") as SavedItemType,
              title: item.careerTitle || item.title || "Saved Roadmap"
            }))
          );
        }

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          items.push(
            ...chatData.map((item: any) => ({
              ...item,
              type: "chat" as const,
              title: item.title || "Saved Chat"
            }))
          );
        }

        if (mounted) {
          setSavedItems(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch {
        if (mounted) setError(t("saved.loadFail", lang));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    window.addEventListener("savedChatCreated", fetchData);
    return () => { mounted = false; window.removeEventListener("savedChatCreated", fetchData); };
  }, [lang]);

  const handleDelete = async (id: string, type: SavedItemType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t("saved.deleteConfirm", lang))) {
      try {
        const path = type === "chat" ? "/api/saved-chats" : "/api/pathfinder/saved-roadmaps";
        const response = await apiFetch(apiUrl(`${path}/${id}`), { method: "DELETE" });
        if (!response.ok) return;
        setSavedItems(prev => prev.filter((item) => item.id !== id));
      } catch {
        setError(t("saved.deleteFail", lang));
      }
    }
  };

  const handleLoadItem = (item: SavedItem) => {
    try {
      if (item.type === "chat") {
        if (item.messages && item.messages.length > 0) {
          setCurrentChat(item.messages);
          setTriggerAssistantOpen(true);
          setLocation("/");
        }
        return;
      }

      const parsed = item.roadmapData ? JSON.parse(item.roadmapData) : null;
      const type = item.type || "roadmap";
      if (type === "roadmap") {
        setCurrentRoadmap(parsed);
        setLocation("/results");
      } else if (type === "compare") {
        setCurrentCompare(parsed);
        setLocation("/compare");
      } else if (type === "resume") {
        setCurrentResume(parsed);
        setLocation("/resume");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRoadmaps = activeCategory === "all" 
    ? savedItems 
    : savedItems.filter((item) => item.type === activeCategory);

  if (isLoading) {
    return (
      <div className={`min-h-screen px-4 py-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="container mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-1/3 bg-gray-300/20 rounded-lg animate-pulse mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-3xl bg-gray-300/10 animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-shell min-h-screen w-full px-4 sm:px-6 py-8 sm:py-10 transition-colors duration-500
      ${theme === "dark" ? "bg-[#0B0F1A] text-white" : "bg-gray-50 text-black"}`}>

      <div className="container mx-auto max-w-6xl">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col items-center mb-12 space-y-2"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-transparent bg-clip-text">
              {t("saved.title", lang)}
            </h1>
          </div>
          <div className="h-1.5 w-24 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
        </motion.div>

        {/* --- CATEGORY  --- */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-6 py-2 font-bold transition-all duration-300 
                  ${isActive 
                    ? "scale-110 shadow-lg shadow-primary/20" 
                    : `hover:scale-105 border-transparent ${theme === "dark" ? "bg-gray-800/40 text-gray-500 hover:bg-gray-800 hover:text-gray-300" : "bg-gray-200/50 text-gray-600"}`
                  }`}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* --- CONTENT  --- */}
        <AnimatePresence mode="wait">
          {filteredRoadmaps.length === 0 ? (
            <motion.div 
              key={activeCategory} 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative overflow-hidden rounded-[40px] p-8 sm:p-12 md:p-20 text-center flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-2xl"
            >
   <div
  className={`absolute inset-0 opacity-10 bg-gradient-to-br ${activeEmpty.bgColor} to-transparent blur-3xl pointer-events-none`}
/>           
              <div className={`p-8 rounded-full bg-gray-500/5 mb-6 transition-all duration-500 group`}>
                <EmptyIcon className={`w-20 h-20 ${activeEmpty.color} animate-pulse`} />
              </div>

              <h2 className="text-3xl font-bold mb-3">{activeEmpty.title}</h2>
              <p className="text-muted-foreground mb-8 max-w-sm text-lg">{activeEmpty.desc}</p>
              
              {activeCategory === "chat" ? (
                <Button onClick={() => {
                  setTriggerAssistantOpen(true);
                  setLocation("/");
                }}>
                  <PlusCircle className="mr-2 w-5 h-5" />
                  {activeAction.label}
                </Button>
              ) : (
<Button 
  type="button"

onClick={() => setLocation(activeAction.href)}>
  <PlusCircle className="mr-2 w-5 h-5" />
  {activeAction.label}
</Button>
)}
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmaps.map((item, i) => {
                const itemType = item.type || "roadmap";
                let CardIcon = Map;
                let cardColor = "text-blue-500";
                const title = item.title || item.careerTitle || "Saved item";
                
                if (itemType === "compare") { CardIcon = GitCompare; cardColor = "text-purple-500"; }
                else if (itemType === "resume") { CardIcon = FileText; cardColor = "text-orange-500"; }
                else if (itemType === "chat") { CardIcon = MessageSquare; cardColor = "text-green-500"; }

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -10 }}
                    onClick={() => handleLoadItem(item)}
                    className={`group relative p-6 rounded-3xl cursor-pointer border transition-all duration-300 shadow-lg
                      ${theme === "dark" 
                        ? "bg-gray-900/40 border-gray-800 hover:border-primary/50" 
                        : "bg-white border-gray-100 hover:border-primary/30"}`}
                  >
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gray-500/5 ${cardColor} group-hover:scale-110 transition-transform`}>
                        <CardIcon className="w-6 h-6" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(item.id, item.type, e)} 
                        className="hover:text-red-500 hover:bg-red-500/10 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-1">
                      {title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-gray-500/10 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(item.createdAt), "MMM d")}
                      </div>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        View <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}